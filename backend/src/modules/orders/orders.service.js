'use strict';

const ApiError = require('../../utils/apiError');
const db = require('../../config/database');
const { pool } = require('../../config/database');
const logger = require('../../config/logger');
const env = require('../../config/env');
const { sendMail } = require('../../utils/mailers');
const cartRepo = require('../cart/cart.repository');
const productsRepo = require('../products/products.repository');
const variantsRepo = require('../variants/variants.repository');
const couponsRepo = require('../coupons/coupons.repository');
const couponsService = require('../coupons/coupons.service');
const notificationsService = require('../notifications/notifications.service');
const locationsRepo = require('../shippings/locations.repository');
const repo = require('./orders.repository');

const ALLOWED_TRANSITIONS = {
  physical: {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['completed', 'returned'],
  },
  digital: {
    pending: ['completed', 'cancelled'],
  },
};

function assertTransition(orderType, from, to) {
  const allowed = ALLOWED_TRANSITIONS[orderType]?.[from];
  if (!allowed || !allowed.includes(to)) {
    throw ApiError.badRequest(`Cannot change status from "${from}" to "${to}"`);
  }
}

function effectivePrice(price, promo) {
  const p = Number(price);
  const pr = promo != null ? Number(promo) : null;
  return pr != null && pr < p ? pr : p;
}

// ─── Create order ─────────────────────────────────────

async function createOrder(sessionId, input) {
  const cart = await cartRepo.findBySessionId(sessionId);
  if (!cart) throw ApiError.badRequest('Cart is empty');

  const cartItems = await cartRepo.listItems(cart.id);
  if (cartItems.length === 0) throw ApiError.badRequest('Cart is empty');

  const productIds = [...new Set(cartItems.map((i) => i.product_id))];
  const variantIds = [...new Set(cartItems.map((i) => i.variant_id).filter(Boolean))];

  const productPh = productIds.map(() => '?').join(',');
  const [productRows] = await pool.execute(
    `SELECT id, name, product_type, price, promotional_price,
            profit, stock_quantity, stock_mode, is_active
       FROM products WHERE id IN (${productPh})`,
    productIds
  );
  const products = Object.fromEntries(productRows.map((p) => [p.id, p]));

  let variants = {};
  if (variantIds.length) {
    const [variantRows] = await pool.execute(
      `SELECT id, product_id, name, price, promotional_price, profit,
              stock_quantity, is_active, duration
         FROM product_variants WHERE id IN (${variantIds.map(() => '?').join(',')})`,
      variantIds
    );
    variants = Object.fromEntries(variantRows.map((v) => [v.id, v]));
  }

  // Build order lines with validation
  let subtotal = 0;
  let profitTotal = 0;
  let hasPhysical = false;
  const lines = [];

  for (const item of cartItems) {
    const product = products[item.product_id];
    if (!product || !product.is_active) {
      throw ApiError.badRequest('A product in your cart is no longer available');
    }

    let variant = null;
    if (item.variant_id) {
      variant = variants[item.variant_id];
      if (!variant || variant.product_id !== product.id || !variant.is_active) {
        throw ApiError.badRequest('A variant in your cart is no longer available');
      }
    }

    // Availability + stock check (mode-aware)
    if (product.product_type === 'physical') {
      hasPhysical = true;

      if (product.stock_mode === 'shared') {
        // Aggregated pool check happens after building all lines
      } else if (variant) {
        if ((variant.stock_quantity ?? 0) < item.quantity) {
          throw ApiError.badRequest(`Not enough stock for "${product.name} - ${variant.name}"`);
        }
      } else {
        // per_variant base config OR product with no variants
        if ((product.stock_quantity ?? 0) < item.quantity) {
          throw ApiError.badRequest(`Not enough stock for "${product.name}"`);
        }
      }
    }

    const unitPrice = variant
      ? effectivePrice(variant.price, variant.promotional_price)
      : effectivePrice(product.price, product.promotional_price);

    const unitProfit = variant
      ? Number(variant.profit ?? 0)
      : Number(product.profit ?? 0);

    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    profitTotal += unitProfit * item.quantity;

    lines.push({
      product_id: product.id,
      variant_id: item.variant_id ?? null,
      product_name: product.name,
      variant_name: variant ? (variant.name || variant.duration) : null,
      unit_price: unitPrice,
      quantity: item.quantity,
      profit: unitProfit,
      line_total: lineTotal,
    });
  }

  // Shared pool aggregate check
  const sharedProducts = new Map();
  for (const l of lines) {
    const p = products[l.product_id];
    if (p.product_type === 'physical' && p.stock_mode === 'shared') {
      sharedProducts.set(p.id, (sharedProducts.get(p.id) || 0) + l.quantity);
    }
  }
  for (const [productId, totalQty] of sharedProducts) {
    const p = products[productId];
    if ((p.stock_quantity ?? 0) < totalQty) {
      throw ApiError.badRequest(`Not enough stock for "${p.name}"`);
    }
  }

  // Coupon
  let discount = 0;
  let coupon = null;
  if (input.coupon_code) {
    const result = await couponsService.computeDiscount(input.coupon_code, lines, subtotal);
    if (!result.valid) throw ApiError.badRequest(result.message);
    discount = result.discount;
    coupon = result.coupon;
  }

  // Shipping
  let shippingCost = 0;
  let shippingData = null;

  if (hasPhysical) {
    if (!input.wilaya || !input.commune || !input.delivery_type) {
      throw ApiError.badRequest('Shipping information is required');
    }
    const wilaya = locationsRepo.findWilaya(input.wilaya);
    if (!wilaya) throw ApiError.badRequest('Invalid wilaya');

    if (input.delivery_type === 'home' && !input.address) {
      throw ApiError.badRequest('Address is required for home delivery');
    }
    if (input.delivery_type === 'stop_desk' && !input.stop_desk_name) {
      throw ApiError.badRequest('Stop desk name is required');
    }

    shippingCost = input.delivery_type === 'home'
      ? Number(wilaya.home_rate || 0)
      : Number(wilaya.stop_desk_rate || 0);

    shippingData = {
      delivery_type: input.delivery_type,
      wilaya: wilaya.name,
      commune: input.commune,
      address: input.address ?? null,
      stop_desk_name: input.stop_desk_name ?? null,
    };
  }

  const total = Math.max(0, subtotal - discount) + shippingCost;
  const orderType = hasPhysical ? 'physical' : 'digital';

  // Net profit = item profits − discount (discount eats into margin)
  const profit = Math.max(0, profitTotal - discount);

  const orderId = await db.transaction(async (conn) => {
    const id = await repo.insert(conn, {
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      order_type: orderType,
      subtotal,
      discount_amount: discount,
      shipping_cost: shippingCost,
      total_amount: total,
      profit,
      coupon_id: coupon ? coupon.id : null,
      note: input.note ?? null,
    });

    await repo.insertItems(conn, id, lines);
    if (shippingData) await repo.insertShipping(conn, id, shippingData);
    if (coupon) await couponsRepo.incrementUsed(conn, coupon.id);

    await notificationsService.onNewOrder(conn, {
      id,
      customer_name: input.customer_name,
      total_amount: total,
    });

    await cartRepo.clear(cart.id);

    return id;
  });

  // Fire-and-forget email
  sendMail({
    to: env.mail.superadminEmail,
    subject: `New order #${orderId}`,
    text: `${input.customer_name} placed an order for ${total} DA (${orderType}).`,
  }).catch((err) => logger.error(`Order email failed: ${err.message}`));

  return getOrderSummary(orderId);
}

// ─── Reads ────────────────────────────────────────────

async function getOrderSummary(id) {
  const order = await repo.findById(id);
  if (!order) throw ApiError.notFound('Order not found');
  return {
    id: order.id,
    status: order.status,
    order_type: order.order_type,
    total_amount: Number(order.total_amount),
    created_at: order.created_at,
  };
}

async function getAdminOrderDetail(id) {
  const order = await repo.findById(id);
  if (!order) throw ApiError.notFound('Order not found');

  const [items, shipping] = await Promise.all([
    repo.listItemsByOrder(id),
    order.order_type === 'physical' ? repo.getShipping(id) : Promise.resolve(null),
  ]);

  return {
    id: order.id,
    customer: {
      name: order.customer_name,
      phone: order.customer_phone,
    },
    order_type: order.order_type,
    status: order.status,
    note: order.note,
    cancellation: order.rejection_reason
      ? { reason: order.rejection_reason, note: order.rejection_note }
      : null,
    shipping,
    items: items.map((it) => ({
      id: it.id,
      product_id: it.product_id,
      variant_id: it.variant_id,
      product_name: it.product_name,
      variant_name: it.variant_name,
      unit_price: Number(it.unit_price),
      quantity: it.quantity,
      line_total: Number(it.unit_price) * it.quantity,
      profit: Number(it.profit),
    })),
    totals: {
      subtotal: Number(order.subtotal),
      discount: Number(order.discount_amount),
      shipping: Number(order.shipping_cost),
      total: Number(order.total_amount),
      profit: Number(order.profit),
    },
    created_at: order.created_at,
    updated_at: order.updated_at,
  };
}

async function listAdmin(query) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const { rows, total } = await repo.list({ page, limit, ...query });

  const orderIds = rows.map((r) => r.id);
  const itemsByOrder = await repo.listFirstItemsByOrderIds(orderIds, 2);

  return {
    items: rows.map((r) => {
      const items = itemsByOrder[r.id] || [];
      const first = items[0];
      const extra = Math.max(0, Number(r.items_count) - 1);

      let preview = null;
      if (first) {
        preview = extra > 0
          ? `${first.product_name} +${extra} autre${extra > 1 ? 's' : ''}`
          : first.product_name;
      }

      return {
        id: r.id,
        customer_name: r.customer_name,
        customer_phone: r.customer_phone,
        items_count: Number(r.items_count),
        items_preview: preview,
        total_amount: Number(r.total_amount),
        status: r.status,
        created_at: r.created_at,
      };
    }),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

// ─── Status change ────────────────────────────────────

async function changeStatus(id, { status, rejection_reason, rejection_note }) {  const order = await repo.findById(id);
  if (!order) throw ApiError.notFound('Order not found');

  assertTransition(order.order_type, order.status, status);

  const isCancelling = status === 'cancelled';
  const isReturning = status === 'returned';
  const needsRestore = isCancelling || isReturning;
  const isConfirming = status === 'confirmed';

  const lowStockNotifications = [];

  await db.transaction(async (conn) => {
    // Lock the order
    const locked = await repo.findByIdForUpdate(conn, id);
    if (locked.status !== order.status) {
      throw ApiError.conflict('Order status was changed by another request');
    }

    const items = await repo.listItemsByOrder(id);

    if (isConfirming) {
      // ─── Lock products ─────────────────────────────
      const productIds = [...new Set(items.map((i) => i.product_id))];
      const productPh = productIds.map(() => '?').join(',');
      const [productRows] = await conn.execute(
        `SELECT id, name, product_type, stock_quantity, stock_mode,
                low_stock_threshold, is_active
           FROM products WHERE id IN (${productPh}) FOR UPDATE`,
        productIds
      );
      const products = Object.fromEntries(productRows.map((p) => [p.id, p]));

      const variantIds = items.map((i) => i.variant_id).filter(Boolean);
      let variants = {};
      if (variantIds.length) {
        const [variantRows] = await conn.execute(
          `SELECT id, product_id, name, stock_quantity,
                  low_stock_threshold, is_active
             FROM product_variants
            WHERE id IN (${variantIds.map(() => '?').join(',')})
            FOR UPDATE`,
          variantIds
        );
        variants = Object.fromEntries(variantRows.map((v) => [v.id, v]));
      }

      // ─── Classify decrements by target ─────────────
      // Three independent targets:
      //   variantDecrements: per_variant variant rows (own threshold)
      //   baseDecrements:    per_variant base config + no-variants products (product threshold)
      //   sharedDecrements:  shared pool (product threshold, aggregated per product)
      const variantDecrements = new Map();
      const baseDecrements = new Map();
      const sharedDecrements = new Map();

      for (const it of items) {
        const p = products[it.product_id];
        if (!p || p.product_type !== 'physical') continue;

        if (p.stock_mode === 'shared') {
          sharedDecrements.set(p.id, (sharedDecrements.get(p.id) || 0) + it.quantity);
        } else if (it.variant_id) {
          variantDecrements.set(it.variant_id, (variantDecrements.get(it.variant_id) || 0) + it.quantity);
        } else {
          baseDecrements.set(p.id, (baseDecrements.get(p.id) || 0) + it.quantity);
        }
      }

      // ─── Decrement per_variant / no_variants ───────
      for (const it of items) {
        const p = products[it.product_id];
        if (!p || !p.is_active) {
          throw ApiError.badRequest(`Product "${it.product_name}" is no longer active`);
        }
        if (p.product_type !== 'physical') continue;
        if (p.stock_mode === 'shared') continue;

        if (it.variant_id) {
          const v = variants[it.variant_id];
          if (!v || !v.is_active) {
            throw ApiError.badRequest(`Variant "${it.variant_name}" is no longer active`);
          }
          if ((v.stock_quantity ?? 0) < it.quantity) {
            throw ApiError.badRequest(`Not enough stock for "${it.product_name} - ${it.variant_name}"`);
          }
          await conn.execute(
            `UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?`,
            [it.quantity, it.variant_id]
          );
        } else {
          if ((p.stock_quantity ?? 0) < it.quantity) {
            throw ApiError.badRequest(`Not enough stock for "${it.product_name}"`);
          }
          await conn.execute(
            `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
            [it.quantity, p.id]
          );
        }
      }

      // ─── Decrement shared pools ────────────────────
      for (const [productId, qty] of sharedDecrements) {
        const p = products[productId];
        if ((p.stock_quantity ?? 0) < qty) {
          throw ApiError.badRequest(`Not enough shared stock for "${p.name}"`);
        }
        await conn.execute(
          `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
          [qty, productId]
        );
      }

      // ─── Low-stock crossing checks (independent per target) ──

      // Variants (per_variant) — each variant uses its own threshold
      for (const [variantId, qty] of variantDecrements) {
        const v = variants[variantId];
        const p = products[v.product_id];
        const notif = await notificationsService.checkAndNotifyLowStock(conn, {
          product: p,
          variant: v,
          threshold: v.low_stock_threshold,
          prevQty: (v.stock_quantity ?? 0) + qty,
          newQty: v.stock_quantity ?? 0,
        });
        if (notif) lowStockNotifications.push(notif);
      }

      // Base config (per_variant) + no-variants — product threshold
      for (const [productId, qty] of baseDecrements) {
        const p = products[productId];
        const notif = await notificationsService.checkAndNotifyLowStock(conn, {
          product: p,
          variant: null,
          threshold: p.low_stock_threshold,
          prevQty: (p.stock_quantity ?? 0) + qty,
          newQty: p.stock_quantity ?? 0,
        });
        if (notif) lowStockNotifications.push(notif);
      }

      // Shared pool — product threshold, one check per product
      for (const [productId, qty] of sharedDecrements) {
        const p = products[productId];
        const notif = await notificationsService.checkAndNotifyLowStock(conn, {
          product: p,
          variant: null,
          threshold: p.low_stock_threshold,
          prevQty: (p.stock_quantity ?? 0) + qty,
          newQty: p.stock_quantity ?? 0,
        });
        if (notif) lowStockNotifications.push(notif);
      }
    }

    if (needsRestore) {
      // Only restore if the order was previously confirmed or shipped
      if (order.status !== 'confirmed' && order.status !== 'shipped') {
        // Nothing to restore — order was never decremented
      } else {
        const productIds = [...new Set(items.map((i) => i.product_id))];
        const productPh = productIds.map(() => '?').join(',');
        const [productRows] = await conn.execute(
          `SELECT id, product_type, stock_quantity, stock_mode
             FROM products WHERE id IN (${productPh}) FOR UPDATE`,
          productIds
        );
        const products = Object.fromEntries(productRows.map((p) => [p.id, p]));

        const sharedQty = new Map();
        for (const it of items) {
          const p = products[it.product_id];
          if (p && p.product_type === 'physical' && p.stock_mode === 'shared') {
            sharedQty.set(p.id, (sharedQty.get(p.id) || 0) + it.quantity);
          }
        }

        for (const it of items) {
          const p = products[it.product_id];
          if (!p || p.product_type !== 'physical') continue;
          if (p.stock_mode === 'shared') continue;

          if (it.variant_id) {
            await conn.execute(
              `UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?`,
              [it.quantity, it.variant_id]
            );
          } else {
            await conn.execute(
              `UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?`,
              [it.quantity, p.id]
            );
          }
        }

        for (const [productId, qty] of sharedQty) {
          await conn.execute(
            `UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?`,
            [qty, productId]
          );
        }
      }
    }

    const extra = {};
    if (isCancelling) {
      extra.rejection_reason = rejection_reason ?? null;
      extra.rejection_note = rejection_note ?? null;
      extra.rejected_by = 1;; 
    }

    await repo.updateStatus(conn, id, status, extra);
  });

  // Fire low-stock emails after transaction commits
  for (const n of lowStockNotifications) {
    const label = n.variantName
      ? `${n.productName} — ${n.variantName}`
      : n.productName;
    sendMail({
      to: env.mail.superadminEmail,
      subject: `Low stock: ${label}`,
      text: `Stock is ${n.newQty} (threshold: ${n.threshold}).`,
    }).catch((err) => logger.error(`Low-stock email failed: ${err.message}`));
  }

  return getAdminOrderDetail(id);
}

async function updateShippingInfo(id, input) {
  const order = await repo.findById(id);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.order_type !== 'physical') {
    throw ApiError.badRequest('Digital orders have no shipping');
  }

  const fields = {};
  for (const k of ['courier', 'tracking_number', 'status']) {
    if (input[k] !== undefined) fields[k] = input[k];
  }
  if (Object.keys(fields).length === 0) {
    throw ApiError.badRequest('Nothing to update');
  }

  await repo.updateShipping(id, fields);
  return getAdminOrderDetail(id);
}

module.exports = {
  createOrder,
  getOrderSummary,
  getAdminOrderDetail,
  listAdmin,
  changeStatus,
  updateShippingInfo,
};
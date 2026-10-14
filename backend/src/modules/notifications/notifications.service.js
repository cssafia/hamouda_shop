'use strict';

const ApiError = require('../../utils/apiError');
const repo = require('./notifications.repository');

async function onNewOrder(conn, order) {
  await repo.insert(conn, {
    type: 'new_order',
    title: `New order #${order.id}`,
    message: `${order.customer_name} placed an order for ${order.total_amount} DA`,
    related_type: 'order',
    related_id: order.id,
  });
}

async function onNewServiceRequest(conn, request) {
  await repo.insert(conn, {
    type: 'new_service_request',
    title: `New service request #${request.id}`,
    message: `${request.customer_name} requested: ${request.service_name}`,
    related_type: 'service_request',
    related_id: request.id,
  });
}

// Fire only on downward crossing of the product's notify_below threshold.
// Returns null or { product, newTotal } so the caller can send an email after commit.
async function checkAndNotifyLowStock(conn, { product, variant, threshold, prevQty, newQty }) {
  if (threshold == null) return null;
  if (!(prevQty >= threshold && newQty < threshold)) return null;

  const label = variant ? `${product.name} — ${variant.name}` : product.name;

  await repo.insert(conn, {
    type: 'low_stock',
    title: `Low stock: ${label}`,
    message: `Stock is ${newQty} (threshold: ${threshold})`,
    related_type: 'product',
    related_id: product.id,
  });

  return {
    productName: product.name,
    variantName: variant ? variant.name : null,
    newQty,
    threshold,
  };
}

async function list(query) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const onlyUnread = query.unread === 'true';
  const { rows, total } = await repo.list({ page, limit, onlyUnread });
  return {
    items: rows.map((r) => ({ ...r, is_read: !!r.is_read })),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function unreadCount() {
  return { count: await repo.countUnread() };
}

async function markRead(id) {
  const n = await repo.markRead(id);
  if (!n) throw ApiError.notFound('Notification not found');
}

async function markAllRead() {
  await repo.markAllRead();
}

module.exports = {
  onNewOrder,
  onNewServiceRequest,
  checkAndNotifyLowStock,
  list,
  unreadCount,
  markRead,
  markAllRead,
};
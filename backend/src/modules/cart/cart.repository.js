
const { pool } = require('../../config/database');

async function findBySessionId(sessionId) {
  const [rows] = await pool.execute(
    `SELECT id, session_id FROM carts WHERE session_id = ? LIMIT 1`,
    [sessionId]
  );
  return rows[0] || null;
}

async function create(sessionId) {
  const [result] = await pool.execute(
    `INSERT INTO carts (session_id) VALUES (?)`,
    [sessionId]
  );
  return result.insertId;
}

async function findOrCreate(sessionId) {
  let cart = await findBySessionId(sessionId);
  if (!cart) {
    const id = await create(sessionId);
    cart = { id, session_id: sessionId };
  }
  return cart;
}

async function listItems(cartId) {
  const [rows] = await pool.execute(
    `SELECT id, product_id, variant_id, quantity
       FROM cart_items WHERE cart_id = ?
      ORDER BY id ASC`,
    [cartId]
  );
  return rows;
}

async function findItem(cartId, productId, variantId) {
  const sql = variantId
    ? `SELECT id, quantity FROM cart_items
         WHERE cart_id = ? AND product_id = ? AND variant_id = ? LIMIT 1`
    : `SELECT id, quantity FROM cart_items
         WHERE cart_id = ? AND product_id = ? AND variant_id IS NULL LIMIT 1`;
  const params = variantId
    ? [cartId, productId, variantId]
    : [cartId, productId];
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
}

async function findItemById(cartId, itemId) {
  const [rows] = await pool.execute(
    `SELECT id, product_id, variant_id, quantity
       FROM cart_items WHERE id = ? AND cart_id = ? LIMIT 1`,
    [itemId, cartId]
  );
  return rows[0] || null;
}

async function insertItem(cartId, { product_id, variant_id, quantity }) {
  const [result] = await pool.execute(
    `INSERT INTO cart_items (cart_id, product_id, variant_id, quantity)
     VALUES (?, ?, ?, ?)`,
    [cartId, product_id, variant_id ?? null, quantity]
  );
  return result.insertId;
}

async function updateQuantity(itemId, quantity) {
  const [r] = await pool.execute(
    `UPDATE cart_items SET quantity = ? WHERE id = ?`,
    [quantity, itemId]
  );
  return r.affectedRows;
}

async function deleteItem(cartId, itemId) {
  const [r] = await pool.execute(
    `DELETE FROM cart_items WHERE id = ? AND cart_id = ?`,
    [itemId, cartId]
  );
  return r.affectedRows;
}

async function clear(cartId) {
  await pool.execute(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
}

async function sumQuantityExcludingItem(cartId, productId, excludeItemId) {
  const [rows] = await pool.execute(
    `SELECT COALESCE(SUM(quantity), 0) AS total
       FROM cart_items
      WHERE cart_id = ? AND product_id = ? AND id <> ?`,
    [cartId, productId, excludeItemId]
  );
  return Number(rows[0].total);
}

module.exports = {
  findBySessionId, create, findOrCreate,
  listItems, findItem, findItemById,
  insertItem, updateQuantity, deleteItem, clear,
  sumQuantityExcludingItem,
};
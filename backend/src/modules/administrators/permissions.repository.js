const { pool } = require('../../config/database');

async function hasPermission(administratorId, permissionKey) {
  const [rows] = await pool.execute(
    `SELECT 1
       FROM administrator_permissions ap
       JOIN permissions p ON p.id = ap.permission_id
      WHERE ap.administrator_id = ? AND p.key = ?
      LIMIT 1`,
    [administratorId, permissionKey]
  );
  return rows.length > 0;
}

async function listKeysByAdminId(administratorId) {
  const [rows] = await pool.execute(
    `SELECT p.key
       FROM administrator_permissions ap
       JOIN permissions p ON p.id = ap.permission_id
      WHERE ap.administrator_id = ?`,
    [administratorId]
  );
  return rows.map((r) => r.key);
}

module.exports = { hasPermission, listKeysByAdminId };
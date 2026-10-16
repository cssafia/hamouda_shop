// src/config/database.js
const fs = require('fs');
const mysql = require('mysql2/promise');
const env = require('./env');

/* ---------- SSL configuration ----------
   Priority:
     1. DB_SSL_CA_CONTENT env var (PEM as string)
     2. DB_SSL_CA file path
     3. Nothing (no SSL) — with a warning in production
*/
let ssl;
const caContent = process.env.DB_SSL_CA_CONTENT;

if (caContent) {
  ssl = {
    ca: caContent.replace(/\\n/g, '\n'),
    rejectUnauthorized: true,
  };
} else if (env.db.sslCa) {
  try {
    ssl = { ca: fs.readFileSync(env.db.sslCa), rejectUnauthorized: true };
  } catch {
    console.warn(`[db] CA file missing at "${env.db.sslCa}" — continuing without verification`);
    ssl = { rejectUnauthorized: false };
  }
} else {
  if (env.isProd) {
    console.warn('[db] No CA configured in production — SSL verification disabled');
  }
  ssl = { rejectUnauthorized: false };
}

/* ---------- Pool ---------- */
const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  ssl,

  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: env.db.queueLimit,
  connectTimeout: env.db.connectTimeout,

  charset: 'utf8mb4',
  timezone: 'Z',
  decimalNumbers: true,
  multipleStatements: false, // blocks stacked-query injection
});

/* ---------- Strict SQL mode on every connection ---------- */
pool.on('connection', (conn) => {
  conn.query(
    "SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'"
  );
});

/* ---------- Query helper — always use this with user input ---------- */
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/* ---------- Transaction helper with auto-rollback ---------- */
async function transaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { pool, query, transaction };
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../config/env');
const logger = require('../config/logger');

async function run() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const ssl = env.db.sslCa
    ? { ca: fs.readFileSync(env.db.sslCa), rejectUnauthorized: true }
    : undefined;

  const conn = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    ssl,
    charset: 'utf8mb4',
    multipleStatements: true, // required to run schema.sql as one script
  });

  try {
    logger.info('Applying schema.sql...');
    await conn.query(sql);
    logger.info('Schema applied successfully');
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  logger.error(`Migration failed: ${err.message}`);
  process.exit(1);
});
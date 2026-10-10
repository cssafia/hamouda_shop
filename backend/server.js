const env = require('./src/config/env');
const logger = require('./src/config/logger');
const db = require('./src/config/database');
const app = require('./app');

let server;

async function start() {
  try {
    await db.pool.getConnection().then((c) => c.release());
    logger.info('Database connected');

    server = app.listen(env.port, () => {
      logger.info(`${env.appName} listening on port ${env.port} [${env.nodeEnv}]`);
    });
  } catch (err) {
    logger.error(`Startup failed: ${err.message}`);
    process.exit(1);
  }
}

function shutdown(signal) {
  logger.info(`${signal} received — shutting down`);
  if (!server) return process.exit(0);

  server.close(async () => {
    try { await db.pool.end(); } catch { /* ignore */ }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
  shutdown('unhandledRejection');
});

start();
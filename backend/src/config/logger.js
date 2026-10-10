const env = require('./env');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const current = LEVELS[env.logLevel] ?? LEVELS.info;

function write(level, message, meta) {
  if (LEVELS[level] > current) return;
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  const out = level === 'debug' ? console.log : console[level];
  if (meta !== undefined) out(line, meta);
  else out(line);
}

module.exports = {
  error: (msg, meta) => write('error', msg, meta),
  warn: (msg, meta) => write('warn', msg, meta),
  info: (msg, meta) => write('info', msg, meta),
  debug: (msg, meta) => write('debug', msg, meta),
};
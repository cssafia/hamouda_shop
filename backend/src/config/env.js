require('dotenv').config();

const REQUIRED = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET','JWT_RESET_SECRET','JWT_EXPIRES_IN',
  'CORS_ORIGIN',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS',
    'MAIL_FROM_EMAIL', 'SUPERADMIN_EMAIL','FRONTEND_URL'
    
];

const missing = REQUIRED.filter((key) => !(key in process.env));
if (missing.length > 0) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}

const toInt = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const nodeEnv = process.env.NODE_ENV;

module.exports = {
  nodeEnv,
  isProd: nodeEnv === 'production',
  port: toInt(process.env.PORT, 3000),
  appName: process.env.APP_NAME || 'hamouda-shop',
  logLevel: (process.env.LOG_LEVEL || 'info').toLowerCase(),
  frontendUrl: process.env.FRONTEND_URL ,
  db: {
    host: process.env.DB_HOST,
    port: toInt(process.env.DB_PORT, 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    sslCa: process.env.DB_SSL_CA || null,
    connectionLimit: toInt(process.env.DB_CONNECTION_LIMIT, 10),
    queueLimit: toInt(process.env.DB_QUEUE_LIMIT, 0),
    connectTimeout: toInt(process.env.DB_CONNECT_TIMEOUT, 10000),
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    resetSecret: process.env.JWT_RESET_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ,
  },

  cors: {
    origin: process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean),
  },

  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toInt(process.env.RATE_LIMIT_MAX, 100),
  },

  bodyLimit: process.env.BODY_LIMIT || '1mb',

  upload: {
  dir: process.env.UPLOAD_DIR || 'storage/uploads',
  maxFileSize: toInt(process.env.MAX_FILE_SIZE, 5 * 1024 * 1024),
  driver: process.env.UPLOAD_DRIVER || 'local',
},

cloudinary: {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
  apiKey: process.env.CLOUDINARY_API_KEY || null,
  apiSecret: process.env.CLOUDINARY_API_SECRET || null,
  folder: process.env.CLOUDINARY_FOLDER || 'hamouda-shop',
},
  smtp: {
    host: process.env.SMTP_HOST,
    port: toInt(process.env.SMTP_PORT, 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  mail: {
    fromName: process.env.MAIL_FROM_NAME || 'Hamouda Shop',
    fromEmail: process.env.MAIL_FROM_EMAIL,
    superadminEmail: process.env.SUPERADMIN_EMAIL,
  },
};
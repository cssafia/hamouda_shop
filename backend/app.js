const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./src/config/env');
const { globalLimiter } = require('./src/middlewares/rateLimiter.middleware');
const notFound = require('./src/middlewares/notFound.middleware');
const errorHandler = require('./src/middlewares/error.middleware');

const app = express();

app.disable('x-powered-by');

// Disable ETag — API responses are dynamic, not static files.
// Prevents Express from responding 304 with an empty body on
// subsequent requests, which breaks auth flow and JSON parsing.
app.set('etag', false);

if (env.isProd) app.set('trust proxy', 1);

// ─── Security & parsing ────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({ origin: env.cors.origin, credentials: true }));
app.use(express.json({ limit: env.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: env.bodyLimit }));

// ─── Rate limiting ─────────────────────────────────────
app.use(globalLimiter);

// ─── Logging ───────────────────────────────────────────
app.use(morgan(env.isProd ? 'combined' : 'dev'));

// ─── Static uploads ────────────────────────────────────
app.use('/uploads', express.static(env.upload.dir));

// ─── Health ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK' });
});

// ─── API routes ────────────────────────────────────────
app.use('/api/auth', require('./src/modules/auth/auth.routes'));

const categoryRoutes = require('./src/modules/categories/categories.routes');
app.use('/api/categories',       categoryRoutes.publicRouter);
app.use('/api/admin/categories', categoryRoutes.adminRouter);

const brandRoutes = require('./src/modules/brands/brands.routes');
app.use('/api/brands',       brandRoutes.publicRouter);
app.use('/api/admin/brands', brandRoutes.adminRouter);

const productRoutes = require('./src/modules/products/products.routes');
app.use('/api/products',            productRoutes.publicRouter);
app.use('/api/admin/products',      productRoutes.adminRouter);
app.use('/api/admin/subscriptions', productRoutes.subscriptionRouter);

app.use('/api/admin/products', require('./src/modules/variants/variants.routes'));

const cartRoutes = require('./src/modules/cart/cart.routes');
app.use('/api/cart', cartRoutes);

const couponRoutes = require('./src/modules/coupons/coupons.routes');
app.use('/api/coupons',       couponRoutes.publicRouter);
app.use('/api/admin/coupons', couponRoutes.adminRouter);

const shippingRoutes = require('./src/modules/shippings/shippings.routes');
app.use('/api/shipping', shippingRoutes.publicRouter);

const orderRoutes = require('./src/modules/orders/orders.routes');
app.use('/api/orders',       orderRoutes.publicRouter);
app.use('/api/admin/orders', orderRoutes.adminRouter);

app.use('/api/admin/notifications', require('./src/modules/notifications/notifications.routes'));

// ─── 404 & errors ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
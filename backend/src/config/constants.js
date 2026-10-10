const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
};

const PRODUCT_TYPE = {
  PHYSICAL: 'physical',
  DIGITAL: 'digital',
};

const ORDER_TYPE = {
  PHYSICAL: 'physical',
  DIGITAL: 'digital',
};

const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
};

const SERVICE_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
};

const NOTIFICATION_TYPE = {
  NEW_ORDER: 'new_order',
  NEW_SERVICE_REQUEST: 'new_service_request',
};

const NOTIFICATION_RELATED_TYPE = {
  ORDER: 'order',
  SERVICE_REQUEST: 'service_request',
};

const DELIVERY_TYPE = {
  HOME: 'home',
  STOP_DESK: 'stop_desk',
};

const COUPON_SCOPE = {
  ALL: 'all',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
};

const DISCOUNT_TYPE = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
};

const PERMISSIONS = {
  ADMINISTRATORS_CREATE: 'administrators.create',
  ADMINISTRATORS_READ: 'administrators.read',
  ADMINISTRATORS_UPDATE: 'administrators.update',
  ADMINISTRATORS_DELETE: 'administrators.delete',
  ADMINISTRATORS_ASSIGN: 'administrators.assign_permissions',

  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_READ: 'categories.read',
  CATEGORIES_UPDATE: 'categories.update',
  CATEGORIES_DELETE: 'categories.delete',

  BRANDS_CREATE: 'brands.create',
  BRANDS_READ: 'brands.read',
  BRANDS_UPDATE: 'brands.update',
  BRANDS_DELETE: 'brands.delete',

  USAGES_CREATE: 'usages.create',
  USAGES_READ: 'usages.read',
  USAGES_UPDATE: 'usages.update',
  USAGES_DELETE: 'usages.delete',

  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_READ: 'products.read',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',

  VARIANTS_CREATE: 'variants.create',
  VARIANTS_READ: 'variants.read',
  VARIANTS_UPDATE: 'variants.update',
  VARIANTS_DELETE: 'variants.delete',

  IMAGES_CREATE: 'images.create',
  IMAGES_READ: 'images.read',
  IMAGES_DELETE: 'images.delete',

  COUPONS_CREATE: 'coupons.create',
  COUPONS_READ: 'coupons.read',
  COUPONS_UPDATE: 'coupons.update',
  COUPONS_DELETE: 'coupons.delete',

  ORDERS_READ: 'orders.read',
  ORDERS_UPDATE_STATUS: 'orders.update_status',

  SHIPPINGS_READ: 'shippings.read',
  SHIPPINGS_UPDATE: 'shippings.update',

  SERVICE_REQUESTS_READ: 'serviceRequests.read',
  SERVICE_REQUESTS_ACCEPT: 'serviceRequests.accept',
  SERVICE_REQUESTS_REJECT: 'serviceRequests.reject',
  SERVICE_REQUESTS_COMPLETE: 'serviceRequests.complete',

  NOTIFICATIONS_READ: 'notifications.read',

  DASHBOARD_READ: 'dashboard.read',
};
const USAGES = [
  { key: 'gaming',         label: 'Gaming' },
  { key: 'programming',    label: 'Programming' },
  { key: 'web_dev',        label: 'Web Development' },
  { key: 'studies',        label: 'Studies' },
  { key: 'architecture',   label: 'Architecture' },
  { key: 'graphic_design', label: 'Graphic Design' },
  { key: 'video_editing',  label: 'Video Editing' },
  { key: 'professional',   label: 'Professional Use' },
  { key: 'daily',          label: 'Daily Use' },
];
const USAGE_KEYS = USAGES.map((u) => u.key);
const DURATIONS = [
  '1 month',
  '3 months',
  '6 months',
  '12 months',
];

module.exports = {
  ROLES,
  PRODUCT_TYPE,
  ORDER_TYPE,
  ORDER_STATUS,
  SERVICE_REQUEST_STATUS,
  NOTIFICATION_TYPE,
  NOTIFICATION_RELATED_TYPE,
  DELIVERY_TYPE,
  COUPON_SCOPE,
  DISCOUNT_TYPE,
  PERMISSIONS, USAGE_KEYS, USAGES,
  DURATIONS
};


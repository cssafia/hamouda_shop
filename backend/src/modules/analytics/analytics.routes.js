
const router = require('express').Router();

const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');
const validate = require('../../middlewares/validate.middleware');

const controller = require('./analytics.controller');
const validators = require('../../validators/analytics.validators');

router.use(auth);
router.use(role(ROLES.SUPERADMIN));

/* ─── Dashboard ─── */
router.get('/dashboard/priority', controller.getPriority);
router.get('/dashboard/today', controller.getToday);

router.get(
  '/dashboard/revenue',
  validate(validators.dashboardRevenue),
  controller.getDashboardRevenue
);

/* ─── Reports ─── */
router.get(
  '/reports/summary',
  validate(validators.reportsSummary),
  controller.getReportsSummary
);

router.get(
  '/reports/revenue',
  validate(validators.reportsRevenue),
  controller.getReportsRevenue
);

router.get(
  '/reports/orders',
  validate(validators.reportsOrders),
  controller.getReportsOrders
);

router.get(
  '/reports/top-products',
  validate(validators.topList),
  controller.getTopProducts
);

router.get(
  '/reports/top-categories',
  validate(validators.topList),
  controller.getTopCategories
);

router.get(
  '/reports/top-wilayas',
  validate(validators.topList),
  controller.getTopWilayas
);

module.exports = router;
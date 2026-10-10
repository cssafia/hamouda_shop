
const express = require('express');
const controller = require('./products.controller');
const productValidator = require('../../validators/products.validator');
const subscriptionValidator = require('../../validators/subscriptions.validator');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { productImages } = require('../../middlewares/upload.middleware');
const { ROLES } = require('../../config/constants');

const publicRouter = express.Router();
const adminRouter = express.Router();
const subscriptionRouter = express.Router();

// ─── Public ────────────────────────────────────────────
publicRouter.get('/', validate(productValidator.listPublic), controller.listPublic);
publicRouter.get('/:id', controller.getPublicById);

// ─── Admin — physical products ─────────────────────────
adminRouter.use(auth, role(ROLES.SUPERADMIN));

adminRouter.get('/', controller.listAdmin);
adminRouter.get('/:id', controller.getAdminById);

adminRouter.post(
  '/',
  productImages,
  controller.parseMultipart,
  validate(productValidator.create),
  controller.create
);

adminRouter.patch(
  '/:id',
  productImages,
  controller.parseMultipart,
  validate(productValidator.update),
  controller.update
);

adminRouter.patch('/:id/status', validate(productValidator.status), controller.setStatus);

// ─── Admin — subscriptions ─────────────────────────────
subscriptionRouter.use(auth, role(ROLES.SUPERADMIN));

subscriptionRouter.post(
  '/',
  productImages,
  controller.parseMultipart,
  controller.forceDigitalType,
  validate(subscriptionValidator.create),
  controller.create
);

subscriptionRouter.patch(
  '/:id',
  productImages,
  controller.parseMultipart,
  controller.forceDigitalType,
  validate(subscriptionValidator.update),
  controller.update
);


module.exports = { publicRouter, adminRouter, subscriptionRouter };
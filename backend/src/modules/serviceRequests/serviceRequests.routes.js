
const express = require('express');
const controller = require('./serviceRequests.controller');
const validator = require('../../validators/serviceRequests.validator');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');
const { ROLES } = require('../../config/constants');

const publicRouter = express.Router();
const adminRouter = express.Router();

// ─── Public ────────────────────────────────────────────
publicRouter.post(
  '/',
  authLimiter,
  validate(validator.create),
  controller.create
);

// ─── Admin ─────────────────────────────────────────────
adminRouter.use(auth, role(ROLES.SUPERADMIN));

adminRouter.get('/', validate(validator.list), controller.listAdmin);
adminRouter.get('/:id', controller.getById);
adminRouter.patch('/:id/complete', validate(validator.complete), controller.complete);
adminRouter.patch('/:id/cancel', validate(validator.cancel), controller.cancel);

module.exports = { publicRouter, adminRouter };
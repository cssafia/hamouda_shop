
const express = require('express');
const controller = require('./brands.controller');
const validator = require('../../validators/brands.validator');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

const publicRouter = express.Router();
const adminRouter = express.Router();

// ─── Public ────────────────────────────────────────────
publicRouter.get('/', validate(validator.listPublic), controller.listPublic);

// ─── Admin ─────────────────────────────────────────────
adminRouter.use(auth, role(ROLES.SUPERADMIN));

adminRouter.get('/', controller.listAdmin);
adminRouter.post('/', validate(validator.create), controller.create);
adminRouter.patch('/:id', validate(validator.update), controller.update);
adminRouter.patch('/:id/status', validate(validator.status), controller.setStatus);

module.exports = { publicRouter, adminRouter };
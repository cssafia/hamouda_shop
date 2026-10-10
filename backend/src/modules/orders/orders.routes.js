
const express = require('express');
const controller = require('./orders.controller');
const validator = require('../../validators/orders.validator');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

const publicRouter = express.Router();
const adminRouter = express.Router();

// Public — place an order
publicRouter.post('/', validate(validator.create), controller.create);

// Admin
adminRouter.use(auth, role(ROLES.SUPERADMIN));
adminRouter.get('/', validate(validator.list), controller.listAdmin);
adminRouter.get('/:id', controller.getAdminById);
adminRouter.patch('/:id/status', validate(validator.status), controller.changeStatus);
adminRouter.patch('/:id/shipping', validate(validator.shippingUpdate), controller.updateShipping);

module.exports = { publicRouter, adminRouter };
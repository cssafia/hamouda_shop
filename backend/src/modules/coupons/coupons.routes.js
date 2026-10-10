
const express = require('express');
const controller = require('./coupons.controller');
const validator = require('../../validators/coupons.validator');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

const publicRouter = express.Router();
const adminRouter = express.Router();

// Public — validate a coupon against the current cart
publicRouter.post('/validate', validate(validator.validate), controller.validate);

// Admin
adminRouter.use(auth, role(ROLES.SUPERADMIN));
adminRouter.get('/', validate(validator.list), controller.list);
adminRouter.get('/:id', controller.getById);
adminRouter.post('/', validate(validator.create), controller.create);
adminRouter.patch('/:id', validate(validator.update), controller.update);
adminRouter.patch('/:id/status', validate(validator.status), controller.setStatus);

module.exports = { publicRouter, adminRouter };
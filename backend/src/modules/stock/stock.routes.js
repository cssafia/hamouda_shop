'use strict';

const express = require('express');
const controller = require('./stock.controller');
const validator = require('../../validators/stock.validator');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

const router = express.Router();

router.use(auth, role(ROLES.SUPERADMIN));

router.get('/', validate(validator.list), controller.list);
router.get('/:productId', controller.getOne);
router.patch('/:productId', validate(validator.adjust), controller.adjust);

module.exports = router;

const express = require('express');
const controller = require('./variants.controller');
const validator = require('../../validators/variants.validator');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

const router = express.Router();

router.use(auth, role(ROLES.SUPERADMIN));

router.get('/:id/variants', controller.list);
router.post('/:id/variants', validate(validator.create), controller.create);
router.patch('/:id/variants/:variantId', validate(validator.update), controller.update);
router.patch('/:id/variants/:variantId/status', validate(validator.status), controller.setStatus);

module.exports = router;

const express = require('express');
const controller = require('./cart.controller');
const validator = require('../../validators/cart.validator');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

router.get('/', controller.get);
router.post('/items', validate(validator.add), controller.add);
router.patch('/items/:id', validate(validator.updateQty), controller.updateQty);
router.delete('/items/:id', controller.remove);
router.delete('/', controller.clear);

module.exports = router;
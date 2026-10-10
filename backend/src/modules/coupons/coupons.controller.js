
const asyncHandler = require('../../utils/asyncHandler');
const { success, paginated } = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const service = require('./coupons.service');
const cartService = require('../cart/cart.service');

const validate = asyncHandler(async (req, res) => {
  const sessionId = cartService.getSessionId(req);
  const cart = await cartService.getCart(sessionId);
  const result = await service.validateForCart(req.body.code, cart);
  return success(res, {
    valid: result.valid,
    discount: result.discount || 0,
    message: result.message,
    coupon: result.coupon || null,
  });
});

const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query);
  return paginated(res, items, meta, 'Coupons');
});

const getById = asyncHandler(async (req, res) => {
  const data = await service.getById(req.params.id);
  return success(res, data);
});

const create = asyncHandler(async (req, res) => {
  const data = await service.create(req.body);
  return success(res, data, 'Coupon created', 201);
});

const update = asyncHandler(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  return success(res, data, 'Coupon updated');
});

const setStatus = asyncHandler(async (req, res) => {
  const data = await service.setStatus(req.params.id, req.body.is_active);
  return success(res, data, 'Coupon status updated');
});

module.exports = { validate, list, getById, create, update, setStatus };
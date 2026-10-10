
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/apiResponse');
const service = require('./cart.service');

const get = asyncHandler(async (req, res) => {
  const sessionId = service.getSessionId(req);
  const data = await service.getCart(sessionId, req.query.coupon);
  return success(res, data);
});

const add = asyncHandler(async (req, res) => {
  const sessionId = service.getSessionId(req);
  const data = await service.addItem(sessionId, req.body);
  return success(res, data, 'Added to cart');
});

const updateQty = asyncHandler(async (req, res) => {
  const sessionId = service.getSessionId(req);
  const data = await service.updateQuantity(sessionId, req.params.id, req.body.quantity);
  return success(res, data, 'Cart updated');
});

const remove = asyncHandler(async (req, res) => {
  const sessionId = service.getSessionId(req);
  const data = await service.removeItem(sessionId, req.params.id);
  return success(res, data, 'Item removed');
});

const clear = asyncHandler(async (req, res) => {
  const sessionId = service.getSessionId(req);
  const data = await service.clearCart(sessionId);
  return success(res, data, 'Cart cleared');
});

module.exports = { get, add, updateQty, remove, clear };
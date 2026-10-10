
const asyncHandler = require('../../utils/asyncHandler');
const { success, paginated } = require('../../utils/apiResponse');
const cartService = require('../cart/cart.service');
const service = require('./orders.service');

const create = asyncHandler(async (req, res) => {
  const sessionId = cartService.getSessionId(req);
  const data = await service.createOrder(sessionId, req.body);
  return success(res, data, 'Order placed', 201);
});

const listAdmin = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listAdmin(req.query);
  return paginated(res, items, meta, 'Orders');
});

const getAdminById = asyncHandler(async (req, res) => {
  const data = await service.getAdminOrderDetail(req.params.id);
  return success(res, data);
});

const changeStatus = asyncHandler(async (req, res) => {
  const data = await service.changeStatus(req.params.id, req.body);
  return success(res, data, 'Status updated');
});

const updateShipping = asyncHandler(async (req, res) => {
  const data = await service.updateShippingInfo(req.params.id, req.body);
  return success(res, data, 'Shipping updated');
});

module.exports = { create, listAdmin, getAdminById, changeStatus, updateShipping };
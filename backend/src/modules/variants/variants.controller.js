
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/apiResponse');
const service = require('./variants.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.listForProduct(req.params.id, true);
  return success(res, data, 'Variants');
});

const create = asyncHandler(async (req, res) => {
  const data = await service.create(req.params.id, req.body);
  return success(res, data, 'Variant created', 201);
});

const update = asyncHandler(async (req, res) => {
  const data = await service.update(req.params.id, req.params.variantId, req.body);
  return success(res, data, 'Variant updated');
});

const setStatus = asyncHandler(async (req, res) => {
  const data = await service.setStatus(req.params.id, req.params.variantId, req.body.is_active);
  return success(res, data, 'Variant status updated');
});

module.exports = { list, create, update, setStatus };
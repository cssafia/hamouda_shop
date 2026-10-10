
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/apiResponse');
const service = require('./brands.service');

const listPublic = asyncHandler(async (req, res) => {
  const data = await service.listPublic(req.query);
  return success(res, data, 'Brands');
});

const listAdmin = asyncHandler(async (req, res) => {
  const data = await service.listAdmin();
  return success(res, data, 'Brands');
});

const create = asyncHandler(async (req, res) => {
  const data = await service.create(req.body);
  return success(res, data, 'Brand created', 201);
});

const update = asyncHandler(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  return success(res, data, 'Brand updated');
});

const setStatus = asyncHandler(async (req, res) => {
  const data = await service.setStatus(req.params.id, req.body.is_active);
  return success(res, data, 'Brand status updated');
});

module.exports = { listPublic, listAdmin, create, update, setStatus };
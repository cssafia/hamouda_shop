
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/apiResponse');
const service = require('./categories.service');

const listPublic = asyncHandler(async (req, res) => {
  const data = await service.listPublic();
  return success(res, data, 'Categories');
});

const listAdmin = asyncHandler(async (req, res) => {
  const data = await service.listAdmin();
  return success(res, data, 'Categories');
});

const create = asyncHandler(async (req, res) => {
  const data = await service.create(req.body);
  return success(res, data, 'Category created', 201);
});

const update = asyncHandler(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  return success(res, data, 'Category updated');
});

const setStatus = asyncHandler(async (req, res) => {
  const data = await service.setStatus(req.params.id, req.body.is_active);
  return success(res, data, 'Category status updated');
});

module.exports = { listPublic, listAdmin, create, update, setStatus };
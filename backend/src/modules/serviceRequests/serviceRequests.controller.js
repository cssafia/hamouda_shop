
const asyncHandler = require('../../utils/asyncHandler');
const { success, paginated } = require('../../utils/apiResponse');
const service = require('./serviceRequests.service');

const create = asyncHandler(async (req, res) => {
  const data = await service.create(req.body);
  return success(res, data, 'Request submitted', 201);
});

const listAdmin = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listAdmin(req.query);
  return paginated(res, items, meta, 'Service requests');
});

const getById = asyncHandler(async (req, res) => {
  const data = await service.getById(req.params.id);
  return success(res, data, 'Service request');
});

const complete = asyncHandler(async (req, res) => {
  const data = await service.complete(req.params.id, req.body.profit);
  return success(res, data, 'Request completed');
});

const cancel = asyncHandler(async (req, res) => {
  const data = await service.cancel(req.params.id);
  return success(res, data, 'Request cancelled');
});

module.exports = { create, listAdmin, getById, complete, cancel };

const asyncHandler = require('../../utils/asyncHandler');
const { success, paginated } = require('../../utils/apiResponse');
const service = require('./stock.service');

const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query);
  return paginated(res, items, meta, 'Stock');
});

const getOne = asyncHandler(async (req, res) => {
  const data = await service.getOne(req.params.productId);
  return success(res, data, 'Stock');
});

const adjust = asyncHandler(async (req, res) => {
  const { delta, variant_id } = req.body;
  const data = await service.adjust(req.params.productId, delta, variant_id ?? null);
  return success(res, data, 'Stock mis à jour');
});

module.exports = { list, getOne, adjust };
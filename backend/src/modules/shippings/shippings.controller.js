
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const repo = require('./locations.repository');

const listWilayas = asyncHandler(async (req, res) => {
  return success(res, repo.listWilayas());
});

const listCommunes = asyncHandler(async (req, res) => {
  const { wilaya } = req.query;
  if (!wilaya) throw ApiError.badRequest('wilaya is required');
  const w = repo.findWilaya(wilaya);
  if (!w) throw ApiError.notFound('Wilaya not found');
  return success(res, { wilaya: w, communes: repo.listCommunes(wilaya) });
});

module.exports = { listWilayas, listCommunes };
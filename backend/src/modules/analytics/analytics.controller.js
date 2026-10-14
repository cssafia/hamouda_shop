const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/apiResponse');
const service = require('./analytics.service');

/* ─── Dashboard ─────────────────────────────────────────────── */

const getPriority = asyncHandler(async (_req, res) => {
  const data = await service.getPriority();
  return success(res, data, 'Priority');
});

const getToday = asyncHandler(async (_req, res) => {
  const data = await service.getToday();
  return success(res, data, 'Today');
});

const getDashboardRevenue = asyncHandler(async (req, res) => {
  const { period = '7d', metric = 'revenue' } = req.query;
  const data = await service.getDashboardRevenue({ period, metric });
  return success(res, data, 'Revenue');
});

/* ─── Reports ───────────────────────────────────────────────── */

const getReportsSummary = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await service.getReportsSummary({ from, to });
  return success(res, data, 'Summary');
});

const getReportsRevenue = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await service.getReportsRevenue({ from, to });
  return success(res, data, 'Revenue');
});

const getReportsOrders = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await service.getReportsOrders({ from, to });
  return success(res, data, 'Orders');
});

const getTopProducts = asyncHandler(async (req, res) => {
  const { from, to, limit = 10 } = req.query;
  const data = await service.getTopProducts({ from, to, limit });
  return success(res, data, 'Top products');
});

const getTopCategories = asyncHandler(async (req, res) => {
  const { from, to, limit = 10 } = req.query;
  const data = await service.getTopCategories({ from, to, limit });
  return success(res, data, 'Top categories');
});

const getTopWilayas = asyncHandler(async (req, res) => {
  const { from, to, limit = 10 } = req.query;
  const data = await service.getTopWilayas({ from, to, limit });
  return success(res, data, 'Top wilayas');
});

module.exports = {
  getPriority,
  getToday,
  getDashboardRevenue,
  getReportsSummary,
  getReportsRevenue,
  getReportsOrders,
  getTopProducts,
  getTopCategories,
  getTopWilayas,
};
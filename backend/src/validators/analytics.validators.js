const { query } = require('express-validator');
const { PERIOD_PRESETS } = require('../modules/analytics/analytics.helpers');

const periodValues = Object.keys(PERIOD_PRESETS); // ['7d','30d','90d']
const metricValues = ['revenue', 'profit'];

const dashboardRevenue = [
  query('period').optional().isIn(periodValues),
  query('metric').optional().isIn(metricValues),
];

const reportsRevenue = [
  query('from').isISO8601().withMessage('from must be a date'),
  query('to').isISO8601().withMessage('to must be a date'),
];

const reportsSummary = reportsRevenue;
const reportsOrders = reportsRevenue;

const topList = [
  query('from').isISO8601().withMessage('from must be a date'),
  query('to').isISO8601().withMessage('to must be a date'),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];

module.exports = {
  dashboardRevenue,
  reportsRevenue,
  reportsSummary,
  reportsOrders,
  topList,
};
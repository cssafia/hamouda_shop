
const asyncHandler = require('../../utils/asyncHandler');
const { success, paginated } = require('../../utils/apiResponse');
const service = require('./notifications.service');

const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query);
  return paginated(res, items, meta, 'Notifications');
});

const unreadCount = asyncHandler(async (req, res) => {
  const data = await service.unreadCount();
  return success(res, data);
});

const markRead = asyncHandler(async (req, res) => {
  await service.markRead(req.params.id);
  return success(res, null, 'Marked as read');
});

const markAllRead = asyncHandler(async (req, res) => {
  await service.markAllRead();
  return success(res, null, 'All marked as read');
});

module.exports = { list, unreadCount, markRead, markAllRead };
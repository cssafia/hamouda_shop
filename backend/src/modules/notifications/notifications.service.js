
const ApiError = require('../../utils/apiError');
const repo = require('./notifications.repository');

async function onNewOrder(conn, order) {
  await repo.insert(conn, {
    type: 'new_order',
    title: `New order #${order.id}`,
    message: `${order.customer_name} placed an order for ${order.total_amount} DA`,
    related_type: 'order',
    related_id: order.id,
  });
}

async function onNewServiceRequest(conn, request) {
  await repo.insert(conn, {
    type: 'new_service_request',
    title: `New service request #${request.id}`,
    message: `${request.customer_name} requested: ${request.service_name}`,
    related_type: 'service_request',
    related_id: request.id,
  });
}

async function list(query) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const onlyUnread = query.unread === 'true';
  const { rows, total } = await repo.list({ page, limit, onlyUnread });
  return {
    items: rows.map((r) => ({ ...r, is_read: !!r.is_read })),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function unreadCount() {
  const count = await repo.countUnread();
  return { count };
}

async function markRead(id) {
  const n = await repo.markRead(id);
  if (!n) throw ApiError.notFound('Notification not found');
}

async function markAllRead() {
  await repo.markAllRead();
}

module.exports = {
  onNewOrder,
  onNewServiceRequest,
  list,
  unreadCount,
  markRead,
  markAllRead,
};
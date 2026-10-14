
const ApiError = require('../../utils/apiError');
const env = require('../../config/env');
const logger = require('../../config/logger');
const { sendMail } = require('../../utils/mailers');
const notificationsService = require('../notifications/notifications.service');
const repo = require('./serviceRequests.repository');

function sanitize(item) {
  return {
    id: item.id,
    customer_name: item.customer_name,
    customer_phone: item.customer_phone,
    service_name: item.service_name,
    description: item.description,
    status: item.status,
    profit: item.profit != null ? Number(item.profit) : null,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

async function create(input) {
  const id = await repo.insert(input);

  const created = await repo.findById(id);

  // Notification for the admin (in-app).
  await notificationsService.onNewServiceRequest(null, {
    id,
    customer_name: input.customer_name,
    service_name: input.service_name,
  });

  // Fire-and-forget email.
  sendMail({
    to: env.mail.superadminEmail,
    subject: `New service request #${id}`,
    text: `${input.customer_name} (${input.customer_phone}) requested: ${input.service_name}`,
  }).catch((err) => logger.error(`Service request email failed: ${err.message}`));

  return { id: created.id, status: created.status, created_at: created.created_at };
}

async function listAdmin(query) {
  const page = query.page || 1;
  const limit = query.limit || 20;

  const { rows, total } = await repo.list({
    page, limit,
    status: query.status,
    search: query.search,
    date_from: query.date_from,
    date_to: query.date_to,
    sort: query.sort,
  });

  return {
    items: rows.map((r) => ({
      id: r.id,
      customer_name: r.customer_name,
      customer_phone: r.customer_phone,
      service_name: r.service_name,
      status: r.status,
      created_at: r.created_at,
    })),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function getById(id) {
  const item = await repo.findById(id);
  if (!item) throw ApiError.notFound('Service request not found');
  return sanitize(item);
}

async function complete(id, profit) {
  const item = await repo.findById(id);
  if (!item) throw ApiError.notFound('Service request not found');
  if (item.status !== 'pending') {
    throw ApiError.badRequest('Only pending requests can be completed');
  }

  await repo.updateStatus(id, 'completed', profit);
  return getById(id);
}

async function cancel(id) {
  const item = await repo.findById(id);
  if (!item) throw ApiError.notFound('Service request not found');
  if (item.status !== 'pending') {
    throw ApiError.badRequest('Only pending requests can be cancelled');
  }

  await repo.updateStatus(id, 'cancelled', null);
  return getById(id);
}

module.exports = { create, listAdmin, getById, complete, cancel };
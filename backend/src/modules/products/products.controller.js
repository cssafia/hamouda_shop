
const asyncHandler = require('../../utils/asyncHandler');
const { success, paginated } = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const service = require('./products.service');

// ─── Multipart helpers ─────────────────────────────────

function parseMultipart(req, res, next) {
  if (!req.body || typeof req.body.data !== 'string') return next();
  try {
    const parsed = JSON.parse(req.body.data);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return next(ApiError.badRequest('data field must be a JSON object'));
    }
    req.body = { ...req.body, ...parsed };
    delete req.body.data;
    next();
  } catch {
    next(ApiError.badRequest('Invalid JSON in data field'));
  }
}

function filesToUrls(files) {
  if (!files || files.length === 0) return [];
  return files.map((f) => `/uploads/${f.filename}`);
}

function buildImages(body, uploadedUrls) {
  const kept = Array.isArray(body.keep_image_urls) ? body.keep_image_urls : [];
  const combined = [...kept, ...uploadedUrls];
  if (combined.length === 0) return [];

  const order = Array.isArray(body.image_order) && body.image_order.length
    ? body.image_order
    : combined.map((_, i) => i);

  for (const i of order) {
    if (i < 0 || i >= combined.length) {
      throw ApiError.badRequest('image_order contains an out-of-range index');
    }
  }

  const primaryIndex = Number.isInteger(body.primary_image_index)
    ? body.primary_image_index
    : 0;
  if (primaryIndex < 0 || primaryIndex >= combined.length) {
    throw ApiError.badRequest('primary_image_index out of range');
  }

  return order.map((idx, pos) => ({
    url: combined[idx],
    is_primary: idx === primaryIndex,
    display_order: pos,
  }));
}

// Force product_type on subscription routes. Runs after parseMultipart.
function forceDigitalType(req, res, next) {
  req.body.product_type = 'digital';
  next();
}

// ─── Public ────────────────────────────────────────────

const listPublic = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listPublic(req.query);
  return paginated(res, items, meta, 'Products');
});

const getPublicById = asyncHandler(async (req, res) => {
  const data = await service.getPublicById(req.params.id);
  console.log(res, data);
  return success(res, data, 'Product');
});

// ─── Admin — products ──────────────────────────────────

const listAdmin = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listAdmin(req.query);
  return paginated(res, items, meta, 'Products');
});

const getAdminById = asyncHandler(async (req, res) => {
  const data = await service.getAdminById(req.params.id);
  return success(res, data, 'Product');
});

const create = asyncHandler(async (req, res) => {
  const uploadedUrls = filesToUrls(req.files);
  const images = buildImages(req.body, uploadedUrls);
  const payload = { ...req.body, images };
  delete payload.keep_image_urls;
  delete payload.primary_image_index;
  delete payload.image_order;

  const data = await service.create(payload);
  return success(res, data, 'Product created', 201);
});

const update = asyncHandler(async (req, res) => {
  const uploadedUrls = filesToUrls(req.files);
  const hasImageChange =
    uploadedUrls.length > 0 ||
    Array.isArray(req.body.keep_image_urls);

  let images;
  if (hasImageChange) {
    images = buildImages(req.body, uploadedUrls);
  }

  const payload = { ...req.body };
  if (images !== undefined) payload.images = images;
  delete payload.keep_image_urls;
  delete payload.primary_image_index;
  delete payload.image_order;

  const data = await service.update(req.params.id, payload);
  return success(res, data, 'Product updated');
});

const setStatus = asyncHandler(async (req, res) => {
  const data = await service.setStatus(req.params.id, req.body.is_active);
  return success(res, data, 'Product status updated');
});

// ─── Admin — subscriptions ─────────────────────────────

const listSubscriptions = asyncHandler(async (req, res) => {
  const query = { ...req.query, product_type: 'digital' };
  const { items, meta } = await service.listAdmin(query);
  return paginated(res, items, meta, 'Subscriptions');
});

module.exports = {
  parseMultipart,
  forceDigitalType,
  listPublic,
  getPublicById,
  listAdmin,
  listSubscriptions,
  getAdminById,
  create,
  update,
  setStatus,
};
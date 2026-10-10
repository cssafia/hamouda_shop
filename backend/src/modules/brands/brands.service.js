
const ApiError = require('../../utils/apiError');
const db = require('../../config/database');
const repo = require('./brands.repository');

async function listPublic({ category_id } = {}) {
  return repo.listActive(category_id || null);
}

async function listAdmin() {
  return repo.listAll();
}

async function create({ name, category_ids = [] }) {
  if (await repo.nameExists(name)) {
    throw ApiError.conflict('A brand with this name already exists');
  }

  const uniqueIds = [...new Set(category_ids)];
  if (uniqueIds.length && !(await repo.categoryIdsExist(uniqueIds))) {
    throw ApiError.badRequest('One or more categories do not exist');
  }

  const id = await db.transaction(async (conn) => {
    return repo.create(conn, name, uniqueIds);
  });

  return repo.findById(id);
}

async function update(id, { name, category_ids }) {
  const brand = await repo.findById(id);
  if (!brand) throw ApiError.notFound('Brand not found');

  if (name !== undefined && name !== brand.name) {
    if (await repo.nameExists(name, id)) {
      throw ApiError.conflict('A brand with this name already exists');
    }
  }

  const uniqueIds =
    category_ids === undefined ? undefined : [...new Set(category_ids)];

  if (uniqueIds && uniqueIds.length && !(await repo.categoryIdsExist(uniqueIds))) {
    throw ApiError.badRequest('One or more categories do not exist');
  }

  await db.transaction(async (conn) => {
    if (name !== undefined && name !== brand.name) {
      await repo.update(id, name);
    }
    if (uniqueIds !== undefined) {
      await repo.replaceCategories(conn, id, uniqueIds);
    }
  });

  return repo.findById(id);
}

async function setStatus(id, is_active) {
  const brand = await repo.findById(id);
  if (!brand) throw ApiError.notFound('Brand not found');
  await repo.setStatus(id, is_active);
  return repo.findById(id);
}

module.exports = { listPublic, listAdmin, create, update, setStatus };

const ApiError = require('../../utils/apiError');
const repo = require('./categories.repository');

async function listPublic() {
  return repo.listActive();
}

async function listAdmin() {
  return repo.listAll();
}

async function create({ name }) {
  if (await repo.nameExists(name)) {
    throw ApiError.conflict('A category with this name already exists');
  }
  const id = await repo.create(name);
  return repo.findById(id);
}

async function update(id, { name }) {
  const category = await repo.findById(id);
  if (!category) throw ApiError.notFound('Category not found');

  if (name !== category.name) {
    if (await repo.nameExists(name, id)) {
      throw ApiError.conflict('A category with this name already exists');
    }
    await repo.update(id, name);
  }
  return repo.findById(id);
}

async function setStatus(id, is_active) {
  const category = await repo.findById(id);
  if (!category) throw ApiError.notFound('Category not found');
  await repo.setStatus(id, is_active);
  return repo.findById(id);
}

module.exports = { listPublic, listAdmin, create, update, setStatus };
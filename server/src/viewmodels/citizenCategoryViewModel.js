import {
  createCitizenCategory,
  deleteCitizenCategory,
  findCitizenCategoryById,
  findCitizenCategoryByName,
  listCitizenCategories,
  updateCitizenCategory,
} from "../models/citizenCategoryModel.js";

function normalizeCategory(row) {
  return {
    categoryid: Number(row.categoryid),
    categoryname: row.categoryname,
    discount: Number(row.discount || 0),
  };
}

function parseDiscount(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    return null;
  }
  if (value < 0 || value > 100) {
    return null;
  }
  return Number(value.toFixed(2));
}

export async function getCitizenCategories() {
  const items = await listCitizenCategories();
  return { ok: true, status: 200, data: items.map(normalizeCategory) };
}

export async function createCitizenCategoryVm(payload) {
  const name = String(payload?.name || "").trim();
  const discount = parseDiscount(payload?.discount);

  if (!name) {
    return { ok: false, status: 400, message: "Название категории обязательно." };
  }
  if (discount === null) {
    return { ok: false, status: 400, message: "Скидка должна быть числом от 0 до 100." };
  }

  const duplicate = await findCitizenCategoryByName(name);
  if (duplicate) {
    return { ok: false, status: 400, message: "Категория граждан с таким названием уже существует." };
  }

  const categoryId = await createCitizenCategory({ name, discount });
  const created = await findCitizenCategoryById(categoryId);

  return { ok: true, status: 201, data: normalizeCategory(created) };
}

export async function updateCitizenCategoryVm(categoryIdRaw, payload) {
  const categoryId = Number(categoryIdRaw);
  const existing = await findCitizenCategoryById(categoryId);
  if (!existing) {
    return { ok: false, status: 404, message: "Категория граждан не найдена." };
  }

  const name = String(payload?.name || "").trim();
  const discount = parseDiscount(payload?.discount);

  if (!name) {
    return { ok: false, status: 400, message: "Название категории обязательно." };
  }
  if (discount === null) {
    return { ok: false, status: 400, message: "Скидка должна быть числом от 0 до 100." };
  }

  const duplicate = await findCitizenCategoryByName(name);
  if (duplicate && Number(duplicate.categoryid) !== categoryId) {
    return { ok: false, status: 400, message: "Категория граждан с таким названием уже существует." };
  }

  await updateCitizenCategory(categoryId, { name, discount });
  const updated = await findCitizenCategoryById(categoryId);

  return { ok: true, status: 200, data: normalizeCategory(updated) };
}

export async function deleteCitizenCategoryVm(categoryIdRaw) {
  const categoryId = Number(categoryIdRaw);
  const existing = await findCitizenCategoryById(categoryId);
  if (!existing) {
    return { ok: false, status: 404, message: "Категория граждан не найдена." };
  }

  await deleteCitizenCategory(categoryId);
  return { ok: true, status: 200, data: { categoryId } };
}

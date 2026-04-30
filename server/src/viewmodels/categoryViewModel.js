import {
  createCategory,
  getCategoryById,
  getCategoryByName,
  listCategories,
  setCategoryActive,
  updateCategoryName,
} from "../models/categoryModel.js";

function normalizeCategory(row) {
  return {
    id: Number(row.categoryid),
    name: row.categoryname,
    isActive: Number(row.isactive) === 1,
  };
}

export async function getCategoriesVm({ includeInactive, role }) {
  const canIncludeInactive = role === "Admin" || role === "Manager";
  const rows = await listCategories({ includeInactive: canIncludeInactive && includeInactive });
  return { ok: true, status: 200, data: rows.map(normalizeCategory) };
}

export async function createCategoryVm({ name }) {
  const clean = String(name || "").trim();
  if (!clean) {
    return { ok: false, status: 400, message: "Имя категории не может быть пустым." };
  }
  const existing = await getCategoryByName(clean);
  if (existing) {
    return { ok: false, status: 400, message: "Категория с таким именем уже существует." };
  }
  const id = await createCategory(clean);
  const created = await getCategoryById(id);
  return { ok: true, status: 201, data: normalizeCategory(created) };
}

export async function updateCategoryVm(id, { name }) {
  const clean = String(name || "").trim();
  if (!clean) {
    return { ok: false, status: 400, message: "Имя категории не может быть пустым." };
  }
  const existing = await getCategoryById(id);
  if (!existing) {
    return { ok: false, status: 404, message: "Категория не найдена." };
  }
  const duplicate = await getCategoryByName(clean);
  if (duplicate && Number(duplicate.categoryid) !== Number(id)) {
    return { ok: false, status: 400, message: "Категория с таким именем уже существует." };
  }

  await updateCategoryName(id, clean);
  const updated = await getCategoryById(id);
  return { ok: true, status: 200, data: normalizeCategory(updated) };
}

export async function setCategoryActiveVm(id, { isActive }) {
  const existing = await getCategoryById(id);
  if (!existing) {
    return { ok: false, status: 404, message: "Категория не найдена." };
  }
  await setCategoryActive(id, Boolean(isActive));
  const updated = await getCategoryById(id);
  return { ok: true, status: 200, data: normalizeCategory(updated) };
}

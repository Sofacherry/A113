import { pool } from "../infrastructure/db/pool.js";

export async function listCategories({ includeInactive }) {
  const where = includeInactive ? "" : "WHERE c.isactive = TRUE";
  const { rows } = await pool.query(
    `SELECT c.categoryid, c.categoryname, c.isactive
     FROM categories c
     ${where}
     ORDER BY c.categoryname ASC`
  );
  return rows;
}

export async function getCategoryById(categoryId) {
  const { rows } = await pool.query(
    `SELECT categoryid, categoryname, isactive
     FROM categories
     WHERE categoryid = $1
     LIMIT 1`,
    [categoryId]
  );
  return rows[0] || null;
}

export async function getCategoryByName(name) {
  const { rows } = await pool.query(
    `SELECT categoryid, categoryname, isactive
     FROM categories
     WHERE LOWER(categoryname) = LOWER($1)
     LIMIT 1`,
    [name]
  );
  return rows[0] || null;
}

export async function createCategory(name) {
  const { rows } = await pool.query(
    "INSERT INTO categories (categoryname, isactive) VALUES ($1, TRUE) RETURNING categoryid",
    [name]
  );
  return rows[0].categoryid;
}

export async function updateCategoryName(categoryId, name) {
  await pool.query("UPDATE categories SET categoryname = $1 WHERE categoryid = $2", [name, categoryId]);
}

export async function setCategoryActive(categoryId, isActive) {
  await pool.query("UPDATE categories SET isactive = $1 WHERE categoryid = $2", [Boolean(isActive), categoryId]);
}

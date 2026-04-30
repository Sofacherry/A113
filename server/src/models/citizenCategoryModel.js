import { pool } from "../infrastructure/db/pool.js";

export async function listCitizenCategories() {
  const { rows } = await pool.query(
    `SELECT categoryid, categoryname, discount
     FROM citizencategories
     ORDER BY discount DESC, categoryname ASC`
  );
  return rows;
}

export async function findCitizenCategoryById(categoryId) {
  const { rows } = await pool.query(
    `SELECT categoryid, categoryname, discount
     FROM citizencategories
     WHERE categoryid = $1
     LIMIT 1`,
    [categoryId]
  );
  return rows[0] || null;
}

export async function findCitizenCategoryByName(categoryName) {
  const { rows } = await pool.query(
    `SELECT categoryid, categoryname, discount
     FROM citizencategories
     WHERE categoryname = $1
     LIMIT 1`,
    [categoryName]
  );
  return rows[0] || null;
}

export async function createCitizenCategory({ name, discount }) {
  const { rows } = await pool.query(
    `INSERT INTO citizencategories (categoryname, discount)
     VALUES ($1, $2)
     RETURNING categoryid`,
    [name, discount]
  );
  return rows[0].categoryid;
}

export async function updateCitizenCategory(categoryId, { name, discount }) {
  await pool.query(
    `UPDATE citizencategories
     SET categoryname = $1, discount = $2
     WHERE categoryid = $3`,
    [name, discount, categoryId]
  );
}

export async function deleteCitizenCategory(categoryId) {
  await pool.query("DELETE FROM citizencategories WHERE categoryid = $1", [categoryId]);
}

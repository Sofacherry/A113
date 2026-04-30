import { pool } from "../infrastructure/db/pool.js";

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT userid, name, email, passwordhash, role, citizencategoryid
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

export async function findUserByEmailExceptId(email, userId) {
  const { rows } = await pool.query(
    `SELECT userid, name, email
     FROM users
     WHERE email = $1 AND userid <> $2
     LIMIT 1`,
    [email, userId]
  );
  return rows[0] || null;
}

export async function createUser({ name, email, passwordHash, role, citizenCategoryId }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, passwordhash, role, citizencategoryid)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING userid`,
    [name, email, passwordHash, role, citizenCategoryId || null]
  );
  return rows[0].userid;
}

export async function updatePasswordHash(userId, passwordHash) {
  await pool.query("UPDATE users SET passwordhash = $1 WHERE userid = $2", [passwordHash, userId]);
}

export async function listUsers() {
  const { rows } = await pool.query(
    `SELECT u.userid, u.name, u.email, u.role, u.citizencategoryid,
            c.categoryname, c.discount
     FROM users u
     LEFT JOIN citizencategories c ON c.categoryid = u.citizencategoryid
     ORDER BY u.userid DESC`
  );
  return rows;
}

export async function findUserById(userId) {
  const { rows } = await pool.query(
    `SELECT userid, name, email, role, citizencategoryid
     FROM users
     WHERE userid = $1
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function findUserDetailedById(userId) {
  const { rows } = await pool.query(
    `SELECT u.userid, u.name, u.email, u.role, u.citizencategoryid,
            c.categoryname, c.discount
     FROM users u
     LEFT JOIN citizencategories c ON c.categoryid = u.citizencategoryid
     WHERE u.userid = $1
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function setUserRole(userId, role) {
  await pool.query("UPDATE users SET role = $1 WHERE userid = $2", [role, userId]);
}

export async function updateUserProfile(userId, { name, email, role, citizenCategoryId, passwordHash }) {
  const updates = [];
  const params = [];

  if (name !== undefined) {
    params.push(name);
    updates.push(`name = $${params.length}`);
  }
  if (email !== undefined) {
    params.push(email);
    updates.push(`email = $${params.length}`);
  }
  if (role !== undefined) {
    params.push(role);
    updates.push(`role = $${params.length}`);
  }
  if (citizenCategoryId !== undefined) {
    params.push(citizenCategoryId);
    updates.push(`citizencategoryid = $${params.length}`);
  }
  if (passwordHash !== undefined) {
    params.push(passwordHash);
    updates.push(`passwordhash = $${params.length}`);
  }

  if (updates.length === 0) {
    return;
  }

  params.push(userId);

  await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE userid = $${params.length}`, params);
}

export async function deleteUserById(userId) {
  await pool.query("DELETE FROM users WHERE userid = $1", [userId]);
}

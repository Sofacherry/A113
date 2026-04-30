import bcrypt from "bcryptjs";
import {
  createUser,
  deleteUserById,
  findUserByEmail,
  findUserByEmailExceptId,
  findUserById,
  findUserDetailedById,
  listUsers,
  setUserRole,
  updateUserProfile,
} from "../models/userModel.js";
import { env } from "../config/env.js";
import { mapApiRoleToDb, mapDbRoleToApi } from "../shared/auth.js";

function isAdmin(roleHeader) {
  return String(roleHeader || "").toLowerCase() === "admin";
}

function mapUser(u) {
  return {
    id: Number(u.userid),
    displayName: u.name,
    email: u.email,
    role: mapDbRoleToApi(u.role),
    citizenCategoryId: u.citizencategoryid ? Number(u.citizencategoryid) : null,
    citizenCategoryName: u.categoryname || null,
    citizenDiscount: u.discount !== null && u.discount !== undefined ? Number(u.discount) : null,
  };
}

const ALLOWED_ROLES = new Set(["Client", "Manager", "Admin"]);

function parseRole(role) {
  const value = String(role || "").trim();
  return ALLOWED_ROLES.has(value) ? value : null;
}

function parseCategoryId(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.floor(value);
}

export async function getUsersForAdmin(roleHeader) {
  if (!isAdmin(roleHeader)) {
    return { ok: false, status: 403, message: "Недостаточно прав: нужен Admin." };
  }
  const users = await listUsers();
  return {
    ok: true,
    status: 200,
    data: users.map(mapUser),
  };
}

export async function changeUserRoleForAdmin(roleHeader, userId, targetRole) {
  if (!isAdmin(roleHeader)) {
    return { ok: false, status: 403, message: "Недостаточно прав: нужен Admin." };
  }
  const role = parseRole(targetRole);
  if (!role) {
    return { ok: false, status: 400, message: "Недопустимая роль. Разрешены Client, Manager, Admin." };
  }
  const user = await findUserById(userId);
  if (!user) {
    return { ok: false, status: 404, message: "Пользователь не найден." };
  }
  await setUserRole(userId, mapApiRoleToDb(role));
  return { ok: true, status: 200, data: { userId, role } };
}

export async function createUserForAdmin(roleHeader, payload) {
  if (!isAdmin(roleHeader)) {
    return { ok: false, status: 403, message: "Недостаточно прав: нужен Admin." };
  }

  const displayName = String(payload?.displayName || "").trim();
  const email = String(payload?.email || "").trim();
  const password = String(payload?.password || "");
  const role = parseRole(payload?.role);
  const citizenCategoryId = parseCategoryId(payload?.citizenCategoryId);

  if (!displayName || !email || !password || !role) {
    return { ok: false, status: 400, message: "Поля displayName, email, password и role обязательны." };
  }
  if (password.length < 4) {
    return { ok: false, status: 400, message: "Минимальная длина пароля: 4 символа." };
  }

  const duplicate = await findUserByEmail(email);
  if (duplicate) {
    return { ok: false, status: 400, message: "Пользователь с таким email уже существует." };
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  const userId = await createUser({
    name: displayName,
    email,
    passwordHash,
    role: mapApiRoleToDb(role),
    citizenCategoryId,
  });

  const created = await findUserDetailedById(userId);
  return { ok: true, status: 201, data: mapUser(created) };
}

export async function updateUserForAdmin(roleHeader, userIdRaw, payload) {
  if (!isAdmin(roleHeader)) {
    return { ok: false, status: 403, message: "Недостаточно прав: нужен Admin." };
  }

  const userId = Number(userIdRaw);
  const existing = await findUserById(userId);
  if (!existing) {
    return { ok: false, status: 404, message: "Пользователь не найден." };
  }

  const patch = {};

  if (payload?.displayName !== undefined) {
    const displayName = String(payload.displayName || "").trim();
    if (!displayName) {
      return { ok: false, status: 400, message: "displayName не может быть пустым." };
    }
    patch.name = displayName;
  }

  if (payload?.email !== undefined) {
    const email = String(payload.email || "").trim();
    if (!email) {
      return { ok: false, status: 400, message: "email не может быть пустым." };
    }
    const duplicate = await findUserByEmailExceptId(email, userId);
    if (duplicate) {
      return { ok: false, status: 400, message: "Пользователь с таким email уже существует." };
    }
    patch.email = email;
  }

  if (payload?.role !== undefined) {
    const role = parseRole(payload.role);
    if (!role) {
      return { ok: false, status: 400, message: "Недопустимая роль. Разрешены Client, Manager, Admin." };
    }
    patch.role = mapApiRoleToDb(role);
  }

  if (payload?.citizenCategoryId !== undefined) {
    patch.citizenCategoryId = parseCategoryId(payload.citizenCategoryId);
  }

  if (payload?.password !== undefined && String(payload.password).trim() !== "") {
    const password = String(payload.password);
    if (password.length < 4) {
      return { ok: false, status: 400, message: "Минимальная длина пароля: 4 символа." };
    }
    patch.passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  }

  await updateUserProfile(userId, patch);
  const updated = await findUserDetailedById(userId);
  return { ok: true, status: 200, data: mapUser(updated) };
}

export async function deleteUserForAdmin(roleHeader, adminUserId, userIdRaw) {
  if (!isAdmin(roleHeader)) {
    return { ok: false, status: 403, message: "Недостаточно прав: нужен Admin." };
  }

  const userId = Number(userIdRaw);
  if (adminUserId === userId) {
    return { ok: false, status: 400, message: "Нельзя удалить самого себя." };
  }

  const target = await findUserById(userId);
  if (!target) {
    return { ok: false, status: 404, message: "Пользователь не найден." };
  }

  await deleteUserById(userId);
  return { ok: true, status: 200, data: { userId } };
}

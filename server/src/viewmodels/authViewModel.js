import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { createUser, findUserByEmail, findUserById, updatePasswordHash } from "../models/userModel.js";
import { issueAccessToken, mapApiRoleToDb, mapDbRoleToApi } from "../shared/auth.js";

function isBcryptHash(value) {
  return typeof value === "string" && value.startsWith("$2");
}

async function verifyPasswordAndUpgrade(user, rawPassword) {
  if (!user || !rawPassword) {
    return false;
  }

  if (isBcryptHash(user.passwordhash)) {
    return await bcrypt.compare(rawPassword, user.passwordhash);
  }

  if (user.passwordhash === rawPassword) {
    const newHash = await bcrypt.hash(rawPassword, env.bcryptRounds);
    await updatePasswordHash(user.userid, newHash);
    user.passwordhash = newHash;
    return true;
  }

  return false;
}

export async function login(payload) {
  const email = payload.email?.trim();
  const password = payload.password;
  if (!email || !password) {
    return { ok: false, status: 400, message: "Заполните email и пароль." };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return { ok: false, status: 401, message: "Неверный email или пароль." };
  }

  const isValid = await verifyPasswordAndUpgrade(user, password);
  if (!isValid) {
    return { ok: false, status: 401, message: "Неверный email или пароль." };
  }

  const apiRole = mapDbRoleToApi(user.role);
  const userView = {
    id: user.userid,
    email: user.email,
    displayName: user.name,
    role: apiRole,
  };
  const accessToken = issueAccessToken(userView);

  return {
    ok: true,
    status: 200,
    data: {
      accessToken,
      user: userView,
    },
  };
}

export async function register(payload) {
  const name = payload.displayName?.trim() || payload.name?.trim();
  const email = payload.email?.trim();
  const password = payload.password;
  const citizenCategoryId = payload.citizenCategoryId || null;

  if (!name || !email || !password) {
    return { ok: false, status: 400, message: "Поля name/email/password обязательны." };
  }

  const exists = await findUserByEmail(email);
  if (exists) {
    return { ok: false, status: 400, message: "Пользователь с таким email уже существует." };
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  const userId = await createUser({
    name,
    email,
    passwordHash,
    role: mapApiRoleToDb("Client"),
    citizenCategoryId,
  });

  const userView = {
    id: userId,
    email,
    displayName: name,
    role: "Client",
  };
  const accessToken = issueAccessToken(userView);

  return {
    ok: true,
    status: 200,
    data: {
      accessToken,
      user: userView,
      citizenCategoryId,
    },
  };
}

export async function me(payload) {
  const userId = Number(payload?.userId);
  if (!userId) {
    return { ok: false, status: 401, message: "Токен отсутствует или невалиден." };
  }

  const user = await findUserById(userId);
  if (!user) {
    return { ok: false, status: 401, message: "Пользователь не найден." };
  }

  return {
    ok: true,
    status: 200,
    data: {
      id: user.userid,
      email: user.email,
      displayName: user.name,
      role: mapDbRoleToApi(user.role),
    },
  };
}

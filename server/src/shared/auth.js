import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const ROLE_TO_DB = {
  Client: "Client",
  Manager: "Manager",
  Admin: "Admin",
};

const ROLE_FROM_DB = {
  Client: "Client",
  Manager: "Manager",
  Admin: "Admin",
};

export function mapDbRoleToApi(role) {
  return ROLE_FROM_DB[role] || "Client";
}

export function mapApiRoleToDb(role) {
  return ROLE_TO_DB[role] || "Client";
}

export function issueAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
    env.jwt.key,
    {
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
      expiresIn: env.jwt.expiresIn,
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.key, {
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
  });
}

export function readBearerToken(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return null;
  }
  return auth.slice("Bearer ".length);
}

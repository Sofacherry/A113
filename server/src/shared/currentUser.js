import { readBearerToken, verifyAccessToken } from "./auth.js";

export function readCurrentUser(req) {
  const token = readBearerToken(req);
  if (!token) {
    return null;
  }
  try {
    const payload = verifyAccessToken(token);
    return {
      userId: Number(payload.sub),
      role: String(payload.role),
      email: String(payload.email || ""),
      displayName: String(payload.displayName || ""),
    };
  } catch (_error) {
    return null;
  }
}

import dotenv from "dotenv";

dotenv.config();
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test", override: true });
}

function readNumber(name, fallback) {
  const raw = process.env[name];
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  port: readNumber("API_PORT", 1314),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173",
  jwt: {
    key: process.env.JWT_KEY || "VERY_LONG_SECRET_KEY_MIN_32_SYMBOLS_CHANGE_ME_123456",
    issuer: process.env.JWT_ISSUER || "A113",
    audience: process.env.JWT_AUDIENCE || "A113Client",
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  },
  db: {
    host: process.env.DB_HOST || "localhost",
    port: readNumber("DB_PORT", 5432),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "124360AVqwreyp",
    database: process.env.DB_NAME || "entertainment center",
  },
  bcryptRounds: readNumber("BCRYPT_ROUNDS", 10),
};

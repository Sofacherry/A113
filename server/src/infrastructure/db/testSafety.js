import { env } from "../../config/env.js";

function isTestDatabaseName(name) {
  return /(^|[-_ ])test($|[-_ ])|test/i.test(String(name || ""));
}

export function assertSafeTestDatabase() {
  if (process.env.NODE_ENV !== "test") {
    return;
  }

  const dbName = env.db.database;
  if (!isTestDatabaseName(dbName)) {
    throw new Error(
      `Refusing to run test code against non-test database "${dbName}". Use a dedicated DB_NAME containing "test", for example "a113_test".`
    );
  }
}

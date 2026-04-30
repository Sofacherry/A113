import http from "node:http";
import { env } from "./config/env.js";
import { bootstrapDatabase } from "./infrastructure/db/bootstrap.js";
import { handlePreflight, parseQuery, readJsonBody, sendJson, sendProblem } from "./shared/http.js";
import { createRouter } from "./shared/router.js";
import { routes } from "./routes/index.js";

const resolveRoute = createRouter(routes);

function requestHandler(req, res) {
  res.__requestOrigin = req.headers.origin || "";

  if (handlePreflight(req, res, env.corsOrigin)) {
    return;
  }

  (async () => {
    try {
      const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
      const route = resolveRoute(req.method || "GET", url.pathname);

      if (!route) {
        sendJson(res, { ok: false, message: "Route not found" }, 404, env.corsOrigin);
        return;
      }

      const body = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method || "")
        ? await readJsonBody(req)
        : {};

      const context = {
        params: route.params,
        query: parseQuery(url.searchParams),
      };

      await route.handler(req, res, context, body, env);
    } catch (error) {
      console.error("API error:", error);
      if (error.message === "Invalid JSON") {
        sendProblem(res, { status: 400, title: "Bad Request", detail: "Некорректный JSON." }, env.corsOrigin);
        return;
      }
      sendProblem(res, { status: 500, title: "Internal Server Error", detail: "Внутренняя ошибка сервера." }, env.corsOrigin);
    }
  })();
}

export function createApiServer() {
  return http.createServer(requestHandler);
}

export async function startServer(port = env.port) {
  await bootstrapDatabase();
  const server = createApiServer();

  await new Promise((resolve) => {
    server.listen(port, resolve);
  });

  console.log(`A113 API started on port ${port}`);
  return server;
}

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    console.error("API bootstrap failed:", error);
    process.exit(1);
  });
}

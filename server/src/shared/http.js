function resolveAllowedOrigin(originConfig, requestOrigin) {
  const configured = String(originConfig || "*")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (configured.length === 0 || configured.includes("*")) {
    return "*";
  }

  if (requestOrigin && configured.includes(requestOrigin)) {
    return requestOrigin;
  }

  return configured[0];
}

function setCorsHeaders(res, originConfig, requestOrigin) {
  const allowedOrigin = resolveAllowedOrigin(originConfig, requestOrigin || res.__requestOrigin || "");
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Role");
}

export function handlePreflight(req, res, origin) {
  setCorsHeaders(res, origin, req.headers.origin || "");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return true;
  }
  return false;
}

export function sendJson(res, payload, statusCode = 200, origin = "*") {
  setCorsHeaders(res, origin);
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

export function sendProblem(res, { status = 400, title = "Bad Request", detail = "Request failed.", type = "about:blank" }, origin = "*") {
  setCorsHeaders(res, origin);
  res.writeHead(status, { "Content-Type": "application/problem+json; charset=utf-8" });
  res.end(
    JSON.stringify({
      type,
      title,
      status,
      detail,
    })
  );
}

export async function readJsonBody(req) {
  return await new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (_error) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

export function parseQuery(searchParams) {
  return Object.fromEntries(searchParams.entries());
}

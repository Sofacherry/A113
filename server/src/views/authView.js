import { login, me, register } from "../viewmodels/authViewModel.js";
import { readBearerToken, verifyAccessToken } from "../shared/auth.js";
import { sendJson, sendProblem } from "../shared/http.js";

export async function loginView(_req, res, _ctx, body, env) {
  const result = await login(body);
  if (!result.ok) {
    sendProblem(
      res,
      {
        status: result.status,
        title: result.status === 401 ? "Unauthorized" : "Bad Request",
        detail: result.message,
      },
      env.corsOrigin
    );
    return;
  }
  sendJson(res, result.data, result.status, env.corsOrigin);
}

export async function registerView(_req, res, _ctx, body, env) {
  const result = await register(body);
  if (!result.ok) {
    sendProblem(
      res,
      {
        status: result.status,
        title: "Bad Request",
        detail: result.message,
      },
      env.corsOrigin
    );
    return;
  }
  sendJson(res, result.data, result.status, env.corsOrigin);
}

export async function meView(req, res, _ctx, _body, env) {
  try {
    const token = readBearerToken(req);
    if (!token) {
      sendProblem(res, { status: 401, title: "Unauthorized", detail: "Не передан Bearer токен." }, env.corsOrigin);
      return;
    }
    const payload = verifyAccessToken(token);
    const result = await me({ userId: payload.sub });
    if (!result.ok) {
      sendProblem(res, { status: 401, title: "Unauthorized", detail: result.message }, env.corsOrigin);
      return;
    }
    sendJson(res, result.data, result.status, env.corsOrigin);
  } catch (_error) {
    sendProblem(res, { status: 401, title: "Unauthorized", detail: "Невалидный или просроченный токен." }, env.corsOrigin);
  }
}

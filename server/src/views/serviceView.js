import { addService, editService, getCategories, getServices, removeService } from "../viewmodels/serviceViewModel.js";
import { readCurrentUser } from "../shared/currentUser.js";
import { sendJson, sendProblem } from "../shared/http.js";

function requireAdmin(req, res, env) {
  const currentUser = readCurrentUser(req);
  if (!currentUser) {
    sendProblem(res, { status: 401, title: "Unauthorized", detail: "Требуется JWT." }, env.corsOrigin);
    return false;
  }
  if (currentUser.role !== "Admin") {
    sendProblem(res, { status: 403, title: "Forbidden", detail: "Недостаточно прав: нужен Admin." }, env.corsOrigin);
    return false;
  }
  return true;
}

export async function listServicesView(_req, res, _ctx, _body, env) {
  const result = await getServices();
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function listCategoriesView(_req, res, _ctx, _body, env) {
  const result = await getCategories();
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function createServiceView(req, res, _ctx, body, env) {
  if (!requireAdmin(req, res, env)) return;

  const result = await addService(body);
  sendJson(
    res,
    result.ok ? { ok: true, data: result.data } : { ok: false, message: result.message },
    result.status,
    env.corsOrigin
  );
}

export async function updateServiceView(req, res, ctx, body, env) {
  if (!requireAdmin(req, res, env)) return;

  const result = await editService(Number(ctx.params.id), body);
  sendJson(
    res,
    result.ok ? { ok: true, data: result.data } : { ok: false, message: result.message },
    result.status,
    env.corsOrigin
  );
}

export async function deleteServiceView(req, res, ctx, _body, env) {
  if (!requireAdmin(req, res, env)) return;

  const result = await removeService(Number(ctx.params.id));
  if (!result.ok) {
    const title = result.status === 404 ? "Not Found" : result.status === 409 ? "Conflict" : "Bad Request";
    sendProblem(res, { status: result.status, title, detail: result.message }, env.corsOrigin);
    return;
  }

  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

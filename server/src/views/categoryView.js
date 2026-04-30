import {
  createCategoryVm,
  getCategoriesVm,
  setCategoryActiveVm,
  updateCategoryVm,
} from "../viewmodels/categoryViewModel.js";
import { readCurrentUser } from "../shared/currentUser.js";
import { sendJson, sendProblem } from "../shared/http.js";

function requireAuth(req, res, env) {
  const currentUser = readCurrentUser(req);
  if (!currentUser) {
    sendProblem(res, { status: 401, title: "Unauthorized", detail: "Требуется JWT." }, env.corsOrigin);
    return null;
  }
  return currentUser;
}

function requireAdmin(currentUser, res, env) {
  if (currentUser.role !== "Admin") {
    sendProblem(res, { status: 403, title: "Forbidden", detail: "Доступ только для роли Admin." }, env.corsOrigin);
    return false;
  }
  return true;
}

export async function listCategoriesAdminView(req, res, ctx, _body, env) {
  const currentUser = requireAuth(req, res, env);
  if (!currentUser) return;

  const includeInactive = String(ctx.query.includeInactive || "").toLowerCase() === "true";
  const result = await getCategoriesVm({ includeInactive, role: currentUser.role });
  sendJson(res, { ok: true, data: result.data }, 200, env.corsOrigin);
}

export async function createCategoryView(req, res, _ctx, body, env) {
  const currentUser = requireAuth(req, res, env);
  if (!currentUser) return;
  if (!requireAdmin(currentUser, res, env)) return;

  const result = await createCategoryVm(body);
  if (!result.ok) {
    sendProblem(res, { status: result.status, title: "Bad Request", detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function updateCategoryView(req, res, ctx, body, env) {
  const currentUser = requireAuth(req, res, env);
  if (!currentUser) return;
  if (!requireAdmin(currentUser, res, env)) return;

  const result = await updateCategoryVm(Number(ctx.params.id), body);
  if (!result.ok) {
    const title = result.status === 404 ? "Not Found" : "Bad Request";
    sendProblem(res, { status: result.status, title, detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function setCategoryActiveView(req, res, ctx, body, env) {
  const currentUser = requireAuth(req, res, env);
  if (!currentUser) return;
  if (!requireAdmin(currentUser, res, env)) return;

  const result = await setCategoryActiveVm(Number(ctx.params.id), body);
  if (!result.ok) {
    const title = result.status === 404 ? "Not Found" : "Bad Request";
    sendProblem(res, { status: result.status, title, detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

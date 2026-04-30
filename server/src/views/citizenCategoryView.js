import {
  createCitizenCategoryVm,
  deleteCitizenCategoryVm,
  getCitizenCategories,
  updateCitizenCategoryVm,
} from "../viewmodels/citizenCategoryViewModel.js";
import { readCurrentUser } from "../shared/currentUser.js";
import { sendJson, sendProblem } from "../shared/http.js";

function requireAdmin(req, res, env) {
  const currentUser = readCurrentUser(req);
  if (!currentUser) {
    sendProblem(res, { status: 401, title: "Unauthorized", detail: "Требуется JWT." }, env.corsOrigin);
    return null;
  }
  if (currentUser.role !== "Admin") {
    sendProblem(res, { status: 403, title: "Forbidden", detail: "Недостаточно прав: нужен Admin." }, env.corsOrigin);
    return null;
  }
  return currentUser;
}

export async function listCitizenCategoriesView(req, res, _ctx, _body, env) {
  if (!requireAdmin(req, res, env)) return;
  const result = await getCitizenCategories();
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function createCitizenCategoriesView(req, res, _ctx, body, env) {
  if (!requireAdmin(req, res, env)) return;
  const result = await createCitizenCategoryVm(body);
  if (!result.ok) {
    sendProblem(res, { status: result.status, title: "Bad Request", detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function updateCitizenCategoriesView(req, res, ctx, body, env) {
  if (!requireAdmin(req, res, env)) return;
  const result = await updateCitizenCategoryVm(ctx.params.id, body);
  if (!result.ok) {
    const title = result.status === 404 ? "Not Found" : "Bad Request";
    sendProblem(res, { status: result.status, title, detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function deleteCitizenCategoriesView(req, res, ctx, _body, env) {
  if (!requireAdmin(req, res, env)) return;
  const result = await deleteCitizenCategoryVm(ctx.params.id);
  if (!result.ok) {
    sendProblem(res, { status: 404, title: "Not Found", detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

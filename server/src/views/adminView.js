import {
  changeUserRoleForAdmin,
  createUserForAdmin,
  deleteUserForAdmin,
  getUsersForAdmin,
  updateUserForAdmin,
} from "../viewmodels/adminViewModel.js";
import { readCurrentUser } from "../shared/currentUser.js";
import { sendJson, sendProblem } from "../shared/http.js";

function requireCurrentUser(req, res, env) {
  const currentUser = readCurrentUser(req);
  if (!currentUser) {
    sendProblem(res, { status: 401, title: "Unauthorized", detail: "Требуется JWT." }, env.corsOrigin);
    return null;
  }
  return currentUser;
}

export async function listUsersView(req, res, _ctx, _body, env) {
  const currentUser = requireCurrentUser(req, res, env);
  if (!currentUser) return;

  const result = await getUsersForAdmin(currentUser.role);
  if (!result.ok) {
    sendProblem(res, { status: result.status, title: "Forbidden", detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function createUserView(req, res, _ctx, body, env) {
  const currentUser = requireCurrentUser(req, res, env);
  if (!currentUser) return;

  const result = await createUserForAdmin(currentUser.role, body);
  if (!result.ok) {
    const title = result.status === 403 ? "Forbidden" : "Bad Request";
    sendProblem(res, { status: result.status, title, detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function updateUserView(req, res, ctx, body, env) {
  const currentUser = requireCurrentUser(req, res, env);
  if (!currentUser) return;

  const result = await updateUserForAdmin(currentUser.role, ctx.params.id, body);
  if (!result.ok) {
    const title = result.status === 403 ? "Forbidden" : result.status === 404 ? "Not Found" : "Bad Request";
    sendProblem(res, { status: result.status, title, detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function deleteUserView(req, res, ctx, _body, env) {
  const currentUser = requireCurrentUser(req, res, env);
  if (!currentUser) return;

  const result = await deleteUserForAdmin(currentUser.role, currentUser.userId, ctx.params.id);
  if (!result.ok) {
    const title = result.status === 403 ? "Forbidden" : result.status === 404 ? "Not Found" : "Bad Request";
    sendProblem(res, { status: result.status, title, detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function updateUserRoleView(req, res, ctx, body, env) {
  const currentUser = requireCurrentUser(req, res, env);
  if (!currentUser) return;

  const userId = Number(ctx.params.id);
  const result = await changeUserRoleForAdmin(currentUser.role, userId, String(body.role || ""));
  if (!result.ok) {
    const title = result.status === 403 ? "Forbidden" : result.status === 404 ? "Not Found" : "Bad Request";
    sendProblem(res, { status: result.status, title, detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

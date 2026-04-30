import { readCurrentUser } from "../shared/currentUser.js";
import { sendJson, sendProblem } from "../shared/http.js";
import { createEventVm, deleteEventVm, getEventsVm, updateEventVm } from "../viewmodels/eventViewModel.js";

function isAdmin(user) {
  return user?.role === "Admin";
}

export async function listEventsView(_req, res, _ctx, _body, env) {
  const result = await getEventsVm();
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function createEventView(req, res, _ctx, body, env) {
  const currentUser = readCurrentUser(req);
  if (!currentUser) {
    sendProblem(res, { status: 401, title: "Unauthorized", detail: "Требуется JWT." }, env.corsOrigin);
    return;
  }
  if (!isAdmin(currentUser)) {
    sendProblem(res, { status: 403, title: "Forbidden", detail: "Доступ только для Admin." }, env.corsOrigin);
    return;
  }
  const result = await createEventVm(body);
  if (!result.ok) {
    sendProblem(res, { status: result.status, title: "Bad Request", detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function updateEventView(req, res, ctx, body, env) {
  const currentUser = readCurrentUser(req);
  if (!currentUser) {
    sendProblem(res, { status: 401, title: "Unauthorized", detail: "Требуется JWT." }, env.corsOrigin);
    return;
  }
  if (!isAdmin(currentUser)) {
    sendProblem(res, { status: 403, title: "Forbidden", detail: "Доступ только для Admin." }, env.corsOrigin);
    return;
  }
  const result = await updateEventVm(Number(ctx.params.id), body);
  if (!result.ok) {
    const title = result.status === 404 ? "Not Found" : "Bad Request";
    sendProblem(res, { status: result.status, title, detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function deleteEventView(req, res, ctx, _body, env) {
  const currentUser = readCurrentUser(req);
  if (!currentUser) {
    sendProblem(res, { status: 401, title: "Unauthorized", detail: "Требуется JWT." }, env.corsOrigin);
    return;
  }
  if (!isAdmin(currentUser)) {
    sendProblem(res, { status: 403, title: "Forbidden", detail: "Доступ только для Admin." }, env.corsOrigin);
    return;
  }
  const result = await deleteEventVm(Number(ctx.params.id));
  if (!result.ok) {
    sendProblem(res, { status: 404, title: "Not Found", detail: result.message }, env.corsOrigin);
    return;
  }
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

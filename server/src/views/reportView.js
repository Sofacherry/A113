import { monthlyRevenue, topClients, topServices } from "../viewmodels/reportViewModel.js";
import { readCurrentUser } from "../shared/currentUser.js";
import { sendJson, sendProblem } from "../shared/http.js";

function requireAdmin(req, res, env) {
  const currentUser = readCurrentUser(req);
  if (!currentUser) {
    sendProblem(res, { status: 401, title: 'Unauthorized', detail: 'Требуется JWT.' }, env.corsOrigin);
    return false;
  }
  if (currentUser.role !== 'Admin') {
    sendProblem(res, { status: 403, title: 'Forbidden', detail: 'Отчеты доступны только администратору.' }, env.corsOrigin);
    return false;
  }
  return true;
}

export async function monthlyRevenueView(req, res, ctx, _body, env) {
  if (!requireAdmin(req, res, env)) return;
  const result = await monthlyRevenue(ctx.query);
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function topServicesView(req, res, ctx, _body, env) {
  if (!requireAdmin(req, res, env)) return;
  const result = await topServices(ctx.query);
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function topClientsView(req, res, ctx, _body, env) {
  if (!requireAdmin(req, res, env)) return;
  const result = await topClients(ctx.query);
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

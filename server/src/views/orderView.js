import { changeOrderStatus, createOrderEntry, getOrders } from "../viewmodels/orderViewModel.js";
import { readCurrentUser } from "../shared/currentUser.js";
import { sendJson, sendProblem } from "../shared/http.js";

function requireAuth(req, res, env) {
  const currentUser = readCurrentUser(req);
  if (!currentUser) {
    sendProblem(res, { status: 401, title: 'Unauthorized', detail: 'Требуется JWT.' }, env.corsOrigin);
    return null;
  }
  return currentUser;
}

export async function listOrdersView(req, res, ctx, _body, env) {
  const currentUser = requireAuth(req, res, env);
  if (!currentUser) return;

  const safeQuery = { ...ctx.query };

  if (currentUser.role === 'Client') {
    safeQuery.userId = String(currentUser.userId);
  }

  const result = await getOrders(safeQuery);
  sendJson(res, { ok: true, data: result.data }, result.status, env.corsOrigin);
}

export async function createOrderView(req, res, _ctx, body, env) {
  const currentUser = requireAuth(req, res, env);
  if (!currentUser) return;

  if (currentUser.role !== 'Client') {
    sendProblem(res, { status: 403, title: 'Forbidden', detail: 'Создавать бронирования может только клиент.' }, env.corsOrigin);
    return;
  }

  const payload = { ...body, userId: currentUser.userId };
  const result = await createOrderEntry(payload);
  sendJson(
    res,
    result.ok ? { ok: true, data: result.data } : { ok: false, message: result.message },
    result.status,
    env.corsOrigin
  );
}

export async function updateOrderStatusView(req, res, ctx, body, env) {
  const currentUser = requireAuth(req, res, env);
  if (!currentUser) return;

  if (currentUser.role !== 'Manager' && currentUser.role !== 'Admin') {
    sendProblem(res, { status: 403, title: 'Forbidden', detail: 'Статусы заказов могут менять только Manager или Admin.' }, env.corsOrigin);
    return;
  }

  const result = await changeOrderStatus(ctx.params.id, body);
  sendJson(
    res,
    result.ok ? { ok: true, data: result.data } : { ok: false, message: result.message },
    result.status,
    env.corsOrigin
  );
}

import { sendJson } from "../shared/http.js";

export async function healthView(_req, res, _ctx, _body, env) {
  sendJson(res, { ok: true, service: "a113-api" }, 200, env.corsOrigin);
}

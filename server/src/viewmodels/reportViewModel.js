import { getMonthlyRevenue, getTopClients, getTopServices } from "../models/reportModel.js";

export async function monthlyRevenue(query) {
  const data = await getMonthlyRevenue(query.limit);
  return { ok: true, status: 200, data };
}

export async function topServices(query) {
  const data = await getTopServices(query.limit);
  return { ok: true, status: 200, data };
}

export async function topClients(query) {
  const data = await getTopClients(query.limit);
  return { ok: true, status: 200, data };
}

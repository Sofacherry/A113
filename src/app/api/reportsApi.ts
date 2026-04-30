import { apiRequest } from "./http";

export interface RevenuePoint {
  month: string;
  orders: number;
  revenue: number;
}

export interface TopServicePoint {
  name: string;
  orders: number;
  revenue: number;
}

export interface TopClientPoint {
  name: string;
  email: string;
  orders: number;
  total: number;
}

export function getMonthlyRevenue(token: string, limit = 6) {
  return apiRequest<{ ok: boolean; data: RevenuePoint[] }>(`/api/reports/monthly-revenue?limit=${limit}`, { method: "GET" }, token);
}

export function getTopServices(token: string, limit = 5) {
  return apiRequest<{ ok: boolean; data: TopServicePoint[] }>(`/api/reports/top-services?limit=${limit}`, { method: "GET" }, token);
}

export function getTopClients(token: string, limit = 5) {
  return apiRequest<{ ok: boolean; data: TopClientPoint[] }>(`/api/reports/top-clients?limit=${limit}`, { method: "GET" }, token);
}

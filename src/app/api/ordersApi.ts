import { apiRequest } from "./http";

export interface OrderDto {
  orderid: number;
  userid: number;
  serviceid: number;
  orderdate: string;
  totalprice: number;
  peoplecount: number;
  status: string;
  clientname: string;
  clientemail: string;
  servicename: string;
  serviceduration: number;
}

export function getMyOrders(token: string, userId: number) {
  return apiRequest<{ ok: boolean; data: OrderDto[] }>(`/api/orders?userId=${userId}`, { method: "GET" }, token);
}

export function getOrders(token: string, params?: { userId?: number; status?: string }) {
  const query = new URLSearchParams();
  if (params?.userId) query.set("userId", String(params.userId));
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return apiRequest<{ ok: boolean; data: OrderDto[] }>(`/api/orders${qs ? `?${qs}` : ""}`, { method: "GET" }, token);
}

export function createOrder(
  token: string,
  payload: { userId: number; serviceId: number; orderDate: string; peopleCount: number }
) {
  return apiRequest<{ ok: boolean; data: { orderId: number; totalPrice: number; discountApplied: number; resourceId: number | null } }>(
    "/api/orders",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export function updateOrderStatus(token: string, orderId: number, status: string) {
  return apiRequest<{ ok: boolean; data: { orderId: number; status: string } }>(
    `/api/orders/${orderId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    token
  );
}

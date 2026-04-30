import { apiRequest } from "./http";

export type AdminUserRole = "Client" | "Manager" | "Admin";

export interface AdminUserDto {
  id: number;
  displayName: string;
  email: string;
  role: AdminUserRole;
  citizenCategoryId: number | null;
  citizenCategoryName: string | null;
  citizenDiscount: number | null;
}

export interface UpsertAdminUserPayload {
  displayName: string;
  email: string;
  role: AdminUserRole;
  citizenCategoryId: number | null;
  password?: string;
}

export function getUsers(token: string) {
  return apiRequest<{ ok: boolean; data: AdminUserDto[] }>("/api/users", { method: "GET" }, token);
}

export function createUser(token: string, payload: UpsertAdminUserPayload & { password: string }) {
  return apiRequest<{ ok: boolean; data: AdminUserDto }>(
    "/api/users",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export function updateUser(token: string, userId: number, payload: Partial<UpsertAdminUserPayload>) {
  return apiRequest<{ ok: boolean; data: AdminUserDto }>(
    `/api/users/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token
  );
}

export function deleteUser(token: string, userId: number) {
  return apiRequest<{ ok: boolean; data: { userId: number } }>(`/api/users/${userId}`, { method: "DELETE" }, token);
}

export function updateUserRole(token: string, userId: number, role: AdminUserRole) {
  return apiRequest<{ ok: boolean; data: { userId: number; role: AdminUserRole } }>(
    `/api/users/${userId}/role`,
    {
      method: "PUT",
      body: JSON.stringify({ role }),
    },
    token
  );
}

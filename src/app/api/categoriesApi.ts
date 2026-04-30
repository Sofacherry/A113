import { apiRequest } from "./http";

export interface CategoryDto {
  id: number;
  name: string;
  isActive: boolean;
}

export function getCategories(token: string, includeInactive = false) {
  return apiRequest<{ ok: boolean; data: CategoryDto[] }>(
    `/api/categories?includeInactive=${includeInactive ? "true" : "false"}`,
    { method: "GET" },
    token
  );
}

export function createCategory(token: string, name: string) {
  return apiRequest<{ ok: boolean; data: CategoryDto }>(
    "/api/categories",
    {
      method: "POST",
      body: JSON.stringify({ name }),
    },
    token
  );
}

export function updateCategory(token: string, id: number, name: string) {
  return apiRequest<{ ok: boolean; data: CategoryDto }>(
    `/api/categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({ name }),
    },
    token
  );
}

export function setCategoryActive(token: string, id: number, isActive: boolean) {
  return apiRequest<{ ok: boolean; data: CategoryDto }>(
    `/api/categories/${id}/active`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    },
    token
  );
}

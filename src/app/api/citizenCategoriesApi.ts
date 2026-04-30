import { apiRequest } from "./http";

export interface CitizenCategoryDto {
  id: number;
  name: string;
  discount: number;
}

interface CitizenCategoryRow {
  categoryid: number;
  categoryname: string;
  discount: number;
}

function mapRow(row: CitizenCategoryRow): CitizenCategoryDto {
  return {
    id: Number(row.categoryid),
    name: row.categoryname,
    discount: Number(row.discount || 0),
  };
}

export async function getCitizenCategories(token?: string) {
  const response = await apiRequest<{ ok: boolean; data: CitizenCategoryRow[] }>(
    "/api/citizen-categories",
    { method: "GET" },
    token
  );

  return {
    ok: response.ok,
    data: (response.data || []).map(mapRow),
  };
}

export async function createCitizenCategory(token: string, payload: { name: string; discount: number }) {
  const response = await apiRequest<{ ok: boolean; data: CitizenCategoryRow }>(
    "/api/citizen-categories",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
  return {
    ok: response.ok,
    data: mapRow(response.data),
  };
}

export async function updateCitizenCategory(token: string, id: number, payload: { name: string; discount: number }) {
  const response = await apiRequest<{ ok: boolean; data: CitizenCategoryRow }>(
    `/api/citizen-categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token
  );
  return {
    ok: response.ok,
    data: mapRow(response.data),
  };
}

export function deleteCitizenCategory(token: string, id: number) {
  return apiRequest<{ ok: boolean; data: { categoryId: number } }>(`/api/citizen-categories/${id}`, { method: "DELETE" }, token);
}

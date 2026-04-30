import { apiRequest } from "./http";

export interface ServiceDto {
  serviceid: number;
  name: string;
  duration: number;
  weekdayprice: number;
  weekendprice: number;
  starttime: string;
  endtime: string;
  categories: string | null;
}

export interface ServiceUi {
  id: string;
  name: string;
  category: string;
  categories: string[];
  image: string;
  priceWeekday: number;
  priceWeekend: number;
  duration: number;
  description: string;
}

function placeholderImage(name: string) {
  const encoded = encodeURIComponent(name);
  return `https://placehold.co/600x400/E8ECEF/1C2B48?text=${encoded}`;
}

export function mapServiceToUi(item: ServiceDto): ServiceUi {
  const categories = (item.categories || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  return {
    id: String(item.serviceid),
    name: item.name,
    category: categories[0] || "\u0411\u0435\u0437 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438",
    categories,
    image: placeholderImage(item.name),
    priceWeekday: Number(item.weekdayprice),
    priceWeekend: Number(item.weekendprice),
    duration: Number(item.duration),
    description: `\u0423\u0441\u043b\u0443\u0433\u0430 \u00ab${item.name}\u00bb. \u0412\u0440\u0435\u043c\u044f \u0440\u0430\u0431\u043e\u0442\u044b: ${item.starttime} - ${item.endtime}.`,
  };
}

export function getServices() {
  return apiRequest<{ ok: boolean; data: ServiceDto[] }>("/api/services", { method: "GET" });
}

export function createService(token: string, payload: {
  name: string;
  duration: number;
  weekdayPrice: number;
  weekendPrice: number;
  startTime?: string;
  endTime?: string;
  categoryIds?: number[];
}) {
  return apiRequest<{ ok: boolean; data: { serviceId: number } }>(
    "/api/services",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export function updateService(token: string, id: number, payload: {
  name: string;
  duration: number;
  weekdayPrice: number;
  weekendPrice: number;
  startTime?: string;
  endTime?: string;
  categoryIds?: number[];
}) {
  return apiRequest<{ ok: boolean; data: { serviceId: number } }>(
    `/api/services/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token
  );
}

export function deleteService(token: string, id: number) {
  return apiRequest<{ ok: boolean; data: { serviceId: number } }>(
    `/api/services/${id}`,
    { method: "DELETE" },
    token
  );
}

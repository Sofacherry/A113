import { apiRequest } from "./http";

export interface EventDto {
  id: number;
  title: string;
  description: string;
  date: string;
  discount: number;
  promo: string;
  image: string;
}

export function getEvents() {
  return apiRequest<{ ok: boolean; data: EventDto[] }>("/api/events", { method: "GET" });
}

export function createEvent(
  token: string,
  payload: { title: string; description: string; eventDate: string; discount: number; promo?: string; imageUrl?: string }
) {
  return apiRequest<{ ok: boolean; data: EventDto }>(
    "/api/events",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export function updateEvent(
  token: string,
  id: number,
  payload: { title: string; description: string; eventDate: string; discount: number; promo?: string; imageUrl?: string }
) {
  return apiRequest<{ ok: boolean; data: EventDto }>(
    `/api/events/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token
  );
}

export function deleteEvent(token: string, id: number) {
  return apiRequest<{ ok: boolean; data: { eventId: number } }>(
    `/api/events/${id}`,
    { method: "DELETE" },
    token
  );
}

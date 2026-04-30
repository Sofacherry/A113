import { createEvent, deleteEvent, getEventById, listEvents, updateEvent } from "../models/eventModel.js";

function mapEvent(row) {
  return {
    id: Number(row.eventid),
    title: row.title,
    description: row.description,
    date: row.eventdate,
    discount: Number(row.discount || 0),
    promo: row.promo || "",
    image: row.imageurl || `https://placehold.co/600x400/E8ECEF/1C2B48?text=${encodeURIComponent(row.title)}`,
  };
}

function validate(payload) {
  if (!payload.title || !payload.description || !payload.eventDate) {
    return "Поля title, description, eventDate обязательны.";
  }
  const discount = Number(payload.discount || 0);
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    return "discount должен быть в диапазоне 0..100.";
  }
  return null;
}

export async function getEventsVm() {
  const rows = await listEvents();
  return { ok: true, status: 200, data: rows.map(mapEvent) };
}

export async function createEventVm(payload) {
  const err = validate(payload);
  if (err) return { ok: false, status: 400, message: err };
  const eventId = await createEvent(payload);
  const created = await getEventById(eventId);
  return { ok: true, status: 201, data: mapEvent(created) };
}

export async function updateEventVm(eventId, payload) {
  const existing = await getEventById(eventId);
  if (!existing) {
    return { ok: false, status: 404, message: "Акция не найдена." };
  }
  const err = validate(payload);
  if (err) return { ok: false, status: 400, message: err };
  await updateEvent(eventId, payload);
  const updated = await getEventById(eventId);
  return { ok: true, status: 200, data: mapEvent(updated) };
}

export async function deleteEventVm(eventId) {
  const existing = await getEventById(eventId);
  if (!existing) {
    return { ok: false, status: 404, message: "Акция не найдена." };
  }
  await deleteEvent(eventId);
  return { ok: true, status: 200, data: { eventId } };
}

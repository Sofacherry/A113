import {
  createService,
  deleteService,
  getServiceById,
  listCategories,
  listServices,
  updateService,
} from "../models/serviceModel.js";

function validateServicePayload(payload) {
  if (!payload.name || !payload.duration || payload.weekdayPrice == null || payload.weekendPrice == null) {
    return "Поля name, duration, weekdayPrice и weekendPrice обязательны.";
  }
  return null;
}

export async function getServices() {
  const items = await listServices();
  return { ok: true, status: 200, data: items };
}

export async function getCategories() {
  const items = await listCategories();
  return { ok: true, status: 200, data: items };
}

export async function addService(payload) {
  const error = validateServicePayload(payload);
  if (error) {
    return { ok: false, status: 400, message: error };
  }

  const serviceId = await createService(payload);
  return { ok: true, status: 201, data: { serviceId } };
}

export async function editService(serviceId, payload) {
  const existing = await getServiceById(serviceId);
  if (!existing) {
    return { ok: false, status: 404, message: "Услуга не найдена." };
  }

  const error = validateServicePayload(payload);
  if (error) {
    return { ok: false, status: 400, message: error };
  }

  await updateService(serviceId, payload);
  return { ok: true, status: 200, data: { serviceId } };
}

export async function removeService(serviceId) {
  const existing = await getServiceById(serviceId);
  if (!existing) {
    return { ok: false, status: 404, message: "Услуга не найдена." };
  }
  const result = await deleteService(serviceId);
  if (result.hasOrders) {
    return {
      ok: false,
      status: 409,
      message: "Нельзя удалить услугу, потому что по ней уже есть бронирования.",
    };
  }
  return { ok: true, status: 200, data: { serviceId } };
}

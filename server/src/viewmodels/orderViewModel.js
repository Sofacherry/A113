import { listCitizenCategories } from "../models/citizenCategoryModel.js";
import {
  createOrder,
  findFirstResourceByService,
  findOrderById,
  linkOrderResource,
  listOrders,
  updateOrderStatus,
} from "../models/orderModel.js";
import { getServiceById } from "../models/serviceModel.js";
import { findUserById } from "../models/userModel.js";

const ALLOWED_STATUSES = new Set(["создан", "подтвержден", "подтверждён", "завершен", "завершён", "отменен", "отменён"]);

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

async function getUserDiscount(user) {
  if (!user?.citizencategoryid) {
    return 0;
  }
  const categories = await listCitizenCategories();
  const cat = categories.find((item) => Number(item.categoryid) === Number(user.citizencategoryid));
  return Number(cat?.discount || 0);
}

function calcFinalPrice(basePrice, discountPercent, peopleCount) {
  const gross = Number(basePrice) * Number(peopleCount || 1);
  const discountValue = (gross * Number(discountPercent || 0)) / 100;
  return Number((gross - discountValue).toFixed(2));
}

export async function getOrders(query) {
  const data = await listOrders({
    userId: query.userId ? Number(query.userId) : null,
    status: query.status || null,
  });
  return { ok: true, status: 200, data };
}

export async function createOrderEntry(payload) {
  const userId = Number(payload.userId);
  const serviceId = Number(payload.serviceId);
  const peopleCount = Number(payload.peopleCount || 1);
  const orderDate = payload.orderDate ? new Date(payload.orderDate) : null;

  if (!userId || !serviceId || !orderDate || Number.isNaN(orderDate.getTime())) {
    return { ok: false, status: 400, message: "Поля userId, serviceId и orderDate обязательны." };
  }
  if (!Number.isFinite(peopleCount) || peopleCount <= 0) {
    return { ok: false, status: 400, message: "peopleCount должен быть больше нуля." };
  }

  const service = await getServiceById(serviceId);
  if (!service) {
    return { ok: false, status: 404, message: "Услуга не найдена." };
  }

  const user = await findUserById(userId);
  if (!user) {
    return { ok: false, status: 404, message: "Пользователь не найден." };
  }

  const discount = await getUserDiscount(user);
  const basePrice = isWeekend(orderDate) ? Number(service.weekendprice) : Number(service.weekdayprice);
  const totalPrice = calcFinalPrice(basePrice, discount, peopleCount);

  const orderId = await createOrder({
    userId,
    serviceId,
    orderDate,
    totalPrice,
    peopleCount,
    status: "создан",
  });

  const resource = await findFirstResourceByService(serviceId);
  if (resource) {
    await linkOrderResource({ orderId, resourceId: resource.resourceid });
  }

  return {
    ok: true,
    status: 201,
    data: {
      orderId,
      totalPrice,
      discountApplied: discount,
      resourceId: resource?.resourceid || null,
    },
  };
}

export async function changeOrderStatus(orderIdRaw, payload) {
  const orderId = Number(orderIdRaw);
  const status = String(payload.status || "").trim().toLowerCase();

  if (!status || !ALLOWED_STATUSES.has(status)) {
    return { ok: false, status: 400, message: "Недопустимый статус заказа." };
  }

  const existing = await findOrderById(orderId);
  if (!existing) {
    return { ok: false, status: 404, message: "Заказ не найден." };
  }

  await updateOrderStatus(orderId, status);
  return { ok: true, status: 200, data: { orderId, status } };
}

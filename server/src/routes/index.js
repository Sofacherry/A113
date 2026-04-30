import { loginView, meView, registerView } from "../views/authView.js";
import {
  createServiceView,
  deleteServiceView,
  listServicesView,
  updateServiceView,
} from "../views/serviceView.js";
import { createOrderView, listOrdersView, updateOrderStatusView } from "../views/orderView.js";
import { createUserView, deleteUserView, listUsersView, updateUserRoleView, updateUserView } from "../views/adminView.js";
import {
  createCitizenCategoriesView,
  deleteCitizenCategoriesView,
  listCitizenCategoriesView,
  updateCitizenCategoriesView,
} from "../views/citizenCategoryView.js";
import { monthlyRevenueView, topClientsView, topServicesView } from "../views/reportView.js";
import { healthView } from "../views/healthView.js";
import {
  createCategoryView,
  listCategoriesAdminView,
  setCategoryActiveView,
  updateCategoryView,
} from "../views/categoryView.js";
import { createEventView, deleteEventView, listEventsView, updateEventView } from "../views/eventView.js";

export const routes = [
  { method: "GET", path: "/health", handler: healthView },
  { method: "GET", path: "/api/health", handler: healthView },

  { method: "POST", path: "/api/auth/login", handler: loginView },
  { method: "POST", path: "/api/auth/register", handler: registerView },
  { method: "GET", path: "/api/auth/me", handler: meView },

  { method: "GET", path: "/api/services", handler: listServicesView },
  { method: "POST", path: "/api/services", handler: createServiceView },
  { method: "PUT", path: "/api/services/:id", handler: updateServiceView },
  { method: "DELETE", path: "/api/services/:id", handler: deleteServiceView },

  { method: "GET", path: "/api/categories", handler: listCategoriesAdminView },
  { method: "POST", path: "/api/categories", handler: createCategoryView },
  { method: "PUT", path: "/api/categories/:id", handler: updateCategoryView },
  { method: "PATCH", path: "/api/categories/:id/active", handler: setCategoryActiveView },
  { method: "GET", path: "/api/citizen-categories", handler: listCitizenCategoriesView },
  { method: "POST", path: "/api/citizen-categories", handler: createCitizenCategoriesView },
  { method: "PUT", path: "/api/citizen-categories/:id", handler: updateCitizenCategoriesView },
  { method: "DELETE", path: "/api/citizen-categories/:id", handler: deleteCitizenCategoriesView },

  { method: "GET", path: "/api/orders", handler: listOrdersView },
  { method: "POST", path: "/api/orders", handler: createOrderView },
  { method: "PATCH", path: "/api/orders/:id/status", handler: updateOrderStatusView },

  { method: "GET", path: "/api/events", handler: listEventsView },
  { method: "POST", path: "/api/events", handler: createEventView },
  { method: "PUT", path: "/api/events/:id", handler: updateEventView },
  { method: "DELETE", path: "/api/events/:id", handler: deleteEventView },

  { method: "GET", path: "/api/users", handler: listUsersView },
  { method: "POST", path: "/api/users", handler: createUserView },
  { method: "PUT", path: "/api/users/:id", handler: updateUserView },
  { method: "DELETE", path: "/api/users/:id", handler: deleteUserView },
  { method: "PUT", path: "/api/users/:id/role", handler: updateUserRoleView },

  { method: "GET", path: "/api/reports/monthly-revenue", handler: monthlyRevenueView },
  { method: "GET", path: "/api/reports/top-services", handler: topServicesView },
  { method: "GET", path: "/api/reports/top-clients", handler: topClientsView },
];

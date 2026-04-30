import { pool } from "../infrastructure/db/pool.js";

export async function listOrders({ userId, status }) {
  const filters = [];
  const params = [];

  if (userId) {
    params.push(userId);
    filters.push(`o.userid = $${params.length}`);
  }
  if (status) {
    params.push(status);
    filters.push(`o.status = $${params.length}`);
  }

  const whereSql = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  const { rows } = await pool.query(
    `SELECT o.orderid, o.userid, o.serviceid, o.orderdate, o.totalprice, o.peoplecount, o.status,
            u.name AS clientname, u.email AS clientemail,
            s.name AS servicename, s.duration AS serviceduration
     FROM orders o
     INNER JOIN users u ON u.userid = o.userid
     INNER JOIN services s ON s.serviceid = o.serviceid
     ${whereSql}
     ORDER BY o.orderdate DESC`,
    params
  );
  return rows;
}

export async function createOrder({ userId, serviceId, orderDate, totalPrice, peopleCount, status }) {
  const { rows } = await pool.query(
    `INSERT INTO orders (userid, serviceid, orderdate, totalprice, peoplecount, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING orderid`,
    [userId, serviceId, orderDate, totalPrice, peopleCount, status]
  );
  return rows[0].orderid;
}

export async function linkOrderResource({ orderId, resourceId }) {
  await pool.query(
    `INSERT INTO order_resources (orderid, resourceid)
     VALUES ($1, $2)`,
    [orderId, resourceId]
  );
}

export async function findOrderById(orderId) {
  const { rows } = await pool.query(
    `SELECT orderid, userid, serviceid, orderdate, totalprice, peoplecount, status
     FROM orders
     WHERE orderid = $1
     LIMIT 1`,
    [orderId]
  );
  return rows[0] || null;
}

export async function updateOrderStatus(orderId, status) {
  await pool.query("UPDATE orders SET status = $1 WHERE orderid = $2", [status, orderId]);
}

export async function findFirstResourceByService(serviceId) {
  const { rows } = await pool.query(
    `SELECT resourceid, name, capacity
     FROM resources
     WHERE serviceid = $1
     ORDER BY resourceid ASC
     LIMIT 1`,
    [serviceId]
  );
  return rows[0] || null;
}

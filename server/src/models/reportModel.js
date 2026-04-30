import { pool } from "../infrastructure/db/pool.js";

export async function getMonthlyRevenue(limit = 6) {
  const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 6;
  const { rows } = await pool.query(
    `SELECT TO_CHAR(orderdate, 'YYYY-MM') AS month,
            COUNT(*) AS orders,
            ROUND(SUM(totalprice), 2) AS revenue
     FROM orders
     GROUP BY TO_CHAR(orderdate, 'YYYY-MM')
     ORDER BY month DESC
     LIMIT $1`,
    [safeLimit]
  );
  return rows.reverse();
}

export async function getTopServices(limit = 5) {
  const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 5;
  const { rows } = await pool.query(
    `SELECT s.name, COUNT(*) AS orders, ROUND(SUM(o.totalprice), 2) AS revenue
     FROM orders o
     INNER JOIN services s ON s.serviceid = o.serviceid
     GROUP BY s.serviceid, s.name
     ORDER BY revenue DESC
     LIMIT $1`,
    [safeLimit]
  );
  return rows;
}

export async function getTopClients(limit = 5) {
  const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 5;
  const { rows } = await pool.query(
    `SELECT u.name, u.email, COUNT(*) AS orders, ROUND(SUM(o.totalprice), 2) AS total
     FROM orders o
     INNER JOIN users u ON u.userid = o.userid
     GROUP BY u.userid, u.name, u.email
     ORDER BY total DESC
     LIMIT $1`,
    [safeLimit]
  );
  return rows;
}

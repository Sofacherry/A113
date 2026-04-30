import { pool } from "../infrastructure/db/pool.js";

export async function listCategories() {
  const { rows } = await pool.query(
    "SELECT categoryid, categoryname FROM categories ORDER BY categoryname ASC"
  );
  return rows;
}

export async function listServices() {
  const { rows } = await pool.query(
    `SELECT s.serviceid, s.name, s.duration, s.weekdayprice, s.weekendprice, s.starttime, s.endtime,
            STRING_AGG(c.categoryname, ', ' ORDER BY c.categoryname) AS categories
     FROM services s
     LEFT JOIN servicecategories sc ON sc.serviceid = s.serviceid
     LEFT JOIN categories c ON c.categoryid = sc.categoryid
     GROUP BY s.serviceid, s.name, s.duration, s.weekdayprice, s.weekendprice, s.starttime, s.endtime
     ORDER BY s.serviceid DESC`
  );
  return rows;
}

export async function getServiceById(serviceId) {
  const { rows } = await pool.query(
    `SELECT serviceid, name, duration, weekdayprice, weekendprice, starttime, endtime
     FROM services
     WHERE serviceid = $1
     LIMIT 1`,
    [serviceId]
  );
  return rows[0] || null;
}

export async function createService(payload) {
  const { rows } = await pool.query(
    `INSERT INTO services (name, duration, weekdayprice, weekendprice, starttime, endtime)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING serviceid`,
    [
      payload.name,
      payload.duration,
      payload.weekdayPrice,
      payload.weekendPrice,
      payload.startTime || "10:00:00",
      payload.endTime || "22:00:00",
    ]
  );
  const serviceId = rows[0].serviceid;

  if (Array.isArray(payload.categoryIds) && payload.categoryIds.length > 0) {
    const placeholders = payload.categoryIds.map((_, index) => `($1, $${index + 2})`).join(", ");
    await pool.query(
      `INSERT INTO servicecategories (serviceid, categoryid) VALUES ${placeholders}`,
      [serviceId, ...payload.categoryIds]
    );
  }
  return serviceId;
}

export async function updateService(serviceId, payload) {
  await pool.query(
    `UPDATE services
     SET name = $1, duration = $2, weekdayprice = $3, weekendprice = $4, starttime = $5, endtime = $6
     WHERE serviceid = $7`,
    [
      payload.name,
      payload.duration,
      payload.weekdayPrice,
      payload.weekendPrice,
      payload.startTime || "10:00:00",
      payload.endTime || "22:00:00",
      serviceId,
    ]
  );

  if (Array.isArray(payload.categoryIds)) {
    await pool.query("DELETE FROM servicecategories WHERE serviceid = $1", [serviceId]);
    if (payload.categoryIds.length > 0) {
      const placeholders = payload.categoryIds.map((_, index) => `($1, $${index + 2})`).join(", ");
      await pool.query(
        `INSERT INTO servicecategories (serviceid, categoryid) VALUES ${placeholders}`,
        [serviceId, ...payload.categoryIds]
      );
    }
  }
}

export async function deleteService(serviceId) {
  const { rows } = await pool.query(
    `SELECT EXISTS(
       SELECT 1
       FROM orders
       WHERE serviceid = $1
     ) AS has_orders`,
    [serviceId]
  );

  if (rows[0]?.has_orders) {
    return { deleted: false, hasOrders: true };
  }

  await pool.query(
    `DELETE FROM order_resources
     WHERE resourceid IN (
       SELECT resourceid
       FROM resources
       WHERE serviceid = $1
     )`,
    [serviceId]
  );
  await pool.query("DELETE FROM resources WHERE serviceid = $1", [serviceId]);
  await pool.query("DELETE FROM servicecategories WHERE serviceid = $1", [serviceId]);
  await pool.query("DELETE FROM services WHERE serviceid = $1", [serviceId]);

  return { deleted: true, hasOrders: false };
}

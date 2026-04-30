import { pool } from "../infrastructure/db/pool.js";

export async function listEvents() {
  const { rows } = await pool.query(
    `SELECT eventid, title, description, eventdate, discount, promo, imageurl
     FROM events
     ORDER BY eventdate DESC, eventid DESC`
  );
  return rows;
}

export async function getEventById(eventId) {
  const { rows } = await pool.query(
    `SELECT eventid, title, description, eventdate, discount, promo, imageurl
     FROM events
     WHERE eventid = $1
     LIMIT 1`,
    [eventId]
  );
  return rows[0] || null;
}

export async function createEvent(payload) {
  const { rows } = await pool.query(
    `INSERT INTO events (title, description, eventdate, discount, promo, imageurl)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING eventid`,
    [payload.title, payload.description, payload.eventDate, payload.discount, payload.promo || "", payload.imageUrl || null]
  );
  return rows[0].eventid;
}

export async function updateEvent(eventId, payload) {
  await pool.query(
    `UPDATE events
     SET title = $1, description = $2, eventdate = $3, discount = $4, promo = $5, imageurl = $6
     WHERE eventid = $7`,
    [payload.title, payload.description, payload.eventDate, payload.discount, payload.promo || "", payload.imageUrl || null, eventId]
  );
}

export async function deleteEvent(eventId) {
  await pool.query("DELETE FROM events WHERE eventid = $1", [eventId]);
}

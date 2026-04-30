import { pool } from "./pool.js";

async function ensureCategoriesIsActiveColumn() {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.columns
     WHERE table_catalog = current_database()
       AND table_name = 'categories'
       AND column_name = 'isactive'`
  );

  if (Number(rows[0]?.cnt || 0) === 0) {
    await pool.query("ALTER TABLE categories ADD COLUMN isactive BOOLEAN NOT NULL DEFAULT TRUE");
  }
}

async function ensureEventsTable() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS events (
      eventid INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description VARCHAR(1000) NOT NULL,
      eventdate DATE NOT NULL,
      discount INT NOT NULL DEFAULT 0,
      promo VARCHAR(100),
      imageurl VARCHAR(500)
    )`
  );
}

async function ensureUsersRoleConstraint() {
  const { rows } = await pool.query(
    `SELECT pg_get_constraintdef(c.oid) AS def
     FROM pg_constraint c
     JOIN pg_class t ON t.oid = c.conrelid
     WHERE t.relname = 'users'
       AND c.conname = 'users_role_check'
       AND c.contype = 'c'
     LIMIT 1`
  );

  const constraintDefinition = rows[0]?.def || "";
  if (constraintDefinition.includes("Manager")) {
    return;
  }

  await pool.query(`
    ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_role_check
  `);

  await pool.query(`
    ALTER TABLE users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('Client', 'Admin', 'Manager'))
  `);
}

async function seedEventsIfEmpty() {
  const { rows: countRows } = await pool.query("SELECT COUNT(*) AS cnt FROM events");
  if (Number(countRows[0]?.cnt || 0) > 0) {
    return;
  }

  await pool.query(
    `INSERT INTO events (title, description, eventdate, discount, promo, imageurl)
     VALUES
      ($1, $2, $3, $4, $5, $6),
      ($7, $8, $9, $10, $11, $12),
      ($13, $14, $15, $16, $17, $18)`,
    [
      "Ночь боулинга",
      "Ночной турнир по боулингу с призами и подарками.",
      "2026-05-10",
      20,
      "BOWL20",
      "https://placehold.co/600x400/E8ECEF/1C2B48?text=Night+Bowl",
      "Семейный уикенд",
      "Скидки на семейные развлечения в выходной день.",
      "2026-05-17",
      15,
      "FAMILY15",
      "https://placehold.co/600x400/E8ECEF/1C2B48?text=Family+Weekend",
      "Турнир по бильярду",
      "Открытый турнир центра для любителей бильярда.",
      "2026-05-24",
      0,
      "",
      "https://placehold.co/600x400/E8ECEF/1C2B48?text=Billiard+Cup",
    ]
  );
}

export async function bootstrapDatabase() {
  await ensureCategoriesIsActiveColumn();
  await ensureEventsTable();
  await ensureUsersRoleConstraint();
  await seedEventsIfEmpty();
}

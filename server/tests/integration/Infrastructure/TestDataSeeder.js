// @vitest-environment node
import bcrypt from 'bcryptjs';
import { pool } from '../../../src/infrastructure/db/pool.js';

export class TestDataSeeder {
  static async resetDatabaseAsync() {
    await this.seedRolesAsync();
    await this.seedCitizenCategoriesAsync();
    await this.seedServiceCategoriesAsync();
    await this.seedBaseServiceAsync();
  }

  static async seedRolesAsync() {
    await pool.query(
      `INSERT INTO roles (id, value)
       VALUES (1, 'Client'), (2, 'Admin'), (3, 'Manager')
       ON CONFLICT (id) DO NOTHING`
    );
  }

  static async seedCitizenCategoriesAsync() {
    await pool.query(
      `INSERT INTO citizencategories (categoryname, discount)
       VALUES
       ('Студент', 15.00),
       ('Школьник', 20.00),
       ('Пенсионер', 25.00),
       ('Взрослый', 0.00)
       ON CONFLICT (categoryname) DO NOTHING`
    );
  }

  static async seedServiceCategoriesAsync() {
    await pool.query(
      `INSERT INTO categories (categoryname, isactive)
       SELECT 'Активные игры', TRUE
       WHERE NOT EXISTS (
         SELECT 1 FROM categories WHERE categoryname = 'Активные игры'
       )`
    );
    await pool.query(
      `INSERT INTO categories (categoryname, isactive)
       SELECT 'Интеллектуальные', TRUE
       WHERE NOT EXISTS (
         SELECT 1 FROM categories WHERE categoryname = 'Интеллектуальные'
       )`
    );

    const { rows } = await pool.query(
      `SELECT categoryid
       FROM categories
       ORDER BY categoryid ASC
       LIMIT 1`
    );

    return Number(rows[0].categoryid);
  }

  static async seedBaseServiceAsync() {
    const { rows: serviceRows } = await pool.query(
      `INSERT INTO services (name, duration, weekdayprice, weekendprice, starttime, endtime)
       VALUES ('Боулинг', 60, 1700.00, 2000.00, '10:00:00', '22:00:00')
       RETURNING serviceid`
    );
    const serviceId = Number(serviceRows[0].serviceid);

    await pool.query(
      `INSERT INTO resources (serviceid, name, capacity)
       VALUES ($1, 'Дорожка 1', 6)`,
      [serviceId]
    );

    const { rows: categoryRows } = await pool.query(
      `SELECT categoryid FROM categories ORDER BY categoryid ASC LIMIT 1`
    );
    const categoryId = Number(categoryRows[0].categoryid);

    await pool.query(
      `INSERT INTO servicecategories (serviceid, categoryid)
       VALUES ($1, $2)`,
      [serviceId, categoryId]
    );
  }

  static async seedUserAsync({ name, email, password, role, citizenCategoryId = null }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, passwordhash, role, citizencategoryid)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING userid`,
      [name, email, passwordHash, role, citizenCategoryId]
    );

    return Number(rows[0].userid);
  }

  static async seedTicketNewAsync({ userId, serviceId = null, orderDate = '2026-06-10 10:00:00', totalPrice = 1700, peopleCount = 1 }) {
    let resolvedServiceId = serviceId;
    if (!resolvedServiceId) {
      const { rows } = await pool.query('SELECT serviceid FROM services ORDER BY serviceid ASC LIMIT 1');
      resolvedServiceId = Number(rows[0].serviceid);
    }

    const { rows } = await pool.query(
      `INSERT INTO orders (userid, serviceid, orderdate, totalprice, peoplecount, status)
       VALUES ($1, $2, $3, $4, $5, 'создан')
       RETURNING orderid`,
      [userId, resolvedServiceId, orderDate, totalPrice, peopleCount]
    );

    return Number(rows[0].orderid);
  }
}

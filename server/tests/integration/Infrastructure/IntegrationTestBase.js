// @vitest-environment node
import { afterEach, beforeEach } from 'vitest';
import { pool } from '../../../src/infrastructure/db/pool.js';
import { ServiceDeskWebApplicationFactory } from './ServiceDeskWebApplicationFactory.js';
import { TestDataSeeder } from './TestDataSeeder.js';

export class IntegrationTestBase {
  constructor() {
    this.factory = new ServiceDeskWebApplicationFactory();
  }

  registerLifecycle() {
    beforeEach(async () => {
      await pool.query('BEGIN');
      await this.factory.startAsync();
      await TestDataSeeder.resetDatabaseAsync();
    });

    afterEach(async () => {
      await this.factory.stopAsync();
      await pool.query('ROLLBACK');
    });
  }

  async getJson(path, token = null) {
    const response = await this.factory.requestAsync(path, { method: 'GET' }, token);
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    return { response, body };
  }

  async postJson(path, payload, token = null) {
    const response = await this.factory.requestAsync(
      path,
      { method: 'POST', body: JSON.stringify(payload ?? {}) },
      token
    );
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    return { response, body };
  }

  async putJson(path, payload, token = null) {
    const response = await this.factory.requestAsync(
      path,
      { method: 'PUT', body: JSON.stringify(payload ?? {}) },
      token
    );
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    return { response, body };
  }

  async patchJson(path, payload, token = null) {
    const response = await this.factory.requestAsync(
      path,
      { method: 'PATCH', body: JSON.stringify(payload ?? {}) },
      token
    );
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    return { response, body };
  }

  async deleteJson(path, token = null) {
    const response = await this.factory.requestAsync(path, { method: 'DELETE' }, token);
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    return { response, body };
  }
}

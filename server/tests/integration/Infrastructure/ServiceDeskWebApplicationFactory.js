// @vitest-environment node
import { startServer } from '../../../src/app.js';

export class ServiceDeskWebApplicationFactory {
  constructor() {
    this.server = null;
    this.baseUrl = '';
  }

  async startAsync() {
    if (this.server) return;

    this.server = await startServer(0);
    const address = this.server.address();
    const port = typeof address === 'object' && address ? address.port : 1314;
    this.baseUrl = `http://127.0.0.1:${port}`;
  }

  async stopAsync() {
    if (!this.server) return;

    await new Promise((resolve, reject) => {
      this.server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    this.server = null;
  }

  async requestAsync(path, init = {}, token = null) {
    const headers = {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });
  }
}

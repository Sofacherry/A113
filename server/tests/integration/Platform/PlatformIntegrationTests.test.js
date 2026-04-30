// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { IntegrationTestBase } from '../Infrastructure/IntegrationTestBase.js';

describe('PlatformIntegrationTests', () => {
  const testBase = new IntegrationTestBase();
  testBase.registerLifecycle();

  it('health returns 200', async () => {
    const { response, body } = await testBase.getJson('/health');

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it('protected endpoint without token returns 401 problem details', async () => {
    const { response, body } = await testBase.getJson('/api/users');

    expect(response.status).toBe(401);
    expect(body.status).toBe(401);
    expect(body.title).toBeTypeOf('string');
    expect(body.detail).toBeTypeOf('string');
  });
});

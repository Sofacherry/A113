// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { IntegrationTestBase } from '../Infrastructure/IntegrationTestBase.js';
import { TestDataSeeder } from '../Infrastructure/TestDataSeeder.js';
import { TestAuthHelper } from '../Infrastructure/TestAuthHelper.js';

describe('CategoriesIntegrationTests', () => {
  const testBase = new IntegrationTestBase();
  testBase.registerLifecycle();

  async function getAdminToken() {
    await TestDataSeeder.seedUserAsync({
      name: 'Admin',
      email: 'admin@test.local',
      password: '1234',
      role: 'Admin',
      citizenCategoryId: 4,
    });
    return await TestAuthHelper.loginAndGetTokenAsync(testBase, 'admin@test.local', '1234');
  }

  it('admin creates category successfully', async () => {
    const token = await getAdminToken();

    const { response, body } = await testBase.postJson('/api/categories', { name: 'Для компаний' }, token);

    expect(response.status).toBe(201);
    expect(body.data.name).toBe('Для компаний');
  });

  it('duplicate name returns 400', async () => {
    const token = await getAdminToken();

    const first = await testBase.postJson('/api/categories', { name: 'Дубликат' }, token);
    expect(first.response.status).toBe(201);

    const { response, body } = await testBase.postJson('/api/categories', { name: 'Дубликат' }, token);
    expect(response.status).toBe(400);
    expect(body.status).toBe(400);
  });

  it('empty name returns 400', async () => {
    const token = await getAdminToken();

    const { response, body } = await testBase.postJson('/api/categories', { name: '   ' }, token);

    expect(response.status).toBe(400);
    expect(body.status).toBe(400);
  });
});

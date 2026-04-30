// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { IntegrationTestBase } from '../Infrastructure/IntegrationTestBase.js';
import { TestDataSeeder } from '../Infrastructure/TestDataSeeder.js';
import { TestAuthHelper } from '../Infrastructure/TestAuthHelper.js';

describe('UsersRolesIntegrationTests', () => {
  const testBase = new IntegrationTestBase();
  testBase.registerLifecycle();

  async function seedAdminAndToken() {
    await TestDataSeeder.seedUserAsync({
      name: 'Admin',
      email: 'admin@test.local',
      password: '1234',
      role: 'Admin',
      citizenCategoryId: 4,
    });

    return await TestAuthHelper.loginAndGetTokenAsync(testBase, 'admin@test.local', '1234');
  }

  it('valid role change succeeds', async () => {
    const token = await seedAdminAndToken();

    const userId = await TestDataSeeder.seedUserAsync({
      name: 'Role User',
      email: 'role-user@test.local',
      password: '1234',
      role: 'Client',
      citizenCategoryId: 1,
    });

    const { response } = await testBase.putJson(`/api/users/${userId}`, { role: 'Manager' }, token);
    expect(response.status).toBe(200);

    const list = await testBase.getJson('/api/users', token);
    const updated = list.body.data.find((u) => u.id === userId);

    expect(updated.role).toBe('Manager');
  });

  it('nonexistent user returns 404', async () => {
    const token = await seedAdminAndToken();

    const { response, body } = await testBase.putJson('/api/users/999999', { role: 'Manager' }, token);

    expect(response.status).toBe(404);
    expect(body.status).toBe(404);
  });

  it('invalid role returns 400', async () => {
    const token = await seedAdminAndToken();

    const userId = await TestDataSeeder.seedUserAsync({
      name: 'Invalid Role User',
      email: 'invalid-role@test.local',
      password: '1234',
      role: 'Client',
      citizenCategoryId: 1,
    });

    const { response, body } = await testBase.putJson(`/api/users/${userId}`, { role: 'SuperAdmin' }, token);

    expect(response.status).toBe(400);
    expect(body.status).toBe(400);
  });
});

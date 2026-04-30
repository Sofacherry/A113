// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { IntegrationTestBase } from '../Infrastructure/IntegrationTestBase.js';
import { TestDataSeeder } from '../Infrastructure/TestDataSeeder.js';
import { TestAuthHelper } from '../Infrastructure/TestAuthHelper.js';

describe('AuthIntegrationTests', () => {
  const testBase = new IntegrationTestBase();
  testBase.registerLifecycle();

  it('register valid data succeeds', async () => {
    const { response, body } = await testBase.postJson('/api/auth/register', {
      displayName: 'Тестовый клиент',
      email: 'client1@test.local',
      password: '1234',
    });

    expect(response.status).toBe(200);
    expect(body.accessToken).toBeTypeOf('string');
    expect(body.user.email).toBe('client1@test.local');
  });

  it('login wrong password returns 401', async () => {
    await TestDataSeeder.seedUserAsync({
      name: 'Auth User',
      email: 'auth-user@test.local',
      password: 'good-pass',
      role: 'Client',
      citizenCategoryId: 1,
    });

    const { response, body } = await testBase.postJson('/api/auth/login', {
      email: 'auth-user@test.local',
      password: 'bad-pass',
    });

    expect(response.status).toBe(401);
    expect(body.status).toBe(401);
  });

  it('/api/auth/me without token returns 401', async () => {
    const { response, body } = await testBase.getJson('/api/auth/me');

    expect(response.status).toBe(401);
    expect(body.status).toBe(401);
  });

  it('/api/auth/me with token returns current user', async () => {
    await TestDataSeeder.seedUserAsync({
      name: 'Current User',
      email: 'me@test.local',
      password: '1234',
      role: 'Client',
      citizenCategoryId: 1,
    });

    const token = await TestAuthHelper.loginAndGetTokenAsync(testBase, 'me@test.local', '1234');
    const { response, body } = await testBase.getJson('/api/auth/me', token);

    expect(response.status).toBe(200);
    expect(body.email).toBe('me@test.local');
    expect(body.displayName).toBe('Current User');
  });
});

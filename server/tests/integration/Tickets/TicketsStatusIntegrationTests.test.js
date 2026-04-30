// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { IntegrationTestBase } from '../Infrastructure/IntegrationTestBase.js';
import { TestDataSeeder } from '../Infrastructure/TestDataSeeder.js';
import { TestAuthHelper } from '../Infrastructure/TestAuthHelper.js';

describe('TicketsStatusIntegrationTests', () => {
  const testBase = new IntegrationTestBase();
  testBase.registerLifecycle();

  it('manager changes ticket(order) status to resolved(completed)', async () => {
    const clientId = await TestDataSeeder.seedUserAsync({
      name: 'Client A',
      email: 'client-a@test.local',
      password: '1234',
      role: 'Client',
      citizenCategoryId: 1,
    });
    const orderId = await TestDataSeeder.seedTicketNewAsync({ userId: clientId });

    await TestDataSeeder.seedUserAsync({
      name: 'Manager',
      email: 'manager@test.local',
      password: '1234',
      role: 'Manager',
      citizenCategoryId: 4,
    });
    const managerToken = await TestAuthHelper.loginAndGetTokenAsync(testBase, 'manager@test.local', '1234');

    const { response, body } = await testBase.patchJson(`/api/orders/${orderId}/status`, { status: 'завершен' }, managerToken);

    expect(response.status).toBe(200);
    expect(body.data.status).toBe('завершен');
  });

  it('admin can change ticket(order) status', async () => {
    const clientId = await TestDataSeeder.seedUserAsync({
      name: 'Client A',
      email: 'client-a@test.local',
      password: '1234',
      role: 'Client',
      citizenCategoryId: 1,
    });
    const orderId = await TestDataSeeder.seedTicketNewAsync({ userId: clientId });

    await TestDataSeeder.seedUserAsync({
      name: 'Admin',
      email: 'admin@test.local',
      password: '1234',
      role: 'Admin',
      citizenCategoryId: 4,
    });
    const adminToken = await TestAuthHelper.loginAndGetTokenAsync(testBase, 'admin@test.local', '1234');

    const { response, body } = await testBase.patchJson(`/api/orders/${orderId}/status`, { status: 'завершен' }, adminToken);

    expect(response.status).toBe(200);
    expect(body.data.status).toBe('завершен');
  });

  it('invalid status returns 400', async () => {
    const clientId = await TestDataSeeder.seedUserAsync({
      name: 'Client A',
      email: 'client-a@test.local',
      password: '1234',
      role: 'Client',
      citizenCategoryId: 1,
    });
    const orderId = await TestDataSeeder.seedTicketNewAsync({ userId: clientId });

    await TestDataSeeder.seedUserAsync({
      name: 'Manager',
      email: 'manager@test.local',
      password: '1234',
      role: 'Manager',
      citizenCategoryId: 4,
    });
    const managerToken = await TestAuthHelper.loginAndGetTokenAsync(testBase, 'manager@test.local', '1234');

    const { response, body } = await testBase.patchJson(`/api/orders/${orderId}/status`, { status: 'bad-status' }, managerToken);

    expect(response.status).toBe(400);
    expect(typeof body.message).toBe('string');
  });
});

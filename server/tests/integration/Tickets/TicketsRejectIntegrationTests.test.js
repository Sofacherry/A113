// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { IntegrationTestBase } from '../Infrastructure/IntegrationTestBase.js';
import { TestDataSeeder } from '../Infrastructure/TestDataSeeder.js';
import { TestAuthHelper } from '../Infrastructure/TestAuthHelper.js';

describe('TicketsRejectIntegrationTests', () => {
  const testBase = new IntegrationTestBase();
  testBase.registerLifecycle();

  it('reject-like status is not allowed and returns 400', async () => {
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

    const { response, body } = await testBase.patchJson(`/api/orders/${orderId}/status`, { status: 'rejected' }, managerToken);

    expect(response.status).toBe(400);
    expect(typeof body.message).toBe('string');
  });

  it('updating nonexistent ticket(order) returns 404', async () => {
    await TestDataSeeder.seedUserAsync({
      name: 'Manager',
      email: 'manager@test.local',
      password: '1234',
      role: 'Manager',
      citizenCategoryId: 4,
    });
    const managerToken = await TestAuthHelper.loginAndGetTokenAsync(testBase, 'manager@test.local', '1234');

    const { response, body } = await testBase.patchJson('/api/orders/999999/status', { status: 'отменен' }, managerToken);

    expect(response.status).toBe(404);
    expect(typeof body.message).toBe('string');
  });
});

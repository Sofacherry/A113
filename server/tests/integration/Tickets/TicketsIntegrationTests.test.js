// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { IntegrationTestBase } from '../Infrastructure/IntegrationTestBase.js';
import { TestDataSeeder } from '../Infrastructure/TestDataSeeder.js';
import { TestAuthHelper } from '../Infrastructure/TestAuthHelper.js';

describe('TicketsIntegrationTests', () => {
  const testBase = new IntegrationTestBase();
  testBase.registerLifecycle();

  it('client creates ticket(order) with status created', async () => {
    await TestDataSeeder.seedUserAsync({
      name: 'Client A',
      email: 'client-a@test.local',
      password: '1234',
      role: 'Client',
      citizenCategoryId: 1,
    });

    const token = await TestAuthHelper.loginAndGetTokenAsync(testBase, 'client-a@test.local', '1234');

    const create = await testBase.postJson(
      '/api/orders',
      {
        userId: 99999,
        serviceId: 1,
        orderDate: '2026-06-10T10:00:00',
        peopleCount: 2,
      },
      token
    );

    expect(create.response.status).toBe(201);

    const list = await testBase.getJson('/api/orders', token);
    expect(list.response.status).toBe(200);
    expect(list.body.data.length).toBe(1);
    expect(String(list.body.data[0].status).toLowerCase()).toBe('создан');
  });

  it('client cannot read чужой ticket(order)', async () => {
    const ownerId = await TestDataSeeder.seedUserAsync({
      name: 'Owner',
      email: 'owner@test.local',
      password: '1234',
      role: 'Client',
      citizenCategoryId: 1,
    });

    await TestDataSeeder.seedTicketNewAsync({ userId: ownerId });

    await TestDataSeeder.seedUserAsync({
      name: 'Another',
      email: 'another@test.local',
      password: '1234',
      role: 'Client',
      citizenCategoryId: 1,
    });

    const token = await TestAuthHelper.loginAndGetTokenAsync(testBase, 'another@test.local', '1234');
    const list = await testBase.getJson('/api/orders', token);

    expect(list.response.status).toBe(200);
    expect(list.body.data.length).toBe(0);
  });
});

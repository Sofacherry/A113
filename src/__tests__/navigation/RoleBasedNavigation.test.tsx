import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import App from '../../app/App';
import { renderWithProviders } from '../../test/renderWithProviders';

function mockJson(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('RoleBasedNavigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('admin sees admin navigation', async () => {
    localStorage.setItem('a113_token', 'admin-token');

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/me')) {
        return mockJson(200, {
          id: '2',
          email: 'admin@test.local',
          displayName: 'Admin User',
          role: 'Admin',
        }) as any;
      }
      return mockJson(404, { message: 'not found' }) as any;
    });

    renderWithProviders(<App />);

    await waitFor(() => {
      expect(screen.getByText('Пользователи')).toBeInTheDocument();
    });

    expect(screen.getByText('Заказы клиентов')).toBeInTheDocument();
    expect(screen.getByText('Отчеты')).toBeInTheDocument();
  });

  it('client does not see admin navigation', async () => {
    localStorage.setItem('a113_token', 'client-token');

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/me')) {
        return mockJson(200, {
          id: '3',
          email: 'client@test.local',
          displayName: 'Client User',
          role: 'Client',
        }) as any;
      }
      if (url.includes('/api/services')) {
        return mockJson(200, { ok: true, data: [] }) as any;
      }
      return mockJson(404, { message: 'not found' }) as any;
    });

    renderWithProviders(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('Каталог услуг').length).toBeGreaterThan(0);
    });

    expect(screen.queryByText('Пользователи')).not.toBeInTheDocument();
    expect(screen.queryByText('Отчеты')).not.toBeInTheDocument();
  });
});

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

describe('AuthInit', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('without token shows login screen', async () => {
    renderWithProviders(<App />);

    expect(await screen.findByPlaceholderText('user@test.com')).toBeInTheDocument();
  });

  it('with token restores session and shows app shell', async () => {
    localStorage.setItem('a113_token', 'test-token');

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/me')) {
        return mockJson(200, {
          id: '1',
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
      expect(screen.getByText('Client')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Каталог услуг').length).toBeGreaterThan(0);
  });
});

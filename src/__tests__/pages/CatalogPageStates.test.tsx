import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import { CatalogPage } from '../../app/components/client/CatalogPage';

vi.mock('../../app/api/servicesApi', () => {
  return {
    getServices: vi.fn(),
    mapServiceToUi: (item: any) => item,
  };
});

import { getServices } from '../../app/api/servicesApi';

describe('CatalogPageStates', () => {
  it('shows loading state', () => {
    (getServices as any).mockReturnValue(new Promise(() => {}));

    const view = renderWithProviders(<CatalogPage />);

    expect(view.container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    (getServices as any).mockRejectedValue(new Error('load-failed'));

    const view = renderWithProviders(<CatalogPage />);

    await waitFor(() => {
      expect(view.container.textContent).toContain('load-failed');
    });
  });

  it('shows empty state (no service cards)', async () => {
    (getServices as any).mockResolvedValue({ data: [] });

    const view = renderWithProviders(<CatalogPage />);

    await waitFor(() => {
      expect(view.container.querySelectorAll('.ant-card').length).toBe(0);
    });
  });
});

import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import App from '../../app/App';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('RouteProtection', () => {
  it('protected application is not shown without auth', async () => {
    renderWithProviders(<App />);

    expect(await screen.findByPlaceholderText('user@test.com')).toBeInTheDocument();
    expect(screen.queryByText('Пользователи')).not.toBeInTheDocument();
  });
});

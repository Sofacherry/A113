import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import App from '../../app/App';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('LoginPage', () => {
  it('renders login form when user is unauthenticated', async () => {
    renderWithProviders(<App />);

    expect(await screen.findByText('A113')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('user@test.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password123!')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { League } from './League';

// Mock the Leaderboard component since League is primarily a layout/container component
vi.mock('../Leaderboard/Leaderboard', () => ({
  Leaderboard: () => <div data-testid="leaderboard">Mocked Leaderboard</div>,
}));

// Mock the useAuth hook to provide a mock signOut function
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    session: { access_token: 'mock-token' },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe('League', () => {
  it('should display league information and leaderboard to the user', () => {
    render(
      <MemoryRouter>
        <League />
      </MemoryRouter>,
    );

    // User should see they are viewing the COTA 2025 league
    expect(screen.getByText('League')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'COTA 2025' })).toBeInTheDocument();

    // User should see the main content: the leaderboard
    expect(screen.getByTestId('leaderboard')).toBeInTheDocument();
  });

  it('should have accessible heading structure for screen readers', () => {
    render(
      <MemoryRouter>
        <League />
      </MemoryRouter>,
    );

    // Screen reader users should be able to navigate by headings
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('COTA 2025');
    expect(heading).toBeInTheDocument();
  });
});

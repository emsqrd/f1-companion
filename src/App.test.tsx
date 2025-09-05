import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import App from './App';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Mock the League component to isolate App component testing
vi.mock('./components/League/League', () => ({
  League: () => <div data-testid="league-component">Mocked League Component</div>,
}));

// Mock the useAuth hook to provide a mock authenticated user
vi.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    session: { access_token: 'mock-token' },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe('App', () => {
  it('should render the League component', () => {
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <App />
        </ProtectedRoute>
      </BrowserRouter>,
    );

    const leagueComponent = screen.getByTestId('league-component');
    expect(leagueComponent).toBeInTheDocument();
  });
});

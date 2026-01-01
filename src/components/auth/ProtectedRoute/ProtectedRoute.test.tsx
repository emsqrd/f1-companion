import type { AuthContextType } from '@/contexts/AuthContext';
import { AuthContext } from '@/contexts/AuthContext';
import type { User } from '@supabase/supabase-js';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProtectedRoute } from './ProtectedRoute';

// Mock the LoadingSpinner component
vi.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading F1 Fantasy Sports...</div>,
}));

// Mock react-router navigation
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

const TestChild = () => <div data-testid="protected-content">Protected Content</div>;

const mockAuthenticatedUser: User = {
  id: 'user-123',
  email: 'test@example.com',
} as User;

function renderWithAuthAndRouter(component: ReactNode, authContext: Partial<AuthContextType> = {}) {
  const defaultAuthContext: AuthContextType = {
    user: null,
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    ...authContext,
  };

  return render(
    <AuthContext.Provider value={defaultAuthContext}>{component}</AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('displays loading spinner when auth is loading', () => {
      renderWithAuthAndRouter(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>,
        { loading: true, user: null },
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading F1 Fantasy Sports...')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('does not navigate when loading is true', () => {
      renderWithAuthAndRouter(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>,
        { loading: true, user: null },
      );

      // Should not navigate during loading state
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Authentication Flow', () => {
    it('renders children when user is authenticated and not loading', () => {
      renderWithAuthAndRouter(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>,
        { loading: false, user: mockAuthenticatedUser },
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates to landing page when user is not authenticated and not loading', async () => {
      renderWithAuthAndRouter(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>,
        { loading: false, user: null },
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/', replace: true });
      });
    });

    it('returns null while redirecting to prevent content flash', () => {
      renderWithAuthAndRouter(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>,
        { loading: false, user: null },
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('transitions from loading to authenticated correctly', async () => {
      const { rerender } = renderWithAuthAndRouter(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>,
        { loading: true, user: null },
      );

      // Initially loading
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

      // Auth completes with authenticated user
      rerender(
        <AuthContext.Provider
          value={{
            user: mockAuthenticatedUser,
            session: null,
            loading: false,
            signIn: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
          }}
        >
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </AuthContext.Provider>,
      );

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates when user becomes null after being authenticated', async () => {
      const { rerender } = renderWithAuthAndRouter(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>,
        { loading: false, user: mockAuthenticatedUser },
      );

      // Initially authenticated - should render content
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();

      // User logs out
      rerender(
        <AuthContext.Provider
          value={{
            user: null,
            session: null,
            loading: false,
            signIn: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
          }}
        >
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/', replace: true });
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined user same as null user', async () => {
      renderWithAuthAndRouter(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>,
        { loading: false, user: undefined as unknown as User },
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/', replace: true });
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('only navigates once per authentication state change', async () => {
      const { rerender } = renderWithAuthAndRouter(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>,
        { loading: false, user: null },
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });

      // Re-render with same unauthenticated state
      rerender(
        <AuthContext.Provider
          value={{
            user: null,
            session: null,
            loading: false,
            signIn: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
          }}
        >
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </AuthContext.Provider>,
      );

      // Should not navigate again
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Complex Behavior', () => {
    it('maintains stable behavior across multiple auth state changes', async () => {
      const { rerender } = renderWithAuthAndRouter(
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>,
        { loading: true, user: null },
      );

      const authStates = [
        { loading: false, user: null }, // Should navigate
        { loading: false, user: mockAuthenticatedUser }, // Should show content
        { loading: true, user: mockAuthenticatedUser }, // Should show loading
        { loading: false, user: mockAuthenticatedUser }, // Should show content again
        { loading: false, user: null }, // Should navigate again
      ];

      for (const [index, state] of authStates.entries()) {
        rerender(
          <AuthContext.Provider
            value={{
              ...state,
              session: null,
              signIn: vi.fn(),
              signUp: vi.fn(),
              signOut: vi.fn(),
            }}
          >
            <ProtectedRoute>
              <TestChild />
            </ProtectedRoute>
          </AuthContext.Provider>,
        );

        if (index === 0 || index === 4) {
          // Should navigate on unauthenticated states
          await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({ to: '/', replace: true });
          });
        }
      }

      // Should have navigated twice (states 0 and 4)
      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('maintains accessibility of child components when authenticated', () => {
      const AccessibleChild = () => (
        <div>
          <h1>Accessible Page</h1>
          <button aria-label="Submit form">Submit</button>
          <input aria-label="Search input" type="text" />
        </div>
      );

      renderWithAuthAndRouter(
        <ProtectedRoute>
          <AccessibleChild />
        </ProtectedRoute>,
        { loading: false, user: mockAuthenticatedUser },
      );

      expect(screen.getByRole('heading', { name: 'Accessible Page' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit form' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Search input' })).toBeInTheDocument();
    });
  });
});

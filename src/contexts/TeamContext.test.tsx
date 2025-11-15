import type { Team } from '@/contracts/Team';
import type { User } from '@supabase/supabase-js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import after mocking
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { getMyTeam } from '../services/teamService';
import { TeamProvider } from './TeamContext.tsx';

// Mock modules
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/teamService', () => ({
  getMyTeam: vi.fn(),
}));

vi.mock('@sentry/react', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    fmt: (strings: TemplateStringsArray, ...values: unknown[]) =>
      strings.reduce((acc, str, i) => acc + str + (values[i] || ''), ''),
  },
  captureException: vi.fn(),
}));

// Test component that consumes the team context
function TestComponent() {
  const { team, hasTeam, isCheckingTeam, error, setTeam, refetchTeam, clearError } = useTeam();

  const handleSetTeam = () => {
    setTeam({ id: 2, name: 'Updated Team', ownerName: 'New Owner' });
  };

  const handleRefetchTeam = async () => {
    try {
      await refetchTeam();
    } catch {
      // Errors are expected in some tests
    }
  };

  return (
    <div>
      <div data-testid="team">{team ? team.name : 'null'}</div>
      <div data-testid="has-team">{hasTeam.toString()}</div>
      <div data-testid="is-checking">{isCheckingTeam.toString()}</div>
      <div data-testid="error">{error?.message ?? 'null'}</div>
      <button onClick={handleSetTeam} data-testid="set-team-btn">
        Set Team
      </button>
      <button onClick={handleRefetchTeam} data-testid="refetch-btn">
        Refetch Team
      </button>
      <button onClick={clearError} data-testid="clear-error-btn">
        Clear Error
      </button>
    </div>
  );
}

describe('TeamProvider', () => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockTeam: Team = {
    id: 1,
    name: 'Test Team',
    ownerName: 'Test Owner',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock setup - authenticated user
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('loads existing team on mount when user has a team', async () => {
      vi.mocked(getMyTeam).mockResolvedValue(mockTeam);

      render(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      expect(await screen.findByTestId('team')).toHaveTextContent('Test Team');
      expect(screen.getByTestId('has-team')).toHaveTextContent('true');
      expect(screen.getByTestId('is-checking')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });

    it('handles no team on mount when user has no team', async () => {
      vi.mocked(getMyTeam).mockResolvedValue(null);

      render(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      // Wait for async operation to complete
      await screen.findByText('false', { selector: '[data-testid="is-checking"]' });

      expect(screen.getByTestId('team')).toHaveTextContent('null');
      expect(screen.getByTestId('has-team')).toHaveTextContent('false');
    });

    it('does not fetch team when user is not authenticated', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      render(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      // Wait for async operation to complete
      await screen.findByText('false', { selector: '[data-testid="is-checking"]' });

      expect(getMyTeam).not.toHaveBeenCalled();
      expect(screen.getByTestId('team')).toHaveTextContent('null');
      expect(screen.getByTestId('has-team')).toHaveTextContent('false');
    });
  });

  describe('Error Handling', () => {
    it('captures and displays error when team fetch fails', async () => {
      const fetchError = new Error('Failed to fetch team');
      vi.mocked(getMyTeam).mockRejectedValue(fetchError);

      render(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      expect(
        await screen.findByText('Failed to fetch team', { selector: '[data-testid="error"]' }),
      ).toBeInTheDocument();
      expect(screen.getByTestId('is-checking')).toHaveTextContent('false');
      expect(screen.getByTestId('team')).toHaveTextContent('null');
    });

    it('clears error when setTeam is called', async () => {
      const fetchError = new Error('Failed to fetch team');
      vi.mocked(getMyTeam).mockRejectedValue(fetchError);

      render(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      await screen.findByText('Failed to fetch team', { selector: '[data-testid="error"]' });

      await userEvent.click(screen.getByTestId('set-team-btn'));

      expect(screen.getByTestId('error')).toHaveTextContent('null');
      expect(screen.getByTestId('team')).toHaveTextContent('Updated Team');
    });

    it('clears error when clearError is called', async () => {
      const fetchError = new Error('Failed to fetch team');
      vi.mocked(getMyTeam).mockRejectedValue(fetchError);

      render(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      await screen.findByText('Failed to fetch team', { selector: '[data-testid="error"]' });

      await userEvent.click(screen.getByTestId('clear-error-btn'));

      expect(screen.getByTestId('error')).toHaveTextContent('null');
      expect(screen.getByTestId('team')).toHaveTextContent('null');
    });
  });

  describe('Team Management', () => {
    it('updates team when setTeam is called', async () => {
      vi.mocked(getMyTeam).mockResolvedValue(mockTeam);

      render(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      await screen.findByText('Test Team', { selector: '[data-testid="team"]' });

      await userEvent.click(screen.getByTestId('set-team-btn'));

      expect(screen.getByTestId('team')).toHaveTextContent('Updated Team');
      expect(screen.getByTestId('has-team')).toHaveTextContent('true');
    });

    it('refetches team when refetchTeam is called', async () => {
      vi.mocked(getMyTeam).mockResolvedValue(mockTeam);

      render(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      await screen.findByText('Test Team', { selector: '[data-testid="team"]' });

      const updatedTeam = { id: 1, name: 'Refetched Team', ownerName: 'Test Owner' };
      vi.mocked(getMyTeam).mockResolvedValue(updatedTeam);

      await userEvent.click(screen.getByTestId('refetch-btn'));

      expect(
        await screen.findByText('Refetched Team', { selector: '[data-testid="team"]' }),
      ).toBeInTheDocument();

      expect(getMyTeam).toHaveBeenCalledTimes(2);
    });

    it('handles error during refetchTeam', async () => {
      vi.mocked(getMyTeam).mockResolvedValue(mockTeam);

      render(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      await screen.findByText('Test Team', { selector: '[data-testid="team"]' });

      const refetchError = new Error('Refetch failed');
      vi.mocked(getMyTeam).mockRejectedValue(refetchError);

      await userEvent.click(screen.getByTestId('refetch-btn'));

      expect(
        await screen.findByText('Refetch failed', { selector: '[data-testid="error"]' }),
      ).toBeInTheDocument();
      expect(screen.getByTestId('is-checking')).toHaveTextContent('false');
    });
  });

  describe('User State Changes', () => {
    it('refetches team when user changes from null to authenticated', async () => {
      // Start with no user
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      const { rerender } = render(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      // Wait for async operation to complete
      await screen.findByText('false', { selector: '[data-testid="is-checking"]' });

      expect(getMyTeam).not.toHaveBeenCalled();

      // User logs in
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      vi.mocked(getMyTeam).mockResolvedValue(mockTeam);

      rerender(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      expect(
        await screen.findByText('Test Team', { selector: '[data-testid="team"]' }),
      ).toBeInTheDocument();
      expect(screen.getByTestId('has-team')).toHaveTextContent('true');
    });
  });
});

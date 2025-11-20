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
  const { myTeamId, hasTeam, isCheckingTeam, refreshMyTeam } = useTeam();

  const handleRefreshTeam = () => {
    refreshMyTeam();
  };

  return (
    <div>
      <div data-testid="team-id">{myTeamId ?? 'null'}</div>
      <div data-testid="has-team">{hasTeam.toString()}</div>
      <div data-testid="is-checking">{isCheckingTeam.toString()}</div>
      <button onClick={handleRefreshTeam} data-testid="refresh-btn">
        Refresh Team
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

      expect(await screen.findByTestId('team-id')).toHaveTextContent('1');
      expect(screen.getByTestId('has-team')).toHaveTextContent('true');
      expect(screen.getByTestId('is-checking')).toHaveTextContent('false');
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

      expect(screen.getByTestId('team-id')).toHaveTextContent('null');
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

      // Wait a bit to ensure no calls are made
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(getMyTeam).not.toHaveBeenCalled();
      expect(screen.getByTestId('team-id')).toHaveTextContent('null');
      expect(screen.getByTestId('has-team')).toHaveTextContent('false');
    });
  });

  describe('Team Management', () => {
    it('refreshes team when refreshMyTeam is called', async () => {
      vi.mocked(getMyTeam).mockResolvedValue(mockTeam);

      render(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      await screen.findByText('1', { selector: '[data-testid="team-id"]' });

      const updatedTeam = { id: 3, name: 'Refreshed Team', ownerName: 'Test Owner' };
      vi.mocked(getMyTeam).mockResolvedValue(updatedTeam);

      await userEvent.click(screen.getByTestId('refresh-btn'));

      expect(
        await screen.findByText('3', { selector: '[data-testid="team-id"]' }),
      ).toBeInTheDocument();

      expect(getMyTeam).toHaveBeenCalledTimes(2);
    });

    it('handles error during team fetch silently', async () => {
      const fetchError = new Error('Failed to fetch team');
      vi.mocked(getMyTeam).mockRejectedValue(fetchError);

      render(
        <TeamProvider>
          <TestComponent />
        </TeamProvider>,
      );

      // Wait for async operation to complete
      await screen.findByText('false', { selector: '[data-testid="is-checking"]' });

      // Error is handled silently, team ID is null
      expect(screen.getByTestId('team-id')).toHaveTextContent('null');
      expect(screen.getByTestId('has-team')).toHaveTextContent('false');
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

      // Wait a bit to ensure no calls are made
      await new Promise((resolve) => setTimeout(resolve, 50));

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
        await screen.findByText('1', { selector: '[data-testid="team-id"]' }),
      ).toBeInTheDocument();
      expect(screen.getByTestId('has-team')).toHaveTextContent('true');
    });
  });
});

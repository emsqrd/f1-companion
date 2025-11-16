import type { Team } from '@/contracts/Team';
import { useTeam } from '@/hooks/useTeam';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TeamRequiredGuard } from './TeamRequiredGuard';

vi.mock('@/hooks/useTeam');

const mockUseTeam = vi.mocked(useTeam);

const mockTeam: Team = {
  id: 1,
  name: 'Test Team',
  ownerName: 'Test Owner',
};

// Mock child component that renders when guard allows access
function ProtectedPage() {
  return <div>Protected Content</div>;
}

// Mock create team page
function CreateTeamPage() {
  return <div>Create Team Page</div>;
}

// Helper to render TeamRequiredGuard within routing context
function renderWithRouter(initialRoute = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/protected" element={<TeamRequiredGuard />}>
          <Route index element={<ProtectedPage />} />
        </Route>
        <Route path="/create-team" element={<CreateTeamPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TeamRequiredGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User with Team', () => {
    it('renders protected content when user has a team', () => {
      mockUseTeam.mockReturnValue({
        hasTeam: true,
        isCheckingTeam: false,
        error: null,
        team: mockTeam,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('hides loading state when team is already loaded', () => {
      mockUseTeam.mockReturnValue({
        hasTeam: true,
        isCheckingTeam: false,
        error: null,
        team: mockTeam,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithRouter();

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('User without Team', () => {
    it('redirects to create-team when user has no team', async () => {
      // Start with loading state, then transition to no team
      mockUseTeam.mockReturnValueOnce({
        hasTeam: false,
        isCheckingTeam: true,
        error: null,
        team: null,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      const { rerender } = renderWithRouter();

      // Show loading initially
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Transition to loaded state with no team
      mockUseTeam.mockReturnValue({
        hasTeam: false,
        isCheckingTeam: false,
        error: null,
        team: null,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={<TeamRequiredGuard />}>
              <Route index element={<ProtectedPage />} />
            </Route>
            <Route path="/create-team" element={<CreateTeamPage />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText('Create Team Page')).toBeInTheDocument();
      });

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('hides protected content while redirecting', () => {
      mockUseTeam.mockReturnValue({
        hasTeam: false,
        isCheckingTeam: false,
        error: null,
        team: null,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithRouter();

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner while checking team status', () => {
      mockUseTeam.mockReturnValue({
        hasTeam: false,
        isCheckingTeam: true,
        error: null,
        team: null,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows loading text while checking team status', () => {
      mockUseTeam.mockReturnValue({
        hasTeam: false,
        isCheckingTeam: true,
        error: null,
        team: null,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('hides protected content while checking team', () => {
      mockUseTeam.mockReturnValue({
        hasTeam: false,
        isCheckingTeam: true,
        error: null,
        team: null,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithRouter();

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('prevents redirect while still checking team status', () => {
      mockUseTeam.mockReturnValue({
        hasTeam: false,
        isCheckingTeam: true,
        error: null,
        team: null,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithRouter();

      expect(screen.queryByText('Create Team Page')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when team fetch fails', () => {
      mockUseTeam.mockReturnValue({
        hasTeam: false,
        isCheckingTeam: false,
        error: new Error('Network error'),
        team: null,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByText(/Failed to load team information/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });

    it('shows retry button when error occurs', () => {
      mockUseTeam.mockReturnValue({
        hasTeam: false,
        isCheckingTeam: false,
        error: new Error('Network error'),
        team: null,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls refetchTeam when retry button is clicked', async () => {
      const mockRefetchTeam = vi.fn();
      mockUseTeam.mockReturnValue({
        hasTeam: false,
        isCheckingTeam: false,
        error: new Error('Network error'),
        team: null,
        setTeam: vi.fn(),
        refetchTeam: mockRefetchTeam,
        clearError: vi.fn(),
      });

      renderWithRouter();
      const user = userEvent.setup();

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(mockRefetchTeam).toHaveBeenCalledTimes(1);
    });

    it('hides protected content when error occurs', () => {
      mockUseTeam.mockReturnValue({
        hasTeam: false,
        isCheckingTeam: false,
        error: new Error('Network error'),
        team: null,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithRouter();

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('prevents redirect to create-team when error occurs', () => {
      mockUseTeam.mockReturnValue({
        hasTeam: false,
        isCheckingTeam: false,
        error: new Error('Network error'),
        team: null,
        setTeam: vi.fn(),
        refetchTeam: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithRouter();

      expect(screen.queryByText('Create Team Page')).not.toBeInTheDocument();
    });
  });
});

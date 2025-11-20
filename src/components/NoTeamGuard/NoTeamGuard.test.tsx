import type { Team } from '@/contracts/Team';
import { useTeam } from '@/hooks/useTeam';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NoTeamGuard } from './NoTeamGuard';

vi.mock('@/hooks/useTeam');

const mockUseTeam = vi.mocked(useTeam);

const mockTeam: Team = {
  id: 1,
  name: 'Test Team',
  ownerName: 'Test Owner',
};

// Mock child component that renders when guard allows access
function CreateTeamPage() {
  return <div>Create Team Page</div>;
}

// Mock team page (redirect target)
function TeamPage() {
  return <div>Team Page</div>;
}

// Helper to render NoTeamGuard within routing context
function renderWithRouter(initialRoute = '/create-team') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/create-team" element={<NoTeamGuard />}>
          <Route index element={<CreateTeamPage />} />
        </Route>
        <Route path="/team/:teamId" element={<TeamPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('NoTeamGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User without Team', () => {
    it('renders protected content when user has no team', () => {
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: false,
        refreshMyTeam: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByText('Create Team Page')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('User with Team', () => {
    it('redirects to team page when user already has a team', async () => {
      mockUseTeam.mockReturnValue({
        myTeamId: mockTeam.id,
        hasTeam: true,
        isCheckingTeam: false,
        refreshMyTeam: vi.fn(),
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Team Page')).toBeInTheDocument();
      });

      expect(screen.queryByText('Create Team Page')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading state and prevents navigation while checking team', () => {
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: true,
        refreshMyTeam: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Create Team Page')).not.toBeInTheDocument();
      expect(screen.queryByText('Team Page')).not.toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('transitions from loading to content when user has no team', async () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/create-team']}>
          <Routes>
            <Route path="/create-team" element={<NoTeamGuard />}>
              <Route index element={<CreateTeamPage />} />
            </Route>
            <Route path="/team/:teamId" element={<TeamPage />} />
          </Routes>
        </MemoryRouter>,
      );

      // Start with loading state
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: true,
        refreshMyTeam: vi.fn(),
      });

      rerender(
        <MemoryRouter initialEntries={['/create-team']}>
          <Routes>
            <Route path="/create-team" element={<NoTeamGuard />}>
              <Route index element={<CreateTeamPage />} />
            </Route>
            <Route path="/team/:teamId" element={<TeamPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByRole('status')).toBeInTheDocument();

      // Transition to loaded state (no team)
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: false,
        refreshMyTeam: vi.fn(),
      });

      rerender(
        <MemoryRouter initialEntries={['/create-team']}>
          <Routes>
            <Route path="/create-team" element={<NoTeamGuard />}>
              <Route index element={<CreateTeamPage />} />
            </Route>
            <Route path="/team/:teamId" element={<TeamPage />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText('Create Team Page')).toBeInTheDocument();
      });

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('transitions from loading to redirect when user has team', async () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/create-team']}>
          <Routes>
            <Route path="/create-team" element={<NoTeamGuard />}>
              <Route index element={<CreateTeamPage />} />
            </Route>
            <Route path="/team/:teamId" element={<TeamPage />} />
          </Routes>
        </MemoryRouter>,
      );

      // Start with loading state
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: true,
        refreshMyTeam: vi.fn(),
      });

      rerender(
        <MemoryRouter initialEntries={['/create-team']}>
          <Routes>
            <Route path="/create-team" element={<NoTeamGuard />}>
              <Route index element={<CreateTeamPage />} />
            </Route>
            <Route path="/team/:teamId" element={<TeamPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByRole('status')).toBeInTheDocument();

      // Transition to loaded state (has team)
      mockUseTeam.mockReturnValue({
        myTeamId: mockTeam.id,
        hasTeam: true,
        isCheckingTeam: false,
        refreshMyTeam: vi.fn(),
      });

      rerender(
        <MemoryRouter initialEntries={['/create-team']}>
          <Routes>
            <Route path="/create-team" element={<NoTeamGuard />}>
              <Route index element={<CreateTeamPage />} />
            </Route>
            <Route path="/team/:teamId" element={<TeamPage />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText('Team Page')).toBeInTheDocument();
      });
    });
  });
});

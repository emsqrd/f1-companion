import { useTeam } from '@/hooks/useTeam';
import { createMockTeam } from '@/test-utils';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NoTeamGuard } from './NoTeamGuard';

vi.mock('@/hooks/useTeam');

// Mock TanStack Router
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  Outlet: () => <div>Create Team Page</div>,
}));

const mockUseTeam = vi.mocked(useTeam);

const mockTeam = createMockTeam();

// Helper to render NoTeamGuard
function renderWithRouter() {
  return render(<NoTeamGuard />);
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
        expect(mockNavigate).toHaveBeenCalledWith({
          to: `/team/${mockTeam.id}`,
          replace: true,
        });
      });
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
      // Start with loading state
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: true,
        refreshMyTeam: vi.fn(),
      });

      const { rerender } = render(<NoTeamGuard />);

      rerender(<NoTeamGuard />);

      expect(screen.getByRole('status')).toBeInTheDocument();

      // Transition to loaded state (no team)
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: false,
        refreshMyTeam: vi.fn(),
      });

      rerender(<NoTeamGuard />);

      await waitFor(() => {
        expect(screen.getByText('Create Team Page')).toBeInTheDocument();
      });

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('transitions from loading to redirect when user has team', async () => {
      // Start with loading state
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: true,
        refreshMyTeam: vi.fn(),
      });

      const { rerender } = render(<NoTeamGuard />);

      rerender(<NoTeamGuard />);

      expect(screen.getByRole('status')).toBeInTheDocument();

      // Transition to loaded state (has team)
      mockUseTeam.mockReturnValue({
        myTeamId: mockTeam.id,
        hasTeam: true,
        isCheckingTeam: false,
        refreshMyTeam: vi.fn(),
      });

      rerender(<NoTeamGuard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          to: `/team/${mockTeam.id}`,
          replace: true,
        });
      });
    });
  });
});

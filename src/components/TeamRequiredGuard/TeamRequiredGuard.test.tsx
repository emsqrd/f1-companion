import { useTeam } from '@/hooks/useTeam';
import { createMockTeam } from '@/test-utils';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TeamRequiredGuard } from './TeamRequiredGuard';

vi.mock('@/hooks/useTeam');

// Mock TanStack Router
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  Outlet: () => <div>Protected Content</div>,
}));

const mockUseTeam = vi.mocked(useTeam);

const mockTeam = createMockTeam();

// Helper to render TeamRequiredGuard
function renderWithRouter() {
  return render(<TeamRequiredGuard />);
}

describe('TeamRequiredGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User with Team', () => {
    it('renders protected content when user has a team', () => {
      mockUseTeam.mockReturnValue({
        myTeamId: mockTeam.id,
        hasTeam: true,
        isCheckingTeam: false,
        refreshMyTeam: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('hides loading state when team is already loaded', () => {
      mockUseTeam.mockReturnValue({
        myTeamId: mockTeam.id,
        hasTeam: true,
        isCheckingTeam: false,
        refreshMyTeam: vi.fn(),
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
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: true,
        refreshMyTeam: vi.fn(),
      });

      const { rerender } = renderWithRouter();

      // Show loading initially
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Transition to loaded state with no team
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: false,
        refreshMyTeam: vi.fn(),
      });

      rerender(<TeamRequiredGuard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/create-team', replace: true });
      });
    });

    it('hides protected content while redirecting', () => {
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: false,
        refreshMyTeam: vi.fn(),
      });

      renderWithRouter();

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner while checking team status', () => {
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: true,
        refreshMyTeam: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows loading text while checking team status', () => {
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: true,
        refreshMyTeam: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('hides protected content while checking team', () => {
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: true,
        refreshMyTeam: vi.fn(),
      });

      renderWithRouter();

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('prevents redirect while still checking team status', () => {
      mockUseTeam.mockReturnValue({
        myTeamId: null,
        hasTeam: false,
        isCheckingTeam: true,
        refreshMyTeam: vi.fn(),
      });

      renderWithRouter();

      expect(screen.queryByText('Create Team Page')).not.toBeInTheDocument();
    });
  });
});

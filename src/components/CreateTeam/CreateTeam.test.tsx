import type { Team } from '@/contracts/Team';
import * as teamService from '@/services/teamService';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateTeam } from './CreateTeam';

// Mock dependencies
vi.mock('@/services/teamService');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

const mockTeamService = vi.mocked(teamService);
const mockToast = vi.mocked(toast);

const mockTeam: Team = {
  id: 1,
  name: 'Test Team',
  ownerName: 'Test Owner',
};

describe('CreateTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTeamService.createTeam.mockReset();
    mockTeamService.createTeam.mockResolvedValue(mockTeam);
  });

  it('creates team and navigates to team page on successful submission', async () => {
    render(<CreateTeam />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/team name/i), 'My Racing Team');
    await user.click(screen.getByRole('button', { name: /create team/i }));

    await waitFor(() => {
      expect(mockTeamService.createTeam).toHaveBeenCalledWith({
        name: 'My Racing Team',
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith('Team created successfully');
    expect(mockNavigate).toHaveBeenCalledWith('/team/1');
  });

  it('trims whitespace from team name before submission', async () => {
    render(<CreateTeam />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/team name/i), '  Test Team  ');
    await user.click(screen.getByRole('button', { name: /create team/i }));

    await waitFor(() => {
      expect(mockTeamService.createTeam).toHaveBeenCalledWith({
        name: 'Test Team',
      });
    });
  });

  it('displays validation error for empty team name', async () => {
    render(<CreateTeam />);
    const user = userEvent.setup();

    const teamNameInput = screen.getByLabelText(/team name/i);
    await user.click(teamNameInput);
    await user.tab();

    expect(await screen.findByText(/team name is required/i)).toBeInTheDocument();
  });

  it('displays validation error for team name exceeding 50 characters', async () => {
    render(<CreateTeam />);
    const user = userEvent.setup();

    const longName = 'A'.repeat(51);
    const teamNameInput = screen.getByLabelText(/team name/i);

    await user.type(teamNameInput, longName);
    await user.tab();

    expect(
      await screen.findByText(/team name must be less than 50 characters/i),
    ).toBeInTheDocument();
  });

  it('disables submit button until form is modified', async () => {
    render(<CreateTeam />);
    const user = userEvent.setup();

    const submitButton = screen.getByRole('button', { name: /create team/i });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/team name/i), 'Valid Team');
    expect(submitButton).toBeEnabled();
  });

  it('shows loading state during submission', async () => {
    mockTeamService.createTeam.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockTeam), 100)),
    );

    render(<CreateTeam />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/team name/i), 'Test Team');
    await user.click(screen.getByRole('button', { name: /create team/i }));

    expect(screen.getByRole('button', { name: /creating\.\.\./i })).toBeInTheDocument();
  });

  it('displays error message when submission fails', async () => {
    mockTeamService.createTeam.mockRejectedValueOnce(new Error('Network error'));

    render(<CreateTeam />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/team name/i), 'Test Team');
    await user.click(screen.getByRole('button', { name: /create team/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Network error');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

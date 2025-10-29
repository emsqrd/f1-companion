import type { League as LeagueType } from '@/contracts/League';
import { getLeagueById } from '@/services/leagueService';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { League } from './League';

// Mock the Leaderboard component since League is primarily a layout/container component
vi.mock('../Leaderboard/Leaderboard', () => ({
  Leaderboard: () => <div data-testid="leaderboard">Mocked Leaderboard</div>,
}));

// Mock React Router hooks
vi.mock('react-router', () => ({
  useParams: vi.fn(() => ({ leagueId: '1' })),
  Link: vi.fn(({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  )),
}));

// Mock the leagueService to provide mock league data
vi.mock('@/services/leagueService', () => ({
  getLeagueById: vi.fn().mockResolvedValue({
    id: 1,
    name: 'League 1',
    ownerName: 'Test Owner',
  }),
}));

describe('League', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display league information when loaded', async () => {
    render(<League />);

    // User should see they are viewing the league
    expect(await screen.findByRole('heading', { level: 2, name: 'League 1' })).toBeInTheDocument();

    // User should see the main content: the leaderboard
    expect(screen.getByTestId('leaderboard')).toBeInTheDocument();
  });

  it('should have accessible heading structure for screen readers', async () => {
    render(<League />);

    // Screen reader users should be able to navigate by headings
    const heading = await screen.findByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('League 1');
    expect(heading).toBeInTheDocument();
  });

  it('should display loader while fetching league data', async () => {
    // Create a deferred promise to control when the API call resolves
    let resolveLeagueFetch: (value: LeagueType) => void;
    const leagueFetchPromise = new Promise<LeagueType>((resolve) => {
      resolveLeagueFetch = resolve;
    });

    // Mock getLeagueById to return controlled promise
    vi.mocked(getLeagueById).mockReturnValueOnce(leagueFetchPromise);

    render(<League />);

    // Verify loading state is displayed properly
    expect(screen.getByText('Loading League...')).toBeInTheDocument();

    // Verify loading spinner is present
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');

    // Verify main content is not rendered during loading
    expect(screen.queryByTestId('leaderboard')).not.toBeInTheDocument();

    resolveLeagueFetch!({
      id: 1,
      name: 'League 1',
      ownerName: 'Test Owner',
      description: 'Desc for league 1',
      isPrivate: true,
    });

    // Wait for loading to complete and content to render
    await waitFor(() => {
      expect(screen.queryByText('Loading League...')).not.toBeInTheDocument();
    });

    expect(getLeagueById).toHaveBeenCalledWith(1);
  });

  it('should display error when getLeagueById fetch fails', async () => {
    vi.mocked(getLeagueById).mockRejectedValueOnce({ error: 'Failed to load league' });

    render(<League />);

    expect(await screen.findByRole('error')).toBeInTheDocument();

    expect(screen.queryByTestId('leaderboard')).not.toBeInTheDocument();
  });
});

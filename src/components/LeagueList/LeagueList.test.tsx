import type { League } from '@/contracts/League';
import { getLeagues } from '@/services/leagueService';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe } from 'node:test';
import { beforeEach, expect, it, vi } from 'vitest';

import { LeagueList } from './LeagueList';

// Mock React Router hooks
const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  useNavigate: () => mockNavigate,
}));

// Mock leagueService to mock league data
vi.mock('@/services/leagueService', () => ({
  getLeagues: vi.fn(),
}));

const leaguesMock: League[] = [
  {
    id: 1,
    name: 'League 1',
    ownerName: 'Test Owner',
    description: 'Desc for league 1',
    isPrivate: true,
  },
  {
    id: 2,
    name: 'League 2',
    ownerName: 'Test Owner',
    description: 'Desc for league 2',
    isPrivate: true,
  },
];

describe('Leagues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display leagues', async () => {
    vi.mocked(getLeagues).mockResolvedValue(leaguesMock);

    render(<LeagueList />);

    // Wait for loading to complete and content to render
    expect(await screen.findByText('League 1')).toBeInTheDocument();
    expect(await screen.findByText('League 2')).toBeInTheDocument();

    // There should be an accessible heading for the component
    expect(screen.getByRole('heading', { level: 2, name: 'Joined Leagues' }));
  });

  it('should display loader while fetching leagues data', async () => {
    // Create a deferred promise to control when the API call resolves
    let resolveLeaguesFetch: (value: League[]) => void;
    const leaguesFetchPromise = new Promise<League[]>((resolve) => {
      resolveLeaguesFetch = resolve;
    });

    // Mock getLeagues to return controlled promise
    vi.mocked(getLeagues).mockReturnValueOnce(leaguesFetchPromise);

    render(<LeagueList />);

    // Verify loading state is displayed properly
    expect(screen.getByText('Loading Leagues...')).toBeInTheDocument();

    // Verify loading spinner is present
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');

    // Verify main content is not rendered during loading
    expect(screen.queryByText('league-list')).not.toBeInTheDocument();

    resolveLeaguesFetch!(leaguesMock);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading Leagues...')).not.toBeInTheDocument();
    });

    expect(getLeagues).toHaveBeenCalledOnce();
  });

  it('should display error when getLeagues fetch fails', async () => {
    vi.mocked(getLeagues).mockRejectedValueOnce({ error: 'Failed to load leagues' });

    render(<LeagueList />);

    expect(await screen.findByRole('error')).toBeInTheDocument();

    expect(screen.queryByText('league-list')).not.toBeInTheDocument();
  });

  it('should navigate to league component when league is clicked', async () => {
    const user = userEvent.setup();

    render(<LeagueList />);

    const leagueRow = await screen.findByText('League 1');
    await user.click(leagueRow);

    expect(mockNavigate).toHaveBeenCalledWith('/league/1');
  });
});

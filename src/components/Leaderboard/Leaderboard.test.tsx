import type { Team } from '@/contracts/Team';
import { getTeams } from '@/services/teamService';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Leaderboard } from './Leaderboard';

const mockTeams: Team[] = [
  {
    id: 1,
    rank: 1,
    name: 'Team 1',
    owner: 'Owner 1',
    totalPoints: 100,
  },
  {
    id: 2,
    rank: 2,
    name: 'Team 2',
    owner: 'Owner 2',
    totalPoints: 200,
  },
  {
    id: 3,
    rank: 3,
    name: 'Team 3',
    owner: 'Owner 3',
    totalPoints: 300,
  },
];

vi.mock('@/services/teamService', () => ({
  getTeams: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Leaderboard display', () => {
    it('should render correct number of team rows', async () => {
      vi.mocked(getTeams).mockResolvedValue(mockTeams);

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(getTeams).toHaveBeenCalledTimes(1);
      });

      const teamRows = screen.getAllByRole('row').slice(1);
      expect(teamRows).toHaveLength(3);
    });

    it('should display complete leaderboard with all team information', async () => {
      vi.mocked(getTeams).mockResolvedValue(mockTeams);

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(getTeams).toHaveBeenCalledTimes(1);
      });

      // Verify structure
      expect(screen.getByText('League Leaderboard')).toBeInTheDocument();

      // Verify all teams are present with complete information
      mockTeams.forEach((team) => {
        expect(screen.getByText(team.rank)).toBeInTheDocument();
        expect(screen.getByText(team.name)).toBeInTheDocument();
        expect(screen.getByText(team.owner)).toBeInTheDocument();
        expect(screen.getByText(team.totalPoints.toString())).toBeInTheDocument();
      });
    });

    it('should handle empty teams list gracefully', () => {
      vi.mocked(getTeams).mockResolvedValueOnce([]);

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      // User should still see the leaderboard title
      expect(screen.getByText('League Leaderboard')).toBeInTheDocument();

      // User should see table headers but no team data
      expect(screen.getByText('Rank')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();

      // No team names should be visible
      expect(screen.queryByText('Team 1')).not.toBeInTheDocument();
    });

    it('should display teams even when some data is missing', async () => {
      vi.mocked(getTeams).mockResolvedValueOnce([
        { id: 1, rank: 1, name: 'Complete Team', owner: 'Complete Owner', totalPoints: 100 },
        { id: 2, rank: 2, name: '', owner: 'Owner Only', totalPoints: 200 }, // Missing team name
        { id: 3, rank: 3, name: 'Team Only', owner: '', totalPoints: 300 }, // Missing owner
      ]);

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(getTeams).toHaveBeenCalledTimes(1);
      });

      // User should see all teams are listed (even with missing data)
      expect(screen.getByText('Complete Team')).toBeInTheDocument();
      expect(screen.getByText('Complete Owner')).toBeInTheDocument();
      expect(screen.getByText('Owner Only')).toBeInTheDocument();
      expect(screen.getByText('Team Only')).toBeInTheDocument();

      // User should see all ranks
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should handle displaying many teams', async () => {
      const manyTeams = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        rank: i + 1,
        name: `Team ${i + 1}`,
        owner: `Owner ${i + 1}`,
        totalPoints: Number(`${i + 10}`),
      }));

      vi.mocked(getTeams).mockResolvedValueOnce(manyTeams);

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(getTeams).toHaveBeenCalledTimes(1);
      });

      // Test overall structure
      expect(screen.getAllByRole('row')).toHaveLength(21); // 20 teams + 1 header

      // Test unique identifiers (team names)
      expect(screen.getByText('Team 1')).toBeInTheDocument();
      expect(screen.getByText('Team 20')).toBeInTheDocument();
      expect(screen.getByText('Owner 1')).toBeInTheDocument();
      expect(screen.getByText('Owner 20')).toBeInTheDocument();

      // Test that we have correct number of rank cells by checking table structure
      const rows = screen.getAllByRole('row').slice(1); // Remove header
      const firstRow = rows[0];
      const lastRow = rows[19];

      // Each row should have 3 cells
      expect(within(firstRow).getAllByRole('cell')).toHaveLength(3);
      expect(within(lastRow).getAllByRole('cell')).toHaveLength(3);

      // Test rank by position (first cell in row)
      expect(within(firstRow).getAllByRole('cell')[0]).toHaveTextContent('1');
      expect(within(lastRow).getAllByRole('cell')[0]).toHaveTextContent('20');
    });
  });

  describe('Interactions', () => {
    it('should navigate to team component when team row is clicked', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(getTeams).toHaveBeenCalledTimes(1);
      });

      const teamRow = screen.getByText('Team 1').closest('tr');
      await user.click(teamRow!);

      expect(mockNavigate).toHaveBeenCalledWith('/team/1');
    });
  });

  describe('Data Integration', () => {
    it('should load and display team data from service', async () => {
      const getTeamsSpy = vi.mocked(getTeams);

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(getTeams).toHaveBeenCalledTimes(1);
      });

      // User expects data to be loaded when component renders
      expect(getTeamsSpy).toHaveBeenCalledTimes(1);

      // User should see the loaded data
      expect(screen.getByText('Team 1')).toBeInTheDocument();
      expect(screen.getByText('Owner 1')).toBeInTheDocument();
    });
  });
});

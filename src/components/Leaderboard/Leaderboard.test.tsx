import type { Team } from '@/contracts/Team';
import { getTeams } from '@/services/teamService';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Leaderboard } from './Leaderboard';

const mockTeams: Team[] = [
  {
    id: 1,
    rank: 1,
    name: 'Team 1',
    ownerName: 'Owner 1',
    totalPoints: 100,
  },
  {
    id: 2,
    rank: 2,
    name: 'Team 2',
    ownerName: 'Owner 2',
    totalPoints: 200,
  },
  {
    id: 3,
    rank: 3,
    name: 'Team 3',
    ownerName: 'Owner 3',
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

      await screen.findByText('Team 1');

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

      // Verify all teams are present with complete information
      for (const team of mockTeams) {
        expect(await screen.findByText(team.rank)).toBeInTheDocument();
        expect(await screen.findByText(team.name)).toBeInTheDocument();
        expect(await screen.findByText(team.ownerName)).toBeInTheDocument();
        expect(await screen.findByText(team.totalPoints.toString())).toBeInTheDocument();
      }
    });

    it('should handle empty teams list gracefully', async () => {
      vi.mocked(getTeams).mockResolvedValueOnce([]);

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      // User should see table headers but no team data
      expect(await screen.findByText('Rank')).toBeInTheDocument();
      expect(await screen.findByText('Team')).toBeInTheDocument();
      expect(await screen.findByText('Points')).toBeInTheDocument();

      // No team names should be visible
      expect(screen.queryByText('Team 1')).not.toBeInTheDocument();
    });

    it('should display teams even when some data is missing', async () => {
      vi.mocked(getTeams).mockResolvedValueOnce([
        { id: 1, rank: 1, name: 'Complete Team', ownerName: 'Complete Owner', totalPoints: 100 },
        { id: 2, rank: 2, name: '', ownerName: 'Owner Only', totalPoints: 200 }, // Missing team name
        { id: 3, rank: 3, name: 'Team Only', ownerName: '', totalPoints: 300 }, // Missing owner
      ]);

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      // User should see all teams are listed (even with missing data)
      expect(await screen.findByText('Complete Team')).toBeInTheDocument();
      expect(await screen.findByText('Complete Owner')).toBeInTheDocument();
      expect(await screen.findByText('Owner Only')).toBeInTheDocument();
      expect(await screen.findByText('Team Only')).toBeInTheDocument();

      // User should see all ranks
      expect(await screen.findByText('1')).toBeInTheDocument();
      expect(await screen.findByText('2')).toBeInTheDocument();
      expect(await screen.findByText('3')).toBeInTheDocument();
    });

    it('should handle displaying many teams', async () => {
      const manyTeams = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        rank: i + 1,
        name: `Team ${i + 1}`,
        ownerName: `Owner ${i + 1}`,
        totalPoints: Number(`${i + 10}`),
      }));

      vi.mocked(getTeams).mockResolvedValueOnce(manyTeams);

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      // Wait for the data to actually load first
      expect(await screen.findByText('Team 1')).toBeInTheDocument();

      // Test overall structure
      expect(screen.getAllByRole('row')).toHaveLength(21); // 20 teams + 1 header

      // Test unique identifiers (team names)
      expect(await screen.findByText('Team 1')).toBeInTheDocument();
      expect(await screen.findByText('Team 20')).toBeInTheDocument();
      expect(await screen.findByText('Owner 1')).toBeInTheDocument();
      expect(await screen.findByText('Owner 20')).toBeInTheDocument();

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
});

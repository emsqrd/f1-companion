import type { Team } from '@/contracts/Team';
import { getTeams } from '@/services/teamService';
import { createMockTeam } from '@/test-utils';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Leaderboard } from './Leaderboard';

const mockTeams: Team[] = [
  createMockTeam({ id: 1, name: 'Team 1', ownerName: 'Owner 1' }),
  createMockTeam({ id: 2, name: 'Team 2', ownerName: 'Owner 2' }),
  createMockTeam({ id: 3, name: 'Team 3', ownerName: 'Owner 3' }),
];

vi.mock('@/services/teamService', () => ({
  getTeams: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Leaderboard display', () => {
    it('should render correct number of team rows', async () => {
      vi.mocked(getTeams).mockResolvedValue(mockTeams);

      render(<Leaderboard />);

      await screen.findByText('Team 1');

      const teamRows = screen.getAllByRole('row').slice(1);
      expect(teamRows).toHaveLength(3);
    });

    it('should display complete leaderboard with all team information', async () => {
      vi.mocked(getTeams).mockResolvedValue(mockTeams);

      render(<Leaderboard />);

      // Verify all teams are present with complete information
      for (const team of mockTeams) {
        expect(await screen.findByText(team.name)).toBeInTheDocument();
        expect(await screen.findByText(team.ownerName)).toBeInTheDocument();
      }
    });

    it('should handle empty teams list gracefully', async () => {
      vi.mocked(getTeams).mockResolvedValueOnce([]);

      render(<Leaderboard />);

      // User should see table headers but no team data
      expect(await screen.findByText('Rank')).toBeInTheDocument();
      expect(await screen.findByText('Team')).toBeInTheDocument();

      // No team names should be visible
      expect(screen.queryByText('Team 1')).not.toBeInTheDocument();
    });

    it('should display teams even when some data is missing', async () => {
      vi.mocked(getTeams).mockResolvedValueOnce([
        createMockTeam({ id: 1, name: 'Complete Team', ownerName: 'Complete Owner' }),
        createMockTeam({ id: 2, name: '', ownerName: 'Owner Only' }), // Missing team name
        createMockTeam({ id: 3, name: 'Team Only', ownerName: '' }), // Missing owner
      ]);

      render(<Leaderboard />);

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
      const manyTeams = Array.from({ length: 20 }, (_, i) =>
        createMockTeam({
          id: i + 1,
          name: `Team ${i + 1}`,
          ownerName: `Owner ${i + 1}`,
        }),
      );

      vi.mocked(getTeams).mockResolvedValueOnce(manyTeams);

      render(<Leaderboard />);

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

      // Each row should have 2 cells
      expect(within(firstRow).getAllByRole('cell')).toHaveLength(2);
      expect(within(lastRow).getAllByRole('cell')).toHaveLength(2);

      // Test rank by position (first cell in row)
      expect(within(firstRow).getAllByRole('cell')[0]).toHaveTextContent('1');
      expect(within(lastRow).getAllByRole('cell')[0]).toHaveTextContent('20');
    });
  });
});

import { getTeams } from '@/services/teamService';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Leaderboard } from './Leaderboard';

vi.mock('@/services/teamService', () => ({
  getTeams: vi.fn(() => [
    {
      id: 1,
      name: 'Team 1',
      owner: 'Owner 1',
    },
    {
      id: 2,
      name: 'Team 2',
      owner: 'Owner 2',
    },
    {
      id: 3,
      name: 'Team 3',
      owner: 'Owner 3',
    },
  ]),
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
    it('should render correct number of team rows', () => {
      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      const teamRows = screen.getAllByRole('row').slice(1);
      expect(teamRows).toHaveLength(3);
    });

    it('should display complete leaderboard with all team information', () => {
      // Mock Math.random to return predictable values
      const mockMath = Object.create(global.Math);
      mockMath.random = vi
        .fn()
        .mockReturnValueOnce(0.1) // 800 points (0.1 * 8000)
        .mockReturnValueOnce(0.5) // 4000 points (0.5 * 8000)
        .mockReturnValueOnce(0.9); // 7200 points (0.9 * 8000)
      global.Math = mockMath;

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      // Verify structure
      expect(screen.getByText('League Leaderboard')).toBeInTheDocument();

      // Verify all teams are present with complete information
      ['Team 1', 'Team 2', 'Team 3'].forEach((team, index) => {
        expect(screen.getByText(`${index + 1}`)).toBeInTheDocument(); // rank
        expect(screen.getByText(team)).toBeInTheDocument();
        expect(screen.getByText(`Owner ${index + 1}`)).toBeInTheDocument();
      });

      // Verify points match mocked values
      expect(screen.getByText('800')).toBeInTheDocument();
      expect(screen.getByText('4,000')).toBeInTheDocument();
      expect(screen.getByText('7,200')).toBeInTheDocument();
    });

    it('should handle empty teams list gracefully', () => {
      vi.mocked(getTeams).mockReturnValueOnce([]);

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

    it('should display teams even when some data is missing', () => {
      vi.mocked(getTeams).mockReturnValueOnce([
        { id: 1, name: 'Complete Team', owner: 'Complete Owner' },
        { id: 2, name: '', owner: 'Owner Only' }, // Missing team name
        { id: 3, name: 'Team Only', owner: '' }, // Missing owner
      ]);

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

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

    it('should handle displaying many teams', () => {
      const manyTeams = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Team ${i + 1}`,
        owner: `Owner ${i + 1}`,
      }));

      vi.mocked(getTeams).mockReturnValueOnce(manyTeams);

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      // User should see first and last teams
      expect(screen.getByText('Team 1')).toBeInTheDocument();
      expect(screen.getByText('Team 20')).toBeInTheDocument();

      // User should see correct ranking for first and last
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
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

      const teamRow = screen.getByText('Team 1').closest('tr');
      await user.click(teamRow!);

      expect(mockNavigate).toHaveBeenCalledWith('/team/1');
    });
  });

  describe('Data Integration', () => {
    it('should load and display team data from service', () => {
      const getTeamsSpy = vi.mocked(getTeams);

      render(
        <MemoryRouter>
          <Leaderboard />
        </MemoryRouter>,
      );

      // User expects data to be loaded when component renders
      expect(getTeamsSpy).toHaveBeenCalledTimes(1);

      // User should see the loaded data
      expect(screen.getByText('Team 1')).toBeInTheDocument();
      expect(screen.getByText('Owner 1')).toBeInTheDocument();
    });
  });
});

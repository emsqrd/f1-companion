import type { Team } from '@/contracts/Team';
import { describe, expect, it } from 'vitest';

import { getTeamById, getTeams, teams } from './teamService';

describe('teamService', () => {
  describe('getTeams', () => {
    it('should return all teams', () => {
      const result = getTeams();

      expect(result).toEqual(teams);
      expect(result).toHaveLength(11);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return the same array reference for performance', () => {
      const result1 = getTeams();
      const result2 = getTeams();

      expect(result1).toEqual(result2);
      expect(result1).toBe(result2); // Same array reference for performance
    });

    it('should return teams with correct structure', () => {
      const result = getTeams();

      result.forEach((team: Team) => {
        expect(team).toMatchObject({
          id: expect.any(Number),
          name: expect.any(String),
          owner: expect.any(String),
        });
      });
    });
  });

  describe('getTeamById', () => {
    it('should return the correct team when given a valid ID', () => {
      const team = getTeamById(1);

      expect(team).toBeDefined();
      expect(team).toEqual({
        id: 1,
        name: 'Team Redline Owner',
        owner: 'John',
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly when used together', () => {
      const allTeams = getTeams();

      allTeams.forEach((team) => {
        const foundTeam = getTeamById(team.id);
        expect(foundTeam).toEqual(team);
      });
    });
  });
});

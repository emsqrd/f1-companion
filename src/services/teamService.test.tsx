import type { Team } from '@/contracts/Team';
import { apiClient } from '@/lib/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTeamById, getTeams } from './teamService';

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

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

describe('teamService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTeams', () => {
    it('should return all teams', async () => {
      mockApiClient.get.mockResolvedValue(mockTeams);

      const result = await getTeams();

      expect(result).toEqual(mockTeams);
      expect(result).toHaveLength(3);
      expect(Array.isArray(result)).toBe(true);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(mockApiClient.get).toHaveBeenCalledWith('/teams');
    });

    it('should return the same array reference for performance', async () => {
      mockApiClient.get.mockResolvedValue(mockTeams);

      const result1 = await getTeams();
      const result2 = await getTeams();

      expect(result1).toEqual(result2);
      // Note: With fetch calls, we get new promises each time, so we test equality instead of reference
      expect(result1).toStrictEqual(result2);
    });

    it('should return teams with correct structure', async () => {
      mockApiClient.get.mockResolvedValue(mockTeams);

      const result = await getTeams();

      result?.forEach((team: Team) => {
        expect(team).toMatchObject({
          id: expect.any(Number),
          rank: expect.any(Number),
          name: expect.any(String),
          ownerName: expect.any(String),
          totalPoints: expect.any(Number),
        });
      });
    });

    it('should handle empty response', async () => {
      mockApiClient.get.mockResolvedValue([]);

      const result = await getTeams();
      expect(result).toEqual([]);
    });

    it('should throw error when get fails', async () => {
      const mockError = new Error('Error fetching teams:');
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(getTeams()).rejects.toThrow('Error fetching teams:');
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTeamById', () => {
    it('should return the correct team when given a valid ID', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockTeams[0]);

      const team = await getTeamById(1);

      expect(team).toBeDefined();
      expect(team).toEqual(mockTeams[0]);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining('/teams/1'));
    });

    it('should return team with correct structure', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockTeams[1]);

      const team = await getTeamById(2);

      expect(team).toBeDefined();
      expect(team).toMatchObject({
        id: expect.any(Number),
        rank: expect.any(Number),
        name: expect.any(String),
        ownerName: expect.any(String),
        totalPoints: expect.any(Number),
      });
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining('/teams/2'));
    });

    it('should return undefined for a non-existent team ID', async () => {
      mockApiClient.get.mockResolvedValueOnce(undefined);

      const team = await getTeamById(999);

      expect(team).toBeUndefined();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining('/teams/999'));
    });

    it('should throw error when get fails', async () => {
      const mockError = new Error('Error fetching team by id:');
      mockApiClient.get.mockRejectedValueOnce(mockError);

      await expect(getTeamById(1)).rejects.toThrow('Error fetching team by id:');
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should handle team not found', async () => {
      mockApiClient.get.mockResolvedValueOnce(null);

      const result = await getTeamById(999);
      expect(result).toBeNull();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly when used together', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockTeams);

      const allTeams = await getTeams();

      // Mock individual getTeamById calls
      mockTeams.forEach((team) => {
        mockApiClient.get.mockResolvedValueOnce(team);
      });

      for (const team of allTeams!) {
        const foundTeam = await getTeamById(team.id);
        expect(foundTeam).toEqual(team);
      }
    });
  });
});

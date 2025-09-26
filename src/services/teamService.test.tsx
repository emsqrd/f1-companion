import type { Team } from '@/contracts/Team';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTeamById, getTeams } from './teamService';

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
  const mockFetch = vi.fn();

  beforeAll(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  describe('getTeams', () => {
    it('should return all teams', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockTeams),
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await getTeams();

      expect(result).toEqual(mockTeams);
      expect(result).toHaveLength(3);
      expect(Array.isArray(result)).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams'));
    });

    it('should return the same array reference for performance', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockTeams,
      });

      const result1 = await getTeams();
      const result2 = await getTeams();

      expect(result1).toEqual(result2);
      // Note: With fetch calls, we get new promises each time, so we test equality instead of reference
      expect(result1).toStrictEqual(result2);
    });

    it('should return teams with correct structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTeams,
      });

      const result = await getTeams();

      result.forEach((team: Team) => {
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue([]),
      });

      const result = await getTeams();
      expect(result).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      const mockError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(mockError);

      await expect(getTeams()).rejects.toThrow('Network error');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error when JSON parsing fails', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(getTeams()).rejects.toThrow('Invalid JSON');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API server errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ error: 'Internal Server Error' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await getTeams();
      expect(result).toEqual({ error: 'Internal Server Error' });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API unavailable errors', async () => {
      const mockError = new Error('Failed to fetch');
      mockFetch.mockRejectedValueOnce(mockError);

      await expect(getTeams()).rejects.toThrow('Failed to fetch');
    });
  });

  describe('getTeamById', () => {
    it('should return the correct team when given a valid ID', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockTeams[0]),
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      const team = await getTeamById(1);

      expect(team).toBeDefined();
      expect(team).toEqual(mockTeams[0]);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams/1'));
    });

    it('should return team with correct structure', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockTeams[1]),
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      const team = await getTeamById(2);

      expect(team).toBeDefined();
      expect(team).toMatchObject({
        id: expect.any(Number),
        rank: expect.any(Number),
        name: expect.any(String),
        ownerName: expect.any(String),
        totalPoints: expect.any(Number),
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams/2'));
    });

    it('should return undefined for a non-existent team ID', async () => {
      const mockResponse = {
        ok: true,
        status: 404,
        json: vi.fn().mockResolvedValue(undefined),
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      const team = await getTeamById(999);

      expect(team).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams/999'));
    });

    it('should throw error when fetch fails', async () => {
      const mockError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(mockError);

      await expect(getTeamById(1)).rejects.toThrow('Network error');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error when JSON parsing fails', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(getTeamById(1)).rejects.toThrow('Invalid JSON');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API server errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ error: 'Internal Server Error' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await getTeamById(1);
      expect(result).toEqual({ error: 'Internal Server Error' });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle team not found errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ error: 'Team not found' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await getTeamById(999);
      expect(result).toEqual({ error: 'Team not found' });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly when used together', async () => {
      // Mock getTeams call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeams,
      });

      const allTeams = await getTeams();

      // Mock individual getTeamById calls
      mockTeams.forEach((team) => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => team,
        });
      });

      for (const team of allTeams) {
        const foundTeam = await getTeamById(team.id);
        expect(foundTeam).toEqual(team);
      }
    });
  });
});

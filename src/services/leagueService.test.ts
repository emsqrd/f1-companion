import type { CreateLeagueRequest } from '@/contracts/CreateLeagueRequest';
import type { League } from '@/contracts/League';
import { apiClient } from '@/lib/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createLeague, getLeagueById, getLeagues } from './leagueService';

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('leagueService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createLeague', () => {
    it('should call apiClient.post with correct endpoint and data', async () => {
      const mockLeagueRequest: CreateLeagueRequest = {
        name: 'Test League',
        description: 'A test league for testing',
        isPrivate: false,
      };
      const mockLeagueResponse: League = {
        id: 1,
        name: 'Test League',
        description: 'A test league for testing',
        ownerName: 'John Doe',
        isPrivate: false,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockLeagueResponse);

      const result = await createLeague(mockLeagueRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/leagues', mockLeagueRequest);
      expect(result).toEqual(mockLeagueResponse);
    });

    it('should handle API errors during league creation', async () => {
      const mockLeagueRequest: CreateLeagueRequest = {
        name: 'Test League',
        description: 'Another test league',
        isPrivate: true,
      };
      const mockError = new Error('Network error');

      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(createLeague(mockLeagueRequest)).rejects.toThrow('Network error');
      expect(apiClient.post).toHaveBeenCalledWith('/leagues', mockLeagueRequest);
    });
  });

  describe('getLeagues', () => {
    it('should call apiClient.get with correct endpoint', async () => {
      const mockLeagues: League[] = [
        {
          id: 1,
          name: 'League 1',
          description: 'First league',
          ownerName: 'Alice',
          isPrivate: false,
        },
        {
          id: 2,
          name: 'League 2',
          description: 'Second league',
          ownerName: 'Bob',
          isPrivate: true,
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue(mockLeagues);

      const result = await getLeagues();

      expect(apiClient.get).toHaveBeenCalledWith('/leagues');
      expect(result).toEqual(mockLeagues);
    });

    it('should return empty array when no leagues exist', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([]);

      const result = await getLeagues();

      expect(result).toEqual([]);
      expect(apiClient.get).toHaveBeenCalledWith('/leagues');
    });

    it('should handle API errors during league retrieval', async () => {
      const mockError = new Error('Server error');

      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(getLeagues()).rejects.toThrow('Server error');
      expect(apiClient.get).toHaveBeenCalledWith('/leagues');
    });
  });

  describe('getLeagueById', () => {
    it('should call apiClient.get with correct endpoint and id', async () => {
      const mockLeague: League = {
        id: 42,
        name: 'Specific League',
        description: 'A specific league',
        ownerName: 'Charlie',
        isPrivate: false,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockLeague);

      const result = await getLeagueById(42);

      expect(apiClient.get).toHaveBeenCalledWith('/leagues/42');
      expect(result).toEqual(mockLeague);
    });

    it('should return null when league is not found', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(null);

      const result = await getLeagueById(999);

      expect(result).toBeNull();
      expect(apiClient.get).toHaveBeenCalledWith('/leagues/999');
    });

    it('should handle API errors during single league retrieval', async () => {
      const mockError = new Error('Not found');

      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(getLeagueById(1)).rejects.toThrow('Not found');
      expect(apiClient.get).toHaveBeenCalledWith('/leagues/1');
    });
  });
});

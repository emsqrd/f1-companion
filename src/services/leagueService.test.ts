import type { CreateLeagueRequest } from '@/contracts/CreateLeagueRequest';
import type { League } from '@/contracts/League';
import { apiClient } from '@/lib/api';
import * as Sentry from '@sentry/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createLeague, getLeagueById, getLeagues, getMyLeagues } from './leagueService';

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@sentry/react', () => ({
  logger: {
    info: vi.fn(),
    fmt: (strings: TemplateStringsArray, ...values: unknown[]) =>
      strings.reduce((acc, str, i) => acc + str + (values[i] || ''), ''),
  },
}));

const mockApiClient = vi.mocked(apiClient);
const mockSentryLogger = vi.mocked(Sentry.logger);

describe('leagueService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createLeague', () => {
    it('calls apiClient.post with correct endpoint and data', async () => {
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

      mockApiClient.post.mockResolvedValue(mockLeagueResponse);

      const result = await createLeague(mockLeagueRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/leagues', mockLeagueRequest);
      expect(result).toEqual(mockLeagueResponse);
    });

    it('logs league creation event with correct context', async () => {
      const mockLeagueRequest: CreateLeagueRequest = {
        name: 'Champions League',
        description: 'Elite racing league',
        isPrivate: true,
      };
      const mockLeagueResponse: League = {
        id: 42,
        name: 'Champions League',
        description: 'Elite racing league',
        ownerName: 'Race Master',
        isPrivate: true,
      };

      mockApiClient.post.mockResolvedValue(mockLeagueResponse);

      await createLeague(mockLeagueRequest);

      expect(mockSentryLogger.info).toHaveBeenCalledWith('League created', {
        leagueId: 42,
        leagueName: 'Champions League',
        isPrivate: true,
      });
    });

    it('propagates API errors during league creation', async () => {
      const mockLeagueRequest: CreateLeagueRequest = {
        name: 'Test League',
        description: 'Another test league',
        isPrivate: true,
      };
      const mockError = new Error('Network error');

      mockApiClient.post.mockRejectedValue(mockError);

      await expect(createLeague(mockLeagueRequest)).rejects.toThrow('Network error');
      expect(mockApiClient.post).toHaveBeenCalledWith('/leagues', mockLeagueRequest);
    });
  });

  describe('getLeagues', () => {
    it('calls apiClient.get with correct endpoint', async () => {
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

      mockApiClient.get.mockResolvedValue(mockLeagues);

      const result = await getLeagues();

      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues');
      expect(result).toEqual(mockLeagues);
    });

    it('returns empty array when no leagues exist', async () => {
      mockApiClient.get.mockResolvedValue([]);

      const result = await getLeagues();

      expect(result).toEqual([]);
      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues');
    });

    it('propagates API errors during league retrieval', async () => {
      const mockError = new Error('Server error');

      mockApiClient.get.mockRejectedValue(mockError);

      await expect(getLeagues()).rejects.toThrow('Server error');
      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues');
    });
  });

  describe('getMyLeagues', () => {
    it('calls apiClient.get with correct endpoint', async () => {
      const mockLeagues: League[] = [
        {
          id: 1,
          name: 'My League',
          description: 'My personal league',
          ownerName: 'Current User',
          isPrivate: false,
        },
      ];

      mockApiClient.get.mockResolvedValue(mockLeagues);

      const result = await getMyLeagues();

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/leagues');
      expect(result).toEqual(mockLeagues);
    });

    it('returns empty array when user has no leagues', async () => {
      mockApiClient.get.mockResolvedValue([]);

      const result = await getMyLeagues();

      expect(result).toEqual([]);
      expect(mockApiClient.get).toHaveBeenCalledWith('/me/leagues');
    });

    it('propagates API errors during user leagues retrieval', async () => {
      const mockError = new Error('Unauthorized');

      mockApiClient.get.mockRejectedValue(mockError);

      await expect(getMyLeagues()).rejects.toThrow('Unauthorized');
      expect(mockApiClient.get).toHaveBeenCalledWith('/me/leagues');
    });
  });

  describe('getLeagueById', () => {
    it('calls apiClient.get with correct endpoint and id', async () => {
      const mockLeague: League = {
        id: 42,
        name: 'Specific League',
        description: 'A specific league',
        ownerName: 'Charlie',
        isPrivate: false,
      };

      mockApiClient.get.mockResolvedValue(mockLeague);

      const result = await getLeagueById(42);

      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues/42');
      expect(result).toEqual(mockLeague);
    });

    it('returns null when league is not found (404 error)', async () => {
      const notFoundError = Object.assign(new Error('Not found'), {
        status: 404,
      });

      mockApiClient.get.mockRejectedValue(notFoundError);

      const result = await getLeagueById(999);

      expect(result).toBeNull();
      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues/999');
    });

    it('propagates non-404 errors during league retrieval', async () => {
      const serverError = Object.assign(new Error('Server error'), {
        status: 500,
      });

      mockApiClient.get.mockRejectedValue(serverError);

      await expect(getLeagueById(1)).rejects.toMatchObject({
        message: 'Server error',
        status: 500,
      });
      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues/1');
    });
  });
});

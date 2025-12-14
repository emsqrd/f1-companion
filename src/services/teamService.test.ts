import type { CreateTeamRequest } from '@/contracts/CreateTeamRequest';
import type { Team } from '@/contracts/Team';
import { apiClient } from '@/lib/api';
import { createMockTeam } from '@/test-utils';
import type { ApiError } from '@/utils/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTeam, getMyTeam, getTeamById, getTeams } from './teamService';

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('teamService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTeam', () => {
    it('calls apiClient.post with correct endpoint and data', async () => {
      const mockRequest: CreateTeamRequest = {
        name: 'Racing Legends',
      };

      const mockResponse: Team = createMockTeam({
        id: 1,
        name: 'Racing Legends',
        ownerName: 'John Doe',
      });

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await createTeam(mockRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/teams', mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('propagates API errors during team creation', async () => {
      const mockRequest: CreateTeamRequest = {
        name: 'Test Team',
      };

      const mockError = new Error('Network failure');

      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(createTeam(mockRequest)).rejects.toThrow('Network failure');
    });
  });

  describe('getMyTeam', () => {
    it('calls apiClient.get with correct endpoint', async () => {
      const mockTeam: Team = createMockTeam({
        id: 1,
        name: 'My Racing Team',
        ownerName: 'Current User',
      });

      vi.mocked(apiClient.get).mockResolvedValue(mockTeam);

      const result = await getMyTeam();

      expect(apiClient.get).toHaveBeenCalledWith('/me/team');
      expect(result).toEqual(mockTeam);
    });

    it('returns null when user has no team (404 response)', async () => {
      const notFoundError: ApiError = Object.assign(new Error('Not found'), {
        status: 404,
      });

      vi.mocked(apiClient.get).mockRejectedValue(notFoundError);

      const result = await getMyTeam();

      expect(result).toBeNull();
    });

    it('propagates non-404 errors', async () => {
      const serverError: ApiError = Object.assign(new Error('Server error'), {
        status: 500,
      });

      vi.mocked(apiClient.get).mockRejectedValue(serverError);

      await expect(getMyTeam()).rejects.toMatchObject({
        message: 'Server error',
        status: 500,
      });
    });
  });

  describe('getTeams', () => {
    it('calls apiClient.get with correct endpoint', async () => {
      const mockTeams: Team[] = [
        createMockTeam({ id: 1, name: 'Team Alpha', ownerName: 'Alice' }),
        createMockTeam({ id: 2, name: 'Team Beta', ownerName: 'Bob' }),
        createMockTeam({ id: 3, name: 'Team Gamma', ownerName: 'Charlie' }),
      ];

      vi.mocked(apiClient.get).mockResolvedValue(mockTeams);

      const result = await getTeams();

      expect(apiClient.get).toHaveBeenCalledWith('/teams');
      expect(result).toEqual(mockTeams);
    });

    it('returns empty array when no teams exist', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([]);

      const result = await getTeams();

      expect(result).toEqual([]);
      expect(apiClient.get).toHaveBeenCalledWith('/teams');
    });

    it('propagates API errors during team retrieval', async () => {
      const mockError = new Error('Failed to fetch teams');

      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(getTeams()).rejects.toThrow('Failed to fetch teams');
      expect(apiClient.get).toHaveBeenCalledWith('/teams');
    });
  });

  describe('getTeamById', () => {
    it('calls apiClient.get with correct endpoint and team id', async () => {
      const mockTeam: Team = createMockTeam({
        id: 99,
        name: 'Specific Team',
        ownerName: 'David',
      });

      vi.mocked(apiClient.get).mockResolvedValue(mockTeam);

      const result = await getTeamById(99);

      expect(apiClient.get).toHaveBeenCalledWith('/teams/99');
      expect(result).toEqual(mockTeam);
    });
  });
});

import type { CreateTeamRequest } from '@/contracts/CreateTeamRequest';
import type { Team } from '@/contracts/Team';
import { apiClient } from '@/lib/api';
import { isApiError } from '@/utils/errors';
import * as Sentry from '@sentry/react';

export async function createTeam(data: CreateTeamRequest): Promise<Team> {
  const team = await apiClient.post<Team, CreateTeamRequest>('/teams', data);

  // INFO - significant business event
  Sentry.logger.info('Team created', {
    teamId: team.id,
    teamName: team.name,
  });

  return team;
}

export async function getMyTeam(): Promise<Team | null> {
  try {
    return await apiClient.get<Team>('/me/team');
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getTeams(): Promise<Team[]> {
  return await apiClient.get('/teams');
}

export async function getTeamById(id: number): Promise<Team | null> {
  try {
    return await apiClient.get<Team>(`/teams/${id}`);
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      return null;
    }

    throw error;
  }
}

import type { CreateLeagueRequest } from '@/contracts/CreateLeagueRequest';
import type { League } from '@/contracts/League';
import { apiClient } from '@/lib/api';
import * as Sentry from '@sentry/react';

export async function createLeague(data: CreateLeagueRequest): Promise<League> {
  const league = await apiClient.post<League, CreateLeagueRequest>('/leagues', data);

  // INFO - significant business event
  Sentry.logger.info('League created', {
    leagueId: league.id,
    leagueName: league.name,
    isPrivate: league.isPrivate,
  });

  return league;
}

export async function getLeagues(): Promise<League[]> {
  return apiClient.get<League[]>('/leagues');
}

export async function getMyLeagues(): Promise<League[]> {
  return apiClient.get<League[]>('/me/leagues');
}

export async function getLeagueById(id: number): Promise<League | null> {
  try {
    return await apiClient.get<League>(`/leagues/${id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null;
    }
    throw error;
  }
}

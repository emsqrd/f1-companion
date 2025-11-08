import type { CreateLeagueRequest } from '@/contracts/CreateLeagueRequest';
import type { League } from '@/contracts/League';
import { apiClient } from '@/lib/api';

export async function createLeague(league: CreateLeagueRequest): Promise<League> {
  return apiClient.post('/leagues', league);
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

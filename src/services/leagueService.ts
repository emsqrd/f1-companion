import type { CreateLeagueRequest } from '@/contracts/CreateLeagueRequest';
import type { League } from '@/contracts/League';
import { apiClient } from '@/lib/api';

export async function createLeague(league: CreateLeagueRequest): Promise<League> {
  return apiClient.post('/leagues', league);
}

export async function getLeagues(): Promise<League[] | null> {
  return apiClient.get('/leagues');
}

export async function getLeagueById(id: number): Promise<League | null> {
  return apiClient.get(`/leagues/${id}`);
}

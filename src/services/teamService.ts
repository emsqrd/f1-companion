import type { Team } from '@/contracts/Team';
import { apiClient } from '@/lib/api';

export async function getTeams(): Promise<Team[]> {
  return await apiClient.get('/teams');
}

export async function getTeamById(id: number): Promise<Team | null> {
  return await apiClient.get(`/teams/${id}`);
}

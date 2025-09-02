import type { Team } from '@/contracts/Team';

const API_BASE_URL = import.meta.env.VITE_F1_FANTASY_API;

export async function getTeams(): Promise<Team[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/teams`);

    return await response.json();
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
}

export async function getTeamById(id: number): Promise<Team | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`);

    return await response.json();
  } catch (error) {
    console.error('Error fetching team by id:', error);
    throw error;
  }
}

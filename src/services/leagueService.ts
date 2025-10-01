import type { League } from '@/contracts/League';
import { apiClient } from '@/lib/api';

export async function getLeagues(): Promise<League[] | null> {
  return apiClient.get('/leagues');
}

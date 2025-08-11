import type { Team } from '@/contracts/Team';

export function getTeams(): Team[] {
  const teams: Team[] = [
    {
      id: 1,
      name: 'Sainz of Trouble',
    },
    {
      id: 2,
      name: 'Chili Carbono',
    },
    {
      id: 3,
      name: 'Team 3',
    },
  ];

  return teams;
}

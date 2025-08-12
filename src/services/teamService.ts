import type { Team } from '@/contracts/Team';

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

export function getTeams(): Team[] {
  return teams;
}

export function getTeamById(id: number): Team | undefined {
  return teams.find((team) => team.id === id);
}

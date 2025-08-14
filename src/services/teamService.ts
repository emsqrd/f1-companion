import type { Team } from '@/contracts/Team';

export const teams: Team[] = [
  { id: 1, name: 'Team Redline Owner', owner: 'John' },
  { id: 2, name: 'Luigi Ferrari', owner: 'Katharine' },
  { id: 3, name: 'Chili Carbono', owner: 'Heidi' },
  { id: 4, name: 'DayAfter Ricciardo', owner: 'Jessica' },
  { id: 5, name: 'New Sainz of Hope', owner: 'Mark' },
  { id: 6, name: 'Vroom vroom', owner: 'Kyle' },
  { id: 7, name: 'Mindys team', owner: 'Mindy' },
  { id: 8, name: 'Il Vecchio Drogo', owner: 'Austin' },
  { id: 9, name: 'Wayne Dennison', owner: 'Wayne' },
  { id: 10, name: 'VerStopHim', owner: 'Jeremy' },
  { id: 11, name: 'I Saw The Sainz', owner: 'Ryan' },
];

export function getTeams(): Team[] {
  return teams;
}

export function getTeamById(id: number): Team | undefined {
  return teams.find((team) => team.id === id);
}

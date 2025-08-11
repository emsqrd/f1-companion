import { getTeams } from '@/services/teamService';

export function League() {
  const teams = getTeams();
  return (
    <div>
      <ul>
        {teams.map((team) => (
          <li key={team.id} className="flex items-start">
            {team.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

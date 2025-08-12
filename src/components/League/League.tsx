import { getTeams } from '@/services/teamService';
import { Link } from 'react-router';

export function League() {
  const teams = getTeams();
  return (
    <div>
      <ul>
        {teams.map((team) => (
          <li key={team.id} className="flex items-start">
            <Link
              to={`/team/${team.id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {team.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

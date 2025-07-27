import { useMemo, useState } from 'react';

import './App.css';
import RoleCard from './components/RoleCard/RoleCard';
import RoleGrid from './components/RoleGrid/RoleGrid';

function App() {
  const [drivers, setDrivers] = useState<string[]>(['Lando Norris', '', '', 'Lewis Hamilton']);
  const [teams, setTeams] = useState<string[]>(['Mercedes', '', 'Red Bull Racing', 'Ferrari']);

  const handleAddDriver = (index: number) => {
    const name = prompt('Enter driver name:');
    if (name && name.trim()) {
      setDrivers((prev) => {
        const updated = [...prev];
        updated[index] = name.trim();
        return updated;
      });
    }
  };

  const handleAddTeam = (index: number) => {
    const name = prompt('Enter team name:');
    if (name && name.trim()) {
      setTeams((prev) => {
        const updated = [...prev];
        updated[index] = name.trim();
        return updated;
      });
    }
  };

  const handleDriverAddCallbacks = useMemo(
    () => drivers.map((_, idx) => () => handleAddDriver(idx)),
    [drivers],
  );

  const handleTeamAddCallbacks = useMemo(
    () => teams.map((_, idx) => () => handleAddTeam(idx)),
    [teams],
  );

  const driverCards = drivers.map((driver, idx) => (
    <RoleCard key={idx} role="Driver" name={driver} onAddRole={handleDriverAddCallbacks[idx]} />
  ));

  const teamCards = teams.map((team, idx) => (
    <RoleCard key={idx} role="Team" name={team} onAddRole={handleTeamAddCallbacks[idx]} />
  ));

  return (
    <>
      <div className="space-y-12">
        <RoleGrid cards={driverCards} />
        <RoleGrid cards={teamCards} />
      </div>
    </>
  );
}

export default App;

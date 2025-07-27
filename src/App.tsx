import { useState } from 'react';

import './App.css';
import RoleCard from './components/RoleCard/RoleCard';

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

  const driverCards = drivers.map((driver, idx) => (
    <RoleCard role="Driver" name={driver} index={idx} onAddRole={() => handleAddDriver(idx)} />
  ));

  const teamCards = teams.map((team, idx) => (
    <RoleCard role="Team" name={team} index={idx} onAddRole={() => handleAddTeam(idx)} />
  ));

  return (
    <>
      <div className="space-y-12">
        <div className="grid grid-cols-2 gap-4 justify-center">{driverCards}</div>
        <div className="grid grid-cols-2 gap-4 justify-center">{teamCards}</div>
      </div>
    </>
  );
}

export default App;

import { useState } from 'react';

import './App.css';
import RoleCard from './components/RoleCard/RoleCard';
import RoleGrid from './components/RoleGrid/RoleGrid';

// const drivers = ['Lando Norris', '', '', 'Lewis Hamilton'];
// const teams = ['Mercedes', '', 'Red Bull Racing', 'Ferrari'];

function App() {
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>(['', '', '', '']);
  const [driverPool, setDriverPool] = useState<string[]>([
    'Oscar Piastri',
    'Lando Norris',
    'Charles Leclerc',
    'Lewis Hamilton',
    'George Russell',
    'Kimi Antonelli',
    'Max Verstappen',
    'Yuki Tsunoda',
    'Alexander Albon',
    'Carlos Sainz',
    'Nico Hülkenberg',
    'Gabriel Bortoleto',
    'Liam Lawson',
    'Isack Hadjar',
    'Fernando Alonso',
    'Lance Stroll',
    'Pierre Gasly',
    'Franco Colapinto',
    'Esteban Ocon',
    'Oliver Bearman',
  ]);

  const [selectedConstructors, setSelectedConstructors] = useState<string[]>(['', '', '', '']);

  const [constructorPool, setConstructorPool] = useState<string[]>([
    'McLaren',
    'Ferrari',
    'Mercedes',
    'Red Bull Racing',
    'Williams',
    'Kick Sauber',
    'Racing Bulls',
    'Aston Martin',
    'Haas',
    'Alpine',
  ]);

  const driverCards = selectedDrivers.map((driver, idx) => (
    <RoleCard
      key={idx}
      role="Driver"
      name={driver}
      pool={driverPool}
      onAddRole={(name) => {
        setSelectedDrivers((prev) => {
          const updated = [...prev];
          updated[idx] = name;
          return updated;
        });
        setDriverPool((prev) => prev.filter((d) => d !== name));
      }}
    />
  ));

  const constructorCards = selectedConstructors.map((constructor, idx) => (
    <RoleCard
      key={idx}
      role="Constructor"
      name={constructor}
      pool={constructorPool}
      onAddRole={(name) => {
        setSelectedConstructors((prev) => {
          const updated = [...prev];
          updated[idx] = name;
          return updated;
        });
        setConstructorPool((prev) => prev.filter((c) => c !== name));
      }}
    />
  ));

  return (
    <>
      <div className="space-y-12">
        <RoleGrid cards={driverCards} />
        <RoleGrid cards={constructorCards} />
      </div>
    </>
  );
}

export default App;

import { useState } from 'react';

import './App.css';
import RoleCard from './components/RoleCard/RoleCard';
import RoleGrid from './components/RoleGrid/RoleGrid';

const ORIGINAL_DRIVER_POOL = [
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
];

const ORIGINAL_CONSTRUCTOR_POOL = [
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
];
function App() {
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>(['', '', '', '']);
  const [driverPool, setDriverPool] = useState<string[]>(ORIGINAL_DRIVER_POOL);

  const [selectedConstructors, setSelectedConstructors] = useState<string[]>(['', '', '', '']);
  const [constructorPool, setConstructorPool] = useState<string[]>(ORIGINAL_CONSTRUCTOR_POOL);

  const updateDriverPool = (selected: string[]) => {
    setDriverPool(ORIGINAL_DRIVER_POOL.filter((driver) => !selected.includes(driver)));
  };

  const updateConstructorPool = (selected: string[]) => {
    setConstructorPool(
      ORIGINAL_CONSTRUCTOR_POOL.filter((constructor) => !selected.includes(constructor)),
    );
  };

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
      onRemoveRole={() => {
        if (driver) {
          setSelectedDrivers((prev) => {
            const updated = [...prev];
            updated[idx] = '';
            updateDriverPool(updated);
            return updated;
          });
        }
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
      onRemoveRole={() => {
        if (constructor) {
          setSelectedConstructors((prev) => {
            const updated = [...prev];
            updated[idx] = '';
            updateConstructorPool(updated);
            return updated;
          });
        }
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

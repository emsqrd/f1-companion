import { Car, CircleUserRound } from 'lucide-react';
import { useState } from 'react';

import './App.css';
import { RoleCard } from './components/RoleCard/RoleCard';
import RoleGrid from './components/RoleGrid/RoleGrid';
import type { Constructor, Driver } from './contracts/Roles';
import { getAllConstructors } from './services/constructorService';
import { getAllDrivers } from './services/driverService';

const DriverCard = RoleCard<Driver>();
const ConstructorCard = RoleCard<Constructor>();

function App() {
  const ORIGINAL_DRIVER_POOL = getAllDrivers();
  const ORIGINAL_CONSTRUCTOR_POOL = getAllConstructors();

  const [selectedDrivers, setSelectedDrivers] = useState<(Driver | null)[]>(Array(4).fill(null));
  const [driverPool, setDriverPool] = useState<Driver[]>(ORIGINAL_DRIVER_POOL);

  const [selectedConstructors, setSelectedConstructors] = useState<(Constructor | null)[]>(
    Array(4).fill(null),
  );
  const [constructorPool, setConstructorPool] = useState<Constructor[]>(ORIGINAL_CONSTRUCTOR_POOL);

  const driverCards = selectedDrivers.map((driver, idx) => (
    <DriverCard
      key={idx}
      role="Driver"
      selected={driver}
      pool={driverPool}
      getLabel={(d: Driver) => `${d.firstName} ${d.lastName}`}
      getIcon={() => <CircleUserRound />}
      onAddRole={(newDriver: Driver) => {
        setSelectedDrivers((prev) => {
          const updated = [...prev];
          updated[idx] = newDriver;
          return updated;
        });
        setDriverPool((prev) => prev.filter((d) => d.id !== newDriver.id));
      }}
      onRemoveRole={(oldDriver: Driver) => {
        if (!oldDriver) return;

        setSelectedDrivers((prev) => {
          const updated = [...prev];
          updated[idx] = null;

          setDriverPool(
            ORIGINAL_DRIVER_POOL.filter((d) => !updated.some((selected) => selected?.id === d.id)),
          );

          return updated;
        });
      }}
    />
  ));

  const constructorCards = selectedConstructors.map((constructor, idx) => (
    <ConstructorCard
      key={idx}
      role="Constructor"
      selected={constructor}
      pool={constructorPool}
      getLabel={(c: Constructor) => c.name}
      getIcon={() => <Car />}
      onAddRole={(newConstructor: Constructor) => {
        setSelectedConstructors((prev) => {
          const updated = [...prev];
          updated[idx] = newConstructor;
          return updated;
        });
        setConstructorPool((prev) => prev.filter((c) => c.id !== newConstructor.id));
      }}
      onRemoveRole={(oldConstructor: Constructor) => {
        if (!oldConstructor) return;

        setSelectedConstructors((prev) => {
          const updated = [...prev];
          updated[idx] = null;

          setConstructorPool(
            ORIGINAL_CONSTRUCTOR_POOL.filter(
              (c) => !updated.some((selected) => selected?.id === c.id),
            ),
          );
          return updated;
        });
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

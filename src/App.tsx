import { Car, CircleUserRound } from 'lucide-react';

import './App.css';
import { Card, CardContent } from './components/ui/card';

function App() {
  const drivers = ['Lando Norris', 'Oscar Piastri', 'Max Verstappen', 'Lewis Hamilton'];
  const teams = ['Mercedes', 'McLaren', 'Red Bull Racing', 'Ferrari'];

  const driverCards = drivers.map((driver) => (
    <Card className="w-60 h-20">
      <CardContent className="flex items-center justify-center gap-2">
        <CircleUserRound />
        {driver}
      </CardContent>
    </Card>
  ));

  const teamCards = teams.map((team) => (
    <Card className="w-60 h-20">
      <CardContent className="flex items-center justify-center gap-2">
        <Car />
        {team}
      </CardContent>
    </Card>
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

import { CircleUserRound } from 'lucide-react';

import './App.css';
import { Card, CardContent } from './components/ui/card';

function App() {
  const drivers = ['Lando Norris', 'Oscar Piastri', 'Max Verstappen', 'Lewis Hamilton'];

  const driverCards = drivers.map((driver) => (
    <Card className="w-60 h-20">
      <CardContent className="flex items-center justify-center gap-2">
        <CircleUserRound />
        {driver}
      </CardContent>
    </Card>
  ));

  return (
    <>
      <div className="grid grid-cols-2 gap-4 justify-center">{driverCards}</div>
    </>
  );
}

export default App;

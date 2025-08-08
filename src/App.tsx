import { useState } from 'react';

import './App.css';
import { ConstructorPicker } from './components/ConstructorPicker/ConstructorPicker';
import { DriverPicker } from './components/DriverPicker/DriverPicker';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';

function App() {
  const [showTab, setShowTab] = useState('driver');

  return (
    <>
      <div className="flex justify-between p-2">
        <Button
          variant="header"
          className={cn(showTab === 'constructor' && 'text-muted-foreground')}
          onClick={() => setShowTab('driver')}
        >
          Drivers
        </Button>

        <Button
          variant="header"
          className={cn(showTab === 'driver' && 'text-muted-foreground')}
          onClick={() => setShowTab('constructor')}
        >
          Constructors
        </Button>
      </div>

      {showTab === 'driver' && <DriverPicker slotsCount={4} />}

      {showTab === 'constructor' && <ConstructorPicker slotsCount={4} />}
    </>
  );
}

export default App;

import './App.css';
import { DriverPicker } from './components/DriverPicker/DriverPicker';
import { Button } from './components/ui/button';

function App() {
  return (
    <>
      <div className="flex justify-between p-2">
        <Button variant="header">Drivers</Button>

        <Button variant="header" className="text-muted-foreground">
          Constructors
        </Button>
      </div>
      <DriverPicker slotsCount={4} />
      {/* <ConstructorPicker slotsCount={4} /> */}
    </>
  );
}

export default App;

import './App.css';
import { ConstructorPicker } from './components/ConstructorPicker/ConstructorPicker';
import { DriverPicker } from './components/DriverPicker/DriverPicker';

function App() {
  return (
    <div className="space-y-12">
      <DriverPicker slotsCount={4} />
      <ConstructorPicker slotsCount={4} />
    </div>
  );
}

export default App;

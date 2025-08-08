import './App.css';
import { ConstructorPicker } from './components/ConstructorPicker/ConstructorPicker';
import { DriverPicker } from './components/DriverPicker/DriverPicker';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

function App() {
  return (
    <Tabs defaultValue="drivers">
      <TabsList className="w-full">
        <TabsTrigger className="cursor-pointer" value="drivers">
          Drivers
        </TabsTrigger>
        <TabsTrigger className="cursor-pointer" value="constructors">
          Constructors
        </TabsTrigger>
      </TabsList>
      <TabsContent className="mt-4" value="drivers">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <DriverPicker slotsCount={4} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent className="mt-4" value="constructors">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Constructors</CardTitle>
          </CardHeader>
          <CardContent>
            <ConstructorPicker slotsCount={4} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default App;

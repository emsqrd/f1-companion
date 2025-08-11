import { ConstructorPicker } from '../ConstructorPicker/ConstructorPicker';
import { DriverPicker } from '../DriverPicker/DriverPicker';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function Team() {
  return (
    <Tabs defaultValue="drivers">
      <TabsList className="w-full">
        <TabsTrigger value="drivers">Drivers</TabsTrigger>
        <TabsTrigger value="constructors">Constructors</TabsTrigger>
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

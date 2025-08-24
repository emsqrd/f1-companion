import { getTeamById } from '@/services/teamService';
import { ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { ConstructorPicker } from '../ConstructorPicker/ConstructorPicker';
import { DriverPicker } from '../DriverPicker/DriverPicker';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function Team() {
  const params = useParams();

  const team = getTeamById(Number(params.teamId));

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <div className="mx-auto p-8 md:max-w-max">
      <header className="mb-4">
        <nav aria-label="Breadcrumb" className="mb-4">
          <Link
            to={`/`}
            className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm transition-colors"
          >
            <ChevronLeft />
            Back to League
          </Link>
        </nav>
        <div className="mb-2">
          <div className="mb-4">
            <h1 className="text-3xl font-bold">{team.name}</h1>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">Round 15</p>
            <h1 className="text-2xl font-bold">Netherlands</h1>
          </div>
        </div>
        <div className="flex flex-row gap-10">
          <div className="flex flex-col items-center">
            <p className="text-muted-foreground text-sm font-medium">Points</p>
            <h1 className="text-lg font-bold">679</h1>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-muted-foreground text-sm font-medium">Budget</p>
            <h1 className="text-lg font-bold">$200k</h1>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-muted-foreground text-sm font-medium">Trades</p>
            <h1 className="text-lg font-bold">3/3</h1>
          </div>
        </div>
      </header>
      <Tabs defaultValue="drivers">
        <TabsList className="w-full">
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="constructors">Constructors</TabsTrigger>
        </TabsList>
        <TabsContent value="drivers">
          <Card className="py-4">
            <CardContent className="px-4">
              <DriverPicker slotsCount={4} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="constructors">
          <Card className="py-4">
            <CardContent className="px-4">
              <ConstructorPicker slotsCount={4} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

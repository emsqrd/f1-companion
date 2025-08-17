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
        <div className="space-y-1">
          <p className="text-muted-foreground font-medium">Team</p>
          <h1 className="text-3xl font-bold">{team.name}</h1>
        </div>
      </header>
      <Tabs defaultValue="drivers">
        <TabsList className="w-full">
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="constructors">Constructors</TabsTrigger>
        </TabsList>
        <TabsContent value="drivers">
          <Card>
            <CardContent>
              <DriverPicker slotsCount={4} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="constructors">
          <Card>
            <CardContent>
              <ConstructorPicker slotsCount={4} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

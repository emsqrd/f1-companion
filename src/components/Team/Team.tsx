import { getTeamById } from '@/services/teamService';
import { ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { ConstructorPicker } from '../ConstructorPicker/ConstructorPicker';
import { DriverPicker } from '../DriverPicker/DriverPicker';
import { Card, CardContent, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function Team() {
  const params = useParams();

  const team = getTeamById(Number(params.teamId));

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-8 lg:px-8">
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

        <div className="gap-4 sm:grid sm:grid-cols-2">
          <Card className="mb-6 flex justify-center sm:mb-0">
            <CardTitle className="text-center text-3xl font-bold">{team.name}</CardTitle>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-row sm:justify-center">
                <div className="flex flex-col items-center">
                  <p className="text-muted-foreground font-medium">Budget</p>
                  <h1 className="text-lg font-bold">$200k</h1>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-muted-foreground font-medium">Trades</p>
                  <h1 className="text-lg font-bold">3/3</h1>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-4 flex flex-col space-y-4 sm:mb-0">
            <Select defaultValue="round15">
              <SelectTrigger className="h-auto min-h-[60px] w-full py-8 [&>span]:block [&>span]:w-full [&>span]:text-left">
                <SelectValue placeholder="Pick a race" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round15">
                  <div>
                    <p className="text-muted-foreground font-medium">Round 15</p>
                    <h1 className="text-2xl font-bold">Netherlands</h1>
                  </div>
                </SelectItem>
                <SelectItem value="round14">
                  <div>
                    <p className="text-muted-foreground font-medium">Round 14</p>
                    <h1 className="text-2xl font-bold">Hungary</h1>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Card className="gap-2 py-2">
              <CardTitle className="pb-2 text-center text-xl font-bold">Round Results</CardTitle>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:flex sm:justify-center sm:gap-8 lg:gap-12">
                  <div className="text-center">
                    <p className="text-muted-foreground font-medium">Finished</p>
                    <h1 className="text-lg font-bold">1st</h1>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground font-medium">Points</p>
                    <h1 className="text-lg font-bold">679</h1>
                  </div>
                </div>
              </CardContent>
            </Card>
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

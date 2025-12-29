import type { Team } from '@/contracts/Team';
import { getTeamById } from '@/services/teamService';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { AppContainer } from '../AppContainer/AppContainer';
import { ConstructorPicker } from '../ConstructorPicker/ConstructorPicker';
import { DriverPicker } from '../DriverPicker/DriverPicker';
import { ErrorState } from '../ErrorState/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function Team() {
  const params = useParams();

  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchTeam = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTeamById(Number(params.teamId));
        setTeam(data);
      } catch {
        // Error already captured by API client (5xx or network errors)
        setError('Failed to load team. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [params.teamId, refetchTrigger]);

  const handleRetry = () => setRefetchTrigger((prev) => prev + 1);

  // Memoize driver slot transformation to avoid recalculating on every render
  const initialDriverSlots = useMemo(() => {
    if (!team?.drivers) return Array.from({ length: 5 }, () => null);

    return Array.from({ length: 5 }, (_, index) => {
      const teamDriver = team.drivers.find((d) => d.slotPosition === index);
      return teamDriver
        ? {
            id: teamDriver.id,
            firstName: teamDriver.firstName,
            lastName: teamDriver.lastName,
            abbreviation: teamDriver.abbreviation,
            countryAbbreviation: teamDriver.countryAbbreviation,
            price: 0,
            points: 0,
            type: 'driver' as const,
          }
        : null;
    });
  }, [team?.drivers]);

  // Memoize constructor slot transformation to avoid recalculating on every render
  const initialConstructorSlots = useMemo(() => {
    if (!team?.constructors) return Array.from({ length: 2 }, () => null);

    return Array.from({ length: 2 }, (_, index) => {
      const teamConstructor = team.constructors.find((c) => c.slotPosition === index);
      return teamConstructor
        ? {
            id: teamConstructor.id,
            name: teamConstructor.name,
            abbreviation: teamConstructor.abbreviation,
            countryAbbreviation: teamConstructor.countryAbbreviation,
            price: 0,
            points: 0,
            type: 'constructor' as const,
          }
        : null;
    });
  }, [team?.constructors]);

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-8 md:min-h-screen">
        <div className="text-center">
          <div
            role="status"
            className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"
          ></div>
          <p className="text-muted-foreground">Loading Team...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <AppContainer maxWidth="md">
      <div className="mb-4 gap-4 sm:grid sm:grid-cols-2">
        <Card className="mb-6 flex justify-center sm:mb-0">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">{team.name}</CardTitle>
          </CardHeader>
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
            <CardHeader>
              <CardTitle className="pb-2 text-center text-2xl font-bold">Round Results</CardTitle>
            </CardHeader>
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
      <Tabs defaultValue="drivers">
        <TabsList className="w-full">
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="constructors">Constructors</TabsTrigger>
        </TabsList>
        <TabsContent value="drivers">
          <Card className="py-4">
            <CardContent className="px-4">
              <DriverPicker lineupSize={5} initialDrivers={initialDriverSlots} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="constructors">
          <Card className="py-4">
            <CardContent className="px-4">
              <ConstructorPicker lineupSize={2} initialConstructors={initialConstructorSlots} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppContainer>
  );
}

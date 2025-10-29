import type { League } from '@/contracts/League';
import { createLeague, getLeagues } from '@/services/leagueService';
import {
  type CreateLeagueFormData,
  createLeagueFormSchema,
} from '@/validations/createLeagueFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { AppContainer } from '../AppContainer/AppContainer';
import { FormFieldInput, FormFieldSwitch, FormFieldTextarea } from '../FormField/FormField';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export function LeagueList() {
  const [leagues, setLeagues] = useState<League[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  //TODO: Keep feedback but fold toasts into feedback?
  //const { feedback, showSuccess, showError, clearFeedback } = useFormFeedback();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateLeagueFormData>({
    resolver: zodResolver(createLeagueFormSchema),
    mode: 'onBlur',
    defaultValues: {
      leagueName: '',
      leagueDescription: '',
      leagueIsPrivate: true,
    },
  });

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const data = await getLeagues();
        setLeagues(data);
      } catch (err) {
        console.error('Failed to load leagues: ', err);
        setError('Failed to load leagues');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  const onSubmit = async (formData: CreateLeagueFormData) => {
    try {
      const createdLeague = await createLeague({
        name: formData.leagueName,
        description: formData.leagueDescription,
        isPrivate: formData.leagueIsPrivate,
      });

      navigate(`/league/${createdLeague.id}`);

      toast.success('League created successfully!');

      reset(formData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create league';
      toast.error(message);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
    }
  };

  if (error) {
    return <div role="error">{error}</div>;
  }

  if (isLoading) {
    return (
      <div role="loader" className="flex w-full items-center justify-center p-8 md:min-h-screen">
        <div className="text-center">
          <div
            role="status"
            className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"
          ></div>
          <p className="text-muted-foreground">Loading Leagues...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContainer maxWidth="md" className="p-8">
      <header className="flex justify-between pb-4">
        <h2 className="mb-2 text-2xl font-semibold">Joined Leagues</h2>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Create League</Button>
          </DialogTrigger>
          <DialogContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Create League</DialogTitle>
                <DialogDescription>Create your league here</DialogDescription>
              </DialogHeader>
              <FormFieldInput
                label="League Name"
                id="leagueName"
                required
                error={errors.leagueName?.message}
                register={register('leagueName')}
                placeholder="Name your league"
              />
              <FormFieldTextarea
                label="Description"
                id="leagueDescription"
                error={errors.leagueDescription?.message}
                register={register('leagueDescription')}
                placeholder="Your league description"
              />
              <Controller
                name="leagueIsPrivate"
                control={control}
                render={({ field }) => (
                  <FormFieldSwitch
                    label="Private"
                    id="leagueIsPrivate"
                    error={errors.leagueIsPrivate?.message}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
                <Button disabled={isSubmitting || !isDirty} type="submit">
                  Submit
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>
      <div aria-label="league-list">
        {leagues?.map((league) => (
          <Card
            key={league.id}
            className="mb-4 cursor-pointer"
            onClick={() => navigate(`/league/${league.id}`)}
          >
            <CardContent>{league.name}</CardContent>
          </Card>
        ))}
      </div>
    </AppContainer>
  );
}

import { useTeam } from '@/hooks/useTeam';
import { createTeam } from '@/services/teamService';
import { type CreateTeamFormData, createTeamFormSchema } from '@/validations/teamSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { AppContainer } from '../AppContainer/AppContainer';
import { FormFieldInput } from '../FormField/FormField';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function CreateTeam() {
  const navigate = useNavigate();
  const { refreshMyTeam } = useTeam();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamFormSchema),
    mode: 'onBlur',
    defaultValues: {
      teamName: '',
    },
  });

  const onSubmit = async (formData: CreateTeamFormData) => {
    try {
      const createdTeam = await createTeam({
        name: formData.teamName,
      });

      toast.success('Team created successfully');

      // Refresh context to update myTeamId
      refreshMyTeam();

      // Navigate using startTransition for non-blocking UI updates
      startTransition(() => {
        navigate(`/team/${createdTeam.id}`);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create team';
      toast.error(message);
    }
  };

  return (
    <AppContainer maxWidth="md">
      <div className="flex w-full items-center justify-center p-8 md:min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">Create Your Team</CardTitle>
            <p className="text-muted-foreground text-center">
              Choose a name for your fantasy F1 team
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormFieldInput
                label="Team Name"
                id="teamName"
                required
                error={errors.teamName?.message}
                register={register('teamName')}
                placeholder="Enter your team name"
                helpText="You can change this later"
              />

              <div className="flex justify-end pt-2">
                <Button
                  disabled={isSubmitting || !isDirty || isPending}
                  className="min-w-32"
                  type="submit"
                >
                  {isSubmitting ? 'Creating...' : isPending ? 'Redirecting...' : 'Create Team'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppContainer>
  );
}

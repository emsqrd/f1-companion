import type { League } from '@/contracts/League';
import { createLeague } from '@/services/leagueService';
import {
  type CreateLeagueFormData,
  createLeagueFormSchema,
} from '@/validations/createLeagueFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormFieldInput, FormFieldSwitch, FormFieldTextarea } from '../FormField/FormField';
import { Button } from '../ui/button';
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

interface CreateLeagueProps {
  onLeagueCreated?: (league: League) => void;
}

export function CreateLeague({ onLeagueCreated }: CreateLeagueProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const onSubmit = async (formData: CreateLeagueFormData) => {
    try {
      const createdLeague = await createLeague({
        name: formData.leagueName,
        description: formData.leagueDescription,
        isPrivate: formData.leagueIsPrivate,
      });

      toast.success('League created successfully!');
      setIsOpen(false);
      reset();

      onLeagueCreated?.(createdLeague);
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

  return (
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
  );
}

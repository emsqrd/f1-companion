import type { UserProfile } from '@/contracts/UserProfile';
import { useAuth } from '@/hooks/useAuth';
import { useFormFeedback } from '@/hooks/useFormFeedback';
import { avatarEvents } from '@/lib/avatarEvents';
import { type UserProfileFormData, userProfileFormSchema } from '@/lib/validationSchema';
import { userProfileService } from '@/services/userProfileService';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { AvatarUpload } from '../AvatarUpload/AvatarUpload';
import { FormFieldInput } from '../FormField/FormField';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function Account() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [isLoading, setIsLoading] = useState(true);
  const { feedback, showSuccess, showError, clearFeedback } = useFormFeedback();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileFormSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      displayName: '',
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await userProfileService.getCurrentProfile();
        setUserProfile(data);

        // Reset form with fetched data
        reset({
          displayName: data.displayName || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
        });

        clearFeedback();
      } catch (err) {
        console.error('Failed to load user profile:', err);
        showError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [reset, clearFeedback, showError]);

  const handleAvatarChange = async (avatarUrl: string) => {
    if (!userProfile) return;

    try {
      const updatedProfile = await userProfileService.updateUserProfile({
        ...userProfile,
        avatarUrl,
      });

      setUserProfile(updatedProfile);
      // Emit avatar change event so PageHeader updates immediately
      avatarEvents.emit(avatarUrl);
      showSuccess('Avatar updated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update avatar';
      showError(message);
    }
  };

  const onSubmit = async (formData: UserProfileFormData) => {
    if (!userProfile) return;

    clearFeedback();

    try {
      const updatedProfile = await userProfileService.updateUserProfile({
        ...userProfile,
        ...formData,
      });

      setUserProfile(updatedProfile);
      showSuccess('Profile updated successfully!');

      // Reset form state to mark it as clean
      reset(formData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      showError(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-8 md:min-h-screen">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full items-center justify-center p-8 md:min-h-screen">
      <div className="w-full max-w-md space-y-4">
        {/* Feedback Messages */}
        {feedback.type && (
          <div
            className={`rounded-md p-3 text-sm ${
              feedback.type === 'success'
                ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
            }`}
            role={feedback.type === 'error' ? 'alert' : 'status'}
          >
            {feedback.message}
          </div>
        )}

        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl">Profile Information</CardTitle>
            <AvatarUpload
              userId={user?.id || ''}
              currentAvatarUrl={userProfile?.avatarUrl || ''}
              onAvatarChange={handleAvatarChange}
              onError={showError}
              size="lg"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormFieldInput
                label="Display Name"
                id="displayName"
                required
                error={errors.displayName?.message}
                helpText="Display name appears throughout the app."
                register={register('displayName')}
                placeholder="Enter your display name"
              />

              <FormFieldInput
                label="Email"
                id="email"
                type="email"
                required
                error={errors.email?.message}
                register={register('email')}
                placeholder="Enter your email address"
              />

              <FormFieldInput
                label="First Name"
                id="firstName"
                error={errors.firstName?.message}
                register={register('firstName')}
                placeholder="Enter your first name"
              />

              <FormFieldInput
                label="Last Name"
                id="lastName"
                error={errors.lastName?.message}
                register={register('lastName')}
                placeholder="Enter your last name"
              />

              <div className="flex justify-end pt-2">
                <Button disabled={isSubmitting || !isDirty} className="min-w-20" type="submit">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

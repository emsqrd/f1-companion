import type { UserProfile } from '@/contracts/UserProfile';
import { userProfileService } from '@/services/userProfileService';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function Account() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await userProfileService.getCurrentProfile();
        setUserProfile(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load user profile');
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setEmail(userProfile.email || '');
    }
  }, [userProfile]);

  return (
    <div className="flex w-full items-center justify-center p-8 md:min-h-screen">
      <div className="w-full max-w-md space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              ></Input>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Input>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

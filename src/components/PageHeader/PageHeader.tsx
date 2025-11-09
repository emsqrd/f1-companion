import { useAuth } from '@/hooks/useAuth';
import { avatarEvents } from '@/lib/avatarEvents';
import { userProfileService } from '@/services/userProfileService';
import * as Sentry from '@sentry/react';
import { CircleUser, Loader2, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function PageHeader() {
  const { user, signOut, loading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();

  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleAccountClick = () => {
    navigate('/account');
  };

  const handleLeagues = () => {
    navigate('/leagues');
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/sign-in');
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setAvatarUrl('');
        return;
      }

      try {
        setIsLoading(true);
        const profile = await userProfileService.getCurrentProfile();
        setAvatarUrl(profile?.avatarUrl || '');
      } catch (error) {
        Sentry.captureException(error, {
          contexts: {
            user: { id: user?.id },
          },
        });
        setAvatarUrl('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]); // Only depend on user, not location

  // Listen for avatar update events
  useEffect(() => {
    const unsubscribe = avatarEvents.subscribe((newAvatarUrl) => {
      setAvatarUrl(newAvatarUrl);
    });

    return unsubscribe;
  }, []);

  // Hide auth buttons on auth pages
  const isAuthPage = location.pathname === '/sign-in' || location.pathname === '/sign-up';

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div
            className="flex cursor-pointer items-center space-x-2"
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogoClick();
              }
            }}
            aria-label="Navigate to home page"
          >
            <Trophy className="text-primary h-8 w-8" />
            <span className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
              F1 Fantasy Sports
            </span>
          </div>
          <div className="flex space-x-4">
            <div className="items-center">
              {!isAuthPage && !loading && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="data-[state=open]:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0"
                      size="icon"
                    >
                      <Avatar>
                        <AvatarImage src={avatarUrl} alt="User avatar" />
                        <AvatarFallback>
                          <CircleUser className="size-8" />
                        </AvatarFallback>
                        {/* Loading Overlay */}
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="[&>*]:cursor-pointer" align="end">
                    {user ? (
                      <>
                        <DropdownMenuItem onClick={handleAccountClick}>My Account</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLeagues}>My Leagues</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={handleSignIn}>Sign In</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

import { useAuth } from '@/hooks/useAuth';
import { Trophy } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '../ui/button';

export function PageHeader() {
  const { user, signOut } = useAuth();

  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  // Hide auth buttons on auth pages
  const isAuthPage = location.pathname === '/sign-in' || location.pathname === '/sign-up';
  const isLandingPage = location.pathname === '/';

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
          <div className="hidden items-center space-x-4 sm:flex">
            {user && isLandingPage && (
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            )}

            {user && !isAuthPage && <Button onClick={signOut}>Sign Out</Button>}

            {!user && !isAuthPage && (
              <>
                <Button variant="ghost" onClick={() => navigate('/sign-in')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/sign-up')} className="hidden sm:inline-flex">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

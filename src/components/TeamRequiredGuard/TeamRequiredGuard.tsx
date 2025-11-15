import { useTeam } from '@/hooks/useTeam';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

export function TeamRequiredGuard() {
  const { hasTeam, isCheckingTeam, error, refetchTeam } = useTeam();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're done checking AND confirmed there's no team
    if (!isCheckingTeam && !hasTeam && !error) {
      // Defer navigation to next tick to ensure React finishes all state updates
      // This prevents race condition where guard checks state before context updates complete
      const timeoutId = setTimeout(() => {
        navigate('/create-team', { replace: true });
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [hasTeam, isCheckingTeam, error, navigate]);

  // show loading state while checking team
  if (isCheckingTeam) {
    return (
      <div className="flex w-full items-center justify-center p-8 md:min-h-screen">
        <div className="text-center">
          <div
            role="status"
            className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"
          ></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // show error state with retry option
  if (error) {
    return (
      <div className="flex w-full items-center justify-center p-8 md:min-h-screen">
        <div className="space-y-4 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load team information. {error.message}
          </p>
          <button
            onClick={() => refetchTeam()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // if no team, return null while redirecting
  if (!hasTeam) {
    return null;
  }

  // has team - render protected routes
  return <Outlet />;
}

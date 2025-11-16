import { useTeam } from '@/hooks/useTeam';
import { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router';

export function TeamRequiredGuard() {
  const { hasTeam, isCheckingTeam, error, refetchTeam, team } = useTeam();
  const navigate = useNavigate();
  const hasSeenLoadingState = useRef(false);

  // Redirect to team creation if user has no team
  // CRITICAL: Must wait for data to actually load before making decisions
  // Track if we've ever seen the loading state to ensure data fetch has been attempted
  useEffect(() => {
    // Track when loading state is active
    if (isCheckingTeam) {
      hasSeenLoadingState.current = true;
      return;
    }

    // Only redirect if:
    // 1. We've seen the loading state (data fetch was attempted)
    // 2. Loading is complete
    // 3. No error occurred
    // 4. Team is explicitly null (confirmed no team)
    if (hasSeenLoadingState.current && !error && team === null) {
      navigate('/create-team', { replace: true });
    }
  }, [team, isCheckingTeam, error, navigate]);

  // Show loading state while checking team status
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

  // Show error state with retry option
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

  // Return null while redirect is processing
  if (!hasTeam) {
    return null;
  }

  // User has team - render protected routes
  return <Outlet />;
}

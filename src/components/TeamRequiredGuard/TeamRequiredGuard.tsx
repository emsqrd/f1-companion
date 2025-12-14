import { useTeam } from '@/hooks/useTeam';
import { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router';

export function TeamRequiredGuard() {
  const { hasTeam, isCheckingTeam, myTeamId } = useTeam();
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
    // 3. Team ID is explicitly null (confirmed no team)
    if (hasSeenLoadingState.current && myTeamId === null) {
      navigate('/create-team', { replace: true });
    }
  }, [myTeamId, isCheckingTeam, navigate]);

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

  // Return null while redirect is processing
  if (!hasTeam) {
    return null;
  }

  // User has team - render protected routes
  return <Outlet />;
}

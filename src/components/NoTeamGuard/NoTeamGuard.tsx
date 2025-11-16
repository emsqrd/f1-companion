import { useTeam } from '@/hooks/useTeam';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

/**
 * Guard component that redirects users who already have a team.
 * Use this to protect routes that should only be accessible to users without a team.
 */
export function NoTeamGuard() {
  const { hasTeam, isCheckingTeam } = useTeam();
  const navigate = useNavigate();

  // Redirect to leagues if user already has a team
  // useEffect ensures navigation happens after render completes, avoiding issues
  // with React's render cycle and preventing navigation during state updates
  useEffect(() => {
    if (!isCheckingTeam && hasTeam) {
      navigate('/leagues', { replace: true });
    }
  }, [hasTeam, isCheckingTeam, navigate]);

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
  if (hasTeam) {
    return null;
  }

  // User has no team - render protected routes
  return <Outlet />;
}

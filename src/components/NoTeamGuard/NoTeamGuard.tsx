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

  useEffect(() => {
    // Redirect to leagues if user already has a team
    if (!isCheckingTeam && hasTeam) {
      const timeoutId = setTimeout(() => {
        navigate('/leagues', { replace: true });
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [hasTeam, isCheckingTeam, navigate]);

  // Show loading state while checking team
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

  // If user has a team, return null while redirecting
  if (hasTeam) {
    return null;
  }

  // No team - render protected routes
  return <Outlet />;
}

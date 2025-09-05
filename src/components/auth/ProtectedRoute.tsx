import { useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { LoadingSpinner } from '../ui/loading-spinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to landing page when user is not authenticated
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Return null while redirecting to prevent flash of content
    return null;
  }

  return <>{children}</>;
}

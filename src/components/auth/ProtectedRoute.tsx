import { useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';

import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  //TODO: Replace with an actual loading component
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoginForm />
      </div>
    );
  }

  return <>{children}</>;
}

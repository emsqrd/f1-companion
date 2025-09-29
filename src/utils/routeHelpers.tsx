import { ProtectedRoute } from '@/components/auth/ProtectedRoute/ProtectedRoute';
import type { ComponentType } from 'react';

export const withProtection = <P extends object>(Component: ComponentType<P>) => {
  return (props: P) => (
    <ProtectedRoute>
      <Component {...props} />
    </ProtectedRoute>
  );
};

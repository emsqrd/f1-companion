import { RouterProvider } from '@tanstack/react-router';

import { useAuth } from './hooks/useAuth';
import { useTeam } from './hooks/useTeam';
import { router } from './router';

/**
 * InnerApp component provides router context after auth and team are initialized
 * This component is separated to satisfy fast refresh requirements
 */
export function InnerApp() {
  const auth = useAuth();
  const team = useTeam();

  return <RouterProvider router={router} context={{ auth, team }} />;
}

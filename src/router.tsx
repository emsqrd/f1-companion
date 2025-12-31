import { Account } from '@/components/Account/Account';
import { CreateTeam } from '@/components/CreateTeam/CreateTeam';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { ErrorFallback } from '@/components/ErrorBoundary/ErrorFallback';
import { LandingPage } from '@/components/LandingPage/LandingPage';
import { Layout } from '@/components/Layout/Layout';
import { League } from '@/components/League/League';
import { LeagueList } from '@/components/LeagueList/LeagueList';
import { Team } from '@/components/Team/Team';
import { SignInForm } from '@/components/auth/SignInForm/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm/SignUpForm';
import type { AuthContextType } from '@/contexts/AuthContext';
import type { TeamContextType } from '@/contexts/TeamContext';
import {
  ErrorComponent,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

// Define the router context interface that will be available to all routes
interface RouterContext {
  auth: AuthContextType;
  team: TeamContextType;
}

// Create root route with context - this will wrap all routes
const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Layout />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  ),
  errorComponent: ({ error, reset }) => (
    <ErrorBoundary level="page">
      <ErrorFallback error={error} onReset={reset} level="page" />
    </ErrorBoundary>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-primary hover:underline">
        Go back home
      </a>
    </div>
  ),
});

// Public routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  component: SignInForm,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-up',
  component: SignUpForm,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

// Protected routes (authentication required)
// We'll add beforeLoad guards in Phase 2
const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: Account,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

const createTeamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-team',
  component: CreateTeam,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

const leaguesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leagues',
  component: LeagueList,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

const leagueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/league/$leagueId',
  component: () => (
    <ErrorBoundary level="section">
      <League />
    </ErrorBoundary>
  ),
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/team/$teamId',
  component: () => (
    <ErrorBoundary level="section">
      <Team />
    </ErrorBoundary>
  ),
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  signUpRoute,
  accountRoute,
  createTeamRoute,
  leaguesRoute,
  leagueRoute,
  teamRoute,
]);

// Create the router instance with default components and Sentry integration
export const router = createRouter({
  routeTree,
  context: {
    // Context will be provided by the RouterProvider in main.tsx
    auth: undefined!,
    team: undefined!,
  },
  defaultPendingComponent: () => (
    <div role="status" className="flex min-h-screen items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  ),
  defaultErrorComponent: ({ error }) => (
    <ErrorBoundary level="page">
      <ErrorFallback error={error} level="page" />
    </ErrorBoundary>
  ),
  defaultNotFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-primary hover:underline">
        Go back home
      </a>
    </div>
  ),
});

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

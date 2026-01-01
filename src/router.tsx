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
import type { RouterContext } from '@/lib/router-context';
import { requireAuth, requireTeam } from '@/lib/route-guards';
import {
  ErrorComponent,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

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
const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  beforeLoad: ({ context }) => requireAuth(context),
  component: Account,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

const createTeamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-team',
  beforeLoad: ({ context }) => {
    requireAuth(context);
    // Note: Cannot use requireNoTeam guard here due to async team data loading
    // Component handles redirect after team data loads
  },
  component: CreateTeam,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

const leaguesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leagues',
  beforeLoad: ({ context }) => {
    requireAuth(context);
    requireTeam(context);
  },
  component: LeagueList,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

const leagueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/league/$leagueId',
  beforeLoad: ({ context }) => {
    requireAuth(context);
    requireTeam(context);
  },
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
  beforeLoad: ({ context }) => {
    requireAuth(context);
    requireTeam(context);
  },
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

// Create the router instance with default components
// Note: Sentry integration is configured in main.tsx via tanStackRouterBrowserTracingIntegration
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

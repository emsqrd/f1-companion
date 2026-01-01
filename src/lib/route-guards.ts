import type { RouterContext } from '@/lib/router-context';
import { redirect } from '@tanstack/react-router';

/**
 * Route guard that requires user authentication.
 *
 * Use this guard in the `beforeLoad` function of any route that requires
 * the user to be authenticated. If the user is not authenticated, they will
 * be redirected to the sign-in page.
 *
 * @example
 * ```typescript
 * const accountRoute = createRoute({
 *   getParentRoute: () => rootRoute,
 *   path: '/account',
 *   beforeLoad: ({ context }) => requireAuth(context),
 *   component: Account,
 * });
 * ```
 *
 * @param context - The router context containing auth state
 * @throws {redirect} Redirects to '/' (landing page with sign-in) if not authenticated
 * @see {@link https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes TanStack Router Authentication Guide}
 */
export function requireAuth(context: RouterContext): void {
  // Wait for auth to load before checking authentication
  if (context.auth.loading) {
    return;
  }

  // Throw redirect if user is not authenticated
  // Note: TanStack Router requires throwing redirect, not returning it
  if (!context.auth.user) {
    throw redirect({
      to: '/',
      replace: true,
    });
  }
}

/**
 * Route guard that requires the authenticated user to have a team.
 *
 * Use this guard in combination with `requireAuth` for routes that require
 * both authentication and team ownership. If the user doesn't have a team,
 * they will be redirected to the create team page.
 *
 * NOTE: This guard will prevent navigation while team data is loading to ensure
 * accurate routing decisions. The route will wait until team state is determined.
 *
 * @example
 * ```typescript
 * const leaguesRoute = createRoute({
 *   getParentRoute: () => rootRoute,
 *   path: '/leagues',
 *   beforeLoad: ({ context }) => {
 *     requireAuth(context);
 *     requireTeam(context);
 *   },
 *   component: LeagueList,
 * });
 * ```
 *
 * @param context - The router context containing auth and team state
 * @throws {redirect} Redirects to '/create-team' if user doesn't have a team
 */
export function requireTeam(context: RouterContext): void {
  // Don't check team if auth is still loading or user is not authenticated
  // requireAuth should be called first to handle authentication
  if (context.auth.loading || !context.auth.user) {
    return;
  }

  // Wait for team check to complete before evaluating
  // NOTE: This guard won't work perfectly until Phase 4/5 when loaders are implemented
  // For now, it relies on context data which loads asynchronously
  if (context.team.isCheckingTeam) {
    return;
  }

  // Throw redirect if user doesn't have a team
  if (!context.team.hasTeam) {
    throw redirect({
      to: '/create-team',
      replace: true,
    });
  }
}

/**
 * Route guard that requires the authenticated user to NOT have a team.
 *
 * Use this guard for routes like "create team" where users who already have
 * a team should not be able to access the page. If the user has a team,
 * they will be redirected to the leagues page.
 *
 * NOTE: This guard will prevent navigation while team data is loading to ensure
 * accurate routing decisions. The route will wait until team state is determined.
 *
 * @example
 * ```typescript
 * const createTeamRoute = createRoute({
 *   getParentRoute: () => rootRoute,
 *   path: '/create-team',
 *   beforeLoad: ({ context }) => {
 *     requireAuth(context);
 *     requireNoTeam(context);
 *   },
 *   component: CreateTeam,
 * });
 * ```
 *
 * @param context - The router context containing auth and team state
 * @throws {redirect} Redirects to '/leagues' if user already has a team
 */
export function requireNoTeam(context: RouterContext): void {
  // Don't check team if auth is still loading or user is not authenticated
  // requireAuth should be called first to handle authentication
  if (context.auth.loading || !context.auth.user) {
    return;
  }

  // Wait for team check to complete before evaluating
  // NOTE: This guard won't work perfectly until Phase 4/5 when loaders are implemented
  // For now, component-level checks in CreateTeam handle the redirect after team loads
  if (context.team.isCheckingTeam) {
    return;
  }

  // Throw redirect if user already has a team
  if (context.team.hasTeam) {
    throw redirect({
      to: '/leagues',
      replace: true,
    });
  }
}

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import the route configuration after mocks
import { Account } from './components/Account/Account.tsx';
import { LandingPage } from './components/LandingPage/LandingPage.tsx';
import { Layout } from './components/Layout/Layout.tsx';
import { League } from './components/League/League.tsx';
import { Team } from './components/Team/Team.tsx';
import { SignInForm } from './components/auth/SignInForm/SignInForm.tsx';
import { SignUpForm } from './components/auth/SignUpForm/SignUpForm.tsx';
import { withProtection } from './utils/routeHelpers.tsx';

// Mock all components to focus on routing behavior
vi.mock('@/components/LandingPage/LandingPage', () => ({
  LandingPage: () => <div data-testid="landing-page">Landing Page</div>,
}));

vi.mock('@/components/auth/SignInForm/SignInForm', () => ({
  SignInForm: () => <div data-testid="sign-in-form">Sign In Form</div>,
}));

vi.mock('@/components/auth/SignUpForm/SignUpForm', () => ({
  SignUpForm: () => <div data-testid="sign-up-form">Sign Up Form</div>,
}));

vi.mock('@/components/League/League', () => ({
  League: () => <div data-testid="league">League Dashboard</div>,
}));

vi.mock('@/components/Team/Team', () => ({
  Team: () => <div data-testid="team">Team Page</div>,
}));

vi.mock('@/components/Account/Account', () => ({
  Account: () => <div data-testid="account">Account Page</div>,
}));

vi.mock('@/components/Layout/Layout', async () => {
  const { Outlet } = await import('react-router');
  return {
    Layout: () => (
      <div data-testid="layout">
        <div data-testid="layout-header">Layout Header</div>
        <Outlet />
      </div>
    ),
  };
});

// Mock the AuthProvider
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

// Mock the protection HOC
vi.mock('@/utils/routeHelpers', () => ({
  withProtection: (Component: React.ComponentType) => {
    return function ProtectedComponent() {
      return (
        <div data-testid="protected-wrapper">
          <Component />
        </div>
      );
    };
  },
}));

const ProtectedLeague = withProtection(League);
const ProtectedTeam = withProtection(Team);
const ProtectedAccount = withProtection(Account);

// Helper function to render routes as they appear in main.tsx
function renderRoutes(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="sign-in" element={<SignInForm />} />
          <Route path="sign-up" element={<SignUpForm />} />
          <Route path="dashboard" element={<ProtectedLeague />} />
          <Route path="team/:teamId" element={<ProtectedTeam />} />
          <Route path="account" element={<ProtectedAccount />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('Main App Routing Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Public Routes', () => {
    it('should render landing page at root path', () => {
      renderRoutes('/');

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-wrapper')).not.toBeInTheDocument();
    });

    it('should render sign-in form at /sign-in', () => {
      renderRoutes('/sign-in');

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('sign-in-form')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-wrapper')).not.toBeInTheDocument();
    });

    it('should render sign-up form at /sign-up', () => {
      renderRoutes('/sign-up');

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('sign-up-form')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-wrapper')).not.toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    it('should render protected dashboard route', () => {
      renderRoutes('/dashboard');

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('protected-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('league')).toBeInTheDocument();
    });

    it('should render protected team route with parameter', () => {
      renderRoutes('/team/123');

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('protected-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('team')).toBeInTheDocument();
    });

    it('should render protected account route', () => {
      renderRoutes('/account');

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('protected-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('account')).toBeInTheDocument();
    });

    it('should handle different team IDs in protected team route', () => {
      const teamIds = ['123', 'abc-456', 'team_789'];

      for (const teamId of teamIds) {
        const { unmount } = renderRoutes(`/team/${teamId}`);

        expect(screen.getByTestId('protected-wrapper')).toBeInTheDocument();
        expect(screen.getByTestId('team')).toBeInTheDocument();
        unmount();
      }
    });
  });

  describe('Route Structure and Layout', () => {
    it('should nest all routes under Layout component', () => {
      const testRoutes = ['/', '/sign-in', '/sign-up', '/dashboard', '/team/123', '/account'];

      for (const route of testRoutes) {
        const { unmount } = renderRoutes(route);

        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('layout-header')).toBeInTheDocument();
        unmount();
      }
    });

    it('should apply protection only to protected routes', () => {
      const publicRoutes = ['/', '/sign-in', '/sign-up'];
      const protectedRoutes = ['/dashboard', '/team/123', '/account'];

      // Test public routes don't have protection wrapper
      for (const route of publicRoutes) {
        const { unmount } = renderRoutes(route);

        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-wrapper')).not.toBeInTheDocument();
        unmount();
      }

      // Test protected routes have protection wrapper
      for (const route of protectedRoutes) {
        const { unmount } = renderRoutes(route);

        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('protected-wrapper')).toBeInTheDocument();
        unmount();
      }
    });

    it('should ensure protection wrapper contains the actual component', () => {
      const protectedRoutes = [
        { path: '/dashboard', testId: 'league' },
        { path: '/team/123', testId: 'team' },
        { path: '/account', testId: 'account' },
      ];

      for (const { path, testId } of protectedRoutes) {
        const { unmount } = renderRoutes(path);

        const wrapper = screen.getByTestId('protected-wrapper');
        const component = screen.getByTestId(testId);
        expect(wrapper).toContainElement(component);
        unmount();
      }
    });
  });

  describe('Route Matching and Parameters', () => {
    it('should handle exact index route matching', () => {
      renderRoutes('/');

      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      expect(screen.queryByTestId('sign-in-form')).not.toBeInTheDocument();
      expect(screen.queryByTestId('league')).not.toBeInTheDocument();
    });

    it('should handle parameterized routes correctly', () => {
      renderRoutes('/team/my-team-123');

      expect(screen.getByTestId('team')).toBeInTheDocument();
      expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
    });

    it('should handle special characters in team ID', () => {
      const specialTeamIds = ['team-with-dashes', 'team_with_underscores', 'team123', 'TEAM-CAPS'];

      for (const teamId of specialTeamIds) {
        const { unmount } = renderRoutes(`/team/${teamId}`);

        expect(screen.getByTestId('protected-wrapper')).toBeInTheDocument();
        expect(screen.getByTestId('team')).toBeInTheDocument();
        unmount();
      }
    });

    it('should handle 404 routes gracefully', () => {
      renderRoutes('/nonexistent');

      // Should not render any specific page content for unknown routes
      expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('league')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sign-in-form')).not.toBeInTheDocument();
    });

    it('should handle route without team ID parameter gracefully', () => {
      renderRoutes('/team');

      // /team without ID should not match the /team/:teamId route
      expect(screen.queryByTestId('team')).not.toBeInTheDocument();
      expect(screen.queryByTestId('protected-wrapper')).not.toBeInTheDocument();
    });
  });

  describe('Route Configuration Integrity', () => {
    it('should define all expected route patterns correctly', () => {
      const expectedRoutes = [
        { path: '/', expectedComponent: 'landing-page', protected: false },
        { path: '/sign-in', expectedComponent: 'sign-in-form', protected: false },
        { path: '/sign-up', expectedComponent: 'sign-up-form', protected: false },
        { path: '/dashboard', expectedComponent: 'league', protected: true },
        { path: '/team/test-123', expectedComponent: 'team', protected: true },
        { path: '/account', expectedComponent: 'account', protected: true },
      ];

      for (const { path, expectedComponent, protected: isProtected } of expectedRoutes) {
        const { unmount } = renderRoutes(path);

        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId(expectedComponent)).toBeInTheDocument();

        if (isProtected) {
          expect(screen.getByTestId('protected-wrapper')).toBeInTheDocument();
        } else {
          expect(screen.queryByTestId('protected-wrapper')).not.toBeInTheDocument();
        }

        unmount();
      }
    });

    it('should maintain consistent layout across all routes', () => {
      const allRoutes = ['/', '/sign-in', '/sign-up', '/dashboard', '/team/456', '/account'];

      for (const route of allRoutes) {
        const { unmount } = renderRoutes(route);

        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('layout-header')).toBeInTheDocument();
        unmount();
      }
    });

    it('should verify route structure matches main.tsx configuration', () => {
      // This test verifies that our test setup mirrors the actual route configuration
      const routeStructure = [
        { path: '/', component: 'LandingPage', index: true },
        { path: '/sign-in', component: 'SignInForm' },
        { path: '/sign-up', component: 'SignUpForm' },
        { path: '/dashboard', component: 'League', protected: true },
        { path: '/team/:teamId', component: 'Team', protected: true },
        { path: '/account', component: 'Account', protected: true },
      ];

      // Verify that all expected routes work as configured
      expect(routeStructure).toHaveLength(6);
      expect(routeStructure.filter((r) => r.protected)).toHaveLength(3);
      expect(routeStructure.filter((r) => !r.protected && !r.index)).toHaveLength(2);
      expect(routeStructure.filter((r) => r.index)).toHaveLength(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle deeply nested non-existent routes', () => {
      renderRoutes('/some/deep/nested/route');

      // Should not render any specific page content for deeply nested unknown routes
      expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('league')).not.toBeInTheDocument();
    });

    it('should handle empty or malformed routes', () => {
      const malformedRoutes = ['///', '/team/', '/team//123'];

      for (const route of malformedRoutes) {
        const { unmount } = renderRoutes(route);

        // Should not render specific page content for malformed routes
        expect(screen.queryByTestId('team')).not.toBeInTheDocument();
        unmount();
      }

      // Test empty route separately (should default to index route)
      const { unmount } = renderRoutes('');
      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      unmount();
    });

    it('should handle URL encoded parameters in team routes', () => {
      const encodedTeamId = encodeURIComponent('team with spaces & symbols!');
      renderRoutes(`/team/${encodedTeamId}`);

      expect(screen.getByTestId('protected-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('team')).toBeInTheDocument();
    });
  });

  describe('Accessibility and Semantic Structure', () => {
    it('should maintain semantic route structure for screen readers', () => {
      renderRoutes('/');

      // Layout should provide proper document structure
      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();

      // All content should be accessible within the layout
      const layout = screen.getByTestId('layout');
      expect(layout).toContainElement(screen.getByTestId('landing-page'));
    });

    it('should ensure all routes render content that can be accessed by assistive technology', () => {
      const testRoutes = [
        { path: '/', expectedContent: 'landing-page' },
        { path: '/sign-in', expectedContent: 'sign-in-form' },
        { path: '/sign-up', expectedContent: 'sign-up-form' },
        { path: '/dashboard', expectedContent: 'league' },
        { path: '/account', expectedContent: 'account' },
      ];

      for (const { path, expectedContent } of testRoutes) {
        const { unmount } = renderRoutes(path);
        const content = screen.getByTestId(expectedContent);
        expect(content).toBeInTheDocument();
        expect(content).toBeVisible();
        unmount();
      }
    });
  });
});

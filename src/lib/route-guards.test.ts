import { requireAuth, requireNoTeam, requireTeam } from '@/lib/route-guards';
import type { RouterContext } from '@/lib/router-context';
import type { Session, User } from '@supabase/supabase-js';
import { redirect } from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';

// Mock the TanStack Router redirect function
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    redirect: vi.fn((options) => {
      const error = new Error('Redirect') as Error & { redirect: typeof options };
      error.redirect = options;
      return error;
    }),
  };
});

// Helper to create a mock user
const createMockUser = (): User => ({
  id: '123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
});

// Helper to create a mock session
const createMockSession = (): Session => ({
  access_token: 'mock-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock-refresh-token',
  user: createMockUser(),
});

describe('route-guards', () => {
  describe('requireAuth', () => {
    it('throws redirect when user is not authenticated', () => {
      const context: RouterContext = {
        auth: {
          user: null,
          session: null,
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: null,
          hasTeam: false,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      expect(() => requireAuth(context)).toThrow();
      expect(redirect).toHaveBeenCalledWith({
        to: '/',
        replace: true,
      });
    });

    it('does not throw when user is authenticated', () => {
      const context: RouterContext = {
        auth: {
          user: createMockUser(),
          session: createMockSession(),
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: null,
          hasTeam: false,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      expect(() => requireAuth(context)).not.toThrow();
    });

    it('does not throw when auth is loading', () => {
      const context: RouterContext = {
        auth: {
          user: null,
          session: null,
          loading: true,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: null,
          hasTeam: false,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      expect(() => requireAuth(context)).not.toThrow();
    });

    it('redirects to landing page with replace option', () => {
      const context: RouterContext = {
        auth: {
          user: null,
          session: null,
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: null,
          hasTeam: false,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      try {
        requireAuth(context);
      } catch (error) {
        expect((error as Error & { redirect: unknown }).redirect).toEqual({
          to: '/',
          replace: true,
        });
      }
    });
  });

  describe('requireTeam', () => {
    it('throws redirect when user does not have a team', () => {
      const context: RouterContext = {
        auth: {
          user: createMockUser(),
          session: createMockSession(),
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: null,
          hasTeam: false,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      expect(() => requireTeam(context)).toThrow();
      expect(redirect).toHaveBeenCalledWith({
        to: '/create-team',
        replace: true,
      });
    });

    it('does not throw when user has a team', () => {
      const context: RouterContext = {
        auth: {
          user: createMockUser(),
          session: createMockSession(),
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: 1,
          hasTeam: true,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      expect(() => requireTeam(context)).not.toThrow();
    });

    it('does not throw when auth is loading', () => {
      const context: RouterContext = {
        auth: {
          user: null,
          session: null,
          loading: true,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: null,
          hasTeam: false,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      expect(() => requireTeam(context)).not.toThrow();
    });

    it('does not throw when team is checking', () => {
      const context: RouterContext = {
        auth: {
          user: createMockUser(),
          session: createMockSession(),
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: null,
          hasTeam: false,
          isCheckingTeam: true,
          refreshMyTeam: vi.fn(),
        },
      };

      expect(() => requireTeam(context)).not.toThrow();
    });

    it('does not throw when user is not authenticated', () => {
      const context: RouterContext = {
        auth: {
          user: null,
          session: null,
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: null,
          hasTeam: false,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      // Should not throw because requireAuth should be called first
      expect(() => requireTeam(context)).not.toThrow();
    });

    it('redirects to create-team page with replace option', () => {
      const context: RouterContext = {
        auth: {
          user: createMockUser(),
          session: createMockSession(),
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: null,
          hasTeam: false,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      try {
        requireTeam(context);
      } catch (error) {
        expect((error as Error & { redirect: unknown }).redirect).toEqual({
          to: '/create-team',
          replace: true,
        });
      }
    });
  });

  describe('requireNoTeam', () => {
    it('throws redirect when user already has a team', () => {
      const context: RouterContext = {
        auth: {
          user: createMockUser(),
          session: createMockSession(),
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: 1,
          hasTeam: true,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      expect(() => requireNoTeam(context)).toThrow();
      expect(redirect).toHaveBeenCalledWith({
        to: '/leagues',
        replace: true,
      });
    });

    it('does not throw when user does not have a team', () => {
      const context: RouterContext = {
        auth: {
          user: createMockUser(),
          session: createMockSession(),
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: null,
          hasTeam: false,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      expect(() => requireNoTeam(context)).not.toThrow();
    });

    it('does not throw when auth is loading', () => {
      const context: RouterContext = {
        auth: {
          user: null,
          session: null,
          loading: true,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: 1,
          hasTeam: true,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      expect(() => requireNoTeam(context)).not.toThrow();
    });

    it('does not throw when team is checking', () => {
      const context: RouterContext = {
        auth: {
          user: createMockUser(),
          session: createMockSession(),
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: 1,
          hasTeam: true,
          isCheckingTeam: true,
          refreshMyTeam: vi.fn(),
        },
      };

      expect(() => requireNoTeam(context)).not.toThrow();
    });

    it('does not throw when user is not authenticated', () => {
      const context: RouterContext = {
        auth: {
          user: null,
          session: null,
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: 1,
          hasTeam: true,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      // Should not throw because requireAuth should be called first
      expect(() => requireNoTeam(context)).not.toThrow();
    });

    it('redirects to leagues page with replace option', () => {
      const context: RouterContext = {
        auth: {
          user: createMockUser(),
          session: createMockSession(),
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        team: {
          myTeamId: 1,
          hasTeam: true,
          isCheckingTeam: false,
          refreshMyTeam: vi.fn(),
        },
      };

      try {
        requireNoTeam(context);
      } catch (error) {
        expect((error as Error & { redirect: unknown }).redirect).toEqual({
          to: '/leagues',
          replace: true,
        });
      }
    });
  });
});

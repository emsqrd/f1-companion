import type { CreateProfileData } from '@/contracts/CreateProfileData';
import type { Session, User } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext, type AuthContextType } from './AuthContext';

describe('AuthContext', () => {
  describe('Context Creation', () => {
    it('should create a context', () => {
      expect(AuthContext).toBeDefined();
      expect(typeof AuthContext).toBe('object');
    });
  });

  describe('AuthContextType Interface', () => {
    it('should accept a complete AuthContextType object with user and session', () => {
      const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: mockUser,
      };

      const authContext: AuthContextType = {
        user: mockUser,
        session: mockSession,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      };

      // Verify the interface structure
      expect(authContext).toHaveProperty('user');
      expect(authContext).toHaveProperty('session');
      expect(authContext).toHaveProperty('loading');
      expect(authContext).toHaveProperty('signIn');
      expect(authContext).toHaveProperty('signUp');
      expect(authContext).toHaveProperty('signOut');
    });

    it('should accept null values for optional user and session properties', () => {
      const authContext: AuthContextType = {
        user: null,
        session: null,
        loading: true,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      };

      expect(authContext.user).toBeNull();
      expect(authContext.session).toBeNull();
      expect(authContext.loading).toBe(true);
    });

    it('should enforce required function properties', () => {
      const authContext: AuthContextType = {
        user: null,
        session: null,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      };

      expect(typeof authContext.signIn).toBe('function');
      expect(typeof authContext.signUp).toBe('function');
      expect(typeof authContext.signOut).toBe('function');
    });

    it('should enforce loading property as boolean', () => {
      const authContextLoading: AuthContextType = {
        user: null,
        session: null,
        loading: true,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      };

      const authContextNotLoading: AuthContextType = {
        user: null,
        session: null,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      };

      expect(typeof authContextLoading.loading).toBe('boolean');
      expect(typeof authContextNotLoading.loading).toBe('boolean');
      expect(authContextLoading.loading).toBe(true);
      expect(authContextNotLoading.loading).toBe(false);
    });
  });

  describe('Type Compatibility', () => {
    it('should be compatible with CreateProfileData interface', () => {
      const profileData: CreateProfileData = {
        displayName: 'Test User',
      };

      // This test ensures CreateProfileData can be used in signUp function
      const mockSignUp: AuthContextType['signUp'] = vi.fn();

      expect(() => {
        mockSignUp('email@test.com', 'password', profileData);
      }).not.toThrow();
    });

    it('should be compatible with Supabase User type', () => {
      const mockUser: User = {
        id: 'test-id',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const authContext: Pick<AuthContextType, 'user'> = {
        user: mockUser,
      };

      expect(authContext.user).toBe(mockUser);
    });

    it('should be compatible with Supabase Session type', () => {
      const mockSession: Session = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: {} as User,
      };

      const authContext: Pick<AuthContextType, 'session'> = {
        session: mockSession,
      };

      expect(authContext.session).toBe(mockSession);
    });
  });
});

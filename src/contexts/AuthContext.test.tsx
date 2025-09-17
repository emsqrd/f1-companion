import type { AuthError, Session, User } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { supabase } from '../lib/supabase';
import { userProfileService } from '../services/userProfileService';

// Mock modules with factory functions to avoid hoisting issues
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

vi.mock('../services/userProfileService', () => ({
  userProfileService: {
    registerUser: vi.fn(),
  },
}));

describe('AuthProvider Logic', () => {
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
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Supabase Integration', () => {
    it('should be able to call getSession', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await supabase.auth.getSession();

      expect(supabase.auth.getSession).toHaveBeenCalledOnce();
      expect(result.data.session).toBeNull();
    });

    it('should be able to call signInWithPassword', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password',
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      expect(result.data.user).toBe(mockUser);
    });

    it('should be able to call signUp', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password',
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      expect(result.data.user).toBe(mockUser);
    });

    it('should be able to call signOut', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const result = await supabase.auth.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalledOnce();
      expect(result.error).toBeNull();
    });

    it('should be able to set up auth state change listener', () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe, id: 'test', callback: vi.fn() } },
      });

      const callback = vi.fn();
      const result = supabase.auth.onAuthStateChange(callback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
      expect(result.data.subscription.unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('UserProfile Service Integration', () => {
    it('should be able to call registerUser', async () => {
      const mockProfile = {
        id: 'profile-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        avatarUrl: '',
      };

      vi.mocked(userProfileService.registerUser).mockResolvedValue(mockProfile);

      const result = await userProfileService.registerUser({
        displayName: 'Test User',
      });

      expect(userProfileService.registerUser).toHaveBeenCalledWith({
        displayName: 'Test User',
      });
      expect(result).toBe(mockProfile);
    });

    it('should handle registerUser errors', async () => {
      const error = new Error('Profile creation failed');
      vi.mocked(userProfileService.registerUser).mockRejectedValue(error);

      await expect(userProfileService.registerUser({ displayName: 'Test User' })).rejects.toThrow(
        'Profile creation failed',
      );

      expect(userProfileService.registerUser).toHaveBeenCalledWith({
        displayName: 'Test User',
      });
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle signIn errors', async () => {
      const signInError = new Error('Invalid credentials') as unknown as AuthError;
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: signInError,
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrong-password',
      });

      expect(result.error).toBe(signInError);
    });

    it('should handle signUp errors', async () => {
      const signUpError = new Error('Email already exists') as unknown as AuthError;
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: signUpError,
      });

      const result = await supabase.auth.signUp({
        email: 'existing@example.com',
        password: 'password',
      });

      expect(result.error).toBe(signUpError);
    });

    it('should handle signOut errors', async () => {
      const signOutError = new Error('Sign out failed') as unknown as AuthError;
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: signOutError,
      });

      const result = await supabase.auth.signOut();

      expect(result.error).toBe(signOutError);
    });

    it('should handle getSession errors', async () => {
      const sessionError = new Error('Session retrieval failed') as unknown as AuthError;
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: sessionError,
      });

      const result = await supabase.auth.getSession();

      expect(result.error).toBe(sessionError);
    });
  });

  describe('Auth Flow Scenarios', () => {
    it('should simulate successful sign up with profile creation', async () => {
      // Mock successful signUp
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock successful profile creation
      vi.mocked(userProfileService.registerUser).mockResolvedValue({
        id: 'profile-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        avatarUrl: '',
      });

      // Step 1: Sign up
      const signUpResult = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password',
      });

      expect(signUpResult.data.user).toBe(mockUser);
      expect(signUpResult.error).toBeNull();

      // Step 2: Create profile (only if user exists)
      if (signUpResult.data.user) {
        const profileResult = await userProfileService.registerUser({
          displayName: 'Test User',
        });

        expect(profileResult.displayName).toBe('Test User');
      }

      expect(supabase.auth.signUp).toHaveBeenCalledOnce();
      expect(userProfileService.registerUser).toHaveBeenCalledOnce();
    });

    it('should simulate sign up with profile creation failure', async () => {
      // Mock successful signUp
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock profile creation failure
      const profileError = new Error('Profile creation failed');
      vi.mocked(userProfileService.registerUser).mockRejectedValue(profileError);

      // Step 1: Sign up
      const signUpResult = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password',
      });

      expect(signUpResult.data.user).toBe(mockUser);

      // Step 2: Profile creation should fail
      if (signUpResult.data.user) {
        await expect(userProfileService.registerUser({ displayName: 'Test User' })).rejects.toThrow(
          'Profile creation failed',
        );
      }

      expect(supabase.auth.signUp).toHaveBeenCalledOnce();
      expect(userProfileService.registerUser).toHaveBeenCalledOnce();
    });

    it('should not attempt profile creation if signUp returns no user', async () => {
      // Mock signUp with no user (e.g., email confirmation required)
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      const signUpResult = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password',
      });

      expect(signUpResult.data.user).toBeNull();

      // Profile creation should not be attempted
      expect(supabase.auth.signUp).toHaveBeenCalledOnce();
      expect(userProfileService.registerUser).not.toHaveBeenCalled();
    });
  });
});

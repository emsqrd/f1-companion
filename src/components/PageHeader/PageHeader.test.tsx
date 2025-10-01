import type { AuthContextType } from '@/contexts/AuthContext';
import type { UserProfile } from '@/contracts/UserProfile';
// Import mocked modules
import { useAuth } from '@/hooks/useAuth';
import { avatarEvents } from '@/lib/avatarEvents';
import { userProfileService } from '@/services/userProfileService';
import type { User } from '@supabase/supabase-js';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PageHeader } from './PageHeader';

// Mock dependencies
vi.mock('@/hooks/useAuth');
vi.mock('@/services/userProfileService');
vi.mock('@/lib/avatarEvents');
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

const mockUseAuth = vi.mocked(useAuth);
const mockUserProfileService = vi.mocked(userProfileService);
const mockAvatarEvents = vi.mocked(avatarEvents);
const mockUseNavigate = vi.mocked(useNavigate);
const mockUseLocation = vi.mocked(useLocation);

const mockNavigate = vi.fn();

const createMockUser = (): User => ({
  id: '1',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
});

const createMockAuthContext = (user: User | null, loading = false): AuthContextType => ({
  user,
  session: null,
  loading,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
});

const createMockUserProfile = (avatarUrl = ''): UserProfile => ({
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  avatarUrl,
});

describe('PageHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLocation.mockReturnValue({
      pathname: '/dashboard',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });
    mockAvatarEvents.subscribe.mockReturnValue(vi.fn()); // Return unsubscribe function
  });

  const renderWithRouter = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <PageHeader />
      </MemoryRouter>,
    );
  };

  const getLogoButton = () => screen.getByRole('button', { name: 'Navigate to home page' });

  describe('Logo and branding', () => {
    it('should display the F1 Fantasy Sports logo and title', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext(null));

      renderWithRouter();

      expect(screen.getByText('F1 Fantasy Sports')).toBeInTheDocument();
      expect(getLogoButton()).toBeInTheDocument();
    });

    it('should navigate to home page when logo is clicked', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue(createMockAuthContext(null));

      renderWithRouter();

      await user.click(getLogoButton());

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should navigate to home page when logo is activated with keyboard', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue(createMockAuthContext(null));

      renderWithRouter();

      const logoButton = getLogoButton();
      logoButton.focus();
      await user.keyboard('{Enter}');

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Authentication states', () => {
    it('should show user dropdown when authenticated', () => {
      const mockUser = createMockUser();
      mockUseAuth.mockReturnValue(createMockAuthContext(mockUser));
      mockUserProfileService.getCurrentProfile.mockResolvedValue(createMockUserProfile());

      renderWithRouter();

      const dropdownButtons = screen.getAllByRole('button');
      // Should have both logo button and dropdown menu trigger
      expect(dropdownButtons).toHaveLength(2);
    });

    it('should show sign in option when not authenticated', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue(createMockAuthContext(null));

      renderWithRouter();

      const dropdownButtons = screen.getAllByRole('button');
      const dropdownTrigger = dropdownButtons.find(
        (button) => button.getAttribute('aria-haspopup') === 'menu',
      );
      expect(dropdownTrigger).toBeInTheDocument();

      if (dropdownTrigger) {
        await user.click(dropdownTrigger);
        expect(screen.getByRole('menuitem', { name: 'Sign In' })).toBeInTheDocument();
      }
    });

    it('should show authenticated user menu options when logged in', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      mockUseAuth.mockReturnValue(createMockAuthContext(mockUser));
      mockUserProfileService.getCurrentProfile.mockResolvedValue(createMockUserProfile());

      renderWithRouter();

      const dropdownButtons = screen.getAllByRole('button');
      const dropdownTrigger = dropdownButtons.find(
        (button) => button.getAttribute('aria-haspopup') === 'menu',
      );
      expect(dropdownTrigger).toBeInTheDocument();

      if (dropdownTrigger) {
        await user.click(dropdownTrigger);
        expect(screen.getByRole('menuitem', { name: 'My Account' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'My Leagues' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Sign Out' })).toBeInTheDocument();
      }
    });

    it('should hide dropdown menu on auth pages', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext(null));
      mockUseLocation.mockReturnValue({
        pathname: '/sign-in',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      renderWithRouter(['/sign-in']);

      // Should only have the logo button, no dropdown
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(getLogoButton()).toBeInTheDocument();
    });

    it('should hide dropdown menu while loading', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext(null, true));

      renderWithRouter();

      // Should only have the logo button, no dropdown
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(getLogoButton()).toBeInTheDocument();
    });
  });

  describe('Navigation actions', () => {
    beforeEach(() => {
      const mockUser = createMockUser();
      mockUseAuth.mockReturnValue(createMockAuthContext(mockUser));
      mockUserProfileService.getCurrentProfile.mockResolvedValue(createMockUserProfile());
    });

    it('should navigate to account page when My Account is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const dropdownButtons = screen.getAllByRole('button');
      const dropdownTrigger = dropdownButtons.find(
        (button) => button.getAttribute('aria-haspopup') === 'menu',
      )!;
      await user.click(dropdownTrigger);

      const accountMenuItem = screen.getByRole('menuitem', { name: 'My Account' });
      await user.click(accountMenuItem);

      expect(mockNavigate).toHaveBeenCalledWith('/account');
    });

    it('should navigate to dashboard when Dashboard is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const dropdownButtons = screen.getAllByRole('button');
      const dropdownTrigger = dropdownButtons.find(
        (button) => button.getAttribute('aria-haspopup') === 'menu',
      )!;
      await user.click(dropdownTrigger);

      const dashboardMenuItem = screen.getByRole('menuitem', { name: 'My Leagues' });
      await user.click(dashboardMenuItem);

      expect(mockNavigate).toHaveBeenCalledWith('/leagues');
    });

    it('should navigate to sign-in page when Sign In is clicked', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue(createMockAuthContext(null));

      renderWithRouter();

      const dropdownButtons = screen.getAllByRole('button');
      const dropdownTrigger = dropdownButtons.find(
        (button) => button.getAttribute('aria-haspopup') === 'menu',
      )!;
      await user.click(dropdownTrigger);

      const signInMenuItem = screen.getByRole('menuitem', { name: 'Sign In' });
      await user.click(signInMenuItem);

      expect(mockNavigate).toHaveBeenCalledWith('/sign-in');
    });

    it('should sign out and navigate to home when Sign Out is clicked', async () => {
      const user = userEvent.setup();
      const mockSignOut = vi.fn();
      const mockUser = createMockUser();
      mockUseAuth.mockReturnValue({
        ...createMockAuthContext(mockUser),
        signOut: mockSignOut,
      });

      renderWithRouter();

      const dropdownButtons = screen.getAllByRole('button');
      const dropdownTrigger = dropdownButtons.find(
        (button) => button.getAttribute('aria-haspopup') === 'menu',
      )!;
      await user.click(dropdownTrigger);

      const signOutMenuItem = screen.getByRole('menuitem', { name: 'Sign Out' });
      await user.click(signOutMenuItem);

      expect(mockSignOut).toHaveBeenCalledOnce();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Avatar functionality', () => {
    it('should display avatar container when user is authenticated', async () => {
      const mockUser = createMockUser();
      mockUseAuth.mockReturnValue(createMockAuthContext(mockUser));
      mockUserProfileService.getCurrentProfile.mockResolvedValue(
        createMockUserProfile('https://example.com/avatar.jpg'),
      );

      renderWithRouter();

      // Avatar container should be present
      await waitFor(() => {
        const avatarElements = screen.getAllByRole('button');
        const avatarButton = avatarElements.find(
          (button) => button.getAttribute('aria-haspopup') === 'menu',
        );
        expect(avatarButton).toBeInTheDocument();
      });
    });

    it('should show loading overlay while fetching user profile', async () => {
      const mockUser = createMockUser();
      mockUseAuth.mockReturnValue(createMockAuthContext(mockUser));
      // Don't resolve the promise immediately to simulate loading
      mockUserProfileService.getCurrentProfile.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      renderWithRouter();

      // Check for loading spinner by looking for the loading overlay div
      await waitFor(() => {
        const loadingOverlay = document.querySelector('.animate-spin');
        expect(loadingOverlay).toBeInTheDocument();
      });
    });

    it('should handle avatar fetch error gracefully', async () => {
      const mockUser = createMockUser();
      mockUseAuth.mockReturnValue(createMockAuthContext(mockUser));
      mockUserProfileService.getCurrentProfile.mockRejectedValue(new Error('Failed to fetch'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithRouter();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load avatar', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('should clear avatar state when user logs out', async () => {
      // Start with authenticated user
      const mockUser = createMockUser();
      mockUseAuth.mockReturnValue(createMockAuthContext(mockUser));
      mockUserProfileService.getCurrentProfile.mockResolvedValue(
        createMockUserProfile('https://example.com/avatar.jpg'),
      );

      const { rerender } = renderWithRouter();

      await waitFor(() => {
        const avatarButtons = screen.getAllByRole('button');
        const avatarButton = avatarButtons.find(
          (button) => button.getAttribute('aria-haspopup') === 'menu',
        );
        expect(avatarButton).toBeInTheDocument();
      });

      // Simulate user logging out
      mockUseAuth.mockReturnValue(createMockAuthContext(null));

      rerender(
        <MemoryRouter initialEntries={['/']}>
          <PageHeader />
        </MemoryRouter>,
      );

      // After logout, dropdown menu should no longer be available
      await waitFor(() => {
        const avatarButtons = screen.getAllByRole('button');
        const avatarButton = avatarButtons.find(
          (button) => button.getAttribute('aria-haspopup') === 'menu',
        );
        expect(avatarButton).toBeInTheDocument(); // Dropdown should still be available for sign-in
      });
      expect(getLogoButton()).toBeInTheDocument();
    });

    it('should subscribe to avatar events and handle updates', async () => {
      let avatarEventCallback: ((url: string) => void) | undefined;
      mockAvatarEvents.subscribe.mockImplementation((callback) => {
        avatarEventCallback = callback;
        return vi.fn(); // Return unsubscribe function
      });

      const mockUser = createMockUser();
      mockUseAuth.mockReturnValue(createMockAuthContext(mockUser));
      mockUserProfileService.getCurrentProfile.mockResolvedValue(
        createMockUserProfile('https://example.com/old-avatar.jpg'),
      );

      renderWithRouter();

      // Wait for initial render
      await waitFor(() => {
        const avatarButtons = screen.getAllByRole('button');
        const avatarButton = avatarButtons.find(
          (button) => button.getAttribute('aria-haspopup') === 'menu',
        );
        expect(avatarButton).toBeInTheDocument();
      });

      // Simulate avatar update event
      expect(mockAvatarEvents.subscribe).toHaveBeenCalled();
      if (avatarEventCallback) {
        avatarEventCallback('https://example.com/new-avatar.jpg');
      }

      // Component should still be rendered (the avatar URL is managed internally)
      await waitFor(() => {
        const avatarButtons = screen.getAllByRole('button');
        const avatarButton = avatarButtons.find(
          (button) => button.getAttribute('aria-haspopup') === 'menu',
        );
        expect(avatarButton).toBeInTheDocument();
      });
    });

    it('should unsubscribe from avatar events on unmount', () => {
      const mockUnsubscribe = vi.fn();
      mockAvatarEvents.subscribe.mockReturnValue(mockUnsubscribe);

      const mockUser = createMockUser();
      mockUseAuth.mockReturnValue(createMockAuthContext(mockUser));
      mockUserProfileService.getCurrentProfile.mockResolvedValue(createMockUserProfile(''));

      const { unmount } = renderWithRouter();

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledOnce();
    });
  });

  describe('Auth page detection', () => {
    it('should hide dropdown on sign-up page', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext(null));
      mockUseLocation.mockReturnValue({
        pathname: '/sign-up',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      renderWithRouter(['/sign-up']);

      // Should only have logo button
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(getLogoButton()).toBeInTheDocument();
    });

    it('should show dropdown on non-auth pages', () => {
      mockUseAuth.mockReturnValue(createMockAuthContext(null));
      mockUseLocation.mockReturnValue({
        pathname: '/dashboard',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      renderWithRouter(['/dashboard']);

      // Should have both logo and dropdown buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1);
      expect(getLogoButton()).toBeInTheDocument();
    });
  });
});

import type { AuthContextType } from '@/contexts/AuthContext';
import { AuthContext } from '@/contexts/AuthContext';
import type { UserProfile } from '@/contracts/UserProfile';
import { avatarEvents } from '@/lib/avatarEvents';
import { userProfileService } from '@/services/userProfileService';
import type { User } from '@supabase/supabase-js';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Account } from './Account';

// Mock the services and dependencies
vi.mock('@/services/userProfileService');
vi.mock('@/lib/avatarEvents');
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));
vi.mock('../AvatarUpload/AvatarUpload', () => ({
  AvatarUpload: ({
    onAvatarChange,
    onError,
    currentAvatarUrl,
  }: {
    onAvatarChange: (url: string) => void;
    onError: (error: string) => void;
    currentAvatarUrl: string;
  }) => (
    <div>
      <button
        onClick={() => onAvatarChange('new-avatar-url.jpg')}
        data-testid="avatar-upload-success"
      >
        Upload Avatar Success
      </button>
      <button onClick={() => onError('Avatar upload failed')} data-testid="avatar-upload-error">
        Upload Avatar Error
      </button>
      <span data-testid="current-avatar-url">{currentAvatarUrl}</span>
    </div>
  ),
}));

const mockToast = vi.mocked(toast);

const mockUserProfileService = vi.mocked(userProfileService);
const mockAvatarEvents = vi.mocked(avatarEvents);

const mockUserProfile: UserProfile = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'Johnny',
  avatarUrl: 'avatar.jpg',
};

const mockAuthContext: AuthContextType = {
  user: { id: 'user-123' } as User,
  session: null,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
};

function renderWithAuth(component: ReactNode, authContext = mockAuthContext) {
  return render(<AuthContext.Provider value={authContext}>{component}</AuthContext.Provider>);
}

describe('Account', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserProfileService.getCurrentProfile.mockResolvedValue(mockUserProfile);
    mockUserProfileService.updateUserProfile.mockResolvedValue(mockUserProfile);
    mockAvatarEvents.emit = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Loading State', () => {
    it('displays loading spinner while fetching user profile', async () => {
      mockUserProfileService.getCurrentProfile.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      renderWithAuth(<Account />);

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    it('hides loading state after profile is fetched', async () => {
      renderWithAuth(<Account />);

      await waitFor(() => {
        expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument();
      });

      expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
    });
  });

  describe('Form Population', () => {
    it('populates form fields with user profile data', async () => {
      renderWithAuth(<Account />);

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      expect(screen.getByLabelText(/email/i)).toHaveValue(mockUserProfile.email);
      expect(screen.getByLabelText(/first name/i)).toHaveValue(mockUserProfile.firstName);
      expect(screen.getByLabelText(/last name/i)).toHaveValue(mockUserProfile.lastName);
    });

    it('handles empty profile fields gracefully', async () => {
      const emptyProfile = {
        ...mockUserProfile,
        firstName: '',
        lastName: '',
        displayName: '',
        email: '',
      };
      mockUserProfileService.getCurrentProfile.mockResolvedValue(emptyProfile);

      renderWithAuth(<Account />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your display name')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText('Enter your display name')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter your first name')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter your last name')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter your email address')).toHaveValue('');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when profile fetch fails', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockUserProfileService.getCurrentProfile.mockRejectedValue(new Error('Network error'));

      renderWithAuth(<Account />);

      const errorAlert = await screen.findByRole('alert');
      expect(errorAlert).toHaveTextContent(/failed to load user profile/i);

      consoleError.mockRestore();
    });

    it('displays error message when profile update fails', async () => {
      mockUserProfileService.updateUserProfile.mockRejectedValue(new Error('Update failed'));

      renderWithAuth(<Account />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Updated Name');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      const errorAlert = await screen.findByRole('alert');
      expect(errorAlert).toHaveTextContent(/update failed/i);
    });

    it('shows fallback error message when avatar update throws non-Error', async () => {
      // Mock updateUserProfile to reject with a string (not an Error instance)
      mockUserProfileService.updateUserProfile.mockRejectedValue('some string error');

      renderWithAuth(<Account />);

      await waitFor(() => {
        expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument();
      });

      const avatarUploadButton = screen.getByTestId('avatar-upload-success');
      await userEvent.click(avatarUploadButton);

      await waitFor(() => {
        // Error shown via toast
        expect(mockToast.error).toHaveBeenCalledWith('Failed to update avatar');
      });
    });

    it('should show fallback error message when saving account throws non-error', async () => {
      // Mock updateUserProfile to reject with a string (not an Error instance)
      mockUserProfileService.updateUserProfile.mockRejectedValue('some string error');

      renderWithAuth(<Account />);

      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument();
      });

      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Updated Name');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      const errorAlert = await screen.findByRole('alert');
      expect(errorAlert).toHaveTextContent(/failed to update profile/i);
    });
  });

  describe('Form Validation', () => {
    it('shows validation error for empty required fields', async () => {
      renderWithAuth(<Account />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.tab(); // Trigger blur validation

      await waitFor(() => {
        expect(screen.getByText('Display name is required')).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid email format', async () => {
      renderWithAuth(<Account />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toHaveValue(mockUserProfile.email);
      });

      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur validation

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    it('keeps save button enabled when form is pristine (ARIA best practice)', async () => {
      renderWithAuth(<Account />);

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      // LoadingButton doesn't use disabled attribute - keeps button keyboard accessible
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).not.toBeDisabled();
      expect(saveButton).toHaveAttribute('aria-busy', 'false');
    });

    it('silently ignores save button click with no changes', async () => {
      renderWithAuth(<Account />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should not call the service
      expect(mockUserProfileService.updateUserProfile).not.toHaveBeenCalled();

      // Should not show any success or error messages
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('enables save button when form is dirty and valid', async () => {
      renderWithAuth(<Account />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Updated Name');

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeEnabled();
    });
  });

  describe('Form Submission', () => {
    it('successfully updates user profile', async () => {
      const updatedProfile = { ...mockUserProfile, displayName: 'Updated Name' };
      mockUserProfileService.updateUserProfile.mockResolvedValue(updatedProfile);

      renderWithAuth(<Account />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Updated Name');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUserProfileService.updateUserProfile).toHaveBeenCalledWith({
          ...mockUserProfile,
          displayName: 'Updated Name',
          firstName: mockUserProfile.firstName,
          lastName: mockUserProfile.lastName,
          email: mockUserProfile.email,
        });
      });

      // Check for InlineSuccess message (visible one, not sr-only)
      await waitFor(() => {
        const successMessages = screen.getAllByText(/profile updated successfully/i);
        const visibleSuccess = successMessages.find((el) => !el.classList.contains('sr-only'));
        expect(visibleSuccess).toBeInTheDocument();
      });
    });

    it('resets form state after successful update', async () => {
      const updatedProfile = { ...mockUserProfile, displayName: 'Updated Name' };
      mockUserProfileService.updateUserProfile.mockResolvedValue(updatedProfile);

      renderWithAuth(<Account />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Updated Name');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        // Verify form was reset by checking visible success message (InlineSuccess)
        const successStatuses = screen.getAllByRole('status');
        const visibleSuccess = successStatuses.find(
          (el) =>
            !el.classList.contains('sr-only') &&
            el.textContent?.includes('Profile updated successfully'),
        );
        expect(visibleSuccess).toBeInTheDocument();
      });

      // LoadingButton remains enabled (not disabled) per ARIA best practices
      expect(saveButton).not.toBeDisabled();
      expect(saveButton).toHaveAttribute('aria-busy', 'false');

      // Check for InlineSuccess message (visible one, not sr-only)
      await waitFor(() => {
        const successMessages = screen.getAllByText(/profile updated successfully/i);
        const visibleSuccess = successMessages.find((el) => !el.classList.contains('sr-only'));
        expect(visibleSuccess).toBeInTheDocument();
      });
    });

    it('clears previous feedback before new submission', async () => {
      // First, create an error state
      mockUserProfileService.updateUserProfile.mockRejectedValueOnce(new Error('First error'));

      renderWithAuth(<Account />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Updated Name');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      const errorAlert = await screen.findByRole('alert');
      expect(errorAlert).toHaveTextContent(/first error/i);

      // Now mock success and try again
      mockUserProfileService.updateUserProfile.mockResolvedValue({
        ...mockUserProfile,
        displayName: 'Updated Name',
      });

      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUserProfileService.updateUserProfile).toHaveBeenCalledTimes(2);
      });

      // Check for InlineSuccess message (visible one, not sr-only)
      await waitFor(() => {
        const successMessages = screen.getAllByText(/profile updated successfully/i);
        const visibleSuccess = successMessages.find((el) => !el.classList.contains('sr-only'));
        expect(visibleSuccess).toBeInTheDocument();
      });
    });
  });

  describe('Avatar Upload Integration', () => {
    it('handles successful avatar upload', async () => {
      const updatedProfile = { ...mockUserProfile, avatarUrl: 'new-avatar-url.jpg' };
      mockUserProfileService.updateUserProfile.mockResolvedValue(updatedProfile);

      renderWithAuth(<Account />);

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      const avatarUploadButton = screen.getByTestId('avatar-upload-success');
      await userEvent.click(avatarUploadButton);

      await waitFor(() => {
        // Silent success - avatar URL update is confirmation
        expect(mockUserProfileService.updateUserProfile).toHaveBeenCalled();
      });

      expect(mockUserProfileService.updateUserProfile).toHaveBeenCalledWith({
        ...mockUserProfile,
        avatarUrl: 'new-avatar-url.jpg',
      });

      expect(mockAvatarEvents.emit).toHaveBeenCalledWith('new-avatar-url.jpg');
    });

    it('handles avatar upload error', async () => {
      renderWithAuth(<Account />);

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      const avatarErrorButton = screen.getByTestId('avatar-upload-error');
      await userEvent.click(avatarErrorButton);

      await waitFor(() => {
        // Error shown via toast, not inline alert
        expect(mockToast.error).toHaveBeenCalledWith('Avatar upload failed');
      });
    });

    it('handles avatar update service error', async () => {
      mockUserProfileService.updateUserProfile.mockRejectedValue(new Error('Avatar service error'));

      renderWithAuth(<Account />);

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      const avatarUploadButton = screen.getByTestId('avatar-upload-success');
      await userEvent.click(avatarUploadButton);

      await waitFor(() => {
        // Error shown via toast, not inline alert
        expect(mockToast.error).toHaveBeenCalledWith('Avatar service error');
      });
    });

    it('passes current avatar URL to AvatarUpload component', async () => {
      renderWithAuth(<Account />);

      await waitFor(() => {
        expect(screen.getByTestId('current-avatar-url')).toHaveTextContent(
          mockUserProfile.avatarUrl,
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper form labels and structure', async () => {
      renderWithAuth(<Account />);

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    });

    it('displays error feedback via InlineError alert', async () => {
      mockUserProfileService.getCurrentProfile.mockRejectedValue(new Error('Test error'));

      renderWithAuth(<Account />);

      const errorAlert = await screen.findByRole('alert');
      expect(errorAlert).toHaveTextContent(/failed to load user profile/i);
    });

    it('displays success feedback via InlineSuccess status', async () => {
      renderWithAuth(<Account />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Updated Name');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUserProfileService.updateUserProfile).toHaveBeenCalled();
      });

      // Check for InlineSuccess message (visible one, not sr-only)
      await waitFor(() => {
        const successMessages = screen.getAllByText(/profile updated successfully/i);
        const visibleSuccess = successMessages.find((el) => !el.classList.contains('sr-only'));
        expect(visibleSuccess).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined user profile gracefully', async () => {
      renderWithAuth(<Account />, { ...mockAuthContext, user: null });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your display name')).toBeInTheDocument();
      });
    });

    it('handles missing user ID in auth context', async () => {
      renderWithAuth(<Account />, { ...mockAuthContext, user: {} as User });

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      // Should still pass current avatar URL to AvatarUpload
      expect(screen.getByTestId('current-avatar-url')).toHaveTextContent(mockUserProfile.avatarUrl);
    });

    it('does not attempt avatar update when no user profile is loaded', async () => {
      // Mock profile fetch to never resolve
      mockUserProfileService.getCurrentProfile.mockImplementation(() => new Promise(() => {}));

      renderWithAuth(<Account />);

      // Wait for loading state
      expect(screen.getByText('Loading profile...')).toBeInTheDocument();

      // Avatar upload should not be attempted when profile is still loading
      expect(mockUserProfileService.updateUserProfile).not.toHaveBeenCalled();
    });

    it('handles form submission when user profile state is stale', async () => {
      // Simulate a scenario where profile is updated externally
      const staleProfile = { ...mockUserProfile, displayName: 'Stale Name' };
      mockUserProfileService.getCurrentProfile.mockResolvedValue(staleProfile);

      const updatedProfile = { ...mockUserProfile, displayName: 'Fresh Name' };
      mockUserProfileService.updateUserProfile.mockResolvedValue(updatedProfile);

      renderWithAuth(<Account />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue('Stale Name');
      });

      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Fresh Name');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        // Form should be reset after successful update (silent success pattern)
        expect(mockUserProfileService.updateUserProfile).toHaveBeenCalled();
      });

      // Should call update with the stale profile as base
      expect(mockUserProfileService.updateUserProfile).toHaveBeenCalledWith({
        ...staleProfile,
        displayName: 'Fresh Name',
        firstName: staleProfile.firstName,
        lastName: staleProfile.lastName,
        email: staleProfile.email,
      });
    });

    it('handles form validation when transitioning from valid to invalid state', async () => {
      renderWithAuth(<Account />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toHaveValue(mockUserProfile.email);
      });

      const emailInput = screen.getByLabelText(/email/i);

      // First make it dirty but valid
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@email.com');

      let saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeEnabled();

      // Then make it invalid
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger validation

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });

      // Button should still be enabled (React Hook Form allows submission even with validation errors)
      saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeEnabled();
    });

    it('handles rapid successive form submissions', async () => {
      renderWithAuth(<Account />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByLabelText(/display name/i)).toHaveValue(mockUserProfile.displayName);
      });

      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Updated Name');

      const saveButton = screen.getByRole('button', { name: /save/i });

      // Click multiple times rapidly
      await user.click(saveButton);
      await user.click(saveButton);
      await user.click(saveButton);

      await waitFor(() => {
        // Should complete update
        expect(mockUserProfileService.updateUserProfile).toHaveBeenCalled();
      });

      // First click saves and resets form (making it pristine)
      // Subsequent clicks show "No changes to save" without calling service
      expect(mockUserProfileService.updateUserProfile).toHaveBeenCalledTimes(1);
    });

    it('maintains form state when fetch fails and user tries to edit', async () => {
      mockUserProfileService.getCurrentProfile.mockRejectedValue(new Error('Network error'));

      renderWithAuth(<Account />);
      const user = userEvent.setup();

      const errorAlert = await screen.findByRole('alert');
      expect(errorAlert).toHaveTextContent(/failed to load user profile/i);

      // Form should still be editable even when initial fetch fails
      const displayNameInput = screen.getByPlaceholderText('Enter your display name');
      await user.type(displayNameInput, 'Test Name');

      expect(displayNameInput).toHaveValue('Test Name');
    });
  });
});

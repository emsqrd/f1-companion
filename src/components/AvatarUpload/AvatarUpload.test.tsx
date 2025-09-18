import * as UseAvatarUploadModule from '@/hooks/useAvatarUpload';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvatarUpload } from './AvatarUpload';

vi.mock('@/hooks/useAvatarUpload');

type UploadState = { uploading: boolean; error: string | null; progress: number };

/**
 * Mock the hook at the import boundary and allow tests to trigger the
 * onSuccess/onError flow by calling the captured callbacks.
 */
// Module-level holder for last hook options so tests can call onSuccess/onError
let lastUseAvatarOptions:
  | { onSuccess?: (url: string) => void; onError?: (err: string) => void }
  | undefined;

const setupHookMock = ({
  uploadState = { uploading: false, error: null, progress: 0 },
}: {
  uploadState?: UploadState;
} = {}) => {
  const uploadAvatar = vi.fn(async (_: File) => undefined as string | undefined);
  const resetError = vi.fn();

  vi.spyOn(UseAvatarUploadModule, 'useAvatarUpload').mockImplementation(
    (
      options:
        | {
            onSuccess?: (url: string) => void;
            onError?: (err: string) => void;
          }
        | undefined,
    ) => {
      lastUseAvatarOptions = options;
      return { uploadState, uploadAvatar, resetError };
    },
  );

  return { uploadAvatar, resetError };
};

// Helper to create an Image mock that supports both onload/onerror and
// addEventListener/removeEventListener so libraries that attach listeners
// work correctly in tests. `shouldLoad` controls whether setting `src`
// triggers load or error.
const createImageMock = (shouldLoad = true) =>
  vi.fn().mockImplementation(() => {
    const listeners: Record<string, Array<() => void>> = {};
    const inst: { onload?: (() => void) | null; onerror?: (() => void) | null } & {
      addEventListener: (event: string, fn: () => void) => void;
      removeEventListener: (event: string, fn: () => void) => void;
    } = {
      onload: null,
      onerror: null,
      addEventListener: (event: string, fn: () => void) => {
        listeners[event] = listeners[event] || [];
        listeners[event].push(fn);
      },
      removeEventListener: (event: string, fn: () => void) => {
        listeners[event] = (listeners[event] || []).filter((f) => f !== fn);
      },
    };

    Object.defineProperty(inst, 'src', {
      set() {
        // simulate async image load/error
        Promise.resolve().then(() => {
          if (shouldLoad) {
            inst.onload?.();
            (listeners['load'] || []).forEach((fn) => fn());
          } else {
            inst.onerror?.();
            (listeners['error'] || []).forEach((fn) => fn());
          }
        });
      },
    });

    return inst as unknown as HTMLImageElement;
  });

describe('AvatarUpload (behavior-driven)', () => {
  const userId = 'user-123';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders change button and fallback when no avatar', () => {
    setupHookMock();
    render(<AvatarUpload userId={userId} onAvatarChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /change avatar/i })).toBeInTheDocument();
    // fallback SVG should be present when no avatar src (implementation detail: lucide icon)
    expect(document.querySelector('svg')).toBeTruthy();
  });

  // Note: The deterministic test that verifies image preloading uses an
  // Image mock below to ensure consistent behavior across test environments.

  it('shows loading state while uploading', () => {
    setupHookMock({ uploadState: { uploading: true, error: null, progress: 0 } });
    render(<AvatarUpload userId={userId} onAvatarChange={vi.fn()} />);

    // button is disabled while uploading
    expect(screen.getByRole('button', { name: /change avatar/i })).toBeDisabled();
    // spinner visible (implementation: has animate-spin class)
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders error from uploadState', () => {
    setupHookMock({ uploadState: { uploading: false, error: 'Upload failed', progress: 0 } });
    render(<AvatarUpload userId={userId} onAvatarChange={vi.fn()} />);

    expect(screen.getByText('Upload failed')).toBeInTheDocument();
  });

  it('shows error when image fails to load after upload (user-observable)', async () => {
    const uploadedUrl = 'https://example.com/bad.png';

    // capture the hook options so we can invoke onSuccess
    setupHookMock();

    // Mock Image to immediately call onerror when src is set
    const originalImage = window.Image;
    const ImageMock = createImageMock(false);
    Object.defineProperty(window, 'Image', {
      configurable: true,
      writable: true,
      value: ImageMock,
    });

    try {
      const onError = vi.fn();
      const user = userEvent.setup();
      render(<AvatarUpload userId={userId} onAvatarChange={vi.fn()} onError={onError} />);

      const input = screen.getByLabelText(/upload avatar image/i) as HTMLInputElement;
      const file = new File(['x'], 'avatar.png', { type: 'image/png' });
      await user.upload(input, file);

      // trigger the hook success which will attempt to preload the image and then fail
      await waitFor(() => lastUseAvatarOptions?.onSuccess?.(uploadedUrl));

      await waitFor(() => expect(onError).toHaveBeenCalledWith('Failed to load new avatar image'));
    } finally {
      Object.defineProperty(window, 'Image', {
        configurable: true,
        writable: true,
        value: originalImage,
      });
    }
  });

  it('uploads a file and updates the avatar image (user flow) - with Image mock', async () => {
    // This variant uses an Image mock that triggers load to ensure Radix Avatar
    // consumers that addEventListener or rely on load handlers behave correctly.
    const uploadedUrl = 'https://example.com/new.png';
    const originalImage = window.Image;
    const ImageMock = createImageMock(true);
    Object.defineProperty(window, 'Image', {
      configurable: true,
      writable: true,
      value: ImageMock,
    });

    try {
      setupHookMock();

      const onAvatarChange = vi.fn();
      const user = userEvent.setup();
      render(<AvatarUpload userId={userId} onAvatarChange={onAvatarChange} />);

      const input = screen.getByLabelText(/upload avatar image/i) as HTMLInputElement;
      const file = new File(['x'], 'avatar.png', { type: 'image/png' });
      await user.upload(input, file);

      // trigger success
      await waitFor(() => lastUseAvatarOptions?.onSuccess?.(uploadedUrl));

      const img = await screen.findByAltText('Current avatar');
      await waitFor(() => expect(img).toHaveAttribute('src', uploadedUrl));
      expect(onAvatarChange).toHaveBeenCalledWith(uploadedUrl);
    } finally {
      Object.defineProperty(window, 'Image', {
        configurable: true,
        writable: true,
        value: originalImage,
      });
    }
  });
});

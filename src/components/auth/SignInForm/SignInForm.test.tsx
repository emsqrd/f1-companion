import { useAuth } from '@/hooks/useAuth';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { MockedFunction } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SignInForm } from './SignInForm';

// Mock useAuth
vi.mock('@/hooks/useAuth');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

describe('SignInForm', () => {
  const signInMock = vi.fn();
  const user = {
    id: 'user1',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00.000Z',
  };
  type UseAuthType = typeof useAuth;
  let useAuthMock: MockedFunction<UseAuthType>;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock = useAuth as unknown as MockedFunction<UseAuthType>;
    useAuthMock.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: signInMock,
      signUp: vi.fn(),
      signOut: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields and submit button', () => {
    render(
      <MemoryRouter>
        <SignInForm />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls signIn and navigates to leagues page on successful login', async () => {
    signInMock.mockResolvedValueOnce(undefined);
    render(
      <MemoryRouter>
        <SignInForm />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(signInMock).toHaveBeenCalledWith('user@example.com', 'password123');
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/leagues');
    });
  });

  it('shows error message on failed login', async () => {
    signInMock.mockRejectedValueOnce(new Error('Invalid credentials'));
    render(
      <MemoryRouter>
        <SignInForm />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/login failed: invalid credentials/i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard');
  });

  it('disables submit button while loading', async () => {
    let resolvePromise: (value?: unknown) => void = () => {};
    signInMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );
    render(
      <MemoryRouter>
        <SignInForm />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    // Resolve the promise to finish loading
    await waitFor(() => resolvePromise !== undefined && resolvePromise !== null);
    resolvePromise();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
    });
  });

  it('redirects to leagues page if already authenticated', () => {
    useAuthMock.mockReturnValue({
      user,
      session: null,
      loading: false,
      signIn: signInMock,
      signUp: vi.fn(),
      signOut: vi.fn(),
    });
    render(
      <MemoryRouter>
        <SignInForm />
      </MemoryRouter>,
    );
    expect(mockNavigate).toHaveBeenCalledWith('/leagues', { replace: true });
  });

  it('has a link to sign up', () => {
    render(
      <MemoryRouter>
        <SignInForm />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /sign up/i });
    expect(link).toHaveAttribute('href', '/sign-up');
  });
});

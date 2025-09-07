import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { LandingPage } from './LandingPage';

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    session: null,
  })),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LandingPage', () => {
  it('renders the main heading', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText(/Race to Glory with/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Race to Glory with/i })).toBeInTheDocument();
  });

  it('displays key features', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText('Compete with Friends')).toBeInTheDocument();
    expect(screen.getByText('Real-time Analytics')).toBeInTheDocument();
    expect(screen.getByText('Strategic Depth')).toBeInTheDocument();
  });

  it('shows how it works section', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText('Build Your Team')).toBeInTheDocument();
    expect(screen.getByText('Join a League')).toBeInTheDocument();
    expect(screen.getByText('Race for Points')).toBeInTheDocument();
  });

  it('displays social proof statistics', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText('10K+')).toBeInTheDocument();
    expect(screen.getByText('Active Players')).toBeInTheDocument();
  });
});

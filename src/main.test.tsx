import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { AuthProvider } from './contexts/AuthContext.tsx';
// Import the actual withProtection helper
import { withProtection } from './utils/routeHelpers.tsx';

// Mock component dependencies
vi.mock('./components/LandingPage/LandingPage.tsx', () => ({
  LandingPage: () => <div data-testid="landing-page">LandingPage</div>,
}));

vi.mock('./components/Layout/Layout.tsx', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}));

// Mock the ProtectedRoute component
vi.mock('@/components/auth/ProtectedRoute/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

describe('main.tsx - Application Entry Point', () => {
  describe('Application Structure', () => {
    it('should initialize with AuthProvider wrapping the router', async () => {
      const { LandingPage } = await import('./components/LandingPage/LandingPage.tsx');

      const { container } = render(
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });

      expect(container).toBeTruthy();
    });

    it('should support nested route structure with Layout wrapper', async () => {
      const { Layout } = await import('./components/Layout/Layout.tsx');
      const { LandingPage } = await import('./components/LandingPage/LandingPage.tsx');

      render(
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
            </Route>
          </Routes>
        </BrowserRouter>,
      );

      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });

  describe('withProtection HOC', () => {
    it('should wrap component with ProtectedRoute', () => {
      const TestComponent = () => <div data-testid="test-component">Test</div>;
      const ProtectedComponent = withProtection(TestComponent);

      render(<ProtectedComponent />);

      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should preserve component props when wrapping', () => {
      type TestProps = { message: string; count: number };
      const TestComponent = ({ message, count }: TestProps) => (
        <div data-testid="test-component">
          {message} - {count}
        </div>
      );
      const ProtectedComponent = withProtection(TestComponent);

      render(<ProtectedComponent message="Hello" count={42} />);

      expect(screen.getByTestId('test-component')).toHaveTextContent('Hello - 42');
    });

    it('should preserve optional props when wrapping', () => {
      type TestProps = { required: string; optional?: string };
      const TestComponent = ({ required, optional }: TestProps) => (
        <div data-testid="test-component">
          {required} {optional}
        </div>
      );
      const ProtectedComponent = withProtection(TestComponent);

      render(<ProtectedComponent required="test" />);

      expect(screen.getByTestId('test-component')).toHaveTextContent('test');
    });

    it('should support multiple wrapped components independently', () => {
      const ComponentA = () => <div data-testid="component-a">A</div>;
      const ComponentB = () => <div data-testid="component-b">B</div>;

      const ProtectedA = withProtection(ComponentA);
      const ProtectedB = withProtection(ComponentB);

      const { rerender } = render(<ProtectedA />);
      expect(screen.getByTestId('component-a')).toBeInTheDocument();

      rerender(<ProtectedB />);
      expect(screen.getByTestId('component-b')).toBeInTheDocument();
    });
  });
});

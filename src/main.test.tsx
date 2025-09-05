import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

// Mock React modules
vi.mock('react-dom/client');
vi.mock('./App', () => ({
  default: () => <div data-testid="mock-app">Mock App Component</div>,
}));

// Mock Supabase
vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Mock AuthProvider
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-auth-provider">{children}</div>
  ),
}));

// Mock LandingPage component
vi.mock('./components/LandingPage/LandingPage', () => ({
  LandingPage: () => <div data-testid="mock-landing-page">Mock Landing Page</div>,
}));

// Mock Team component
vi.mock('./components/Team/Team', () => ({
  Team: () => <div data-testid="mock-team">Mock Team Component</div>,
}));

describe('main.tsx', () => {
  const mockRoot = {
    render: vi.fn(),
    unmount: vi.fn(),
  };

  beforeEach(() => {
    // Mock the DOM element
    document.body.innerHTML = '<div id="root"></div>';

    // Mock createRoot to return our mockRoot
    vi.mocked(ReactDOM.createRoot).mockReturnValue(mockRoot as ReactDOM.Root);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should render the LandingPage, App, and Team components with correct routing structure', async () => {
    // Import main to trigger the code execution
    await import('./main');

    // Verify createRoot was called with the root element
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(document.getElementById('root'));

    // Verify render was called on the root
    expect(mockRoot.render).toHaveBeenCalledTimes(1);

    // Capture the rendered JSX by getting the first argument of the render call
    const renderedJSX = mockRoot.render.mock.calls[0][0];

    // Verify the structure: StrictMode wrapping AuthProvider
    expect(renderedJSX.type).toBe(StrictMode);

    // Check that AuthProvider mock is inside StrictMode
    const authProvider = renderedJSX.props.children;
    expect(authProvider.type).toBeDefined();
    expect(authProvider.props.children).toBeDefined();

    // Check that BrowserRouter is inside AuthProvider
    const browserRouter = authProvider.props.children;
    expect(browserRouter.type).toBe(BrowserRouter);

    // Check that Routes are inside BrowserRouter
    const routes = browserRouter.props.children;
    expect(routes.type.name).toBe('Routes');

    // Check that the routes contain the expected route elements
    const routeElements = routes.props.children;
    expect(Array.isArray(routeElements)).toBe(true);
    expect(routeElements).toHaveLength(3);

    // Check the first route (LandingPage component at root path)
    const landingRoute = routeElements[0];
    expect(landingRoute.props.path).toBe('/');
    expect(landingRoute.props.element.type.name).toBe('LandingPage');

    // Check the second route (App component at /dashboard path)
    const appRoute = routeElements[1];
    expect(appRoute.props.path).toBe('/dashboard');
    expect(appRoute.props.element.type).toBe(App);

    // Check the third route (Team component at /team/:teamId path)
    const teamRoute = routeElements[2];
    expect(teamRoute.props.path).toBe('/team/:teamId');
    expect(teamRoute.props.element.type.name).toBe('Team');
  });
});

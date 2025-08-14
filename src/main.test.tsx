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

  it('should render the App component inside StrictMode and BrowserRouter', async () => {
    // Import main to trigger the code execution
    await import('./main');

    // Verify createRoot was called with the root element
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(document.getElementById('root'));

    // Verify render was called on the root
    expect(mockRoot.render).toHaveBeenCalledTimes(1);

    // Capture the rendered JSX by getting the first argument of the render call
    const renderedJSX = mockRoot.render.mock.calls[0][0];

    // Verify the structure: StrictMode wrapping BrowserRouter
    expect(renderedJSX.type).toBe(StrictMode);

    // Check that BrowserRouter is inside StrictMode
    const browserRouter = renderedJSX.props.children;
    expect(browserRouter.type).toBe(BrowserRouter);

    // Check that Routes are inside BrowserRouter
    const routes = browserRouter.props.children;
    expect(routes.type.name).toBe('Routes');

    // Check that the routes contain the expected route elements
    const routeElements = routes.props.children;
    expect(Array.isArray(routeElements)).toBe(true);
    expect(routeElements).toHaveLength(2);

    // Check the first route (App component at root path)
    const appRoute = routeElements[0];
    expect(appRoute.props.path).toBe('/');
    expect(appRoute.props.element.type).toBe(App);
  });
});

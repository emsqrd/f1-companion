import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Layout } from './Layout';

// Render the real Layout but mock PageHeader to keep tests focused and deterministic
vi.mock('../PageHeader/PageHeader', () => ({
  PageHeader: () => <div data-testid="mock-page-header">Mock PageHeader</div>,
}));

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the PageHeader and outlet children', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div data-testid="home-child">Home Child</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    // PageHeader should be present (mocked)
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();

    // Outlet content should render
    expect(screen.getByTestId('home-child')).toBeInTheDocument();
    expect(screen.getByText('Home Child')).toBeVisible();
  });

  it('renders nested routes inside the Outlet', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<div data-testid="dashboard-child">Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-child')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeVisible();
  });
});

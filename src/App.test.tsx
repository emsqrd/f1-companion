import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import App from './App';

// Mock the Team component to isolate App component testing
vi.mock('./components/Team/Team', () => ({
  Team: () => <div data-testid="team-component">Mocked Team Component</div>,
}));

describe('App', () => {
  it('should render the Team component', () => {
    render(<App />);

    const teamComponent = screen.getByTestId('team-component');
    expect(teamComponent).toBeInTheDocument();
  });
});

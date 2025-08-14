import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import App from './App';

// Mock the Team component to isolate App component testing
vi.mock('./components/League/League', () => ({
  League: () => <div data-testid="league-component">Mocked League Component</div>,
}));

describe('App', () => {
  it('should render the League component', () => {
    render(<App />);

    const leagueComponent = screen.getByTestId('league-component');
    expect(leagueComponent).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InfoRoleCardContent, type InfoRoleCardContentProps } from './InfoRoleCardContent';

// Mock the formatMillions function to isolate component testing
vi.mock('@/lib/utils', () => ({
  formatMillions: vi.fn((value: number) => (value / 1_000_000).toFixed(1)),
}));

describe('InfoRoleCardContent', () => {
  const defaultProps: InfoRoleCardContentProps = {
    name: 'Lewis Hamilton',
    points: 195,
    price: 25500000,
  };

  const renderComponent = (props: Partial<InfoRoleCardContentProps> = {}) => {
    return render(<InfoRoleCardContent {...defaultProps} {...props} />);
  };

  it('should display the provided name', () => {
    renderComponent();

    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
  });

  it('should display the provided points', () => {
    renderComponent();

    expect(screen.getByText('195 pts.')).toBeInTheDocument();
  });

  it('should display the formatted price', () => {
    renderComponent();

    expect(screen.getByText(/^\$.*m$/)).toBeInTheDocument();
  });

  it('should update when props change', () => {
    const { rerender } = render(<InfoRoleCardContent {...defaultProps} />);

    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    expect(screen.getByText('195 pts.')).toBeInTheDocument();

    rerender(<InfoRoleCardContent name="Max Verstappen" points={350} price={30000000} />);

    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('350 pts.')).toBeInTheDocument();
    expect(screen.queryByText('Lewis Hamilton')).not.toBeInTheDocument();
    expect(screen.queryByText('195 pts.')).not.toBeInTheDocument();
  });

  it('should call formatMillions with the provided price', async () => {
    const { formatMillions } = vi.mocked(await import('@/lib/utils'));

    renderComponent({ price: 15750000 });

    expect(formatMillions).toHaveBeenCalledWith(15750000);
  });

  describe('edge cases', () => {
    it('should handle empty name', () => {
      renderComponent({ name: '' });

      // The empty name should still render, just be empty
      expect(screen.queryByText('Lewis Hamilton')).not.toBeInTheDocument();
    });

    it('should handle zero points', () => {
      renderComponent({ points: 0 });

      expect(screen.getByText('0 pts.')).toBeInTheDocument();
    });

    it('should handle negative points', () => {
      renderComponent({ points: -15 });

      expect(screen.getByText('-15 pts.')).toBeInTheDocument();
    });
  });
});

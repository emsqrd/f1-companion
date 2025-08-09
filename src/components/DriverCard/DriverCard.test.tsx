import type { Driver } from '@/contracts/Roles';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RoleCardProps } from '../RoleCard/RoleCard';
import { DriverCard } from './DriverCard';

// Mock RoleCard to capture props
const mockRoleCard = vi.fn();
vi.mock('../RoleCard/RoleCard', () => ({
  RoleCard: (props: RoleCardProps) => {
    mockRoleCard(props);
    return <div data-testid="role-card">Mocked RoleCard</div>;
  },
}));

describe('DriverCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when variant is filled', () => {
    const driver: Driver = {
      id: 1,
      firstName: 'Carlos',
      lastName: 'Sainz',
      countryAbbreviation: 'SPA',
      price: 100,
      points: 40,
    };
    const onOpenSheet = vi.fn();
    const onRemove = vi.fn();

    beforeEach(() => {
      render(<DriverCard driver={driver} onOpenSheet={onOpenSheet} onRemove={onRemove} />);
    });

    it('should forward correct props to RoleCard', () => {
      expect(mockRoleCard).toHaveBeenCalledTimes(1);
      expect(mockRoleCard).toHaveBeenCalledWith({
        variant: 'filled',
        name: 'Carlos Sainz',
        price: 100,
        points: 40,
        onRemove,
      });
    });

    it('should pass onRemove function reference correctly', () => {
      const calledProps = mockRoleCard.mock.calls[0][0];
      expect(calledProps.onRemove).toBe(onRemove);
    });
  });

  describe('when variant is empty', () => {
    const onOpenSheet = vi.fn();
    const onRemove = vi.fn();

    beforeEach(() => {
      render(<DriverCard driver={null} onOpenSheet={onOpenSheet} onRemove={onRemove} />);
    });

    it('should forward correct props to RoleCard with empty variant', () => {
      expect(mockRoleCard).toHaveBeenCalledTimes(1);
      expect(mockRoleCard).toHaveBeenCalledWith({
        variant: 'empty',
        role: 'Driver',
        onOpenSheet,
      });
    });

    it('should pass onOpenSheet function reference correctly', () => {
      const calledProps = mockRoleCard.mock.calls[0][0];
      expect(calledProps.onOpenSheet).toBe(onOpenSheet);
    });
  });
});

import type { Constructor } from '@/contracts/Roles';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RoleCardProps } from '../RoleCard/RoleCard';
import { ConstructorCard } from './ConstructorCard';

// Mock RoleCard to capture props
const mockRoleCard = vi.fn();
vi.mock('../RoleCard/RoleCard', () => ({
  RoleCard: (props: RoleCardProps) => {
    mockRoleCard(props);
    return <div data-testid="role-card">Mocked RoleCard</div>;
  },
}));

describe('ConstructorCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when variant is filled', () => {
    const constructor: Constructor = {
      id: 1,
      name: 'Ferrari',
      countryAbbreviation: 'ITA',
      points: 100,
      price: 400,
    };
    const onOpenSheet = vi.fn();
    const onRemove = vi.fn();

    beforeEach(() => {
      render(
        <ConstructorCard constructor={constructor} onOpenSheet={onOpenSheet} onRemove={onRemove} />,
      );
    });

    it('should forward correct props to RoleCard', () => {
      expect(mockRoleCard).toBeCalledTimes(1);
      expect(mockRoleCard).toBeCalledWith({
        variant: 'filled',
        name: 'Ferrari',
        points: 100,
        price: 400,
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
      render(<ConstructorCard constructor={null} onOpenSheet={onOpenSheet} onRemove={onRemove} />);
    });

    it('should forward correct props to RoleCard with empty variant', () => {
      expect(mockRoleCard).toHaveBeenCalledTimes(1);
      expect(mockRoleCard).toHaveBeenCalledWith({
        variant: 'empty',
        role: 'Constructor',
        onOpenSheet,
      });
    });

    it('should pass onOpenSheet function reference correctly', () => {
      const calledProps = mockRoleCard.mock.calls[0][0];
      expect(calledProps.onOpenSheet).toBe(onOpenSheet);
    });
  });
});

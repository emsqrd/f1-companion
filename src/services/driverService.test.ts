import { describe, expect, it } from 'vitest';

import { getAllDrivers } from './driverService';

describe('driverService', () => {
  describe('getAllDrivers', () => {
    it('should return 20 drivers', () => {
      const drivers = getAllDrivers();

      expect(drivers).toHaveLength(20);
      expect(Array.isArray(drivers)).toBe(true);
    });

    it('should not throw errors when called', () => {
      expect(() => getAllDrivers()).not.toThrow();
    });
  });
});

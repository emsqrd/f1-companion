import type { Constructor } from '@/contracts/Role';
import { describe, expect, it } from 'vitest';

import { getAllConstructors } from './constructorService';

describe('constructorService', () => {
  describe('getAllConstructors', () => {
    it('should return 20 constructors', () => {
      const constructors = getAllConstructors();

      expect(constructors).toHaveLength(20);
      expect(Array.isArray(constructors)).toBe(true);
    });

    it('should contain exactly 10 F1 teams with 2 entries each', () => {
      const constructors = getAllConstructors();
      const teamCounts: Record<string, number> = {};

      constructors.forEach((constructor) => {
        teamCounts[constructor.name] = (teamCounts[constructor.name] || 0) + 1;
      });

      expect(Object.keys(teamCounts)).toHaveLength(10);
      Object.values(teamCounts).forEach((count) => {
        expect(count).toBe(2);
      });
    });

    it('should have consistent data for constructors from the same team', () => {
      const constructors = getAllConstructors();
      const teamGroups: Record<string, Constructor[]> = {};

      constructors.forEach((constructor) => {
        if (!teamGroups[constructor.name]) {
          teamGroups[constructor.name] = [];
        }
        teamGroups[constructor.name].push(constructor);
      });

      Object.values(teamGroups).forEach((teamConstructors) => {
        const [first, second] = teamConstructors;

        expect(first.name).toBe(second.name);
        expect(first.countryAbbreviation).toBe(second.countryAbbreviation);
        expect(first.id).not.toBe(second.id);
      });
    });

    it('should not throw errors when called', () => {
      expect(() => getAllConstructors()).not.toThrow();
    });
  });
});

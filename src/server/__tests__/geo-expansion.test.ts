import { describe, it, expect } from 'vitest';
import { isStateActive } from '../../lib/constants/states.js';

describe('Multi-State Geo-Expansion Validation', () => {
  describe('isStateActive', () => {
    it('should pass validation for active states (NC, MD, CT, ND, KS)', () => {
      // North Carolina
      expect(isStateActive('NC')).toBe(true);
      // Maryland (Baltimore)
      expect(isStateActive('MD')).toBe(true);
      // Connecticut (New Haven)
      expect(isStateActive('CT')).toBe(true);
      // North Dakota (Fargo)
      expect(isStateActive('ND')).toBe(true);
      // Kansas (Wichita)
      expect(isStateActive('KS')).toBe(true);
    });

    it('should throw validation error (return false) for unsupported states', () => {
      // Texas (Austin)
      expect(isStateActive('TX')).toBe(false);
      // California (Los Angeles)
      expect(isStateActive('CA')).toBe(false);
      // New York
      expect(isStateActive('NY')).toBe(false);
      // Invalid input
      expect(isStateActive('XYZ')).toBe(false);
    });
  });
});

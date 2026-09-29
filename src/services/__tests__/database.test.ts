import { describe, it, expect } from 'vitest';
import { calculateMileage, estimateDriveTimeMinutes } from '../database';

describe('Database Services Utility Functions', () => {
  describe('calculateMileage (Haversine Formula)', () => {
    it('should return 0 when coordinates are identical', () => {
      const lat = 35.7847;
      const lon = -78.6821;
      expect(calculateMileage(lat, lon, lat, lon)).toBe(0);
    });

    it('should calculate distance correctly between two known points', () => {
      // Point 1: Raleigh, NC (approx)
      const lat1 = 35.7796;
      const lon1 = -78.6382;
      // Point 2: Durham, NC (approx)
      const lat2 = 35.9940;
      const lon2 = -78.8986;

      const distance = calculateMileage(lat1, lon1, lat2, lon2);

      // Known distance is roughly 20-25 miles
      // Distance is approximately 21 miles
      expect(distance).toBeGreaterThan(15);
      expect(distance).toBeLessThan(30);
      expect(distance).toBe(20.8);
    });

    it('should handle rounding to one decimal place correctly', () => {
      // Just check if the result format has max 1 decimal point
      const distance = calculateMileage(35.1, -78.1, 35.2, -78.2);
      const strDist = distance.toString();
      const decimals = strDist.includes('.') ? strDist.split('.')[1].length : 0;
      expect(decimals).toBeLessThanOrEqual(1);
    });
  });

  describe('estimateDriveTimeMinutes', () => {
    it('should return a minimum of 3 minutes for very short distances', () => {
      expect(estimateDriveTimeMinutes(0)).toBe(3);
      expect(estimateDriveTimeMinutes(0.5)).toBe(3);
      expect(estimateDriveTimeMinutes(1)).toBe(3);
    });

    it('should calculate drive time correctly at 25 mph', () => {
      // 25 miles at 25 mph = 1 hour = 60 minutes
      expect(estimateDriveTimeMinutes(25)).toBe(60);

      // 12.5 miles at 25 mph = 0.5 hours = 30 minutes
      expect(estimateDriveTimeMinutes(12.5)).toBe(30);
    });

    it('should round to the nearest whole minute', () => {
      // 5 miles at 25 mph = 0.2 hours = 12 minutes
      expect(estimateDriveTimeMinutes(5)).toBe(12);

      // 6 miles at 25 mph = 0.24 hours = 14.4 minutes -> rounds to 14
      expect(estimateDriveTimeMinutes(6)).toBe(14);

      // 7 miles at 25 mph = 0.28 hours = 16.8 minutes -> rounds to 17
      expect(estimateDriveTimeMinutes(7)).toBe(17);
    });
  });
});

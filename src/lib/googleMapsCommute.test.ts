import { expect, test, describe, beforeAll, afterAll } from 'bun:test';
import {
  calculateCommuteDuration,
  HOSPITAL_GEO_DIRECTORY,
  LISTING_GEO_MAP
} from './googleMapsCommute.js';

describe('calculateCommuteDuration drive time buckets', () => {
  beforeAll(() => {
    HOSPITAL_GEO_DIRECTORY['TestHospital'] = {
      name: 'TestHospital',
      shortName: 'TestHospital',
      address: '123 Test',
      lat: 0,
      lng: 0,
      healthSystem: 'Test',
    };
  });

  afterAll(() => {
    delete HOSPITAL_GEO_DIRECTORY['TestHospital'];
  });

  const getLatForDistance = (miles: number) => (miles / 3958.8) * (180 / Math.PI);

  const testCases = [
    { distance: 0.5, expectedDriveMinutes: 2 }, // Math.max(2, Math.round(0.5 * 3.5)) = 2
    { distance: 1.0, expectedDriveMinutes: 4 }, // Math.max(2, Math.round(1.0 * 3.5)) = 4
    { distance: 2.0, expectedDriveMinutes: 5 }, // 3 + (2.0 - 1.0) * 2.4 = 5.4 => 5
    { distance: 3.0, expectedDriveMinutes: 8 }, // 3 + (3.0 - 1.0) * 2.4 = 7.8 => 8
    { distance: 5.0, expectedDriveMinutes: 12 }, // 8 + (5.0 - 3.0) * 2.0 = 12
    { distance: 8.0, expectedDriveMinutes: 18 }, // 8 + (8.0 - 3.0) * 2.0 = 18
    { distance: 10.0, expectedDriveMinutes: 21 }, // 18 + (10.0 - 8.0) * 1.6 = 21.2 => 21
  ];

  for (const { distance, expectedDriveMinutes } of testCases) {
    test(`distance ${distance} miles => ${expectedDriveMinutes} minutes`, () => {
      const id = `test-listing-${distance}`;
      LISTING_GEO_MAP[id] = {
        lat: getLatForDistance(distance),
        lng: 0,
        city: 'TestCity',
        state: 'TS'
      };

      const result = calculateCommuteDuration({ id }, 'TestHospital');

      // Cleanup
      delete LISTING_GEO_MAP[id];

      // Validate distance calculation matches our expectation
      expect(result.distanceMiles).toBe(distance);

      // Validate drive time logic
      expect(result.driveMinutes).toBe(expectedDriveMinutes);
    });
  }
});

import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance } from '../googleMapsCommute';

describe('calculateHaversineDistance', () => {
  it('should calculate the distance between New York and Los Angeles', () => {
    // New York: 40.7128° N, 74.0060° W
    // Los Angeles: 34.0522° N, 118.2437° W
    const nyLat = 40.7128;
    const nyLon = -74.0060;
    const laLat = 34.0522;
    const laLon = -118.2437;

    const distance = calculateHaversineDistance(nyLat, nyLon, laLat, laLon);

    // Expected distance is approximately 2446 miles.
    // We check if it is within a reasonable tolerance (e.g. 10 miles).
    expect(distance).toBeGreaterThan(2430);
    expect(distance).toBeLessThan(2460);
  });

  it('should return 0 when the two points are the same', () => {
    const lat = 40.7128;
    const lon = -74.0060;

    const distance = calculateHaversineDistance(lat, lon, lat, lon);

    expect(distance).toBe(0);
  });

  it('should calculate the distance between Duke Hospital and UNC Medical Center', () => {
    // Duke Hospital: 36.0076, -78.9382
    // UNC Medical Center: 35.9049, -79.0526
    const dukeLat = 36.0076;
    const dukeLon = -78.9382;
    const uncLat = 35.9049;
    const uncLon = -79.0526;

    const distance = calculateHaversineDistance(dukeLat, dukeLon, uncLat, uncLon);

    // Expected distance is approximately 9.5 miles
    expect(distance).toBeGreaterThan(9);
    expect(distance).toBeLessThan(10);
  });
});

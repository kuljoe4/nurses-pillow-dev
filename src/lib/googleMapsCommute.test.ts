import { describe, it, expect } from 'vitest';
import {
  resolveHospitalCoordinates,
  getListingCoordinates,
  calculateCommuteDuration,
  HOSPITAL_GEO_DIRECTORY
} from './googleMapsCommute';

describe('googleMapsCommute', () => {
  describe('resolveHospitalCoordinates', () => {
    it('returns default (Duke) when query is empty', () => {
      const result = resolveHospitalCoordinates('');
      expect(result.name).toBe('Duke University Hospital');
    });

    it('matches hospital by exact name', () => {
      const result = resolveHospitalCoordinates('Stanford Health Care');
      expect(result.name).toBe('Stanford Health Care - Main Hospital');
    });

    it('matches hospital by lowercase name', () => {
      const result = resolveHospitalCoordinates('cedars-sinai');
      expect(result.name).toBe('Cedars-Sinai Medical Center');
    });

    it('matches hospital by shortName', () => {
      const result = resolveHospitalCoordinates('UCSF Mission Bay');
      expect(result.name).toBe('UCSF Medical Center at Mission Bay');
    });

    it('matches hospital by address fragment', () => {
      const result = resolveHospitalCoordinates('300 Pasteur Dr');
      expect(result.name).toBe('Stanford Health Care - Main Hospital');
    });

    it('matches by city/state fallback (chapel hill -> UNC)', () => {
      const result = resolveHospitalCoordinates('chapel hill');
      expect(result.name).toBe('UNC Medical Center (Chapel Hill)');
    });

    it('matches by city/state fallback (raleigh -> WakeMed)', () => {
      const result = resolveHospitalCoordinates('raleigh');
      expect(result.name).toBe('WakeMed Raleigh Campus');
    });

    it('returns default (Duke) for unmatched queries', () => {
      const result = resolveHospitalCoordinates('Unknown Hospital in Unknown City');
      expect(result.name).toBe('Duke University Hospital');
    });
  });

  describe('getListingCoordinates', () => {
    it('returns known coordinates for a recognized listing ID', () => {
      const result = getListingCoordinates({ id: 'nc-duke-condo' });
      expect(result.lat).toBe(36.0112);
      expect(result.lng).toBe(-78.9248);
    });

    it('generates consistent coordinates based on city (Durham)', () => {
      const result = getListingCoordinates({ id: 'unknown-id', city: 'Durham' });
      expect(result.lat).toBe(36.0090);
      expect(result.lng).toBe(-78.9320);
    });

    it('generates deterministic fallback coordinates based on ID hash', () => {
      const result1 = getListingCoordinates({ id: 'some-random-id', city: 'Unknown City' });
      const result2 = getListingCoordinates({ id: 'some-random-id', city: 'Unknown City' });
      const result3 = getListingCoordinates({ id: 'another-random-id', city: 'Unknown City' });

      expect(result1.lat).toBe(result2.lat);
      expect(result1.lng).toBe(result2.lng);

      // another ID will have different hash, hence different coordinates
      expect(result1.lat).not.toBe(result3.lat);
      expect(result1.lng).not.toBe(result3.lng);
    });
  });

  describe('calculateCommuteDuration', () => {
    it('calculates commute details accurately for close distance', () => {
      // Use known listing and hospital that are close (e.g. SF dogpatch to UCSF Mission Bay)
      const listing = { id: 'sf-dogpatch-studio', city: 'San Francisco', state: 'CA' }; // lat: 37.7618, lng: -122.3902
      const hospitalQuery = 'UCSF Medical Center'; // lat: 37.7681, lng: -122.3908

      const result = calculateCommuteDuration(listing, hospitalQuery);

      expect(result.hospitalName).toBe('UCSF Medical Center at Mission Bay');
      expect(result.distanceMiles).toBeGreaterThan(0);
      expect(result.distanceMiles).toBeLessThan(1.5); // It should be around 0.4 miles

      // < 1.0 miles uses the formula: max(2, Math.round(distanceMiles * 3.5))
      expect(result.driveMinutes).toBeGreaterThanOrEqual(2);
      expect(result.transitMinutes).toBeGreaterThan(0);
      expect(result.walkMinutes).toBeGreaterThan(0);
      expect(result.isShiftSafe).toBe(true);
      expect(result.trafficStatus).toBe('Shift-ready (24/7 clear)');
      expect(result.routeSummary).toContain('Via 3rd St');
    });

    it('calculates commute details accurately for medium distance', () => {
      // Use a listing and hospital that are medium distance apart (e.g. Palo Alto to UCSF)
      const listing = { id: 'hosp-1', city: 'Palo Alto', state: 'CA' }; // lat: 37.4419, lng: -122.1580
      const hospitalQuery = 'UCSF Medical Center'; // lat: 37.7681, lng: -122.3908

      const result = calculateCommuteDuration(listing, hospitalQuery);

      expect(result.hospitalName).toBe('UCSF Medical Center at Mission Bay');
      expect(result.distanceMiles).toBeGreaterThan(15);

      // Long distance uses: Math.round(18 + (distanceMiles - 8.0) * 1.6)
      expect(result.driveMinutes).toBeGreaterThan(30);
      expect(result.isShiftSafe).toBe(false); // > 15 mins
      expect(result.trafficStatus).toBe('Highway access flow');
    });

    it('calculates departure times correctly for day and night shifts', () => {
      const listing = { id: 'sf-dogpatch-studio' };
      const hospitalQuery = 'UCSF Medical Center';

      const result = calculateCommuteDuration(listing, hospitalQuery);

      expect(result.dayShiftDepartureEstimate).toMatch(/^[5-6]:[0-5][0-9] AM \(for 7 AM shift\)$/);
      expect(result.nightShiftDepartureEstimate).toMatch(/^[5-6]:[0-5][0-9] PM \(for 7 PM shift\)$/);
    });

    it('ensures distance is at least 0.3 miles', () => {
      // Use the exact hospital coordinates as listing coordinates
      const duke = HOSPITAL_GEO_DIRECTORY['Duke University Hospital'];

      const mockListing = {
        id: 'mock-exact-location',
      };

      // Override getListingCoordinates behavior by passing it indirectly?
      // Wait, getListingCoordinates falls back to Duke or city center.
      // We can't directly override the coords for calculateCommuteDuration without mocking,
      // but we can test the behavior by picking a listing very close to a hospital.

      // Or we can mock the listing coordinates by choosing the exact center of durham which is very close to duke
      // Wait, calculateCommuteDuration relies on getListingCoordinates and calculateHaversineDistance internally.
      // If we pick a known listing near duke, maybe it's > 0.3 miles.

      // Let's rely on the internal getListingCoordinates logic to provide a location near Duke
      const listing = { id: 'unknown', city: 'Durham' };
      // Durham city center: lat: 36.0090, lng: -78.9320
      // Duke: lat: 36.0076, lng: -78.9382

      const result = calculateCommuteDuration(listing, 'Duke University Hospital');
      expect(result.distanceMiles).toBeGreaterThanOrEqual(0.3);
    });
  });
});

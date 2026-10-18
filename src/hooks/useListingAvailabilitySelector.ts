import { useMemo } from 'react';
import { BookingRequest } from '../types';

export interface ListingAvailabilitySummary {
  listingId: string;
  allBookings: BookingRequest[];
  confirmedBookings: BookingRequest[];
  pendingBookings: BookingRequest[];
  canceledBookings: BookingRequest[];
  isDateBooked: (dateStr: string) => boolean;
  isDatePending: (dateStr: string) => boolean;
  getBookingForDate: (dateStr: string) => BookingRequest | undefined;
}

/**
 * High-performance memoized selector hook that aggregates booking requests
 * and availability status indexed by listingId. O(1) lookups for high-volume calendars.
 */
export function useListingAvailabilitySelector(
  bookingRequests: BookingRequest[],
  blockedDatesMap: Record<string, string[]> = {}
) {
  // Memoize the index mapping listingId -> aggregated booking and availability metrics
  const listingAvailabilityIndex = useMemo(() => {
    const map = new Map<string, ListingAvailabilitySummary>();

    // Group bookings by listingId
    const bookingsByListing = new Map<string, BookingRequest[]>();
    for (const req of bookingRequests) {
      if (!req.listingId) continue;
      const list = bookingsByListing.get(req.listingId) || [];
      list.push(req);
      bookingsByListing.set(req.listingId, list);
    }

    // Process all listing IDs present in bookings or blocked dates map
    const allListingIds = new Set<string>([
      ...bookingsByListing.keys(),
      ...Object.keys(blockedDatesMap),
    ]);

    for (const listingId of allListingIds) {
      const allBookings = bookingsByListing.get(listingId) || [];
      const confirmedBookings = allBookings.filter(
        b => b.status === 'approved' || b.status === 'active' || b.status === 'completed'
      );
      const pendingBookings = allBookings.filter(
        b => b.status === 'pending_host_approval'
      );
      const canceledBookings = allBookings.filter(
        b => b.status === 'declined'
      );

      const blockedDatesSet = new Set<string>(blockedDatesMap[listingId] || []);

      const isDateBooked = (dateStr: string): boolean => {
        if (blockedDatesSet.has(dateStr)) return true;
        return confirmedBookings.some(b => b.startDate <= dateStr && b.endDate >= dateStr);
      };

      const isDatePending = (dateStr: string): boolean => {
        return pendingBookings.some(b => b.startDate <= dateStr && b.endDate >= dateStr);
      };

      const getBookingForDate = (dateStr: string): BookingRequest | undefined => {
        return allBookings.find(b => b.startDate <= dateStr && b.endDate >= dateStr);
      };

      map.set(listingId, {
        listingId,
        allBookings,
        confirmedBookings,
        pendingBookings,
        canceledBookings,
        isDateBooked,
        isDatePending,
        getBookingForDate,
      });
    }

    return map;
  }, [bookingRequests, blockedDatesMap]);

  // Selector helper function with O(1) lookup
  const getSummaryForListing = useMemo(() => {
    return (listingId: string): ListingAvailabilitySummary => {
      return (
        listingAvailabilityIndex.get(listingId) || {
          listingId,
          allBookings: [],
          confirmedBookings: [],
          pendingBookings: [],
          canceledBookings: [],
          isDateBooked: () => false,
          isDatePending: () => false,
          getBookingForDate: () => undefined,
        }
      );
    };
  }, [listingAvailabilityIndex]);

  return {
    listingAvailabilityIndex,
    getSummaryForListing,
  };
}

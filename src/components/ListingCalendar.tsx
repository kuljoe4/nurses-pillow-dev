import React, { useState, useMemo } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { BookingRequest } from '../types';
import { useListingAvailabilitySelector } from '../hooks/useListingAvailabilitySelector';

interface ListingCalendarProps {
  listingId: string;
  bookingRequests: BookingRequest[];
  blockedDatesMap?: Record<string, string[]>;
}

export const ListingCalendar: React.FC<ListingCalendarProps> = ({
  listingId,
  bookingRequests,
  blockedDatesMap = {},
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { getSummaryForListing } = useListingAvailabilitySelector(bookingRequests, blockedDatesMap);

  const summary = getSummaryForListing(listingId);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  
  // Calculate availability percentage for the current month view
  const monthDays = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [monthStart, monthEnd]);

  const monthStats = useMemo(() => {
    let bookedCount = 0;
    let pendingCount = 0;
    let availableCount = 0;

    for (const day of monthDays) {
      const dateStr = format(day, 'yyyy-MM-dd');
      if (summary.isDateBooked(dateStr)) {
        bookedCount++;
      } else if (summary.isDatePending(dateStr)) {
        pendingCount++;
      } else {
        availableCount++;
      }
    }

    const total = monthDays.length;
    const availabilityPercentage = total > 0 ? Math.round((availableCount / total) * 100) : 100;
    const occupancyPercentage = 100 - availabilityPercentage;

    return {
      bookedCount,
      pendingCount,
      availableCount,
      total,
      availabilityPercentage,
      occupancyPercentage,
    };
  }, [monthDays, summary]);

  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-6 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-md space-y-5">
      {/* Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#0B2559] dark:text-white flex items-center gap-2">
            <span>{format(currentMonth, 'MMMM yyyy')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#142823] dark:text-[#aff0db] text-xs font-extrabold tabular-nums">
              {monthStats.availabilityPercentage}% Available
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {monthStats.availableCount} of {monthStats.total} days open for travel clinicians
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
            className="px-3 py-1.5 bg-gray-100 dark:bg-[#182840] hover:bg-gray-200 dark:hover:bg-[#223550] rounded-lg text-xs font-bold text-[#0B2559] dark:text-white transition-colors cursor-pointer"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="px-3 py-1.5 bg-gray-100 dark:bg-[#182840] hover:bg-gray-200 dark:hover:bg-[#223550] rounded-lg text-xs font-bold text-[#0B2559] dark:text-white transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Prominent Color-Coded Status Badge Banner */}
      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#EFF6FB] dark:bg-[#0E1A2E] border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#22c55e]/15 text-[#22c55e] flex items-center justify-center font-bold text-xs">
            {monthStats.availableCount}
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available</div>
            <div className="text-xs font-extrabold text-[#0B2559] dark:text-white tabular-nums">{monthStats.availabilityPercentage}% Open</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-x border-gray-200/60 dark:border-gray-700/60 px-3">
          <div className="w-8 h-8 rounded-lg bg-[#22c55e] text-white flex items-center justify-center font-bold text-xs">
            {monthStats.bookedCount}
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Booked Stays</div>
            <div className="text-xs font-extrabold text-[#22c55e] tabular-nums">{monthStats.bookedCount} days</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-lg bg-[#FBF0D6] text-[#B9822E] flex items-center justify-center font-bold text-xs">
            {monthStats.pendingCount}
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Review</div>
            <div className="text-xs font-extrabold text-[#B9822E] tabular-nums">{monthStats.pendingCount} days</div>
          </div>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isBooked = summary.isDateBooked(dateStr);
          const isPending = summary.isDatePending(dateStr);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const booking = summary.getBookingForDate(dateStr);

          return (
            <div
              key={dateStr}
              title={booking ? `Booked by ${booking.clinicianName} (${booking.hospitalName})` : undefined}
              className={`h-14 flex flex-col items-center justify-center rounded-xl text-xs font-bold relative transition-all ${
                isCurrentMonth ? 'text-[#0B2559] dark:text-white' : 'text-gray-300 dark:text-gray-600'
              } ${
                isBooked
                  ? 'bg-[#22c55e] dark:bg-[#065f46] text-white shadow-xs'
                  : isPending
                  ? 'bg-[#FBF0D6] dark:bg-[#20190d] text-[#B9822E] border border-amber-300'
                  : 'bg-[#EFF6FB] dark:bg-[#0E1A2E] hover:border-[#0A6FA8]/40 border border-transparent'
              }`}
            >
              <span className="tabular-nums">{format(day, 'd')}</span>
              {isBooked && <span className="text-[7px] uppercase tracking-tighter opacity-90 truncate max-w-[90%] font-extrabold">Booked</span>}
              {isPending && <span className="text-[7px] uppercase tracking-tighter opacity-90 truncate max-w-[90%] font-extrabold">Pending</span>}
            </div>
          );
        })}
      </div>

      {/* Confirmed Stays List Summary */}
      {summary.confirmedBookings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <h4 className="text-xs font-bold text-[#0B2559] dark:text-white uppercase tracking-wider">Active Occupancy Schedule</h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {summary.confirmedBookings.map(b => (
              <div key={b.id} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-[#0E1A2E] border border-gray-200/50 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
                  <img 
                    src={b.clinicianAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(b.clinicianName) + '&background=random'} 
                    alt={b.clinicianName} 
                    className="w-6 h-6 rounded-full object-cover" 
                  />
                  <div className="flex flex-col">
                    <span className="font-bold tabular-nums text-[#0B2559] dark:text-white text-[11px]">{format(new Date(b.startDate), 'MMM d')} – {format(new Date(b.endDate), 'MMM d')}</span>
                    <span className="text-gray-600 dark:text-gray-300 text-[10px] font-semibold">{b.clinicianName} {b.clinicianTitle ? '• ' + b.clinicianTitle : ''}</span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#0A6FA8] dark:text-[#3E9AD1]">{b.hospitalName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { db } from '../services/database';
import { HostCalendarTips } from './HostCalendarTips';
import { ClinicalDateRangePicker } from './ClinicalDateRangePicker';
import { motion } from 'framer-motion';
import { useAvailability } from '../context/AvailabilityContext';

interface AvailabilityCalendarProps {
  listingId: string;
}

export const HostAvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ listingId }) => {
  const { refreshAvailability } = useAvailability();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [availabilityData, bookingsData] = await Promise.all([
        db.fetchAvailabilityBlocks(listingId),
        db.fetchBookingsForListing(listingId)
      ]);
      setAvailability(availabilityData);
      setBookings(bookingsData);
    };
    fetchData();
  }, [listingId]);

  const [conflict, setConflict] = useState<any>(null);
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  const [range, setRange] = useState({ start: '', end: '' });

  const handleApplyRange = async () => {
    if (!range.start || !range.end) return;
    try {
        await db.addAvailabilityBlock(listingId, {
            start_date: range.start,
            end_date: range.end,
            is_blocked: true,
            block_reason: 'host_blocked'
        });
        await refreshAvailability(listingId);
        const updated = await db.fetchAvailabilityBlocks(listingId);
        setAvailability(updated);
        setIsRangeModalOpen(false);
        setRange({ start: '', end: '' });
    } catch (err) {
        console.error('Failed to add range', err);
    }
  }

  const handleDateClick = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isBlocked = availability.some(b => b.start_date <= dateStr && b.end_date >= dateStr && b.is_blocked);
    
    // Check for existing bookings on this date
    const conflictingBooking = bookings.find(b => b.start_date <= dateStr && b.end_date >= dateStr && b.status !== 'declined' && b.status !== 'cancelled' && b.status !== 'refunded');

    if (!isBlocked && conflictingBooking) {
      setConflict({
        error: 'Cannot block these dates as there is already a confirmed or pending booking.',
        conflictingBooking: {
          traveler_name: conflictingBooking.traveler_name || conflictingBooking.traveler_name_from_db || 'Clinician',
          traveler_phone: conflictingBooking.traveler_phone_from_db || 'N/A',
          traveler_email: conflictingBooking.traveler_email_from_db || 'N/A'
        }
      });
      return;
    }
    
    // Optimistic update
    const newBlockedState = !isBlocked;
    if (newBlockedState) {
        setAvailability(prev => [...prev, { start_date: dateStr, end_date: dateStr, is_blocked: true }]);
    } else {
        setAvailability(prev => prev.filter(b => !(b.start_date <= dateStr && b.end_date >= dateStr)));
    }
    
    try {
      await db.addAvailabilityBlock(listingId, {
        start_date: dateStr,
        end_date: dateStr,
        is_blocked: newBlockedState,
        block_reason: 'host_blocked'
      });
      // Refresh to ensure server sync and trigger context update
      await refreshAvailability(listingId);
      const updated = await db.fetchAvailabilityBlocks(listingId);
      setAvailability(updated);
    } catch (err: any) {
      // Revert on error
      const reverted = await db.fetchAvailabilityBlocks(listingId);
      setAvailability(reverted);
      
      if (err.response?.status === 409) {
          setConflict(err.response.data);
      } else {
          console.error('Failed to update availability', err);
      }
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const bookedDays = bookings.filter(b => b.status === 'approved' || b.status === 'active' || b.status === 'completed');
  const pendingRequests = bookings.filter(b => b.status === 'pending_host_approval');

  // ⚡ Bolt Performance Optimization: Pre-compute date lookups
  // Replaced multiple nested O(N) array scans inside the calendar render loop with O(1) Set lookups
  const { blockedDatesSet, confirmedDatesSet, pendingDatesSet } = useMemo(() => {
    const blocked = new Set<string>();
    const confirmed = new Set<string>();
    const pending = new Set<string>();

    availability.forEach(b => {
      if (b.is_blocked) {
        try {
          const bStart = new Date(b.start_date + 'T12:00:00');
          const bEnd = new Date(b.end_date + 'T12:00:00');
          const days = eachDayOfInterval({ start: bStart, end: bEnd });
          days.forEach(d => blocked.add(format(d, 'yyyy-MM-dd')));
        } catch(e) {}
      }
    });

    bookedDays.forEach(b => {
      try {
        const bStart = new Date(b.start_date + 'T12:00:00');
        const bEnd = new Date(b.end_date + 'T12:00:00');
        const days = eachDayOfInterval({ start: bStart, end: bEnd });
        days.forEach(d => confirmed.add(format(d, 'yyyy-MM-dd')));
      } catch(e) {}
    });

    pendingRequests.forEach(b => {
      try {
        const bStart = new Date(b.start_date + 'T12:00:00');
        const bEnd = new Date(b.end_date + 'T12:00:00');
        const days = eachDayOfInterval({ start: bStart, end: bEnd });
        days.forEach(d => pending.add(format(d, 'yyyy-MM-dd')));
      } catch(e) {}
    });

    return { blockedDatesSet: blocked, confirmedDatesSet: confirmed, pendingDatesSet: pending };
  }, [availability, bookedDays, pendingRequests]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-6 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#0B2559] dark:text-white">{format(currentMonth, 'MMMM yyyy')}</h3>
          <div className="flex gap-2">
              <button onClick={() => setIsRangeModalOpen(true)} className="px-3 py-1 bg-[#0A6FA8] text-white rounded-lg text-xs font-bold">Block Range</button>
              <button onClick={() => setCurrentMonth(prev => addMonths(prev, -1))} className="px-3 py-1 bg-gray-100 dark:bg-[#182840] rounded-lg text-xs">Prev</button>
              <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="px-3 py-1 bg-gray-100 dark:bg-[#182840] rounded-lg text-xs">Next</button>
          </div>
        </div>

        {isRangeModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-[#0B1626] p-6 rounded-3xl max-w-lg w-full my-auto">
                  <h3 className="text-lg font-bold mb-4">Select Blackout Range</h3>
                  <ClinicalDateRangePicker
                      startDate={range.start}
                      endDate={range.end}
                      onChange={(start, end) => setRange({ start, end })}
                      onApply={handleApplyRange}
                      onClose={() => setIsRangeModalOpen(false)}
                  />
              </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4 mb-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#A8452E] border border-gray-200"></span> Blocked</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#22c55e] dark:bg-[#065f46] border border-gray-200"></span> Booked</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#FBF0D6] dark:bg-[#20190d] border border-gray-200"></span> Action Needed</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#EFF6FB] dark:bg-[#0E1A2E] border border-gray-200"></span> Available</div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isBlocked = blockedDatesSet.has(dateStr);
            const isConfirmed = confirmedDatesSet.has(dateStr);
            const isPending = pendingDatesSet.has(dateStr);
            const isCurrentMonth = isSameMonth(day, monthStart);
            
            return (
              <button
                key={dateStr}
                onClick={() => handleDateClick(day)}
                className={`h-12 flex flex-col items-center justify-center rounded-lg text-xs font-bold relative ${
                  isCurrentMonth ? 'text-[#0B2559] dark:text-white' : 'text-gray-300'
                } ${isBlocked ? 'bg-[#A8452E] text-white' : isConfirmed ? 'bg-[#22c55e] dark:bg-[#065f46] text-white' : isPending ? 'bg-[#FBF0D6] dark:bg-[#20190d] text-[#B9822E]' : 'bg-[#EFF6FB] dark:bg-[#0E1A2E]'}`}
              >
                {format(day, 'd')}
                {isBlocked && <span className="text-[8px] uppercase">Blocked</span>}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-6 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-md">
        <h4 className="text-sm font-bold text-[#0B2559] dark:text-white mb-4">Upcoming Bookings</h4>
        {bookedDays.length === 0 ? (
          <p className="text-xs text-gray-500">No upcoming confirmed bookings.</p>
        ) : (
          <div className="space-y-3">
            {bookedDays.map(b => (
              <div key={b.id} className="flex justify-between items-center text-xs p-3 rounded-xl bg-[#EFF6FB] dark:bg-[#0E1A2E]">
                <div className="flex items-center gap-2">
                  <img 
                    src={b.clinicianAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(b.traveler_name_from_db || 'Clinician') + '&background=random'} 
                    alt={b.traveler_name_from_db || 'Clinician'} 
                    className="w-7 h-7 rounded-full object-cover" 
                  />
                  <div className="flex flex-col">
                    <span className="font-bold tabular-nums text-[#0B2559] dark:text-white text-[11px]">{format(new Date(b.start_date), 'MMM d')} – {format(new Date(b.end_date), 'MMM d')}</span>
                    <span className="text-gray-600 dark:text-gray-300 text-[10px] font-semibold">
                      {b.traveler_name || b.traveler_name_from_db || 'Clinician'}
                      {b.clinicianTitle ? ' • ' + b.clinicianTitle : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HostCalendarTips />
      
      {conflict && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1626] p-6 rounded-3xl max-w-sm w-full border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-2xl">
            <h3 className="text-lg font-bold text-[#A8452E] dark:text-[#F4E2DC] flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              Date Conflict
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">{conflict.error}</p>
            <div className="mt-4 p-4 bg-[#EFF6FB] dark:bg-[#0E1A2E] rounded-xl text-xs space-y-2">
              <p className="font-bold text-[#0B2559] dark:text-white">Conflicting Booking:</p>
              <p>Clinician: {conflict.conflictingBooking.traveler_name}</p>
              <p>Phone: {conflict.conflictingBooking.traveler_phone}</p>
              <p>Email: {conflict.conflictingBooking.traveler_email}</p>
            </div>
            <button onClick={() => setConflict(null)} className="mt-6 w-full bg-[#0A6FA8] text-white rounded-full py-3 text-xs font-bold hover:bg-[#0C7EBF]">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

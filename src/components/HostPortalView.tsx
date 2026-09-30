import React, { useState, useEffect } from 'react';
import { BookingRequest } from '../types';
import { TrustBreakdownCard } from './TrustBreakdownCard';
import { HostAddressMapping } from './HostAddressMapping';

interface HostPortalViewProps {
  isNightShiftMode: boolean;
  bookingRequests: BookingRequest[];
  onApproveBooking: (id: string) => Promise<void> | void;
  onDeclineBooking: (id: string) => Promise<void> | void;
  onGoToHousing: () => void;
  initialTab?: 'dashboard' | 'editor' | 'onboarding';
  currentUser?: {
    id?: string;
    role: string;
    name: string;
    email?: string;
  };
}

export const HostPortalView: React.FC<HostPortalViewProps> = ({
  isNightShiftMode,
  bookingRequests,
  onApproveBooking,
  onDeclineBooking,
  onGoToHousing,
  initialTab = 'dashboard',
  currentUser,
}) => {
  const [activeHostTab, setActiveHostTab] = useState<'dashboard' | 'editor' | 'onboarding'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveHostTab(initialTab);
    }
  }, [initialTab]);

  // Screen B2 Editor Form State
  const [propertyType, setPropertyType] = useState<'entire_property' | 'individual_rooms'>('individual_rooms');
  const [roomCount, setRoomCount] = useState<number>(2);
  const [roomAPrice, setRoomAPrice] = useState<number>(1950);
  const [roomBPrice, setRoomBPrice] = useState<number>(1850);
  const [requiresSecurityDeposit, setRequiresSecurityDeposit] = useState<boolean>(true);
  const [securityDepositAmount, setSecurityDepositAmount] = useState<number>(250);
  const [cancellationTier, setCancellationTier] = useState<'Flexible' | 'Moderate' | 'Strict'>('Flexible');
  const [hasBlackout, setHasBlackout] = useState(true);
  const [hasQuietHours, setHasQuietHours] = useState(true);
  const [hasScrubWasher, setHasScrubWasher] = useState(true);
  const [hasDedicatedParking, setHasDedicatedParking] = useState(true);
  const [hasFiberWifi, setHasFiberWifi] = useState(true);
  const [isSavedEditor, setIsSavedEditor] = useState(false);

  // Stripe Connect State
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);

  // Processing States for bookings
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);

  // Host ID from authenticated user or fallback for demo
  const hostId = currentUser?.id || 'host-sarah-m';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('stripe_return') === 'true') {
      setActiveHostTab('onboarding');
      setPayoutsEnabled(true);

      setTimeout(() => {
        fetchPayoutStatus();
      }, 2500);

      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('stripe_refresh') === 'true') {
      setActiveHostTab('onboarding');
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchPayoutStatus();
    } else {
      fetchPayoutStatus();
    }
  }, []);

  const fetchPayoutStatus = async () => {
    try {
      const res = await fetch(`/api/stripe/status/${hostId}`);
      if (res.ok) {
        const data = await res.json();
        setPayoutsEnabled(data.payouts_enabled);
      }
    } catch (err) {
      console.error('Failed to fetch Stripe status', err);
    }
  };

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    try {
      const res = await fetch('/api/stripe/account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId,
          returnUrl: `${window.location.origin}${window.location.pathname}?stripe_return=true`,
          refreshUrl: `${window.location.origin}${window.location.pathname}?stripe_refresh=true`,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setIsConnectingStripe(false);
      }
    } catch (err) {
      console.error('Failed to generate account link', err);
      setIsConnectingStripe(false);
    }
  };

  const handleSaveListing = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedEditor(true);
    setTimeout(() => setIsSavedEditor(false), 3000);
  };

  const pendingBookings = bookingRequests.filter((b) => b.status === 'pending_host_approval');
  const confirmedBookings = bookingRequests.filter((b) => b.status === 'approved' || b.status === 'active');
  const totalMonthlyNet = bookingRequests
    .filter((b) => b.status !== 'declined')
    .reduce((sum, b) => sum + (b.hostNetPayout || 0), 0);

  return (
    <div
      className={`w-full py-5 sm:py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-5 transition-colors ${
        isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#0B2559]'
      }`}
    >
      {/* Host Portal Top Bar - Streamlined Header & Capsule Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A6FA8] dark:text-[#3E9AD1]">
              Portal B • Host Console
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#142823] dark:text-[#aff0db] text-[10px] font-bold">
              ~95% Net Payout Partner
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B2559] dark:text-white">
            Host Sanctuary Control Console
          </h1>
        </div>

        {/* Capsule Segment Switcher */}
        <div className="inline-flex p-1 rounded-full bg-[#EFF6FB] dark:bg-[#0E1A2E] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] shrink-0">
          <button
            type="button"
            onClick={() => setActiveHostTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeHostTab === 'dashboard'
                ? 'bg-white dark:bg-[#182840] text-[#0B2559] dark:text-white shadow-[0_1px_3px_rgba(11,37,89,0.08)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            <span>Requests</span>
            {pendingBookings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#A8452E] text-white text-[10px] font-bold tabular-nums">
                {pendingBookings.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveHostTab('editor')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeHostTab === 'editor'
                ? 'bg-white dark:bg-[#182840] text-[#0B2559] dark:text-white shadow-[0_1px_3px_rgba(11,37,89,0.08)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            Listing &amp; Rooms
          </button>
          <button
            type="button"
            onClick={() => setActiveHostTab('onboarding')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeHostTab === 'onboarding'
                ? 'bg-white dark:bg-[#182840] text-[#0B2559] dark:text-white shadow-[0_1px_3px_rgba(11,37,89,0.08)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            Verification
          </button>
        </div>
      </div>

      {/* SCREEN B3: Host Booking Requests Approval Queue */}
      {activeHostTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Quick Metrics 4-Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500 block">Pending Review</span>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-[#A8452E] dark:text-[#F4E2DC] tabular-nums">
                  {pendingBookings.length}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">24-hr SLA window</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500 block">Active Stays</span>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-[#0B2559] dark:text-white tabular-nums">
                  {confirmedBookings.length}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Confirmed rotations</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500 block">Est. Net Payout</span>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-[#2F6E5E] dark:text-[#aff0db] tabular-nums">
                  ${Math.round(totalMonthlyNet).toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">~95% split / mo</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500 block">Direct Payouts</span>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#2F6E5E] dark:text-[#aff0db] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{payoutsEnabled ? 'Direct Active' : 'Connected'}</span>
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Automated direct deposit</span>
              </div>
            </div>
          </div>

          {/* Pending Booking Requests Approval Queue */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0A6FA8] text-[20px]">pending_actions</span>
                <h2 className="text-base font-bold text-[#0B2559] dark:text-white">
                  Booking Requests Queue
                </h2>
              </div>
              {pendingBookings.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#F4E2DC] text-[#A8452E] dark:bg-[#F4E2DC]/20 dark:text-[#F4E2DC] text-[11px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A8452E]"></span>
                  <span>{pendingBookings.length} Awaiting Decision</span>
                </span>
              )}
            </div>

            {bookingRequests.length === 0 ? (
              <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-8 text-center text-xs text-gray-400 shadow-[0_2px_12px_rgba(11,37,89,0.06)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                No pending requests. Incoming traveling clinician bids will appear here with instant alerts.
              </div>
            ) : (
              <div className="space-y-3.5">
                {bookingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-4"
                  >
                    {/* Header & Clinician Identity */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={req.clinicianAvatar}
                          alt={req.clinicianName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#0A6FA8]/20 shrink-0"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <h3 className="text-base font-bold text-[#0B2559] dark:text-white">
                              {req.clinicianName}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-[#EFF6FB] text-[#0A6FA8] dark:bg-[#182840] dark:text-[#3E9AD1] text-[10px] font-bold">
                              {req.clinicianTitle}
                            </span>
                            <span className="text-[11px] text-gray-400">({req.clinicianPhone})</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
                            <p>
                              <strong>Hospital Assignment:</strong> {req.hospitalName} • {req.unitSpecialty}
                            </p>
                            <p>
                              <strong>Duration:</strong> {req.startDate} to {req.endDate} ({req.durationWeeks} Weeks)
                            </p>
                            {req.specialRequests && (
                              <p className="italic text-gray-500 mt-1 bg-[#EFF6FB] dark:bg-[#0E1A2E] p-2 rounded-lg text-[11px]">
                                “{req.specialRequests}”
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Net Payout & Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-[11px] text-gray-500">Monthly Net Payout:</div>
                          <div className="text-lg font-bold text-[#2F6E5E] dark:text-[#aff0db] tabular-nums">
                            ${req.hostNetPayout.toFixed(2)} / mo
                          </div>
                          <div className="text-[10px] text-gray-400 tabular-nums">Total pre-auth hold: ${req.totalInitialCharge.toLocaleString()}</div>
                        </div>

                        {req.status === 'pending_host_approval' ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={processingBookingId === req.id}
                              onClick={async () => {
                                setProcessingBookingId(req.id);
                                await onDeclineBooking(req.id);
                                setProcessingBookingId(null);
                              }}
                              className="px-3.5 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingBookingId === req.id ? 'Processing...' : 'Decline'}
                            </button>
                            <button
                              type="button"
                              disabled={processingBookingId === req.id}
                              onClick={async () => {
                                setProcessingBookingId(req.id);
                                await onApproveBooking(req.id);
                                setProcessingBookingId(null);
                              }}
                              className="px-4 py-1.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold shadow-[0_1px_3px_rgba(10,111,168,0.25)] cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingBookingId === req.id ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  Processing...
                                </span>
                              ) : (
                                <span>Accept Booking</span>
                              )}
                            </button>
                          </div>
                        ) : req.status === 'declined' ? (
                          <div className="px-3 py-1 rounded-sm bg-[#F4E2DC] text-[#A8452E] dark:bg-[#F4E2DC]/20 dark:text-[#F4E2DC] text-[11px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">cancel</span>
                            <span>Declined</span>
                          </div>
                        ) : (
                          <div className="px-3 py-1 rounded-sm bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#142823] dark:text-[#aff0db] text-[11px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">task_alt</span>
                            <span>Accepted &amp; Confirmed</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Compact Clinician Verification Badges */}
                    <div className="pt-2 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#142823] dark:text-[#aff0db] text-[11px] font-bold">
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        <span>Active State Nursing License</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFF6FB] text-[#0A6FA8] dark:bg-[#182840] dark:text-[#3E9AD1] text-[11px] font-semibold">
                        <span className="material-symbols-outlined text-[13px]">badge</span>
                        <span>Government RealID Verified</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFF6FB] text-[#0A6FA8] dark:bg-[#182840] dark:text-[#3E9AD1] text-[11px] font-semibold">
                        <span className="material-symbols-outlined text-[13px]">phonelink_ring</span>
                        <span>Mobile Confirmed</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Listing & Room Calendar Editor - Responsive Card Grid Layout */}
      {activeHostTab === 'editor' && (
        <form onSubmit={handleSaveListing} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#0A6FA8] dark:text-[#3E9AD1] uppercase tracking-wider">
                Listing &amp; Multi-Room Setup
              </span>
              <h2 className="text-lg font-bold text-[#0B2559] dark:text-white">Listing Configuration &amp; Healthcare Amenities</h2>
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold shadow-[0_1px_3px_rgba(10,111,168,0.25)] cursor-pointer transition-all"
            >
              Save Configuration
            </button>
          </div>

          {isSavedEditor && (
            <div className="p-3 rounded-xl bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#142823] dark:text-[#aff0db] text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Listing changes saved and synchronized with the search index!</span>
            </div>
          )}

          {/* 2-Column Responsive Card-Based Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column (7 cols): Address & Property Configuration */}
            <div className="lg:col-span-7 space-y-4">
              {/* Card 1: Google Maps Address & Hospital Distance Mapping */}
              <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                <HostAddressMapping isNightShiftMode={isNightShiftMode} />
              </div>

              {/* Card 2: Property Configuration & Room Pricing */}
              <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-3.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">
                  Property Configuration Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPropertyType('entire_property')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      propertyType === 'entire_property'
                        ? 'border-[#0A6FA8] bg-[#EFF6FB] dark:bg-[#15233a]'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#0B2559] dark:text-white">Entire Property</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Clinician or couple occupies whole unit</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPropertyType('individual_rooms')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      propertyType === 'individual_rooms'
                        ? 'border-[#0A6FA8] bg-[#EFF6FB] dark:bg-[#15233a]'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#0B2559] dark:text-white">Individual Room Units</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Independent rooms (Room A, Room B) w/ private locks</div>
                  </button>
                </div>

                {propertyType === 'individual_rooms' && (
                  <div className="pt-2 border-t border-[rgba(11,37,89,0.05)] dark:border-[#233550] space-y-2.5">
                    <span className="text-[11px] font-bold text-[#0A6FA8] dark:text-[#3E9AD1] uppercase block">
                      Multi-Room Monthly Rates
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-[#EFF6FB] dark:bg-[#0E1A2E] space-y-1.5">
                        <div className="font-bold text-xs text-[#0B2559] dark:text-white">Room A (Master Suite)</div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400">$</span>
                          <input
                            type="number"
                            value={roomAPrice}
                            onChange={(e) => setRoomAPrice(Number(e.target.value))}
                            className="w-full text-sm font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none tabular-nums"
                          />
                          <span className="text-xs text-gray-400">/mo</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#EFF6FB] dark:bg-[#0E1A2E] space-y-1.5">
                        <div className="font-bold text-xs text-[#0B2559] dark:text-white">Room B (Private Bath)</div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400">$</span>
                          <input
                            type="number"
                            value={roomBPrice}
                            onChange={(e) => setRoomBPrice(Number(e.target.value))}
                            className="w-full text-sm font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none tabular-nums"
                          />
                          <span className="text-xs text-gray-400">/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (5 cols): Deposit Controls, Shift Amenities, Cancellation Tier */}
            <div className="lg:col-span-5 space-y-4">
              {/* Card 3: $0 Security Deposit Platform Guarantee */}
              <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6E5E] dark:text-[#aff0db]">
                      Clinician Protection
                    </span>
                    <h3 className="text-xs font-bold text-[#0B2559] dark:text-white">
                      Zero Security Deposit Hold
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#142823] dark:text-[#aff0db] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    $0 Hold
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#EFF6FB] dark:bg-[#0E1A2E] text-xs text-[#0B2559] dark:text-[#c0c7d1] space-y-1.5 leading-relaxed">
                  <p className="font-semibold text-[11px] text-[#0A6FA8] dark:text-[#3E9AD1]">
                    Strict Platform-Wide Zero Hold Rule
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Traveling clinicians complete 12-hour shifts and are never inconvenienced with security deposit card holds or pre-authorization freezes.
                  </p>
                </div>
              </div>

              {/* Card 4: Healthcare Shift Amenities */}
              <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-2.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">
                  Shift Clinician Amenities
                </label>
                <div className="space-y-1.5 text-xs">
                  <label className="p-2 rounded-lg hover:bg-[#EFF6FB] dark:hover:bg-[#0E1A2E] flex items-center gap-2 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={hasBlackout}
                      onChange={(e) => setHasBlackout(e.target.checked)}
                      className="rounded accent-[#0A6FA8]"
                    />
                    <span>100% Blackout Drapes (Zero Bleed)</span>
                  </label>
                  <label className="p-2 rounded-lg hover:bg-[#EFF6FB] dark:hover:bg-[#0E1A2E] flex items-center gap-2 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={hasQuietHours}
                      onChange={(e) => setHasQuietHours(e.target.checked)}
                      className="rounded accent-[#0A6FA8]"
                    />
                    <span>Enforced Quiet Hours (08:00–17:00)</span>
                  </label>
                  <label className="p-2 rounded-lg hover:bg-[#EFF6FB] dark:hover:bg-[#0E1A2E] flex items-center gap-2 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={hasScrubWasher}
                      onChange={(e) => setHasScrubWasher(e.target.checked)}
                      className="rounded accent-[#0A6FA8]"
                    />
                    <span>In-Unit Scrub Sanitizing Washer</span>
                  </label>
                  <label className="p-2 rounded-lg hover:bg-[#EFF6FB] dark:hover:bg-[#0E1A2E] flex items-center gap-2 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={hasDedicatedParking}
                      onChange={(e) => setHasDedicatedParking(e.target.checked)}
                      className="rounded accent-[#0A6FA8]"
                    />
                    <span>Dedicated Off-Street Parking Space</span>
                  </label>
                  <label className="p-2 rounded-lg hover:bg-[#EFF6FB] dark:hover:bg-[#0E1A2E] flex items-center gap-2 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={hasFiberWifi}
                      onChange={(e) => setHasFiberWifi(e.target.checked)}
                      className="rounded accent-[#0A6FA8]"
                    />
                    <span>500+ Mbps Fiber Wi-Fi (Epic Charting)</span>
                  </label>
                </div>
              </div>

              {/* Card 5: Cancellation Tier Selection */}
              <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">
                  Cancellation Policy
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Flexible', 'Moderate', 'Strict'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setCancellationTier(tier)}
                      className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                        cancellationTier === tier
                          ? 'border-[#0A6FA8] bg-[#EFF6FB] dark:bg-[#15233a] font-bold text-[#0A6FA8]'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500'
                      }`}
                    >
                      <div className="text-xs">{tier}</div>
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {cancellationTier === 'Flexible'
                    ? '100% refund up to 14 days prior to rotation'
                    : cancellationTier === 'Moderate'
                    ? '100% refund up to 30 days prior to rotation'
                    : '50% refund up to 30 days prior to rotation'}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Host Onboarding & Identity Verification - 3-Card Responsive Grid */}
      {activeHostTab === 'onboarding' && (
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold text-[#0A6FA8] dark:text-[#3E9AD1] uppercase tracking-wider">
              Host Onboarding &amp; Verification
            </span>
            <h2 className="text-lg font-bold text-[#0B2559] dark:text-white">Host Identity &amp; Authority to List</h2>
            <p className="text-xs text-gray-500">Required prior to publishing units on the traveling clinician search map</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Card 1 */}
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0A6FA8]/10 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                  <h3 className="font-bold text-xs text-[#0B2559] dark:text-white">1. Photo ID &amp; Biometrics</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Government photo identification and facial liveness match for host authenticity.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F6E5E] dark:text-[#aff0db] pt-2 border-t border-[rgba(11,37,89,0.05)] dark:border-[#233550]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Verified RealID</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0A6FA8]/10 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <h3 className="font-bold text-xs text-[#0B2559] dark:text-white">2. Authority to List</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Property deed, property tax receipt, or master lease sublease authorization.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F6E5E] dark:text-[#aff0db] pt-2 border-t border-[rgba(11,37,89,0.05)] dark:border-[#233550]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Deed Verified on File</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0A6FA8]/10 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  </div>
                  <h3 className="font-bold text-xs text-[#0B2559] dark:text-white">3. Payout Account</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Direct deposit routing to receive automatic monthly disbursements on booking acceptance.
                </p>
              </div>
              <div className="pt-2 border-t border-[rgba(11,37,89,0.05)] dark:border-[#233550]">
                {isConnectingStripe ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1]">
                    <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                    <span>Connecting bank routing...</span>
                  </div>
                ) : payoutsEnabled ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F6E5E] dark:text-[#aff0db]">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Direct Payouts Active</span>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectStripe}
                    className="w-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold py-1.5 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[15px]">account_balance_wallet</span>
                    <span>Connect Payouts</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

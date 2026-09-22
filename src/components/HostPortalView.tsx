import React, { useState } from 'react';
import { BookingRequest } from '../types';
import { TrustBreakdownCard } from './TrustBreakdownCard';

interface HostPortalViewProps {
  isNightShiftMode: boolean;
  bookingRequests: BookingRequest[];
  onApproveBooking: (id: string) => void;
  onDeclineBooking: (id: string) => void;
  onGoToHousing: () => void;
}

export const HostPortalView: React.FC<HostPortalViewProps> = ({
  isNightShiftMode,
  bookingRequests,
  onApproveBooking,
  onDeclineBooking,
  onGoToHousing,
}) => {
  const [activeHostTab, setActiveHostTab] = useState<'dashboard' | 'editor' | 'onboarding'>('dashboard');

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

  // Screen B1 Onboarding State
  const [idUploaded, setIdUploaded] = useState(true);
  const [authorityUploaded, setAuthorityUploaded] = useState(true);

  // Calendar blocked dates
  const [blockedDays, setBlockedDays] = useState<number[]>([12, 13]);

  const toggleBlockDay = (day: number) => {
    setBlockedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveListing = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedEditor(true);
    setTimeout(() => setIsSavedEditor(false), 3000);
  };

  return (
    <div className={`w-full py-8 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto transition-colors ${
      isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#001848]'
    }`}>
      {/* Host Portal Navigation Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#005684] dark:text-[#93ccff]">
              Portal B • Host &amp; Property Management
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#195b4c]/15 text-[#195b4c] dark:text-[#aff0db] text-[11px] font-bold">
              ~95% Net Payout Partner
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Host Sanctuary Control Console
          </h1>
        </div>

        <div className="bg-white dark:bg-[#0B1626] p-1.5 rounded-2xl shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveHostTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer ${
              activeHostTab === 'dashboard'
                ? 'bg-[#001848] text-white shadow-xs'
                : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
            }`}
          >
            Host Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveHostTab('editor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer ${
              activeHostTab === 'editor'
                ? 'bg-[#001848] text-white shadow-xs'
                : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
            }`}
          >
            Listing &amp; Rooms
          </button>
          <button
            type="button"
            onClick={() => setActiveHostTab('onboarding')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer ${
              activeHostTab === 'onboarding'
                ? 'bg-[#001848] text-white shadow-xs'
                : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
            }`}
          >
            Host Verification
          </button>
        </div>
      </div>

      {/* SCREEN B3: Host Dashboard */}
      {activeHostTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Earnings & Payout Summary Metric Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1626] shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Gross Booking Value (GBV)
              </span>
              <div className="text-2xl font-black text-[#001848] dark:text-white">$7,800.00</div>
              <div className="text-[11px] text-gray-500 mt-1">4 Active 13-Week Rotations</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1626] shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Net Host Payout (~95%)
              </span>
              <div className="text-2xl font-black text-[#195b4c] dark:text-[#aff0db]">$7,410.00</div>
              <div className="text-[11px] text-[#195b4c] font-semibold mt-1">Stripe Connect Express Direct</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1626] shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Platform App Fee (5%)
              </span>
              <div className="text-2xl font-black text-[#005684] dark:text-[#93ccff]">$390.00</div>
              <div className="text-[11px] text-gray-500 mt-1">$0 Host Onboarding Fee</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1626] shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Clinician Rating
              </span>
              <div className="text-2xl font-black text-[#745b0d] dark:text-[#ffdf91] flex items-center gap-1">
                <span>4.98</span>
                <span className="material-symbols-outlined text-xl">star</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">19 Verified RN Reviews</div>
            </div>
          </div>

          {/* Pending Booking Requests Approval Queue */}
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#005684]/15 text-[#005684] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">Booking Requests Approval Queue</h2>
                  <p className="text-xs text-gray-500">Review traveling nurse contract credentials before 24-hr SLA expiry</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>{bookingRequests.filter(b => b.status === 'pending_host_approval').length} Pending Approval</span>
              </span>
            </div>

            {bookingRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No pending requests. New clinician bids will appear here with instant alerts.
              </div>
            ) : (
              <div className="space-y-6">
                {bookingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 sm:p-6 rounded-3xl bg-[#f2f3ff] dark:bg-[#182840] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      <div className="flex items-start gap-4">
                        <img
                          src={req.clinicianAvatar}
                          alt={req.clinicianName}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#005684] shrink-0"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-[#001848] dark:text-white">
                              {req.clinicianName}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#0a6fa8]/10 text-[#005684] dark:bg-[#0a6fa8]/20 dark:text-[#93ccff] text-[11px] font-bold">
                              {req.clinicianTitle}
                            </span>
                            <span className="text-xs text-gray-500">({req.clinicianPhone})</span>
                          </div>
                          <div className="text-xs text-[#404850] dark:text-[#c0c7d1] space-y-0.5">
                            <p>
                              <strong>Hospital Assignment:</strong> {req.hospitalName} • {req.unitSpecialty}
                            </p>
                            <p>
                              <strong>Duration:</strong> {req.startDate} to {req.endDate} ({req.durationWeeks} Weeks)
                            </p>
                            {req.specialRequests && (
                              <p className="italic text-gray-500 mt-1 bg-white/60 dark:bg-black/20 p-2 rounded-lg">
                                “{req.specialRequests}”
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Monthly Net Payout:</div>
                          <div className="text-lg font-black text-[#195b4c] dark:text-[#aff0db]">
                            ${req.hostNetPayout.toFixed(2)} / mo
                          </div>
                          <div className="text-[10px] text-gray-400">Total hold: ${req.totalInitialCharge.toLocaleString()}</div>
                        </div>

                        {req.status === 'pending_host_approval' ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onDeclineBooking(req.id)}
                              className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-xs font-bold hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => onApproveBooking(req.id)}
                              className="px-5 py-2 rounded-full bg-[#195b4c] hover:bg-[#14483d] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#14483d] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <span>Accept Booking</span>
                            </button>
                          </div>
                        ) : (
                          <div className="px-4 py-1.5 rounded-full bg-[#195b4c]/20 text-[#195b4c] dark:text-[#aff0db] text-xs font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">task_alt</span>
                            <span>Accepted &amp; Confirmed</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Trust Breakdown Card */}
                    <div className="pt-2">
                      <TrustBreakdownCard
                        isNightShiftMode={isNightShiftMode}
                        clinicianName={req.clinicianName}
                        clinicianTitle={req.clinicianTitle}
                        verificationTimestamp="September 2026"
                        stateBoard="State Board of Nursing"
                        titleBadge="Verified Clinician Audit"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar & Availability Management */}
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold">Interactive Room Calendar</h3>
                <p className="text-xs text-gray-500">Click dates to toggle availability or block maintenance days</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-[#005684]"></span>
                  <span>Active Clinician Stay</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-rose-500"></span>
                  <span>Blocked</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="font-bold text-gray-400 py-1">{d}</div>
              ))}
              {Array.from({ length: 31 }).map((_, idx) => {
                const day = idx+ 1;
                const isBlocked = blockedDays.includes(day);
                const isOccupied = day >= 1 && day <= 28;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleBlockDay(day)}
                    className={`h-12 rounded-xl font-bold flex flex-col items-center justify-center transition-all duration-200 ease-in-out cursor-pointer ${
                      isBlocked
                        ? 'bg-rose-500 text-white'
                        : isOccupied
                        ? 'bg-[#005684] text-white'
                        : 'bg-[#f2f3ff] dark:bg-[#182840] hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff]'
                    }`}
                  >
                    <span>{day}</span>
                    <span className="text-[9px] font-normal opacity-80">
                      {isBlocked ? 'Blocked' : isOccupied ? 'UCSF RN' : 'Open'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Listing & Room Calendar Editor */}
      {activeHostTab === 'editor' && (
        <form onSubmit={handleSaveListing} className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] pb-4">
            <div>
              <span className="text-xs font-bold text-[#005684] dark:text-[#93ccff] uppercase tracking-wider">
                Listing &amp; Room Calendar Editor
              </span>
              <h2 className="text-xl font-bold">Listing &amp; Multi-Room Setup</h2>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#001848] hover:bg-[#162e62] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Save Configuration
            </button>
          </div>

          {isSavedEditor && (
            <div className="p-3.5 rounded-xl bg-[#aff0db]/30 text-[#195b4c] dark:text-[#aff0db] text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Listing changes saved and synchronized with the search index!</span>
            </div>
          )}

          {/* Property Type Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Property Configuration Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPropertyType('entire_property')}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 ease-in-out ${
                  propertyType === 'entire_property'
                    ? 'border-[#005684] bg-[#eaedff]/50 dark:bg-[#15233a]'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="font-bold text-sm">Entire Property</div>
                <div className="text-xs text-gray-500 mt-1">Single nurse or clinician family occupies whole unit</div>
              </button>

              <button
                type="button"
                onClick={() => setPropertyType('individual_rooms')}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 ease-in-out ${
                  propertyType === 'individual_rooms'
                    ? 'border-[#005684] bg-[#eaedff]/50 dark:bg-[#15233a]'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="font-bold text-sm">Individual Room Units</div>
                <div className="text-xs text-gray-500 mt-1">Independent rooms (Room A, Room B) with private locks &amp; rates</div>
              </button>
            </div>
          </div>

          {/* Multi-Room Setup */}
          {propertyType === 'individual_rooms' && (
            <div className="p-5 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] space-y-4">
              <div className="font-bold text-xs text-[#005684] dark:text-[#93ccff] uppercase">
                Multi-Room Profile Rates
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#111e33] space-y-2">
                  <div className="font-bold text-xs">Room A (Master w/ Ensuite)</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">$</span>
                    <input
                      type="number"
                      value={roomAPrice}
                      onChange={(e) => setRoomAPrice(Number(e.target.value))}
                      className="w-full text-sm font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none"
                    />
                    <span className="text-xs text-gray-400">/mo</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-[#111e33] space-y-2">
                  <div className="font-bold text-xs">Room B (Garden View w/ Private Bath)</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">$</span>
                    <input
                      type="number"
                      value={roomBPrice}
                      onChange={(e) => setRoomBPrice(Number(e.target.value))}
                      className="w-full text-sm font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none"
                    />
                    <span className="text-xs text-gray-400">/mo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Host Pricing & Security Deposit Control */}
          <div className="p-5 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] border border-[rgba(11,37,89,0.08)] dark:border-[#233550] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#005684] dark:text-[#93ccff]">
                  Pricing &amp; Security Deposit Controls
                </span>
                <h3 className="text-sm font-bold text-[#001848] dark:text-white">
                  Security Deposit (Stripe Authorization Hold)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresSecurityDeposit}
                    onChange={(e) => setRequiresSecurityDeposit(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-200 ease-in-out dark:border-gray-600 peer-checked:bg-[#005684]"></div>
                </label>
                <span className="text-xs font-semibold">
                  {requiresSecurityDeposit ? 'Host Deposit Enabled' : 'No Deposit ($0 Free Hold)'}
                </span>
              </div>
            </div>

            {requiresSecurityDeposit ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Authorization Hold Amount ($)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-500">$</span>
                    <input
                      type="number"
                      min={50}
                      max={500}
                      step={25}
                      value={securityDepositAmount}
                      onChange={(e) => setSecurityDepositAmount(Number(e.target.value))}
                      className="w-32 rounded-xl p-2.5 text-sm font-bold bg-white dark:bg-[#111e33] border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#005684]"
                    />
                    <span className="text-xs text-gray-500">recommended: $250</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/70 dark:bg-[#111e33]/70 text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                  <strong>Stripe Pre-Auth Hold Rule:</strong> This amount is <em>never collected as upfront cash</em>. Stripe holds funds 48 hours prior to check-in and releases them automatically 7 days after checkout if no damage claim is filed.
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#aff0db]/20 text-[11px] text-[#195b4c] dark:text-[#aff0db] flex items-center gap-2">
                <span className="material-symbols-outlined text-base">verified</span>
                <span><strong>Clinician Attraction Perk:</strong> Offering a $0 deposit requirement displays a verified"Zero Deposit Hold" badge on search cards to boost occupancy.</span>
              </div>
            )}
          </div>

          {/* Healthcare Amenity Checklist */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-3">
              Healthcare Shift Amenities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasBlackout}
                  onChange={(e) => setHasBlackout(e.target.checked)}
                  className="rounded accent-[#005684]"
                />
                <span>100% Blackout Drapes (Zero Bleed)</span>
              </label>
              <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasQuietHours}
                  onChange={(e) => setHasQuietHours(e.target.checked)}
                  className="rounded accent-[#005684]"
                />
                <span>Enforced Quiet Hours (08:00–17:00)</span>
              </label>
              <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasScrubWasher}
                  onChange={(e) => setHasScrubWasher(e.target.checked)}
                  className="rounded accent-[#005684]"
                />
                <span>In-Unit Scrub Sanitizing Washer</span>
              </label>
              <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDedicatedParking}
                  onChange={(e) => setHasDedicatedParking(e.target.checked)}
                  className="rounded accent-[#005684]"
                />
                <span>Dedicated Off-Street Parking Space</span>
              </label>
              <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFiberWifi}
                  onChange={(e) => setHasFiberWifi(e.target.checked)}
                  className="rounded accent-[#005684]"
                />
                <span>500+ Mbps Fiber Wi-Fi (Epic Charting)</span>
              </label>
            </div>
          </div>

          {/* Cancellation Tier Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Preferred Cancellation Policy Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['Flexible', 'Moderate', 'Strict'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setCancellationTier(tier)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 ease-in-out ${
                    cancellationTier === tier
                      ? 'border-[#005684] bg-[#eaedff]/50 dark:bg-[#15233a]'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="font-bold text-xs">{tier} Tier</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {tier === 'Flexible'
                      ? '100% refund up to 14 days prior'
                      : tier === 'Moderate'
                      ? '100% refund up to 30 days prior'
                      : '50% refund up to 30 days prior'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* Host Onboarding & Identity Verification */}
      {activeHostTab === 'onboarding' && (
        <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] space-y-6">
          <div>
            <span className="text-xs font-bold text-[#005684] dark:text-[#93ccff] uppercase tracking-wider">
              Host Onboarding &amp; Verification
            </span>
            <h2 className="text-xl font-bold">Host Identity &amp; Authority to List</h2>
            <p className="text-xs text-gray-500">Required prior to publishing units on the traveling clinician map</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005684]">badge</span>
                <h3 className="font-bold text-sm">1. Government Photo ID &amp; Selfie</h3>
              </div>
              <p className="text-xs text-gray-500">
                Processed via Stripe Identity UI. Checks government database for host authenticity.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-[#195b4c] dark:text-[#aff0db]">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Verified RealID</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005684]">description</span>
                <h3 className="font-bold text-sm">2. Authority to List Verification</h3>
              </div>
              <p className="text-xs text-gray-500">
                Property deed, property tax receipt, or master lease sublease authorization.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-[#195b4c] dark:text-[#aff0db]">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Deed Verified on File</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

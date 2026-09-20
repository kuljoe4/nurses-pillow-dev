import React, { useState } from 'react';
import { HousingListing, BookingRequest } from '../types';

interface ItemizedCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: HousingListing;
  isNightShiftMode: boolean;
  onBookingSubmitted: (booking: BookingRequest) => void;
}

export const ItemizedCheckoutModal: React.FC<ItemizedCheckoutModalProps> = ({
  isOpen,
  onClose,
  listing,
  isNightShiftMode,
  onBookingSubmitted,
}) => {
  const [agreedToPolicy, setAgreedToPolicy] = useState(true);
  const [specialNote, setSpecialNote] = useState('Hi Sarah! I am rotating day shifts in the PICU at UCSF Mission Bay. Excited for the quiet sanctuary.');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('883');
  const [cardZip, setCardZip] = useState('94122');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const monthlyRent = listing.monthlyRate || 1950;
  const securityDeposit = 250;
  const cleaningFee = 150;
  const petFee = 0;
  const travelerFee = 0;
  const totalInitialCharge = monthlyRent + securityDeposit + cleaningFee + petFee + travelerFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToPolicy) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      const newBooking: BookingRequest = {
        id: `np-book-${Date.now()}`,
        clinicianName: 'Sarah Jenkins',
        clinicianTitle: 'BSN, RN (PICU / Telemetry)',
        clinicianAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq4qMRmWv2abJRAge1U60MiJz3ulOwOef26b8BlXofCKd0UYHmuYFFweYJOfwOhJ_ggE5Ojndfvp_UgeBPscmhcUpTEyosqeYWT0XOxXEVi_tIhHf24J1MSAxhpaGZomPPjhhjxPvZm1hpBWgQ5TLIwGKQPTELer9K4P2fAWRC9iyShXy8d0AFBKFqZndhLwcltJG7FThPWTne1t5lePzE47OauuD_JvjBvlr9Q8OblPNkVH952ytP',
        clinicianPhone: '+1 (919) 555-0198',
        hospitalName: listing.nearestHospital || 'UCSF Medical Center - Mission Bay',
        unitSpecialty: 'Pediatric Intensive Care Unit (PICU)',
        listingId: listing.id,
        listingTitle: listing.title,
        startDate: '2024-10-01',
        endDate: '2024-12-31',
        durationWeeks: 13,
        monthlyRent,
        securityDeposit,
        cleaningFee,
        petFee,
        travelerFee,
        totalInitialCharge,
        hostNetPayout: Number((monthlyRent * 0.95).toFixed(2)),
        status: 'pending_host_approval',
        submittedAt: 'Just now',
        deadlineHoursRemaining: 24,
        specialRequests: specialNote,
        doorCode: '•••• 4821',
        wifiNetwork: 'SunsetSanctuary-5G',
      };

      onBookingSubmitted(newBooking);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-2xl my-8 rounded-3xl p-6 sm:p-8 shadow-2xl relative border ${
          isNightShiftMode
            ? 'bg-[#0E1A2E] border-[#233550] text-[#E6ECF7]'
            : 'bg-white border-[rgba(11,37,89,0.1)] text-[#001848]'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close checkout modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-black/10 cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {!isSuccess ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#005684] text-white flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-xl">shield_person</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#005684] dark:text-[#93ccff]">
                  Screen A4 • Itemized Checkout &amp; Request
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Request to Book Shift Sanctuary
                </h2>
              </div>
            </div>

            {/* Property Summary Pill */}
            <div className="p-3.5 rounded-2xl bg-[#eaedff]/60 dark:bg-[#15233a] border border-[#005684]/20 flex items-center justify-between gap-4 mb-5">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#005684] dark:text-[#93ccff]">
                  {listing.nearestHospital} • 13-Week Assignment
                </div>
                <div className="text-sm font-bold truncate text-[#001848] dark:text-white">
                  {listing.title}
                </div>
                <div className="text-[11px] text-[#404850] dark:text-[#c0c7d1]">
                  Oct 1, 2024 – Dec 31, 2024 • Shift-Flexible Tier
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#195b4c]/15 text-[#195b4c] dark:text-[#aff0db] text-xs font-bold shrink-0">
                $0 Platform Fee
              </span>
            </div>

            {/* Verification Check State */}
            <div className="p-3.5 rounded-xl bg-[#f2f3ff] dark:bg-[#182840] mb-5">
              <div className="text-xs font-bold text-[#001848] dark:text-white mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#195b4c] dark:text-[#aff0db]">verified</span>
                <span>Clinician Pre-Verification Status</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#195b4c] dark:text-[#aff0db] font-medium">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Twilio SMS OTP Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#195b4c] dark:text-[#aff0db] font-medium">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Stripe Identity Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#195b4c] dark:text-[#aff0db] font-medium">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>CA BRN RN-9482015 Active</span>
                </div>
              </div>
            </div>

            {/* Itemized Cost Summary Table */}
            <div className="border border-[rgba(11,37,89,0.1)] dark:border-[#233550] rounded-2xl p-4 mb-5 space-y-2.5 text-xs">
              <div className="text-xs font-bold text-[#001848] dark:text-white border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] pb-2">
                Itemized Cost Breakdown
              </div>
              <div className="flex justify-between items-center text-[#404850] dark:text-[#c0c7d1]">
                <span>First Month Lodging Rate</span>
                <span className="font-bold text-[#001848] dark:text-white">${monthlyRent.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between items-center text-[#404850] dark:text-[#c0c7d1]">
                <span className="flex items-center gap-1">
                  Refundable Security Deposit Hold (Stripe Auth Hold)
                  <span className="material-symbols-outlined text-[13px] text-gray-400" title="Released at checkout">info</span>
                </span>
                <span className="font-bold text-[#001848] dark:text-white">${securityDeposit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[#404850] dark:text-[#c0c7d1]">
                <span>One-Time Scrub Sanitization &amp; Cleaning Fee</span>
                <span className="font-bold text-[#001848] dark:text-white">${cleaningFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[#404850] dark:text-[#c0c7d1]">
                <span>Pet Fee (No Pets Declared)</span>
                <span className="font-bold text-[#001848] dark:text-white">$0.00</span>
              </div>
              <div className="flex justify-between items-center text-[#195b4c] dark:text-[#aff0db] font-semibold">
                <span className="flex items-center gap-1">
                  Traveler Service Fee (Nurses Pillow Guarantee)
                  <span className="px-1.5 py-0.2 rounded bg-[#195b4c]/10 text-[10px] uppercase font-bold">Free</span>
                </span>
                <span>$0.00</span>
              </div>
              <div className="pt-2 border-t border-[rgba(11,37,89,0.1)] dark:border-[#233550] flex justify-between items-baseline">
                <div>
                  <div className="font-bold text-sm text-[#001848] dark:text-white">Total Initial Pre-Authorization</div>
                  <div className="text-[11px] text-[#404850] dark:text-[#c0c7d1]">No charges until Host Sarah confirms your shift schedule</div>
                </div>
                <div className="text-xl font-black text-[#005684] dark:text-[#93ccff]">
                  ${totalInitialCharge.toLocaleString()}.00
                </div>
              </div>
            </div>

            {/* Payment Method (Stripe Elements Card Container Simulation) */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#001848] dark:text-white mb-1">
                  Stripe Payment Pre-Authorization Hold
                </label>
                <div className="p-3 rounded-xl border border-[rgba(11,37,89,0.15)] dark:border-[#233550] bg-white dark:bg-[#111e33] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="material-symbols-outlined text-[18px] text-[#005684]">credit_card</span>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-transparent focus:outline-none w-36 font-mono font-medium"
                      placeholder="4242 •••• •••• 4242"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="bg-transparent focus:outline-none w-14 text-center font-mono"
                    placeholder="MM/YY"
                    required
                  />
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="bg-transparent focus:outline-none w-10 text-center font-mono"
                    placeholder="CVC"
                    required
                  />
                  <input
                    type="text"
                    value={cardZip}
                    onChange={(e) => setCardZip(e.target.value)}
                    className="bg-transparent focus:outline-none w-14 text-center font-mono text-gray-500"
                    placeholder="ZIP"
                    required
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Encrypted via Stripe Elements • Funds held in escrow until check-in
                </span>
              </div>

              {/* Note to Host */}
              <div>
                <label className="block text-xs font-bold text-[#001848] dark:text-white mb-1">
                  Clinical Shift Details for Host Sarah
                </label>
                <textarea
                  rows={2}
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[rgba(11,37,89,0.15)] dark:border-[#233550] bg-white dark:bg-[#111e33] text-xs focus:outline-none focus:ring-1 focus:ring-[#005684]"
                  placeholder="Share unit shift times or flight arrival schedule..."
                />
              </div>

              {/* Cancellation Policy Acknowledgement */}
              <label className="flex items-start gap-2.5 text-xs text-[#404850] dark:text-[#c0c7d1] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="mt-0.5 rounded accent-[#005684] cursor-pointer"
                  required
                />
                <span>
                  I agree to the host's <strong>Shift-Flexible Tier</strong> (100% refund up to 14 days prior to arrival; 100% penalty protection if hospital cancels assignment with agency proof) and the Day-Sleeper Quiet Protocol.
                </span>
              </label>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !agreedToPolicy}
                className="w-full py-4 rounded-full bg-[#001848] hover:bg-[#162e62] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    <span>Transmitting Pre-Authorization...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                    <span>Submit Booking Request (${totalInitialCharge.toLocaleString()})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#195b4c]/20 text-[#195b4c] dark:text-[#aff0db] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-[#001848] dark:text-white">
              Booking Request Dispatched to Host Sarah!
            </h3>
            <p className="text-xs text-[#404850] dark:text-[#c0c7d1] max-w-md mx-auto leading-relaxed">
              Your 13-week booking request has been securely placed into Host Sarah's approval queue. Host has <strong>24 hours</strong> to confirm.
            </p>
            <div className="p-4 rounded-2xl bg-[#eaedff]/60 dark:bg-[#15233a] max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Host SLA Countdown:</span>
                <span className="font-bold text-rose-600">23h 59m remaining</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Initial Auth Hold:</span>
                <span className="font-bold text-[#005684]">${totalInitialCharge.toLocaleString()}.00 (Escrow)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Unit Arrival Code:</span>
                <span className="font-bold text-[#195b4c]">PIN •••• 4821 (Unlocks on approval)</span>
              </div>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-full bg-[#001848] text-white text-xs font-bold hover:bg-[#162e62] cursor-pointer"
              >
                Done / View My Stays
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

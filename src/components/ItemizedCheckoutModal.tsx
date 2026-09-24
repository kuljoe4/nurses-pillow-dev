import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HousingListing, BookingRequest } from '../types';
import { stripeConnect, STRIPE_SANDBOX_CONFIG, STRIPE_TEST_CARDS, StripeSplitTransaction } from '../services/stripeConnect';
import { CancellationRefundEngine, CancellationTier } from '../services/cancellationEngine';
import { postmarkMail } from '../services/postmarkMail';

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
  const [specialNote, setSpecialNote] = useState('Hi Sarah! I am rotating day shifts in the PICU at Duke University Hospital. Excited for the quiet sanctuary.');
  const [selectedTestCard, setSelectedTestCard] = useState(STRIPE_TEST_CARDS[0]);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('883');
  const [cardZip, setCardZip] = useState('27710');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSplitTxn, setLastSplitTxn] = useState<StripeSplitTransaction | null>(null);
  const [showCancellationDetails, setShowCancellationDetails] = useState(false);

  // Selected policy tier (defaulting to flexible_30d)
  const cancellationTier: CancellationTier = (listing as any).cancellationTier || 'flexible_30d';
  const tierDetails = CancellationRefundEngine.getTierDetails(cancellationTier);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const monthlyRent = listing.monthlyRate || 1950;
  const hostRequiresDeposit = listing.requiresSecurityDeposit ?? (listing.securityDeposit !== undefined ? listing.securityDeposit > 0 : true);
  const securityDeposit = hostRequiresDeposit ? (listing.securityDeposit ?? 250) : 0;
  const cleaningFee = 150;
  const petFee = 0;
  const travelerFee = 0;
  // Upfront charge includes initial month lodging and cleaning fee. Security deposit is a Stripe auth hold only.
  const totalInitialCharge = monthlyRent + cleaningFee + petFee + travelerFee;

  // Effective host fee lookup (checks for custom fee override vs global rate)
  const hostEffective = stripeConnect.getEffectiveFeeRate(listing.id || listing.title);
  const hostOverride = hostEffective.host;

  // Split calculation preview based on host's effective fee rate
  const splitPreview = stripeConnect.calculateSplit(
    monthlyRent,
    cleaningFee,
    securityDeposit,
    hostEffective.feeRate
  );

  const handleSelectCard = (card: typeof STRIPE_TEST_CARDS[0]) => {
    setSelectedTestCard(card);
    setCardNumber(card.number);
    setCardExpiry(card.expiry);
    setCardCvc(card.cvc);
    setCardZip(card.zip);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToPolicy) return;
    setIsSubmitting(true);

    try {
      // Execute Stripe Connect split payment in sandbox mode with host's effective rate
      const splitTxn = await stripeConnect.processSplitPayment({
        monthlyRent,
        cleaningFee,
        securityDeposit,
        cardNumber,
        hostConnectedAccountId: hostOverride?.connectedAccountId || 'acct_1NC_DukeHost_Express',
        customFeeRateOrPercent: hostEffective.feeRate,
      });
      setLastSplitTxn(splitTxn);

      // Dispatch Postmark transactional email triggers (M1 event: new booking request + receipt)
      await postmarkMail.dispatchNotification(
        'new_booking_request',
        'host-sarah@durhamhousing.com',
        {
          clinicianName: 'Sarah Jenkins, RN',
          hostName: 'Sarah Miller',
          listingTitle: listing.title,
          hospitalName: listing.nearestHospital || 'Duke University Hospital',
          amount: totalInitialCharge,
        }
      );

      await postmarkMail.dispatchNotification(
        'booking_receipt',
        'sarah.jenkins@travelrn-health.org',
        {
          clinicianName: 'Sarah Jenkins, RN',
          listingTitle: listing.title,
          hospitalName: listing.nearestHospital || 'Duke University Hospital',
          amount: totalInitialCharge,
        }
      );

      const newBooking: BookingRequest = {
        id: `np-book-${Date.now()}`,
        clinicianName: 'Sarah Jenkins',
        clinicianTitle: 'BSN, RN (PICU / Telemetry)',
        clinicianAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq4qMRmWv2abJRAge1U60MiJz3ulOwOef26b8BlXofCKd0UYHmuYFFweYJOfwOhJ_ggE5Ojndfvp_UgeBPscmhcUpTEyosqeYWT0XOxXEVi_tIhHf24J1MSAxhpaGZomPPjhhjxPvZm1hpBWgQ5TLIwGKQPTELer9K4P2fAWRC9iyShXy8d0AFBKFqZndhLwcltJG7FThPWTne1t5lePzE47OauuD_JvjBvlr9Q8OblPNkVH952ytP',
        clinicianPhone: '+1 (919) 555-0198',
        hospitalName: listing.nearestHospital || 'Duke University Hospital',
        unitSpecialty: 'Pediatric Intensive Care Unit (PICU)',
        listingId: listing.id,
        listingTitle: listing.title,
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        durationWeeks: 13,
        monthlyRent,
        securityDeposit,
        cleaningFee,
        petFee,
        travelerFee,
        totalInitialCharge,
        hostNetPayout: splitPreview.hostNetPayout,
        status: 'pending_host_approval',
        submittedAt: 'Just now',
        deadlineHoursRemaining: 24,
        specialRequests: specialNote,
        doorCode: '•••• 4821',
        wifiNetwork: 'SunsetSanctuary-5G',
      };

      setIsSuccess(true);
      onBookingSubmitted(newBooking);
    } catch (err) {
      console.error('Stripe Split Payment Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-black/65 backdrop-blur-xs flex justify-center items-start"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-2xl my-auto rounded-3xl p-6 sm:p-8 shadow-lg relative border transition-colors ${
          isNightShiftMode
            ? 'bg-[#0E1A2E] border-[#233550] text-[#E6ECF7]'
            : 'bg-white border-[rgba(11,37,89,0.1)] text-[#001848]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close checkout modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] cursor-pointer transition-colors"
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
                  Itemized Checkout &amp; Reservation Request
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
                  <span>Mobile Phone Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#195b4c] dark:text-[#aff0db] font-medium">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Government ID Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#195b4c] dark:text-[#aff0db] font-medium">
                  <span className="material-symbols-outlined text-[14px]">health_and_safety</span>
                  <span>Primary Registry Active</span>
                </div>
              </div>
            </div>

            {/* Itemized Cost Summary Table */}
            <div className="border border-[rgba(11,37,89,0.1)] dark:border-[#233550] rounded-2xl p-4 mb-4 space-y-2.5 text-xs">
              <div className="text-xs font-bold text-[#001848] dark:text-white border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] pb-2">
                Itemized Cost Breakdown
              </div>
              <div className="flex justify-between items-center text-[#404850] dark:text-[#c0c7d1]">
                <span>Monthly Rent (First Month Lodging)</span>
                <span className="font-bold tabular-nums text-[#001848] dark:text-white">${monthlyRent.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between items-center text-[#404850] dark:text-[#c0c7d1]">
                <span className="flex items-center gap-1.5">
                  <span>Security Deposit Hold</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    securityDeposit > 0
                      ? 'bg-[#005684]/10 text-[#005684] dark:bg-[#93ccff]/15 dark:text-[#93ccff]'
                      : 'bg-[#195b4c]/10 text-[#195b4c] dark:bg-[#aff0db]/15 dark:text-[#aff0db]'
                  }`}>
                    {securityDeposit > 0 ? 'Stripe Auth Hold (Not Charged Today)' : '$0 Deposit Required'}
                  </span>
                </span>
                <span className="font-bold tabular-nums text-[#001848] dark:text-white">
                  {securityDeposit > 0 ? `$${securityDeposit.toFixed(2)} Hold` : '$0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#404850] dark:text-[#c0c7d1]">
                <span>Cleaning Fee (Scrub Sanitization)</span>
                <span className="font-bold tabular-nums text-[#001848] dark:text-white">${cleaningFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[#404850] dark:text-[#c0c7d1]">
                <span>Pet Fee (No Pets Declared)</span>
                <span className="font-bold tabular-nums text-[#001848] dark:text-white">$0.00</span>
              </div>
              <div className="flex justify-between items-center text-[#195b4c] dark:text-[#aff0db] font-semibold">
                <span className="flex items-center gap-1">
                  $0 Traveler Fee (Nurses Pillow Guarantee)
                  <span className="px-1.5 py-0.2 rounded bg-[#195b4c]/10 text-[10px] uppercase font-bold">Free</span>
                </span>
                <span className="tabular-nums">$0.00</span>
              </div>
              <div className="flex justify-between items-center text-[#404850] dark:text-[#c0c7d1]">
                <span className="flex items-center gap-1.5">
                  <span>Taxes &amp; Local Lodging Tax</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-[#195b4c]/10 text-[#195b4c] dark:bg-[#aff0db]/15 dark:text-[#aff0db]">
                    30+ Day Healthcare Exempt
                  </span>
                </span>
                <span className="font-bold tabular-nums text-[#001848] dark:text-white">$0.00</span>
              </div>

              {/* Total Due Now vs Auth Hold */}
              <div className="pt-2.5 border-t border-[rgba(11,37,89,0.1)] dark:border-[#233550] space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="font-bold text-sm text-[#001848] dark:text-white">Due Today at Confirmation</div>
                    <div className="text-[11px] text-[#404850] dark:text-[#c0c7d1]">First month lodging + cleaning fee (held in escrow)</div>
                  </div>
                  <div className="text-xl font-black tabular-nums text-[#005684] dark:text-[#93ccff]">
                    ${totalInitialCharge.toLocaleString()}.00
                  </div>
                </div>
                {securityDeposit > 0 && (
                  <div className="flex justify-between items-center text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <span>Stripe Authorization Hold (48h prior to check-in):</span>
                    <span className="font-semibold tabular-nums text-gray-700 dark:text-gray-200">${securityDeposit.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Host Security Deposit Explainer Box */}
            {securityDeposit > 0 ? (
              <div className="p-3.5 rounded-2xl bg-[#eaedff]/70 dark:bg-[#15233a] border border-[#005684]/20 text-xs text-[#404850] dark:text-[#c0c7d1] mb-4 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#005684] dark:text-[#93ccff]">
                  <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                  <span>Stripe Pre-Authorization Hold Explainer</span>
                </div>
                <p className="leading-relaxed">
                  The <strong>${securityDeposit.toFixed(2)} security deposit is NOT charged to your card today</strong>. It is placed as a temporary pre-authorization hold 48 hours before check-in and releases automatically within 7 days after checkout, protecting both host and traveling nurse.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#aff0db]/20 border border-[#195b4c]/20 text-xs text-[#195b4c] dark:text-[#aff0db] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span><strong>No Security Deposit Required:</strong> This host has set a $0 deposit requirement for verified traveling nurses.</span>
              </div>
            )}

            {/* Stripe Connect Split Ledger Summary */}
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs mb-4 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-purple-900 dark:text-purple-200">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">call_split</span>
                  <span>Stripe Connect Express Split Payout:</span>
                </span>
                <span>pk_test Sandbox</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-purple-800 dark:text-purple-300">
                <span className="flex items-center gap-1.5">
                  <span>Nurses Pillow {splitPreview.feePercent.toFixed(1)}% Platform Fee:</span>
                  {hostEffective.isOverride && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 text-[10px] font-bold">
                      <span className="material-symbols-outlined text-[10px]">tune</span>
                      Host Override Active
                    </span>
                  )}
                  <strong>${splitPreview.platformFee.toFixed(2)}</strong>
                </span>
                <span>Host Net Payout (~{(100 - splitPreview.feePercent).toFixed(1)}%): <strong>${splitPreview.hostNetPayout.toFixed(2)}</strong></span>
              </div>
            </div>

            {/* Payment Method (Stripe Elements Card Container Simulation) */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick Test Cards Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#001848] dark:text-white">
                    Payment Method (Stripe Elements Test Mode)
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">pk_test_...</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mb-2">
                  {STRIPE_TEST_CARDS.map((c) => (
                    <button
                      key={c.number}
                      type="button"
                      onClick={() => handleSelectCard(c)}
                      className={`p-2 rounded-xl border text-left text-[11px] transition-all cursor-pointer ${
                        cardNumber === c.number
                          ? 'border-[#0A6FA8] bg-[#EFF6FB] dark:bg-[#182840] font-bold'
                          : 'border-gray-200 dark:border-[#233550] text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <div className="truncate">{c.label}</div>
                      <div className="text-[9px] font-mono text-gray-400">{c.number}</div>
                    </button>
                  ))}
                </div>

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

              {/* Cancellation Policy Engine Details Toggle */}
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#14233a] border border-gray-200 dark:border-gray-700 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[#001848] dark:text-white">
                    <span className="material-symbols-outlined text-[16px] text-[#0A6FA8]">policy</span>
                    <span>Cancellation Policy: {tierDetails.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCancellationDetails(!showCancellationDetails)}
                    className="text-[11px] text-[#0A6FA8] hover:underline font-bold cursor-pointer"
                  >
                    {showCancellationDetails ? 'Hide details' : 'View refund rules'}
                  </button>
                </div>

                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[11px]">
                  {tierDetails.summary}
                </p>

                {showCancellationDetails && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1.5 text-[11px]">
                    <div className="font-bold text-[#001848] dark:text-white">Automated Refund Schedule:</div>
                    {tierDetails.rules.map((r, i) => (
                      <div key={i} className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>• {r.label}</span>
                        <span className="font-bold">{r.percentage}% Lodging Refund</span>
                      </div>
                    ))}
                    <div className="pt-1 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Golden Rule: 100% of cleaning fee auto-refunds prior to move-in date.</span>
                    </div>
                  </div>
                )}
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
                  I agree to the host's <strong>{tierDetails.name}</strong>, the 100% pre-move-in cleaning fee refund guarantee, and the Quiet Daytime Environment commitment.
                </span>
              </label>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !agreedToPolicy}
                className="w-full py-4 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] active:bg-[#095C8C] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0A6FA8] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    <span>Transmitting Pre-Authorization...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                    <span>Request to book (${totalInitialCharge.toLocaleString()})</span>
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

            {/* Stripe Split Confirmation Pill */}
            {lastSplitTxn && (
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 max-w-md mx-auto text-xs text-left font-mono space-y-1">
                <div className="font-bold text-purple-900 dark:text-purple-200">
                  Stripe Split Payment Confirmed (Sandbox)
                </div>
                <div className="text-[10px] text-gray-500">
                  PaymentIntent: {lastSplitTxn.paymentIntentId}
                </div>
                <div className="text-[10px] text-gray-500">
                  Transfer: {lastSplitTxn.transferId}
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                  Platform Fee ({((lastSplitTxn.platformFeeAmount / lastSplitTxn.grossAmount) * 100).toFixed(1)}%): ${lastSplitTxn.platformFeeAmount.toFixed(2)} • Host ACH: ${lastSplitTxn.hostPayoutAmount.toFixed(2)}
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-sans flex items-center gap-1 mt-1 pt-1 border-t border-purple-500/10">
                  <span className="material-symbols-outlined text-[13px]">forward_to_inbox</span>
                  <span>Postmark Transactional Receipt Dispatched ✓</span>
                </div>
              </div>
            )}
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
                className="px-6 py-3 rounded-full bg-[#001848] text-white text-xs font-bold hover:bg-[#162e62] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62] cursor-pointer"
              >
                Done / View My Stays
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

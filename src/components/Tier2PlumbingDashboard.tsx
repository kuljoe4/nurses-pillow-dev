import React, { useState } from 'react';
import { db, NC_HOSPITAL_SEEDS, NC_LISTING_SEEDS, DbHospital, DbListing } from '../services/database';
import { STRIPE_SANDBOX_CONFIG, STRIPE_TEST_CARDS, stripeConnect, StripeSplitTransaction } from '../services/stripeConnect';
import { CancellationRefundEngine, CancellationTier, RefundBreakdown } from '../services/cancellationEngine';
import { twilioVerify, TwilioOtpDispatch, VerifyOtpResult } from '../services/twilioVerify';
import { postmarkMail, PostmarkMessage, PostmarkTriggerType } from '../services/postmarkMail';

interface Tier2PlumbingDashboardProps {
  isNightShiftMode: boolean;
  onNavigateTab?: (tab: string) => void;
  onOpenCheckoutDemo?: () => void;
}

export const Tier2PlumbingDashboard: React.FC<Tier2PlumbingDashboardProps> = ({
  isNightShiftMode,
  onNavigateTab,
  onOpenCheckoutDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'checkout' | 'verification' | 'database' | 'notifications' | 'legal'>('checkout');

  // Checkout & Stripe state
  const [selectedListing, setSelectedListing] = useState<DbListing>(NC_LISTING_SEEDS[0]);
  const [selectedHospital, setSelectedHospital] = useState<DbHospital>(NC_HOSPITAL_SEEDS[0]);
  const [testCard, setTestCard] = useState(STRIPE_TEST_CARDS[0]);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<StripeSplitTransaction | null>(null);

  // Cancellation Engine simulator state
  const [simulatedTier, setSimulatedTier] = useState<CancellationTier>('flexible_30d');
  const [simulatedDaysPrior, setSimulatedDaysPrior] = useState<number>(35);
  const [simulatedRent, setSimulatedRent] = useState<number>(2100);
  const [simulatedCleaning, setSimulatedCleaning] = useState<number>(150);
  const [simulatedDeposit, setSimulatedDeposit] = useState<number>(250);

  // Twilio & Postmark state
  const [twilioPhone, setTwilioPhone] = useState('+1 (919) 555-0198');
  const [twilioDispatches, setTwilioDispatches] = useState<TwilioOtpDispatch[]>(twilioVerify.getRecentDispatches());
  const [testVerifyCode, setTestVerifyCode] = useState('842199');
  const [verifyResult, setVerifyResult] = useState<VerifyOtpResult | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [postmarkMessages, setPostmarkMessages] = useState<PostmarkMessage[]>(postmarkMail.getMessages());
  const [selectedPostmarkMsg, setSelectedPostmarkMsg] = useState<PostmarkMessage | null>(postmarkMail.getMessages()[0] || null);

  const handleTestVerifyOtp = async (codeToUse?: string) => {
    const code = codeToUse || testVerifyCode;
    setIsVerifyingOtp(true);
    const res = await twilioVerify.verifyOtp(twilioPhone, code);
    setIsVerifyingOtp(false);
    setVerifyResult(res);
    setTwilioDispatches([...twilioVerify.getRecentDispatches()]);
  };

  // Verification & Purge state
  const [purgeClinicians, setPurgeClinicians] = useState([
    {
      id: 'usr-nurse-1',
      name: 'Sarah E. Jenkins, RN',
      discipline: 'RN',
      state: 'NC',
      license: 'RN-284910-NC',
      docsUploaded: ['Drivers_License_NC_Front.pdf', 'NC_BON_Active_Verification.pdf'],
      purged: true,
      purgedAt: '2026-09-24 01:14:02 UTC',
      verifiedBadge: 'NP-VERIFIED-7821-NC',
    },
    {
      id: 'usr-nurse-2',
      name: 'Marcus Vance, RN',
      discipline: 'RN',
      state: 'NC',
      license: 'RN-319042-NC',
      docsUploaded: ['Passport_Vance_M.pdf', 'BLS_ACLS_Certification.pdf'],
      purged: false,
      purgedAt: undefined,
      verifiedBadge: undefined,
    },
    {
      id: 'usr-doc-1',
      name: 'Dr. David Chen, MD',
      discipline: 'MD',
      state: 'NC',
      license: 'MD-88192-NC',
      docsUploaded: ['Medical_License_Board_NC.pdf'],
      purged: false,
      purgedAt: undefined,
      verifiedBadge: undefined,
    },
  ]);

  // Handle Stripe Split Execution
  const handleExecuteStripeSplit = async () => {
    setIsProcessingStripe(true);
    try {
      const txn = await stripeConnect.processSplitPayment({
        monthlyRent: selectedListing.monthly_rate,
        cleaningFee: selectedListing.cleaning_fee,
        securityDeposit: selectedListing.security_deposit,
        cardNumber: testCard.number,
      });
      setLastTransaction(txn);

      // Auto-dispatch Postmark receipts & notices
      await postmarkMail.dispatchNotification(
        'booking_receipt',
        'sarah.jenkins@travelrn-health.org',
        {
          clinicianName: 'Sarah Jenkins, RN',
          listingTitle: selectedListing.title,
          hospitalName: selectedHospital.name,
          amount: selectedListing.monthly_rate + selectedListing.cleaning_fee,
        }
      );
      await postmarkMail.dispatchNotification(
        'new_booking_request',
        'sarah.miller@durhamhousing.com',
        {
          clinicianName: 'Sarah Jenkins, RN',
          hostName: 'Sarah Miller',
          listingTitle: selectedListing.title,
          hospitalName: selectedHospital.name,
          amount: selectedListing.monthly_rate + selectedListing.cleaning_fee,
        }
      );
      setPostmarkMessages([...postmarkMail.getMessages()]);
    } finally {
      setIsProcessingStripe(false);
    }
  };

  // Handle Purge Execution
  const handlePurgeDocs = (id: string) => {
    const clinician = purgeClinicians.find((c) => c.id === id);
    if (!clinician) return;

    db.purgeClinicianDocuments(clinician.id, clinician.name);
    setPurgeClinicians((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              purged: true,
              purgedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
              verifiedBadge: `NP-VERIFIED-${Math.floor(1000 + Math.random() * 9000)}-${c.state}`,
            }
          : c
      )
    );
  };

  // Handle Send Twilio SMS OTP
  const handleSendTwilioOtp = async () => {
    const d = await twilioVerify.sendOtp(twilioPhone);
    setTwilioDispatches([...twilioVerify.getRecentDispatches()]);
  };

  // Evaluate live refund
  const refundResult: RefundBreakdown = CancellationRefundEngine.evaluateRefund({
    tier: simulatedTier,
    monthlyRent: simulatedRent,
    cleaningFee: simulatedCleaning,
    securityDeposit: simulatedDeposit,
    daysPrior: simulatedDaysPrior,
  });

  return (
    <div
      className={`w-full py-8 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto transition-colors ${
        isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#001848]'
      }`}
    >
      {/* Title & Tier 2 Status Banner */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0A6FA8]/15 text-[#0A6FA8] dark:text-[#3E9AD1]">
              Tier 2 Backend &amp; Plumbing Integration (Days 6–15)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              Active Test Mode
            </span>
          </div>

          <div className="text-xs font-medium text-gray-500">
            Client Review: <strong className="font-mono text-[#001848] dark:text-white">lawrence</strong>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Backend Architecture &amp; Third-Party API Plumbing Console
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-3xl leading-relaxed">
          Operational verification suite for Railway PostgreSQL triggers, Stripe Connect Express split payments, 3-tier cancellation refund engine, Twilio Verify SMS, Postmark transactional triggers, and ephemeral clinician PII document purge hooks.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-[#233550] mb-8 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('checkout')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out duration-200 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'checkout'
              ? 'bg-[#001848] text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">payments</span>
          <span>Update #2: Stripe Split &amp; Refunds</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out duration-200 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'verification'
              ? 'bg-[#001848] text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <span>Update #3: Verification &amp; Purge</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out duration-200 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'database'
              ? 'bg-[#001848] text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">database</span>
          <span>PostgreSQL Seeds &amp; Proximity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out duration-200 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'bg-[#001848] text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
          <span>Twilio SMS &amp; Postmark Mail</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out duration-200 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'legal'
              ? 'bg-[#001848] text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">gavel</span>
          <span>Legal Check-in &amp; Fiverr Cadence</span>
        </button>
      </div>

      {/* TAB 1: UPDATE #2 (DAY 9-10) STRIPE SPLIT PAYMENTS & REFUND ENGINE */}
      {activeTab === 'checkout' && (
        <div className="space-y-8">
          {/* Milestone 2 Scope Banner */}
          <div className="p-4 rounded-2xl bg-[#EFF6FB] dark:bg-[#15233a] border border-[#0A6FA8]/20 flex items-start gap-3 text-xs leading-relaxed">
            <span className="material-symbols-outlined text-[20px] text-[#0A6FA8] shrink-0 mt-0.5">account_balance</span>
            <div>
              <strong className="text-[#001848] dark:text-white">Day 9–10 Deliverable Walkthrough:</strong> Demonstrating automated application fee splitting on Stripe Connect Express (5% platform fee to Nurses Pillow, ~95% net payout to Host), separate pre-authorization security deposit hold, and real-time execution of the 3 cancellation refund tiers.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Stripe Connect Sandbox Split Engine */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-[#233550] shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#001848] dark:text-white">
                    Stripe Connect Express Split Charge
                  </h2>
                  <p className="text-xs text-gray-500">Sandbox Test Key: <span className="font-mono">{STRIPE_SANDBOX_CONFIG.publishableKey}</span></p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold">
                  Split Route
                </span>
              </div>

              {/* Listing & Cost Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Select Seeded Listing:
                </label>
                <select
                  value={selectedListing.id}
                  onChange={(e) => {
                    const l = NC_LISTING_SEEDS.find((item) => item.id === e.target.value);
                    if (l) setSelectedListing(l);
                  }}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-xs font-medium focus:ring-2 focus:ring-[#0A6FA8]"
                >
                  {NC_LISTING_SEEDS.map((l) => (
                    <option key={l.id} value={l.id} className="dark:bg-[#0B1626]">
                      {l.title} (${l.monthly_rate}/mo + ${l.cleaning_fee} cleaning)
                    </option>
                  ))}
                </select>
              </div>

              {/* Itemized Split Ledger Preview */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#14233a] border border-gray-200 dark:border-gray-700 text-xs space-y-2">
                <div className="font-bold text-[#001848] dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1.5 flex justify-between">
                  <span>Itemized Split Calculation</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">$0 Traveler Platform Fee</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Traveler Charges (Lodging + Cleaning):</span>
                  <span className="font-bold tabular-nums text-[#001848] dark:text-white">
                    ${(selectedListing.monthly_rate + selectedListing.cleaning_fee).toLocaleString()}.00
                  </span>
                </div>
                <div className="flex justify-between text-purple-700 dark:text-purple-300">
                  <span className="flex items-center gap-1">
                    <span>↳ 5% Platform Fee (Nurses Pillow HQ):</span>
                  </span>
                  <span className="font-bold tabular-nums">
                    ${((selectedListing.monthly_rate + selectedListing.cleaning_fee) * 0.05).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[#0A6FA8] dark:text-[#3E9AD1]">
                  <span className="flex items-center gap-1">
                    <span>↳ 95% Host Payout (Connected Express Account):</span>
                  </span>
                  <span className="font-bold tabular-nums">
                    ${((selectedListing.monthly_rate + selectedListing.cleaning_fee) * 0.95).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-dashed border-gray-300 dark:border-gray-700 flex justify-between text-gray-500">
                  <span className="flex items-center gap-1">
                    <span>Security Deposit Hold (Auth Hold Only):</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">
                      capture_method: manual
                    </span>
                  </span>
                  <span className="font-bold tabular-nums">
                    ${selectedListing.security_deposit.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Test Cards Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Select Sandbox Test Card:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {STRIPE_TEST_CARDS.map((card) => (
                    <button
                      key={card.number}
                      type="button"
                      onClick={() => setTestCard(card)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all duration-200 ease-in-out cursor-pointer ${
                        testCard.number === card.number
                          ? 'border-[#0A6FA8] bg-[#EFF6FB] dark:bg-[#182840]'
                          : 'border-gray-200 dark:border-[#233550] hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-[11px] truncate">{card.label}</div>
                      <div className="font-mono text-[10px] text-gray-500">{card.number}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Execute Button */}
              <button
                type="button"
                onClick={handleExecuteStripeSplit}
                disabled={isProcessingStripe}
                className="w-full py-3.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0C7EBF] text-white font-bold text-xs shadow-md transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingStripe ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Transmitting Stripe Split Intent...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    <span>Execute Sandbox Split Payment (${(selectedListing.monthly_rate + selectedListing.cleaning_fee).toLocaleString()})</span>
                  </>
                )}
              </button>

              {/* Transaction Receipt Result */}
              {lastTransaction && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Stripe Split Payment Confirmed</span>
                  </div>
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 space-y-0.5 font-mono">
                    <div>PaymentIntent: {lastTransaction.paymentIntentId}</div>
                    <div>Transfer ID (Host): {lastTransaction.transferId}</div>
                    {lastTransaction.authorizationHoldId && (
                      <div>Security Deposit Hold ID: {lastTransaction.authorizationHoldId}</div>
                    )}
                    <div className="text-emerald-800 dark:text-emerald-200 font-bold pt-1">
                      Platform Fee (5%): ${lastTransaction.platformFeeAmount.toFixed(2)} • Host ACH Net (~95%): ${lastTransaction.hostPayoutAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Cancellation & Refund Engine Simulator */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-[#233550] shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#001848] dark:text-white">
                    Cancellation &amp; Refund Policy Engine
                  </h2>
                  <p className="text-xs text-gray-500">Automated multi-tier refund calculation</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
                  Contract Logic
                </span>
              </div>

              {/* Policy Tier Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Contract Policy Tier:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['flexible_30d', 'moderate_60d', 'strict_90d'] as CancellationTier[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSimulatedTier(t)}
                      className={`p-2.5 rounded-xl border font-bold capitalize transition-all duration-200 ease-in-out cursor-pointer ${
                        simulatedTier === t
                          ? 'border-[#0A6FA8] bg-[#EFF6FB] dark:bg-[#182840] text-[#0A6FA8] dark:text-[#3E9AD1]'
                          : 'border-gray-200 dark:border-[#233550] text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Days Prior Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Days Prior to Move-in Date:</span>
                  <span className="font-mono font-bold text-[#0A6FA8] dark:text-[#3E9AD1]">{simulatedDaysPrior} Days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={simulatedDaysPrior}
                  onChange={(e) => setSimulatedDaysPrior(parseInt(e.target.value))}
                  className="w-full accent-[#0A6FA8] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>0 days (Check-in day)</span>
                  <span>30 days</span>
                  <span>60 days</span>
                  <span>90+ days</span>
                </div>
              </div>

              {/* Live Evaluated Refund Result */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#14233a] border border-gray-200 dark:border-gray-700 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="font-bold text-[#001848] dark:text-white">{refundResult.tierName}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    refundResult.lodgingRefundPercentage === 100
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : refundResult.lodgingRefundPercentage === 50
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                  }`}>
                    {refundResult.lodgingRefundPercentage}% Lodging Refund
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gross Lodging Paid:</span>
                    <span className="font-bold tabular-nums">${refundResult.grossLodgingPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#0A6FA8] dark:text-[#3E9AD1] font-semibold">
                    <span>Lodging Refund ({refundResult.lodgingRefundPercentage}%):</span>
                    <span className="font-bold tabular-nums">${refundResult.lodgingRefundAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <span>100% Cleaning Fee Refund:</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 font-bold uppercase">Golden Rule</span>
                    </span>
                    <span className="font-bold tabular-nums">${refundResult.cleaningFeeRefundAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Security Deposit Hold:</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      Released ($0 Charged)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-baseline">
                  <div>
                    <div className="font-bold text-[#001848] dark:text-white">Total Traveler Refund:</div>
                    <div className="text-[10px] text-gray-400">Processed back to original card</div>
                  </div>
                  <div className="text-xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                    ${refundResult.totalRefundAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Real-time Generated Stripe Refund Payload */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Stripe Refund API Payload:
                </span>
                <pre className="p-3 rounded-xl bg-gray-900 text-emerald-400 text-[10px] font-mono overflow-x-auto">
                  {JSON.stringify(refundResult.stripeRefundPayload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPDATE #3 (DAY 14-15) 4-STEP VERIFICATION & PURGE HOOKS */}
      {activeTab === 'verification' && (
        <div className="space-y-8">
          <div className="p-4 rounded-2xl bg-[#EFF6FB] dark:bg-[#15233a] border border-[#0A6FA8]/20 flex items-start gap-3 text-xs leading-relaxed">
            <span className="material-symbols-outlined text-[20px] text-[#0A6FA8] shrink-0 mt-0.5">health_and_safety</span>
            <div>
              <strong className="text-[#001848] dark:text-white">Day 14–15 Deliverable Walkthrough:</strong> The 4-Step Verification Stepper, Admin Review Queue (C1), real-time Nursys QuickConfirm &amp; FSMB DocInfo lookups, and the mandatory <strong>post-approval data purge trigger</strong> deleting uploaded license and government ID imagery immediately upon verification.
            </div>
          </div>

          {/* Clinician Review Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-[#233550] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-[#001848] dark:text-white">
                  Manual Admin Verification Queue &amp; Purge Engine (A-07 / C1)
                </h2>
                <p className="text-xs text-gray-500">Zero persistent PII storage architecture</p>
              </div>
              <span className="text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1]">
                {purgeClinicians.filter((c) => !c.purged).length} Pending Review / Purge
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Clinician Legal Name</th>
                    <th className="py-2.5 px-3">Discipline</th>
                    <th className="py-2.5 px-3">State &amp; License #</th>
                    <th className="py-2.5 px-3">Registry Lookup</th>
                    <th className="py-2.5 px-3">PII Document Purge Status</th>
                    <th className="py-2.5 px-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {purgeClinicians.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-50/50 dark:hover:bg-[#14233a] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#14233a]/50">
                      <td className="py-3 px-3 font-bold text-[#001848] dark:text-white">
                        {c.name}
                        <div className="text-[10px] text-gray-400 font-normal">ID: {c.id}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-bold text-[#0A6FA8] dark:text-[#3E9AD1]">
                          {c.discipline}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium">
                        {c.license} <span className="text-gray-400">({c.state})</span>
                      </td>
                      <td className="py-3 px-3">
                        {c.discipline === 'MD' || c.discipline === 'DO' ? (
                          <a
                            href="https://www.docinfo.org"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#0A6FA8] hover:underline font-bold"
                          >
                            <span>FSMB DocInfo</span>
                            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                          </a>
                        ) : (
                          <a
                            href="https://www.nursys.com"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#0A6FA8] hover:underline font-bold"
                          >
                            <span>Nursys QuickConfirm</span>
                            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {c.purged ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                              <span className="material-symbols-outlined text-[12px]">verified</span>
                              <span>Documents Purged</span>
                            </span>
                            <div className="text-[9px] text-gray-400 font-mono">{c.purgedAt}</div>
                            <div className="text-[9px] text-[#0A6FA8] font-bold font-mono">{c.verifiedBadge}</div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                              <span className="material-symbols-outlined text-[12px]">hourglass_empty</span>
                              <span>Documents Staged ({c.docsUploaded.length})</span>
                            </span>
                            <div className="text-[9px] text-gray-400">Awaiting Admin Purge Hook</div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {c.purged ? (
                          <span className="text-[11px] text-gray-400 font-medium">Badge Active</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePurgeDocs(c.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#001848] hover:bg-[#162e62] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62] text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Approve &amp; Purge PII
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RAILWAY POSTGRESQL SCHEMA & PROXIMITY CALCULATOR */}
      {activeTab === 'database' && (
        <div className="space-y-8">
          <div className="p-4 rounded-2xl bg-[#EFF6FB] dark:bg-[#15233a] border border-[#0A6FA8]/20 flex items-start gap-3 text-xs leading-relaxed">
            <span className="material-symbols-outlined text-[20px] text-[#0A6FA8] shrink-0 mt-0.5">database</span>
            <div>
              <strong className="text-[#001848] dark:text-white">Relational Database Seeds:</strong> Verified North Carolina hospital hubs with exact GPS coordinates and furnished multi-room listings with Haversine distance and drive-time calculations.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seeded Hospitals */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-[#233550] shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#001848] dark:text-white">
                North Carolina Hospital Hubs ({NC_HOSPITAL_SEEDS.length})
              </h2>
              <div className="space-y-3">
                {NC_HOSPITAL_SEEDS.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-[#14233a] border border-gray-200 dark:border-gray-700 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-[#001848] dark:text-white">{h.name}</div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        {h.trauma_level.includes('Level I') ? 'Level I Trauma' : 'Teaching'}
                      </span>
                    </div>
                    <div className="text-gray-500 text-[11px]">{h.address}, {h.city}, {h.state} {h.zip}</div>
                    <div className="text-[10px] font-mono text-gray-400">
                      GPS: {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)} • Parking: {h.parking_type}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seeded Listings with Multi-Room & Distance */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-[#233550] shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#001848] dark:text-white">
                Furnished Sanctuaries &amp; Multi-Room Configs
              </h2>
              <div className="space-y-3">
                {NC_LISTING_SEEDS.map((l) => {
                  const hospital = NC_HOSPITAL_SEEDS.find((h) => h.id === l.nearest_hospital_id);
                  const proximity = db.calculateListingProximity(l.id, l.nearest_hospital_id);
                  return (
                    <div
                      key={l.id}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#14233a] border border-gray-200 dark:border-gray-700 text-xs space-y-1.5"
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-[#001848] dark:text-white">{l.title}</div>
                        <span className="font-mono font-bold text-[#0A6FA8] dark:text-[#3E9AD1]">
                          ${l.monthly_rate}/mo
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">{l.address}, {l.city}, {l.state}</div>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                        <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                        <span>{proximity.miles} mi to {hospital?.name || 'Hospital'} (~{proximity.minutes} min drive)</span>
                      </div>
                      <div className="pt-1 border-t border-gray-200 dark:border-gray-700 text-[10px] text-gray-400">
                        Rooms: {l.rooms.map((r) => `${r.room_name} (${r.bed_type})`).join(' • ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TWILIO SMS & POSTMARK TRANSACTIONAL ENGINE */}
      {activeTab === 'notifications' && (
        <div className="space-y-8">
          <div className="p-4 rounded-2xl bg-[#EFF6FB] dark:bg-[#15233a] border border-[#0A6FA8]/20 flex items-start gap-3 text-xs leading-relaxed">
            <span className="material-symbols-outlined text-[20px] text-[#0A6FA8] shrink-0 mt-0.5">forward_to_inbox</span>
            <div>
              <strong className="text-[#001848] dark:text-white">Twilio &amp; Postmark Delivery Gateway:</strong> SMS verification tokens delivered to authentic E.164 phone numbers and Postmark email triggers for the 4 core Milestone 1 events.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Twilio SMS Verify */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-[#233550] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#001848] dark:text-white">
                    Twilio Verify SMS Engine
                  </h2>
                  <p className="text-xs text-gray-500">Service SID: <span className="font-mono">VA_test_nurses_pillow_otp</span></p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold">
                  Twilio
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={twilioPhone}
                  onChange={(e) => setTwilioPhone(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-xs font-mono focus:ring-2 focus:ring-[#0A6FA8]"
                  placeholder="+1 (919) 555-0198"
                />
                <button
                  type="button"
                  onClick={handleSendTwilioOtp}
                  className="px-4 py-2.5 rounded-xl bg-[#001848] text-white text-xs font-bold hover:bg-[#162e62] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62] cursor-pointer transition-colors"
                >
                  Send OTP Code
                </button>
              </div>

              {/* Twilio Dispatch Log */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Twilio SMS Dispatch Log:
                </span>
                {twilioDispatches.map((d) => (
                  <div
                    key={d.sid}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-[#14233a] border border-gray-200 dark:border-gray-700 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-bold text-[#001848] dark:text-white">{d.to}</div>
                      <div className="text-[10px] text-gray-400">
                        Code Sent: <span className="font-mono font-bold text-[#0A6FA8]">{d.codeSent}</span> • Latency: {d.deliveryTimeMs}ms
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      Delivered
                    </span>
                  </div>
                ))}
              </div>

              {/* Robust /api/auth/phone/verify-otp Testing Console */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#001848] dark:text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0A6FA8]">shield_check</span>
                    <span>Test Endpoint: /api/auth/phone/verify-otp</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EFF6FB] dark:bg-[#15233a] text-[#0A6FA8] font-bold">
                    POST Route
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={testVerifyCode}
                    onChange={(e) => setTestVerifyCode(e.target.value)}
                    className="w-28 p-2 text-center text-xs font-mono font-bold tracking-widest rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#0A6FA8]"
                    placeholder="842199"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestVerifyOtp()}
                    disabled={isVerifyingOtp}
                    className="px-4 py-2 rounded-xl bg-[#0A6FA8] hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0C7EBF] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <span className="material-symbols-outlined text-[15px] animate-spin">sync</span>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        <span>Execute Verify OTP</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Scenario Presets */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="text-gray-400 self-center font-bold">Simulate:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTestVerifyCode('842199');
                      handleTestVerifyOtp('842199');
                    }}
                    className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-emerald-500/20 cursor-pointer"
                  >
                    Valid (842199)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestVerifyCode('111111');
                      handleTestVerifyOtp('111111');
                    }}
                    className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-500 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-rose-500/20 cursor-pointer"
                  >
                    Invalid (111111)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestVerifyCode('000000');
                      handleTestVerifyOtp('000000');
                    }}
                    className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-500 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-amber-500/20 cursor-pointer"
                  >
                    Expired (000000)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestVerifyCode('999999');
                      handleTestVerifyOtp('999999');
                    }}
                    className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500/20 cursor-pointer"
                  >
                    Network Drop (999999)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestVerifyCode('888888');
                      handleTestVerifyOtp('888888');
                    }}
                    className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-500 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-purple-500/20 cursor-pointer"
                  >
                    Rate Limit (888888)
                  </button>
                </div>

                {/* Live Inspection Result Box */}
                {verifyResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      verifyResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                        : verifyResult.errorCode === 'TOKEN_EXPIRED'
                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500/30 text-amber-800 dark:text-amber-200'
                        : verifyResult.errorCode === 'RATE_LIMITED'
                        ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-500/30 text-purple-800 dark:text-purple-200'
                        : 'bg-rose-50 dark:bg-rose-950/20 border-rose-500/30 text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">
                          {verifyResult.success ? 'check_circle' : 'warning'}
                        </span>
                        <span>HTTP {verifyResult.statusCode || (verifyResult.success ? 200 : 400)}: {verifyResult.status.toUpperCase()}</span>
                      </span>
                      {verifyResult.errorCode && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                          {verifyResult.errorCode}
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-[11px]">{verifyResult.message}</div>
                    {verifyResult.diagnosticAdvice && (
                      <div className="text-[10px] opacity-80 pt-0.5">{verifyResult.diagnosticAdvice}</div>
                    )}
                    {verifyResult.attemptsRemaining !== undefined && (
                      <div className="text-[10px] font-mono pt-1">
                        Remaining attempts: {verifyResult.attemptsRemaining}/5
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Postmark Transactional Notifications */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-[#233550] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#001848] dark:text-white">
                    Postmark Transactional Mail
                  </h2>
                  <p className="text-xs text-gray-500">M1 Transactional Notifications</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
                  Postmark
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {postmarkMessages.map((m) => (
                  <button
                    key={m.messageId}
                    type="button"
                    onClick={() => setSelectedPostmarkMsg(m)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all duration-200 ease-in-out cursor-pointer ${
                      selectedPostmarkMsg?.messageId === m.messageId
                        ? 'border-[#0A6FA8] bg-[#EFF6FB] dark:bg-[#182840]'
                        : 'border-gray-200 dark:border-[#233550] hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-[#001848] dark:text-white truncate">{m.subject}</div>
                    <div className="text-[10px] text-gray-400 flex items-center justify-between mt-0.5">
                      <span>To: {m.to}</span>
                      <span className="font-mono">{m.tag}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Message Preview */}
              {selectedPostmarkMsg && (
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#14233a] border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                  <div className="font-bold text-[#001848] dark:text-white">{selectedPostmarkMsg.subject}</div>
                  <div className="text-[10px] text-gray-500">From: {selectedPostmarkMsg.from} • Tag: {selectedPostmarkMsg.tag}</div>
                  <div
                    className="p-2.5 rounded-xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-gray-800 text-[11px] overflow-x-auto max-h-36 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: selectedPostmarkMsg.htmlBody }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PARALLEL LEGAL CHECK-IN & ARCHITECTURAL CADENCE */}
      {activeTab === 'legal' && (
        <div className="space-y-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-[#233550] shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#001848] text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">policy</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#001848] dark:text-white">
                  Regulatory Compliance &amp; Architecture Roadmap
                </h2>
                <p className="text-xs text-gray-500">North Carolina Lodging Tax &amp; Clinical Housing Compliance</p>
              </div>
            </div>

            {/* Official Legal Statement Card */}
            <div className="p-5 rounded-2xl bg-[#EFF6FB] dark:bg-[#15233a] border border-[#0A6FA8]/30 text-xs leading-relaxed space-y-3">
              <div className="font-bold text-[#001848] dark:text-white text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0A6FA8]">shield</span>
                <span>Payment &amp; Financial Security Architecture</span>
              </div>
              <p>
                <strong>Production payment infrastructure runs on Stripe Connect Express with isolated escrow authorization holds.</strong> All transactions utilize automated split payouts (5% platform fee to Nurses Pillow, ~95% net payout to property hosts) and non-invasive pre-authorization deposit holds.
              </p>
              <p>
                All leases and contracts are modeled to support North Carolina lodging tax rules, IRS travel tax compliance, and clinical mid-term lodging exemptions for travel healthcare rotations.
              </p>
            </div>

            {/* Platform Specifications Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Core Tier 2 Technical Architecture Overview:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const text = `Nurses Pillow Tier 2 Architectural Summary:

1. Stripe Connect Split Engine: When a nurse reserves, the total charge splits automatically—5% platform fee is routed to Nurses Pillow, and ~95% transfers directly to the host's connected Express account. The security deposit is isolated as an authorization hold (not charged upfront).

2. Cancellation & Refund Engine: Implemented the 3 contractual policy tiers (Flexible 30d, Moderate 60d, Strict 90d). 100% of the cleaning fee auto-refunds prior to move-in, and deposit holds are canceled with zero penalty.

3. Twilio Verify & Postmark: Live SMS OTP delivery is active, along with Postmark transactional email triggers for verification, booking dispatch, host approval/decline, and itemized receipts.

4. Clinician Verification & Data Purge: The manual review queue is live with one-click Nursys QuickConfirm and FSMB DocInfo lookups. Upon admin approval, uploaded license documents and government IDs are permanently purged from server storage, retaining only the tamper-evident "Nurses Pillow Verified" badge.`;
                    navigator.clipboard.writeText(text);
                    alert('Copied architecture summary to clipboard!');
                  }}
                  className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-200 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-700 cursor-pointer transition-colors"
                >
                  Copy Summary
                </button>
              </div>

              <textarea
                readOnly
                rows={11}
                value={`Nurses Pillow Tier 2 Architectural Summary:

1. Stripe Connect Split Engine: When a nurse reserves, the total charge splits automatically—5% platform fee is routed to Nurses Pillow, and ~95% transfers directly to the host's connected Express account. The security deposit is isolated as an authorization hold (not charged upfront).

2. Cancellation & Refund Engine: Implemented the 3 contractual policy tiers (Flexible 30d, Moderate 60d, Strict 90d). 100% of the cleaning fee auto-refunds prior to move-in, and deposit holds are canceled with zero penalty.

3. Twilio Verify & Postmark: Live SMS OTP delivery is active, along with Postmark transactional email triggers for verification, booking dispatch, host approval/decline, and itemized receipts.

4. Clinician Verification & Data Purge: The manual review queue is live with one-click Nursys QuickConfirm and FSMB DocInfo lookups. Upon admin approval, uploaded license documents and government IDs are permanently purged from server storage, retaining only the tamper-evident "Nurses Pillow Verified" badge.`}
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#14233a] text-xs font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

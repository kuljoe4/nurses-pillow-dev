import React, { useState, useEffect } from 'react';
import { AdminLicenseReview, MarketDemandReport, PromoCode, BookingRequest, HousingListing } from '../types';
import { AdminSheetsPreset } from './GoogleSheetsSyncModal';
import { Milestone2ScopeGate } from './Milestone2ScopeGate';
import { db } from '../services/database';
import { stripeConnect, HostFeeOverride } from '../services/stripeConnect';

interface AdminPortalViewProps {
  isNightShiftMode: boolean;
  onGoToHousing: () => void;
  onOpenGoogleSheets?: (preset?: AdminSheetsPreset) => void;
  onGoToTier2Plumbing?: () => void;
  bookingRequests?: BookingRequest[];
  listings?: HousingListing[];
  isDeveloper?: boolean;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  isNightShiftMode,
  onGoToHousing,
  onOpenGoogleSheets,
  onGoToTier2Plumbing,
  bookingRequests = [],
  listings = [],
  isDeveloper = false,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'queue' | 'hosts' | 'fees' | 'analytics' | 'sheets'>('queue');
  const [isAnalyticsUnlocked, setIsAnalyticsUnlocked] = useState(false);

  // Cohort state
  const [founderCohort, setFounderCohort] = useState<any[]>([]);
  const [showAddFounderForm, setShowAddFounderForm] = useState(false);
  const [newHostName, setNewHostName] = useState('');
  const [newHostProperty, setNewHostProperty] = useState('');

  // Screen C1 State

  const [reviews, setReviews] = useState<AdminLicenseReview[]>([
    {
      id: 'rev-1',
      clinicianLegalName: 'Sarah E. Jenkins',
      profession: 'RN',
      issuingState: 'CA',
      licenseNumber: 'RN-9482015-CA',
      licenseStatus: 'verified',
      hospitalAffiliation: 'Duke University Hospital (Durham)',
      submittedAt: 'Today 10:14 AM',
      nursysLookupUrl: 'https://www.nursys.com',
      documentPurged: true,
    },
    {
      id: 'rev-2',
      clinicianLegalName: 'Marcus Vance',
      profession: 'RN',
      issuingState: 'NC',
      licenseNumber: 'RN-284910-NC',
      licenseStatus: 'pending_review',
      hospitalAffiliation: 'Duke University Hospital (Durham)',
      submittedAt: 'Today 11:30 AM',
      nursysLookupUrl: 'https://www.nursys.com',
      documentPurged: false,
    },
    {
      id: 'rev-3',
      clinicianLegalName: 'Dr. David Chen',
      profession: 'MD',
      issuingState: 'NC',
      licenseNumber: 'MD-548912-NC',
      licenseStatus: 'pending_review',
      hospitalAffiliation: 'UNC Medical Center (Chapel Hill)',
      submittedAt: 'Yesterday 16:45 PM',
      nursysLookupUrl: 'https://www.docinfo.org',
      documentPurged: false,
    },
    {
      id: 'rev-4',
      clinicianLegalName: 'Elena Rostova',
      profession: 'CRNA',
      issuingState: 'NC',
      licenseNumber: 'CRNA-88190-NC',
      licenseStatus: 'pending_review',
      hospitalAffiliation: 'WakeMed Raleigh Campus',
      submittedAt: '2 days ago',
      nursysLookupUrl: 'https://www.nursys.com',
      documentPurged: false,
    },
  ]);

  // Screen C2 Fee Slider & Host Management State
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(() => stripeConnect.getGlobalPlatformFeePercent());
  const [sampleRent] = useState<number>(2000);
  const [feeNoticeSent, setFeeNoticeSent] = useState(false);

  // Dynamic Host Fee Overrides Directory State
  const [hosts, setHosts] = useState<HostFeeOverride[]>(() => stripeConnect.getHostProfiles());
  const [selectedHostIds, setSelectedHostIds] = useState<string[]>([]);
  const [batchOverridePercent, setBatchOverridePercent] = useState<string>('5.0');
  const [hostSearchQuery, setHostSearchQuery] = useState('');
  const [hostFilter, setHostFilter] = useState<'all' | 'override' | 'global'>('all');
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [showAddHostForm, setShowAddHostForm] = useState(false);
  const [newHostForm, setNewHostForm] = useState({
    hostName: '',
    email: '',
    phone: '',
    propertyTitle: '',
    hasOverride: true,
    overridePercent: 5.0,
    reason: 'Founder Host Cohort — 5% For Life Guarantee',
  });

  // Screen C3 Market Demand & Promo State
  const [demandReports] = useState<MarketDemandReport[]>([
    {
      hospitalName: 'Duke University Hospital',
      healthSystem: 'Duke Health',
      cityState: 'Durham, NC (27710)',
      clinicianSearchCount30d: 342,
      activeHostListings: 2,
      priorityRecruitmentTier: 'CRITICAL',
    },
    {
      hospitalName: 'Mayo Clinic Hospital - Saint Marys',
      healthSystem: 'Mayo Clinic Health System',
      cityState: 'Rochester, MN (55902)',
      clinicianSearchCount30d: 289,
      activeHostListings: 0,
      priorityRecruitmentTier: 'CRITICAL',
    },
    {
      hospitalName: 'Vanderbilt University Medical Center',
      healthSystem: 'Vanderbilt Health',
      cityState: 'Nashville, TN (37232)',
      clinicianSearchCount30d: 215,
      activeHostListings: 1,
      priorityRecruitmentTier: 'HIGH',
    },
    {
      hospitalName: 'The Johns Hopkins Hospital',
      healthSystem: 'Johns Hopkins Medicine',
      cityState: 'Baltimore, MD (21287)',
      clinicianSearchCount30d: 198,
      activeHostListings: 0,
      priorityRecruitmentTier: 'CRITICAL',
    },
  ]);

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    {
      id: 'p-1',
      code: 'FIRSTASSIGNMENT50',
      discountPercentage: 5,
      minBookingValue: 1500,
      expiresAt: '2025-12-31',
      usageLimit: 500,
      usageCount: 184,
      isActive: true,
    },
    {
      id: 'p-2',
      code: 'NIGHTSHIFTREST',
      discountPercentage: 10,
      minBookingValue: 2000,
      expiresAt: '2025-06-30',
      usageLimit: 250,
      usageCount: 92,
      isActive: true,
    },
  ]);

  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(5);

  const handleApprove = (id: string) => {
    const rev = reviews.find((r) => r.id === id);
    if (rev) {
      db.purgeClinicianDocuments(rev.id, rev.clinicianLegalName);
    }
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, licenseStatus: 'verified', documentPurged: true } : r
      )
    );
  };

  const handleReject = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, licenseStatus: 'rejected' } : r))
    );
  };

  const handleTriggerFeeNotice = () => {
    setFeeNoticeSent(true);
    setTimeout(() => setFeeNoticeSent(false), 3500);
  };

  // Toast notification helper
  const showToast = (message: string) => {
    setActionToast(message);
    setTimeout(() => {
      setActionToast((current) => (current === message ? null : current));
    }, 4000);
  };

  // Sync state with stripeConnect
  useEffect(() => {
    const unsub = stripeConnect.subscribe(() => {
      setHosts(stripeConnect.getHostProfiles());
      setPlatformFeePercent(stripeConnect.getGlobalPlatformFeePercent());
    });
    return unsub;
  }, []);

  const handlePlatformFeeSliderChange = (newVal: number) => {
    setPlatformFeePercent(newVal);
    stripeConnect.setGlobalPlatformFeePercent(newVal);
  };

  // Toggle Fee Override for an individual host
  const handleToggleHostFeeOverride = (hostId: string) => {
    const host = hosts.find((h) => h.hostId === hostId);
    if (!host) return;
    const nextState = !host.hasOverride;
    stripeConnect.setHostFeeOverride(hostId, nextState, host.overridePercent);
    setHosts(stripeConnect.getHostProfiles());
    showToast(
      nextState
        ? `Fee Override activated for ${host.hostName} (${host.overridePercent.toFixed(1)}%). Checkout will bypass global ${platformFeePercent.toFixed(1)}% rate.`
        : `Fee Override disabled for ${host.hostName}. Reverted to global platform rate (${platformFeePercent.toFixed(1)}%).`
    );
  };

  // Update specific percentage input for an individual host
  const handleUpdateHostFeePercent = (hostId: string, val: number) => {
    const valid = Math.max(0, Math.min(15, Number(val.toFixed(1))));
    const host = hosts.find((h) => h.hostId === hostId);
    if (!host) return;
    stripeConnect.setHostFeeOverride(hostId, true, valid);
    setHosts(stripeConnect.getHostProfiles());
    showToast(`Updated fee override to ${valid.toFixed(1)}% for ${host.hostName}. Active in checkout calculations.`);
  };

  // Toggle selection for batch actions
  const handleToggleSelectHost = (hostId: string) => {
    setSelectedHostIds((prev) =>
      prev.includes(hostId) ? prev.filter((id) => id !== hostId) : [...prev, hostId]
    );
  };

  const handleSelectAllFiltered = (filteredList: HostFeeOverride[]) => {
    if (selectedHostIds.length === filteredList.length) {
      setSelectedHostIds([]);
    } else {
      setSelectedHostIds(filteredList.map((h) => h.hostId));
    }
  };

  // Apply batch fee override to selected hosts
  const handleApplyBatchOverride = (hasOverride: boolean, specificPercent?: number) => {
    if (selectedHostIds.length === 0) return;
    const targetPercent =
      specificPercent !== undefined ? specificPercent : parseFloat(batchOverridePercent) || 5.0;
    const validPercent = Math.max(0, Math.min(15, Number(targetPercent.toFixed(1))));

    stripeConnect.batchSetHostFeeOverride(
      selectedHostIds,
      hasOverride,
      validPercent,
      hasOverride ? `Admin override adjustment (${validPercent.toFixed(1)}%)` : 'Standard Global Rate'
    );
    setHosts(stripeConnect.getHostProfiles());
    showToast(
      hasOverride
        ? `Applied ${validPercent.toFixed(1)}% fee override to ${selectedHostIds.length} selected host(s). Bypasses global rate in checkout.`
        : `Disabled override for ${selectedHostIds.length} selected host(s). Reverted to global ${platformFeePercent.toFixed(1)}% rate.`
    );
    setSelectedHostIds([]);
  };

  const handleAddNewHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostForm.hostName.trim() || !newHostForm.propertyTitle.trim()) return;

    stripeConnect.addHostProfile({
      hostId: `host-${Date.now()}`,
      hostName: newHostForm.hostName.trim(),
      email: newHostForm.email.trim() || `${newHostForm.hostName.toLowerCase().replace(/\s+/g, '.')}@partner.nursespillow.com`,
      phone: newHostForm.phone.trim() || '+1 (919) 555-0199',
      propertyTitle: newHostForm.propertyTitle.trim(),
      connectedAccountId: `acct_${Math.random().toString(36).substring(2, 10)}_Express`,
      hasOverride: newHostForm.hasOverride,
      overridePercent: newHostForm.overridePercent,
      isGrandfathered: newHostForm.overridePercent === 5.0,
      reason: newHostForm.reason.trim() || 'Custom Host Fee Agreement',
    });

    setHosts(stripeConnect.getHostProfiles());
    setShowAddHostForm(false);
    setNewHostForm({
      hostName: '',
      email: '',
      phone: '',
      propertyTitle: '',
      hasOverride: true,
      overridePercent: 5.0,
      reason: 'Founder Host Cohort — 5% For Life Guarantee',
    });
    showToast(`Registered new host with ${newHostForm.hasOverride ? `${newHostForm.overridePercent.toFixed(1)}% override` : 'global rate'}.`);
  };

  const handleDeleteHost = (hostId: string, hostName: string) => {
    stripeConnect.removeHostProfile(hostId);
    setHosts(stripeConnect.getHostProfiles());
    setSelectedHostIds((prev) => prev.filter((id) => id !== hostId));
    showToast(`Removed ${hostName} from managed hosts.`);
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    setPromoCodes((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        code: newPromoCode.trim().toUpperCase(),
        discountPercentage: newPromoDiscount,
        minBookingValue: 1800,
        expiresAt: '2025-12-31',
        usageLimit: 200,
        usageCount: 0,
        isActive: true,
      },
    ]);
    setNewPromoCode('');
  };

  // Calculations for Screen C2
  const hostPayoutSample = sampleRent * (1 - platformFeePercent / 100);
  const platformRevenueSample = sampleRent * (platformFeePercent / 100);

  return (
    <div
      className={`w-full py-8 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto transition-colors ${
        isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#001848]'
      }`}
    >
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#005684] dark:text-[#93ccff]">
              Portal C • Platform Operations
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#001848] text-white text-[11px] font-bold">
              Super-Admin Tier
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Super-Admin Operations &amp; Verification Hub
          </h1>
        </div>

        {/* Accessible Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Super-Admin Operations Navigation"
          className="bg-white dark:bg-[#0B1626] p-1.5 rounded-2xl shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-wrap items-center gap-1"
        >
          <button
            type="button"
            role="tab"
            id="admin-tab-queue"
            aria-selected={activeAdminTab === 'queue'}
            aria-controls="admin-panel-queue"
            tabIndex={activeAdminTab === 'queue' ? 0 : -1}
            onClick={() => setActiveAdminTab('queue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer focus-visible:ring-2 focus-visible:ring-[#005684] ${
              activeAdminTab === 'queue'
                ? 'bg-[#001848] text-white shadow-xs'
                : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
            }`}
          >
            License Queue
          </button>
          <button
            type="button"
            role="tab"
            id="admin-tab-hosts"
            aria-selected={activeAdminTab === 'hosts'}
            aria-controls="admin-panel-hosts"
            tabIndex={activeAdminTab === 'hosts' ? 0 : -1}
            onClick={() => setActiveAdminTab('hosts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#005684] ${
              activeAdminTab === 'hosts'
                ? 'bg-[#001848] text-white shadow-xs'
                : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840]'
            }`}
          >
            <span>Host Management</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#0A6FA8]/20 text-[#0A6FA8] dark:text-[#3E9AD1] font-mono">
              {hosts.filter((h) => h.hasOverride).length} Overrides
            </span>
          </button>
          <button
            type="button"
            role="tab"
            id="admin-tab-fees"
            aria-selected={activeAdminTab === 'fees'}
            aria-controls="admin-panel-fees"
            tabIndex={activeAdminTab === 'fees' ? 0 : -1}
            onClick={() => setActiveAdminTab('fees')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer focus-visible:ring-2 focus-visible:ring-[#005684] ${
              activeAdminTab === 'fees'
                ? 'bg-[#001848] text-white shadow-xs'
                : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
            }`}
          >
            Platform Fees &amp; Escrow
          </button>
          {isDeveloper && (
            <button
              type="button"
              role="tab"
              id="admin-tab-analytics"
              aria-selected={activeAdminTab === 'analytics'}
              aria-controls="admin-panel-analytics"
              tabIndex={activeAdminTab === 'analytics' ? 0 : -1}
              onClick={() => setActiveAdminTab('analytics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer focus-visible:ring-2 focus-visible:ring-[#005684] ${
                activeAdminTab === 'analytics'
                  ? 'bg-[#001848] text-white shadow-xs'
                  : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
              }`}
            >
              Marketplace Analytics
            </button>
          )}
          <button
            type="button"
            role="tab"
            id="admin-tab-sheets"
            aria-selected={activeAdminTab === 'sheets'}
            aria-controls="admin-panel-sheets"
            tabIndex={activeAdminTab === 'sheets' ? 0 : -1}
            onClick={() => setActiveAdminTab('sheets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#005684] ${
              activeAdminTab === 'sheets'
                ? 'bg-[#0F9D58] text-white shadow-xs'
                : 'text-[#0F9D58] dark:text-[#5bd395] hover:bg-[#0F9D58] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0F9D58]/10'
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2zm0 8H7v-2h10v2z" />
            </svg>
            <span>Google Sheets Bridge</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-black/20 text-white font-mono uppercase">
              Admin
            </span>
          </button>

          {onGoToTier2Plumbing && (
            <button
              type="button"
              onClick={onGoToTier2Plumbing}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer flex items-center gap-1.5 bg-[#0A6FA8]/10 text-[#0A6FA8] hover:bg-[#0A6FA8]/20 dark:text-[#3E9AD1]"
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>Tier 2 Plumbing Console</span>
            </button>
          )}
        </div>
      </div>

      {/* SCREEN C1: Manual License Verification Queue */}
      {activeAdminTab === 'queue' && (
        <div
          role="tabpanel"
          id="admin-panel-queue"
          aria-labelledby="admin-tab-queue"
          className="space-y-6"
        >
          {/* Data Privacy Callout Box */}
          <div className="p-4 rounded-2xl bg-[#aff0db]/25 border border-[#aff0db]/60 text-xs text-[#195b4c] dark:text-[#aff0db] leading-relaxed flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 text-[#195b4c]">security</span>
            <div>
              <strong>Mandatory Clinician Data Privacy Protocol:</strong> Upon manual or automated approval, uploaded medical license documents and PDF attachments are permanently purged from primary server storage. Only the tamper-evident <em>'Nurses Pillow Verified'</em> cryptographically signed status token is retained.
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold">Pending Clinician License Review Queue</h2>
                <p className="text-xs text-gray-500">Cross-reference state medical boards with 1-click Nursys QuickConfirm</p>
              </div>
              <div className="flex items-center gap-2.5">
                {onOpenGoogleSheets && (
                  <button
                    type="button"
                    onClick={() => onOpenGoogleSheets('admin-licenses')}
                    className="px-3.5 py-1.5 rounded-full bg-[#0F9D58] hover:bg-[#0c8047] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#005684]"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2zm0 8H7v-2h10v2z" />
                    </svg>
                    <span>Export Audit Trail to Sheets</span>
                  </button>
                )}
                <span className="text-xs font-bold text-[#005684] dark:text-[#93ccff]">
                  {reviews.filter((r) => r.licenseStatus === 'pending_review').length} Awaiting Verification
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <caption className="sr-only">Pending Clinician License Review Queue</caption>
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-bold uppercase text-[10px]">
                    <th scope="col" className="py-3 px-3">Clinician Name</th>
                    <th scope="col" className="py-3 px-3">Discipline</th>
                    <th scope="col" className="py-3 px-3">State &amp; License #</th>
                    <th scope="col" className="py-3 px-3">Health System Contract</th>
                    <th scope="col" className="py-3 px-3">Nursys / DocInfo Lookup</th>
                    <th scope="col" className="py-3 px-3">Status / Purge</th>
                    <th scope="col" className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-50 dark:hover:bg-[#14233a] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#14233a] transition-colors">
                      <td className="py-3.5 px-3 font-bold text-[#001848] dark:text-white">
                        {r.clinicianLegalName}
                        <div className="text-[10px] text-gray-400 font-normal">{r.submittedAt}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#eaedff] dark:bg-[#182840] font-bold text-[#005684] dark:text-[#93ccff]">
                          {r.profession}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold">{r.licenseNumber}</span>
                        <span className="text-gray-400 ml-1">({r.issuingState})</span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-600 dark:text-gray-300">
                        {r.hospitalAffiliation}
                      </td>
                      <td className="py-3.5 px-3">
                        {r.profession === 'MD' || r.profession === 'DO' ? (
                          <a
                            href="https://www.docinfo.org"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#005684] dark:text-[#93ccff] font-bold group"
                          >
                            <span className="group-hover:underline">FSMB DocInfo</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </a>
                        ) : (
                          <a
                            href="https://www.nursys.com"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#005684] dark:text-[#93ccff] font-bold group"
                          >
                            <span className="group-hover:underline">Nursys QuickConfirm</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </a>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {r.licenseStatus === 'verified' ? (
                          <div className="space-y-0.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#195b4c]/15 text-[#195b4c] dark:text-[#aff0db] font-bold text-[10px] inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">check</span> Verified
                            </span>
                            <div className="text-[9px] text-[#195b4c]">Docs Purged ✓</div>
                          </div>
                        ) : r.licenseStatus === 'rejected' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 font-bold text-[10px]">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {r.licenseStatus === 'pending_review' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprove(r.id)}
                              className="px-3 py-1 rounded-lg bg-[#001848] text-white text-[11px] font-bold hover:bg-[#162e62] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62] cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(r.id)}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] font-bold hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-rose-50 hover:text-rose-600 focus-visible:text-rose-600 cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">Processed</span>
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

      {/* SCREEN C2: Platform Fee Slider & Escrow Configuration */}
      {activeAdminTab === 'fees' && (
        <div
          role="tabpanel"
          id="admin-panel-fees"
          aria-labelledby="admin-tab-fees"
          className="space-y-6"
        >
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold">Platform Fee &amp; Take-Rate Control</h2>
                <p className="text-xs text-gray-500">
                  Global take-rate applied exclusively to host payouts. Nurses pay $0 platform booking markups.
                </p>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-[#eaedff] dark:bg-[#182840] border border-[#005684]/20 text-[#005684] dark:text-[#93ccff] font-mono font-bold text-lg">
                {platformFeePercent.toFixed(1)}% Platform Fee
              </div>
            </div>

            {/* Slider Control */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>0.0% (Break-even promotional)</span>
                <span>5.0% (Platform Standard)</span>
                <span>10.0% (Maximum Cap)</span>
              </div>
              <label htmlFor="platformFeeSlider" className="sr-only">
                Platform Take-Rate Percentage Slider
              </label>
              <input
                id="platformFeeSlider"
                type="range"
                min="0.0"
                max="10.0"
                step="0.5"
                value={platformFeePercent}
                onChange={(e) => setPlatformFeePercent(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#001848]"
              />
            </div>

            {/* Real-time Math Simulation Card */}
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-[#14233a] border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-4">
                Real-Time Simulation: Standard $2,000 / Month Nurse Reservation
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] text-gray-500 mb-1">Clinician Total Paid</div>
                  <div className="text-xl font-bold text-[#001848] dark:text-white">$2,000.00</div>
                  <div className="text-[10px] text-[#195b4c] font-bold mt-1">Zero Markups to Clinician</div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] text-gray-500 mb-1">Host Net Payout ({100 - platformFeePercent}%)</div>
                  <div className="text-xl font-bold text-[#005684] dark:text-[#93ccff]">
                    ${hostPayoutSample.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Direct ACH Escrow Deposit</div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] text-gray-500 mb-1">Platform Revenue ({platformFeePercent.toFixed(1)}%)</div>
                  <div className="text-xl font-bold text-[#745b0d] dark:text-[#ffdf91]">
                    ${platformRevenueSample.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Covers Stripe Fees &amp; Verification</div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500">
                  Adjusting fee applies to all future checkouts. Existing signed 13-week leases remain locked at creation rate.
                </div>
                <button
                  type="button"
                  onClick={handleTriggerFeeNotice}
                  className="px-4 py-2 rounded-xl bg-[#001848] text-white text-xs font-bold hover:bg-[#162e62] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62] cursor-pointer shrink-0 transition-colors"
                >
                  {feeNoticeSent ? 'Dispatched 30-Day Notice ✓' : 'Publish Fee Adjustment'}
                </button>
              </div>
            </div>

            {/* Founder Host Tier: First 50 Hosts @ 5% for Life Override Card */}
            <div className="mt-8 pt-8 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0B2559] dark:text-white">
                      Founder Host Cohort — 5% For Life Override
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#195b4c]/30 dark:text-[#aff0db] text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2F6E5E] dark:bg-[#aff0db]" />
                      Grandfathered
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Hosts in this cohort are permanently locked into the 5.0% take-rate. When you increase the global marketplace fee above, their fee never increases.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EFF6FB] dark:bg-[#182840] text-[#0A6FA8] dark:text-[#3E9AD1] tabular-nums">
                    {founderCohort.length} / 50 Enrolled
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddFounderForm(!showAddFounderForm)}
                    className="px-3 py-1.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {showAddFounderForm ? 'close' : 'add'}
                    </span>
                    <span>{showAddFounderForm ? 'Cancel' : 'Enroll Host'}</span>
                  </button>
                </div>
              </div>

              {/* Add Host Form */}
              {showAddFounderForm && (
                <div className="p-4 mb-4 rounded-2xl bg-[#EFF6FB] dark:bg-[#15233a] border border-[#0A6FA8]/20 space-y-3">
                  <div className="text-xs font-bold text-[#0B2559] dark:text-white">
                    Enroll Host into the 5% For Life Cohort
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Host Name (e.g. Rachel Adams)"
                      value={newHostName}
                      onChange={(e) => setNewHostName(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1626] text-[#0B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A6FA8]"
                    />
                    <input
                      type="text"
                      placeholder="Property / Listing (e.g. Duke Medical Cottage)"
                      value={newHostProperty}
                      onChange={(e) => setNewHostProperty(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1626] text-[#0B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A6FA8]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (newHostName.trim() && newHostProperty.trim()) {
                          setFounderCohort([
                            ...founderCohort,
                            {
                              id: `fh-${Date.now()}`,
                              name: newHostName.trim(),
                              property: newHostProperty.trim(),
                              dateEnrolled: 'Just now',
                              overridePercent: 5.0,
                              isLocked: true,
                            },
                          ]);
                          setNewHostName('');
                          setNewHostProperty('');
                          setShowAddFounderForm(false);
                        }
                      }}
                      disabled={!newHostName.trim() || !newHostProperty.trim()}
                      className="px-4 py-1.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Confirm 5% Lifetime Lock
                    </button>
                  </div>
                </div>
              )}

              {/* Founder Hosts Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-[#14233a] border-b border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Host Name</th>
                      <th className="px-4 py-2.5">Property</th>
                      <th className="px-4 py-2.5">Enrolled</th>
                      <th className="px-4 py-2.5">Locked Fee</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#0B1626]">
                    {founderCohort.map((host) => (
                      <tr key={host.id} className="hover:bg-gray-50/50 dark:hover:bg-[#111e33]">
                        <td className="px-4 py-2.5 font-bold text-[#0B2559] dark:text-white">
                          {host.name}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                          {host.property}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 tabular-nums">
                          {host.dateEnrolled}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-[#0A6FA8] dark:text-[#3E9AD1] tabular-nums">
                          {host.overridePercent.toFixed(1)}% Fixed
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#195b4c]/30 dark:text-[#aff0db] text-[10px] font-bold">
                            <span className="material-symbols-outlined text-[12px]">lock</span>
                            Locked for Life
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setFounderCohort(founderCohort.filter((h) => h.id !== host.id));
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Remove from 5% Cohort"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN C3: Marketplace Analytics & Demand Reports (Milestone 2 Deliverable) */}
      {activeAdminTab === 'analytics' && !isAnalyticsUnlocked && (
        <Milestone2ScopeGate
          isNightShiftMode={isNightShiftMode}
          featureTitle="Super-Admin Marketplace Analytics & Revenue Engine (/admin/analytics)"
          featureDescription="In accordance with the Final Scope Addendum, deep GMV forecasting, multi-hospital search telemetry, and automated fee distribution analytics are scheduled under Milestone 2 post-M1 marketplace acceptance."
          onReturnToMarketplace={() => setActiveAdminTab('queue')}
          onBypassGate={() => setIsAnalyticsUnlocked(true)}
        />
      )}

      {activeAdminTab === 'analytics' && isAnalyticsUnlocked && (
        <div
          role="tabpanel"
          id="admin-panel-analytics"
          aria-labelledby="admin-tab-analytics"
          className="space-y-6"
        >
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Gross Marketplace Volume (GMV)
              </span>
              <div className="text-3xl font-black text-[#001848] dark:text-white">$1,420,800.00</div>
              <div className="text-xs text-[#195b4c] font-bold mt-1">↑ 24.8% vs last month</div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Nurses Pillow App Revenue (5%)
              </span>
              <div className="text-3xl font-black text-[#005684] dark:text-[#93ccff]">$71,040.00</div>
              <div className="text-xs text-gray-500 mt-1">All net clinician volume intact</div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Active Marketplace Users
              </span>
              <div className="text-3xl font-black text-[#745b0d] dark:text-[#ffdf91]">1,842 Nurses</div>
              <div className="text-xs text-gray-500 mt-1">vs 316 Active Verified Hosts</div>
            </div>
          </div>

          {/* Demand-Without-Inventory Market Report */}
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold">Demand-Without-Inventory Market Report</h2>
                <p className="text-xs text-gray-500">
                  Target hospitals &amp; ZIP codes with high clinician search volume but low/zero host inventory
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onOpenGoogleSheets && (
                  <button
                    type="button"
                    onClick={() => onOpenGoogleSheets('admin-demand')}
                    className="px-3.5 py-1.5 rounded-full bg-[#0F9D58] hover:bg-[#0c8047] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#005684]"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2zm0 8H7v-2h10v2z" />
                    </svg>
                    <span>Export Market Report to Google Sheets</span>
                  </button>
                )}
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-xs font-bold">
                  Host Recruitment Targets
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <caption className="sr-only">Demand Without Inventory Market Report Table</caption>
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-bold uppercase text-[10px]">
                    <th scope="col" className="py-3 px-3">Hospital / Health System</th>
                    <th scope="col" className="py-3 px-3">Location &amp; ZIP</th>
                    <th scope="col" className="py-3 px-3">30-Day Search Volume</th>
                    <th scope="col" className="py-3 px-3">Active Listings</th>
                    <th scope="col" className="py-3 px-3">Action Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {demandReports.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-50 dark:hover:bg-[#14233a] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#14233a]">
                      <td className="py-3.5 px-3 font-bold text-[#001848] dark:text-white">
                        {d.hospitalName}
                        <div className="text-[10px] text-gray-400 font-normal">{d.healthSystem}</div>
                      </td>
                      <td className="py-3.5 px-3">{d.cityState}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-[#005684] dark:text-[#93ccff]">
                        {d.clinicianSearchCount30d} searches
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold">
                        <span className={d.activeHostListings === 0 ? 'text-rose-500' : 'text-amber-500'}>
                          {d.activeHostListings} listings
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.priorityRecruitmentTier === 'CRITICAL'
                              ? 'bg-rose-500/15 text-rose-600'
                              : 'bg-amber-500/15 text-amber-700'
                          }`}
                        >
                          {d.priorityRecruitmentTier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Promo Code Generator */}
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <h2 className="text-lg font-bold mb-1">Promo Code Generator</h2>
            <p className="text-xs text-gray-500 mb-4">
              Create assignment onboarding discounts for hospital recruitment partners
            </p>

            <form onSubmit={handleAddPromo} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div>
                <label htmlFor="promoCodeInput" className="sr-only">
                  Promo Code
                </label>
                <input
                  id="promoCodeInput"
                  type="text"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                  placeholder="PROMO CODE (e.g. DUKEHEALTH2025)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#005684]"
                  required
                />
              </div>

              <div>
                <label htmlFor="promoDiscountSelect" className="sr-only">
                  Discount Percentage
                </label>
                <select
                  id="promoDiscountSelect"
                  value={newPromoDiscount}
                  onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-[#005684]"
                >
                  <option value={5}>5% Discount</option>
                  <option value={10}>10% Discount</option>
                  <option value={15}>15% Discount</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#001848] text-white text-xs font-bold hover:bg-[#162e62] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62] cursor-pointer"
              >
                Generate Code
              </button>
            </form>

            <div className="space-y-2">
              {promoCodes.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between text-xs font-mono"
                >
                  <span className="font-bold text-[#005684] dark:text-[#93ccff]">{p.code}</span>
                  <span className="text-gray-500">
                    {p.discountPercentage}% off • Min ${p.minBookingValue}
                  </span>
                  <span className="text-gray-500">
                    {p.usageCount} / {p.usageLimit} uses
                  </span>
                  <span className="text-[#195b4c] font-bold">ACTIVE</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCREEN C4: Google Sheets Administrative Data Bridge */}
      {activeAdminTab === 'sheets' && (
        <div
          role="tabpanel"
          id="admin-panel-sheets"
          aria-labelledby="admin-tab-sheets"
          className="space-y-6"
        >
          {/* Architectural Purpose Callout */}
          <div className="p-5 rounded-3xl bg-[#0F9D58]/10 border border-[#0F9D58]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0F9D58]/20 text-[#0F9D58] uppercase tracking-wider">
                  Administrative Feature • Google Workspace
                </span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  Hidden from Public Menus
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#001848] dark:text-white">
                Google Sheets Operational Data Bridge
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                Seamlessly synchronize live operational metrics, unmet hospital market demand, and clinician license verification audit logs to Google Spreadsheets in your Google Drive without exposing administrative exports to standard nurse or host users.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenGoogleSheets?.('admin-demand')}
              className="px-5 py-2.5 rounded-2xl bg-[#0F9D58] hover:bg-[#0c8047] text-white text-xs font-bold shadow-md cursor-pointer transition-all duration-200 ease-in-out flex items-center gap-2 shrink-0 focus-visible:ring-2 focus-visible:ring-[#005684]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2zm0 8H7v-2h10v2z" />
              </svg>
              <span>Launch Google Sheets Sync</span>
            </button>
          </div>

          {/* 4 Specialized Administrative Export Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Market Demand */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">trending_up</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-bold">
                    Recruitment Target
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#001848] dark:text-white">
                  Demand-Without-Inventory Market Report
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  Export target hospital hubs where clinician search volume exceeds active host inventory. Used by business development to dispatch host sign-on incentives in low-supply ZIP codes.
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 space-y-1">
                  <div>• Headers: Target Hospital, Health System, Metro ZIP, 30d Searches, Supply Deficit</div>
                  <div>• Current Records: {demandReports.length} high-priority health systems</div>
                </div>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => onOpenGoogleSheets?.('admin-demand')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-[#182840] hover:bg-[#0F9D58] hover:text-white text-[#001848] dark:text-[#93ccff] text-xs font-bold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#005684]"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>Export Demand Report to Google Sheets</span>
                </button>
              </div>
            </div>

            {/* Card 2: License Audit Log */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#aff0db]/40 text-[#195b4c] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">verified_user</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#aff0db]/40 text-[#195b4c] text-[10px] font-bold">
                    Regulatory Compliance
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#001848] dark:text-white">
                  Clinician License Verification &amp; Audit Trail
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  Export state medical board credentials, verified Nursys lookup URLs, hospital affiliations, and proof of ephemeral PII document purging within 24 hours.
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 space-y-1">
                  <div>• Headers: Audit Ref ID, Clinician Name, Discipline, State, Nursys URL, Purged Status</div>
                  <div>• Current Records: {reviews.length} processed and pending credentials</div>
                </div>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => onOpenGoogleSheets?.('admin-licenses')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-[#182840] hover:bg-[#0F9D58] hover:text-white text-[#001848] dark:text-[#93ccff] text-xs font-bold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#005684]"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>Export License Verification Trail to Sheets</span>
                </button>
              </div>
            </div>

            {/* Card 3: Host Revenue Ledger */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#005684]/10 text-[#005684] dark:text-[#93ccff] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">account_balance</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#005684]/10 text-[#005684] dark:text-[#93ccff] text-[10px] font-bold">
                    Escrow Accounting
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#001848] dark:text-white">
                  Host Payouts &amp; 5% Platform Revenue Ledger
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  Itemized accounting export of all bookings, gross clinician payments, 5% platform take-rate retention, and net ACH payout disbursements to verified healthcare property hosts.
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 space-y-1">
                  <div>• Headers: Booking ID, Clinician, Property, Gross Rent, 5% Fee, Net Payout, Stay Dates</div>
                  <div>• Current Records: {bookingRequests.length} active and completed bookings</div>
                </div>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => onOpenGoogleSheets?.('host-revenue')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-[#182840] hover:bg-[#0F9D58] hover:text-white text-[#001848] dark:text-[#93ccff] text-xs font-bold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#005684]"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>Export Payouts &amp; Revenue Ledger to Sheets</span>
                </button>
              </div>
            </div>

            {/* Card 4: Hospital Sanctuaries Database */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">apartment</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                    Inventory Audit
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#001848] dark:text-white">
                  Hospital Sanctuaries &amp; Day-Sleeper Quality Audit
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  Directory export of all properties with verified zero-bleed blackout drapes, white noise dB ratings, quiet hours enforcement, hospital transit times, and calloff coverage.
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 space-y-1">
                  <div>• Headers: Title, Metro, Nearest Hospital, Drive Time, Amenities, Quiet Rating, Rates</div>
                  <div>• Current Records: {listings.length} verified sanctuaries</div>
                </div>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => onOpenGoogleSheets?.('housing-comparison')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-[#182840] hover:bg-[#0F9D58] hover:text-white text-[#001848] dark:text-[#93ccff] text-xs font-bold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#005684]"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>Export Sanctuary Database to Sheets</span>
                </button>
              </div>
            </div>
          </div>

          {/* Integration Security & Process Flow Explanation */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1626] shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              How the Google Sheets Administrative Bridge Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#14233a]">
                <div className="font-bold text-[#001848] dark:text-white mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#001848] text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Client-Side OAuth Authentication</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  Connects using Google Identity Services with minimal, secure scopes (Spreadsheets &amp; Drive). Never exposes client secrets.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#14233a]">
                <div className="font-bold text-[#001848] dark:text-white mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#001848] text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Dynamic Destination Selection</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  Create a new labeled spreadsheet or select an existing Google Sheet from your Google Drive with one click.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#14233a]">
                <div className="font-bold text-[#001848] dark:text-white mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#001848] text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Explicit Confirmations</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  Full schema preview with row counts before any writing occurs, backed by an alert confirmation dialog.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

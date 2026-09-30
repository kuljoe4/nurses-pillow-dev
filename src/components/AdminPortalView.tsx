import React, { useState, useEffect } from 'react';
import { AdminLicenseReview, MarketDemandReport, PromoCode, BookingRequest, HousingListing } from '../types';
import { AdminSheetsPreset } from './GoogleSheetsSyncModal';

import { QueueTab, HostsTab, FeesTab, AnalyticsTab, SheetsTab } from './AdminPortal';

import { db } from '../services/database';
import { stripeConnect, HostFeeOverride } from '../services/stripeConnect';

interface AdminPortalViewProps {
  currentUser?: any;
  isNightShiftMode: boolean;
  onGoToHousing: () => void;
  onOpenGoogleSheets?: (preset?: AdminSheetsPreset) => void;
  onGoToTier2Plumbing?: () => void;
  bookingRequests?: BookingRequest[];
  listings?: HousingListing[];
  isDeveloper?: boolean;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  currentUser,
  isNightShiftMode,
  onGoToHousing,
  onOpenGoogleSheets,
  onGoToTier2Plumbing,
  bookingRequests = [],
  listings = [],
  isDeveloper = false,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'queue' | 'hosts' | 'fees' | 'analytics' | 'sheets'>('queue');

  // Cohort state
  const [founderCohort, setFounderCohort] = useState<any[]>([]);
  const [showAddFounderForm, setShowAddFounderForm] = useState(false);
  const [newHostName, setNewHostName] = useState('');
  const [newHostProperty, setNewHostProperty] = useState('');

  // Screen C1 State

  const [reviews, setReviews] = useState<AdminLicenseReview[]>([]);

  useEffect(() => {
    const fetchVerifications = async () => {
        try {
            const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
            const res = await fetch('/api/admin/verifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error(`Expected JSON response, got ${contentType}`);
                }
                const data = await res.json();
                const mappedReviews = data.map((d: any) => ({
                    id: d.id,
                    clinicianLegalName: d.full_name || d.email,
                    profession: d.profession || d.profession_specialty || 'RN',
                    issuingState: d.state_board || d.clinical_state_board || 'NC',
                    licenseNumber: d.license_number || d.clinical_license_number || 'PENDING',
                    licenseStatus: d.verification_status,
                    hospitalAffiliation: 'Pending Assignment',
                    submittedAt: 'Recently',
                    nursysLookupUrl: 'https://www.nursys.com',
                    documentPurged: false
                }));
                setReviews(mappedReviews);
            }
        } catch (error) {
            console.error("Failed to fetch pending verifications", error);
        }
    };

    // Only fetch if admin
    if (currentUser?.role === 'super_admin') {
        fetchVerifications();
    }
  }, [currentUser]);

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

  const handleApprove = async (id: string) => {
    try {
        const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
        const res = await fetch(`/api/admin/verifications/${id}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn(`Expected JSON response, got ${contentType}, ignoring...`);
            } else {
                await res.json(); // optionally parse
            }
            setReviews((prev) =>
              prev.map((r) =>
                r.id === id ? { ...r, licenseStatus: 'verified', documentPurged: true, licenseNumber: 'PURGED' } : r
              )
            );
            alert('Verification approved and sensitive data purged securely.');
        } else {
            alert('Failed to approve verification');
        }
    } catch (error) {
        console.error("Approval error", error);
    }
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

  // Filtered hosts for Screen C1.5 Host Management
  const filteredHosts = hosts.filter((host) => {
    const q = hostSearchQuery.toLowerCase();
    const matchesSearch =
      host.hostName.toLowerCase().includes(q) ||
      host.propertyTitle.toLowerCase().includes(q) ||
      host.email.toLowerCase().includes(q) ||
      host.connectedAccountId.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (hostFilter === 'override') return host.hasOverride;
    if (hostFilter === 'global') return !host.hasOverride;
    return true;
  });

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
                : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
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
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer flex items-center gap-1.5 bg-[#0A6FA8]/10 text-[#0A6FA8] hover:bg-[#0A6FA8] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8]/20 dark:text-[#3E9AD1]"
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>Tier 2 Plumbing Console</span>
            </button>
          )}
        </div>
      </div>

      {/* SCREEN C1: Manual License Verification Queue */}
      {activeAdminTab === 'queue' && <QueueTab reviews={reviews} onOpenGoogleSheets={onOpenGoogleSheets} handleApprove={handleApprove} handleReject={handleReject} />}

      {/* SCREEN C1.5: Host Management & Fee Overrides */}
      {activeAdminTab === 'hosts' && <HostsTab setSelectedHostIds={setSelectedHostIds} hosts={hosts} platformFeePercent={platformFeePercent} showAddHostForm={showAddHostForm} setShowAddHostForm={setShowAddHostForm} newHostForm={newHostForm} setNewHostForm={setNewHostForm} handleAddNewHost={handleAddNewHost} hostSearchQuery={hostSearchQuery} setHostSearchQuery={setHostSearchQuery} hostFilter={hostFilter} setHostFilter={setHostFilter} selectedHostIds={selectedHostIds} handleApplyBatchOverride={handleApplyBatchOverride} batchOverridePercent={batchOverridePercent} setBatchOverridePercent={setBatchOverridePercent} handleSelectAllFiltered={handleSelectAllFiltered} filteredHosts={filteredHosts} handleToggleSelectHost={handleToggleSelectHost} handleToggleHostFeeOverride={handleToggleHostFeeOverride} handleUpdateHostFeePercent={handleUpdateHostFeePercent} handleDeleteHost={handleDeleteHost} />}

      {/* SCREEN C2: Platform Fee Slider & Escrow Configuration */}
      {activeAdminTab === 'fees' && <FeesTab platformFeePercent={platformFeePercent} handlePlatformFeeSliderChange={handlePlatformFeeSliderChange} hostPayoutSample={hostPayoutSample} platformRevenueSample={platformRevenueSample} feeNoticeSent={feeNoticeSent} setFeeNoticeSent={setFeeNoticeSent} founderCohort={founderCohort} showAddFounderForm={showAddFounderForm} setShowAddFounderForm={setShowAddFounderForm} newHostName={newHostName} setNewHostName={setNewHostName} newHostProperty={newHostProperty} setNewHostProperty={setNewHostProperty} setFounderCohort={setFounderCohort} />}

      {/* Marketplace Analytics & Demand Reports */}
      {activeAdminTab === 'analytics' && <AnalyticsTab demandReports={demandReports} newPromoCode={newPromoCode} setNewPromoCode={setNewPromoCode} newPromoDiscount={newPromoDiscount} setNewPromoDiscount={setNewPromoDiscount} handleAddPromo={handleAddPromo} promoCodes={promoCodes} onOpenGoogleSheets={onOpenGoogleSheets} />}

      {/* SCREEN C4: Google Sheets Administrative Data Bridge */}
      {activeAdminTab === 'sheets' && <SheetsTab onOpenGoogleSheets={onOpenGoogleSheets} demandReports={demandReports} reviews={reviews} bookingRequests={bookingRequests} listings={listings} />}

      {/* Action Toast Feedback Banner */}
      {actionToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0B2559] text-white px-4 py-3 rounded-2xl shadow-md border border-white/10 flex items-center gap-3 animate-fade-in text-xs font-medium"
        >
          <span className="material-symbols-outlined text-[18px] text-[#3E9AD1] shrink-0">
            check_circle
          </span>
          <span className="flex-1">{actionToast}</span>
          <button
            type="button"
            onClick={() => setActionToast(null)}
            className="text-white/60 hover:text-white focus-visible:text-white p-0.5 rounded-md cursor-pointer transition-colors"
            aria-label="Dismiss message"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </aside>
      )}
    </div>
  );
};

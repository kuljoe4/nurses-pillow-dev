import React, { useState, useMemo, useEffect } from 'react';
import {
  PHASE_1_SCREENS,
  PHASE_1_FLOWS,
  NOTIFICATION_TEMPLATES,
  CROSS_CUTTING_STATES,
  DECISION_BLOCKED_ITEMS,
  OUT_OF_PHASE_1_ITEMS,
  InventoryScreen,
  EndToEndFlow,
  NotificationTemplateRecord,
  getScreenBuildTier,
} from '../data/phase1InventoryData';
import { NavigationTab } from '../types';

interface Phase1InventoryViewProps {
  isNightShiftMode: boolean;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenSupport: () => void;
  onOpenAuthModal?: () => void;
}

export const Phase1InventoryView: React.FC<Phase1InventoryViewProps> = ({
  isNightShiftMode,
  onNavigateTab,
  onOpenSupport,
  onOpenAuthModal,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'screens' | 'flows' | 'notifications' | 'states' | 'summary' | 'blocked' | 'out-of-scope'>('screens');

  // Screens filter state
  const [screenSearch, setScreenSearch] = useState('');
  const [milestoneFilter, setMilestoneFilter] = useState<'all' | 'M1' | 'M2' | 'M3'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'Must' | 'Should' | 'Could'>('all');
  const [buildTierFilter, setBuildTierFilter] = useState<'all' | 'T1' | 'T2' | 'T3' | 'T4'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedScreenForDetail, setSelectedScreenForDetail] = useState<InventoryScreen | null>(null);

  // Flows filter state
  const [selectedFlow, setSelectedFlow] = useState<EndToEndFlow>(PHASE_1_FLOWS[0]);
  const [flowCurrentStepIndex, setFlowCurrentStepIndex] = useState(0);

  // Notification templates state
  const [selectedNotification, setSelectedNotification] = useState<NotificationTemplateRecord | null>(null);
  const [notificationChannelPreview, setNotificationChannelPreview] = useState<'Email' | 'SMS' | 'Push' | 'In-App'>('Email');
  const [customNotificationCopy, setCustomNotificationCopy] = useState<string>('');

  // States sandbox active state
  const [activeStateDemo, setActiveStateDemo] = useState<string>('STATE-04');
  const [demoButtonLoading, setDemoButtonLoading] = useState(false);
  const [demoInlineError, setDemoInlineError] = useState('Please enter a valid unencumbered state license number');

  // Close detail modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedScreenForDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered screens calculation
  const filteredScreens = useMemo(() => {
    return PHASE_1_SCREENS.filter((s) => {
      if (milestoneFilter !== 'all' && s.milestone !== milestoneFilter) return false;
      if (priorityFilter !== 'all' && s.priority !== priorityFilter) return false;
      if (buildTierFilter !== 'all' && getScreenBuildTier(s) !== buildTierFilter) return false;
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
      if (screenSearch.trim()) {
        const query = screenSearch.toLowerCase();
        return (
          s.id.toLowerCase().includes(query) ||
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [milestoneFilter, priorityFilter, buildTierFilter, categoryFilter, screenSearch]);

  // Executive summary counts
  const summaryStats = useMemo(() => {
    const total = PHASE_1_SCREENS.length;
    const m1 = PHASE_1_SCREENS.filter((s) => s.milestone === 'M1').length;
    const m2 = PHASE_1_SCREENS.filter((s) => s.milestone === 'M2').length;
    const m3 = PHASE_1_SCREENS.filter((s) => s.milestone === 'M3').length;

    const webOnly = PHASE_1_SCREENS.filter((s) => s.platform === 'Web').length;
    const mobileOnly = PHASE_1_SCREENS.filter((s) => s.platform === 'Mobile').length;
    const bothPlatform = PHASE_1_SCREENS.filter((s) => s.platform === 'Both').length;

    const must = PHASE_1_SCREENS.filter((s) => s.priority === 'Must').length;
    const should = PHASE_1_SCREENS.filter((s) => s.priority === 'Should').length;
    const could = PHASE_1_SCREENS.filter((s) => s.priority === 'Could').length;

    const nurseRole = PHASE_1_SCREENS.filter((s) => s.role === 'Nurse').length;
    const hostRole = PHASE_1_SCREENS.filter((s) => s.role === 'Host').length;
    const adminRole = PHASE_1_SCREENS.filter((s) => s.role === 'Admin').length;
    const sharedRole = PHASE_1_SCREENS.filter((s) => s.role === 'All' || s.role === 'Nurse / Host').length;

    const t1 = PHASE_1_SCREENS.filter((s) => getScreenBuildTier(s) === 'T1').length;
    const t2 = PHASE_1_SCREENS.filter((s) => getScreenBuildTier(s) === 'T2').length;
    const t3 = PHASE_1_SCREENS.filter((s) => getScreenBuildTier(s) === 'T3').length;
    const t4 = PHASE_1_SCREENS.filter((s) => getScreenBuildTier(s) === 'T4').length;

    return {
      total,
      m1,
      m2,
      m3,
      webOnly,
      mobileOnly,
      bothPlatform,
      must,
      should,
      could,
      nurseRole,
      hostRole,
      adminRole,
      sharedRole,
      t1,
      t2,
      t3,
      t4,
    };
  }, []);

  // Categories list
  const categories = ['all', 'Public, Marketing & Legal', 'Authentication', 'Nurse (Traveler)', 'Shared', 'Host', 'Admin / Operations', 'Mobile Apps'];

  const handleJumpToScreen = (screen: InventoryScreen) => {
    if (screen.appTab === 'auth') {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    if (screen.appTab === 'nurse-support') {
      onOpenSupport();
      return;
    }
    if (screen.appTab) {
      onNavigateTab(screen.appTab as NavigationTab);
    } else {
      setSelectedScreenForDetail(screen);
    }
  };

  return (
    <div className={`w-full py-8 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto transition-colors ${
      isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#001848]'
    }`}>
      {/* Top Banner / Hero */}
      <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#005684]/15 text-[#005684] dark:text-[#93ccff]">
                PHASE 1 CONTRACT DELIVERABLE ($2,500 SIGNED SCOPE)
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                119 Launch Blockers Audited
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">code</span>
                Internal Developer Reference
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Nurses Pillow — Phase 1 Master Inventory &amp; Flow Navigator
            </h1>
            <p className="text-sm opacity-80 mt-1 max-w-2xl leading-relaxed">
              Companion to the Design System. Complete internal reference indexing <strong>150 screens &amp; pages</strong>, <strong>19 end-to-end flows</strong>, <strong>25 notification templates</strong>, and <strong>11 cross-cutting state patterns</strong>.
            </p>
            <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#eaedff]/60 dark:bg-[#15233a] border border-[#005684]/20 text-[11px] text-[#005684] dark:text-[#93ccff] inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">info</span>
              <span><strong>Developer Notice:</strong> All screen code names (e.g., AU-01, HO-04, M-01) are internal developer and architectural references only and are not customer-facing.</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-[#005684]/5 dark:bg-[#005684]/15 border border-[#005684]/20 text-center">
              <div className="text-xl sm:text-2xl font-black text-[#005684] dark:text-[#93ccff]">150</div>
              <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Total Screens</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/15 border border-emerald-500/20 text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">19</div>
              <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">E2E Flows</div>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/5 dark:bg-blue-500/15 border border-blue-500/20 text-center">
              <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">25</div>
              <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Templates</div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/5 dark:bg-purple-500/15 border border-purple-500/20 text-center">
              <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">11</div>
              <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">UI States</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigator Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-[#0B1626] p-1.5 rounded-2xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm">
        <button
          onClick={() => setActiveMainTab('screens')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMainTab === 'screens'
              ? 'bg-[#005684] text-white shadow-sm'
              : 'hover:bg-gray-100 dark:hover:bg-white/5 opacity-80'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">grid_view</span>
          <span>150 Screens Matrix</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20">All</span>
        </button>

        <button
          onClick={() => setActiveMainTab('flows')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMainTab === 'flows'
              ? 'bg-[#005684] text-white shadow-sm'
              : 'hover:bg-gray-100 dark:hover:bg-white/5 opacity-80'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">route</span>
          <span>19 End-to-End Flows</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20">Demo Ready</span>
        </button>

        <button
          onClick={() => setActiveMainTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMainTab === 'notifications'
              ? 'bg-[#005684] text-white shadow-sm'
              : 'hover:bg-gray-100 dark:hover:bg-white/5 opacity-80'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
          <span>25 Notification Templates</span>
        </button>

        <button
          onClick={() => setActiveMainTab('states')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMainTab === 'states'
              ? 'bg-[#005684] text-white shadow-sm'
              : 'hover:bg-gray-100 dark:hover:bg-white/5 opacity-80'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">layers</span>
          <span>11 Cross-Cutting States</span>
        </button>

        <button
          onClick={() => setActiveMainTab('summary')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMainTab === 'summary'
              ? 'bg-[#005684] text-white shadow-sm'
              : 'hover:bg-gray-100 dark:hover:bg-white/5 opacity-80'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          <span>Summary &amp; Counts</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono">Live</span>
        </button>

        <button
          onClick={() => setActiveMainTab('blocked')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMainTab === 'blocked'
              ? 'bg-[#005684] text-white shadow-sm'
              : 'hover:bg-gray-100 dark:hover:bg-white/5 opacity-80'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">pending_actions</span>
          <span>NC Attorney Blocked (4)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-black font-bold">P-05..09</span>
        </button>

        <button
          onClick={() => setActiveMainTab('out-of-scope')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMainTab === 'out-of-scope'
              ? 'bg-[#005684] text-white shadow-sm'
              : 'hover:bg-gray-100 dark:hover:bg-white/5 opacity-80'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">block</span>
          <span>Out of Scope (Phase 2)</span>
        </button>
      </div>

      {/* TAB 1: 150 SCREENS MATRIX */}
      {activeMainTab === 'screens' && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-[#0B1626] p-4 rounded-2xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by ID (e.g. NS-01, P-07), name or keyword..."
                  value={screenSearch}
                  onChange={(e) => setScreenSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[rgba(11,37,89,0.15)] dark:border-[#233550] bg-transparent focus:outline-none focus:border-[#005684]"
                />
              </div>

              {/* Counts & Clear */}
              <div className="flex items-center gap-2 text-xs opacity-80 self-end sm:self-auto">
                <span>Showing <strong>{filteredScreens.length}</strong> of 150 screens</span>
                {(screenSearch || milestoneFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setScreenSearch('');
                      setMilestoneFilter('all');
                      setPriorityFilter('all');
                      setCategoryFilter('all');
                    }}
                    className="text-[#005684] dark:text-[#93ccff] font-bold hover:underline ml-2"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550]/60 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="opacity-60 font-semibold">Milestone:</span>
                {(['all', 'M1', 'M2', 'M3'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMilestoneFilter(m)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      milestoneFilter === m
                        ? 'bg-[#005684] text-white'
                        : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {m === 'all' ? 'All' : m}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="opacity-60 font-semibold">Priority:</span>
                {(['all', 'Must', 'Should', 'Could'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      priorityFilter === p
                        ? 'bg-[#005684] text-white'
                        : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {p === 'all' ? 'All' : p}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="opacity-60 font-semibold">Build Tier:</span>
                {(['all', 'T1', 'T2', 'T3', 'T4'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setBuildTierFilter(t)}
                    title={
                      t === 'T1'
                        ? 'T1: Fast visual wins'
                        : t === 'T2'
                        ? 'T2: Payments & verification'
                        : t === 'T3'
                        ? 'T3: Dashboards & admin'
                        : t === 'T4'
                        ? 'T4: Mobile & infrastructure'
                        : 'All Tiers'
                    }
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      buildTierFilter === t
                        ? 'bg-[#005684] text-white'
                        : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {t === 'all' ? 'All' : t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="opacity-60 font-semibold">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border-none font-semibold text-xs focus:outline-none dark:bg-[#0B1626]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'all' ? 'All Areas' : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Screens Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScreens.map((screen) => {
              const tier = getScreenBuildTier(screen);
              return (
              <div
                key={screen.id}
                className="bg-white dark:bg-[#0B1626] rounded-2xl p-5 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm flex flex-col justify-between hover:border-[#005684]/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[#005684]/10 text-[#005684] dark:text-[#93ccff]">
                      {screen.id}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        screen.milestone === 'M1'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          : screen.milestone === 'M2'
                          ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
                          : 'bg-teal-500/10 text-teal-700 dark:text-teal-300'
                      }`}>
                        {screen.milestone}
                      </span>
                      <span
                        title={
                          tier === 'T1'
                            ? 'T1: Fast visual wins'
                            : tier === 'T2'
                            ? 'T2: Payments & verification'
                            : tier === 'T3'
                            ? 'T3: Dashboards & admin'
                            : 'T4: Mobile & infrastructure'
                        }
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-200"
                      >
                        {tier}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        screen.priority === 'Must'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                          : screen.priority === 'Should'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          : 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
                      }`}>
                        {screen.priority}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold mb-1 group-hover:text-[#005684] dark:group-hover:text-[#93ccff] transition-colors">
                    {screen.name}
                  </h3>
                  <div className="text-[11px] opacity-60 mb-2 font-semibold">
                    {screen.category} • Role: {screen.role} • {screen.platform}
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed mb-4">
                    {screen.description}
                  </p>

                  {screen.flag && (
                    <div className="text-[10px] font-bold px-2 py-1 rounded bg-black/5 dark:bg-white/5 mb-3 inline-block">
                      Flag: {screen.flag}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550]/60 flex items-center justify-between">
                  <span className="text-[11px] opacity-60 font-mono">
                    {screen.appTab ? `Tab: ${screen.appTab}` : 'Interactive View'}
                  </span>
                  <button
                    onClick={() => handleJumpToScreen(screen)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#005684] text-white text-xs font-bold hover:bg-[#00476d] transition-all shadow-sm"
                  >
                    <span>Open Screen</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* TAB 2: 19 END-TO-END FLOWS */}
      {activeMainTab === 'flows' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Flow Selector Column */}
          <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-1">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-3">
              Phase 1 Flows (19 Total)
            </h3>
            {PHASE_1_FLOWS.map((flow) => (
              <button
                key={flow.id}
                onClick={() => {
                  setSelectedFlow(flow);
                  setFlowCurrentStepIndex(0);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition-all flex flex-col gap-1 ${
                  selectedFlow.id === flow.id
                    ? 'bg-[#005684] text-white border-[#005684] shadow-md'
                    : 'bg-white dark:bg-[#0B1626] border-[rgba(11,37,89,0.08)] dark:border-[#233550] hover:border-[#005684]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                    selectedFlow.id === flow.id ? 'bg-white/20' : 'bg-black/5 dark:bg-white/5'
                  }`}>
                    {flow.id}
                  </span>
                  <span className="text-[10px] opacity-80">{flow.milestone} • {flow.role}</span>
                </div>
                <div className="text-sm font-extrabold">{flow.name}</div>
                <div className="text-[11px] opacity-80 font-normal line-clamp-1">
                  Trigger: {flow.trigger}
                </div>
              </button>
            ))}
          </div>

          {/* Flow Interactive Walkthrough Workspace */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0B1626] p-6 sm:p-8 rounded-3xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[#005684]/15 text-[#005684] dark:text-[#93ccff]">
                    {selectedFlow.id}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    {selectedFlow.milestone} Deliverable
                  </span>
                  <span className="text-xs font-bold opacity-70">Role: {selectedFlow.role}</span>
                </div>
                <h2 className="text-2xl font-black">{selectedFlow.name}</h2>
              </div>
            </div>

            {/* Trigger & Ending */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                <div className="text-[10px] uppercase tracking-wider font-bold opacity-70 mb-1">
                  Trigger Initiator
                </div>
                <div className="text-xs font-semibold leading-relaxed">
                  {selectedFlow.trigger}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-200 mb-1">
                  Journey Ending
                </div>
                <div className="text-xs font-semibold leading-relaxed text-emerald-900 dark:text-emerald-100">
                  {selectedFlow.ending}
                </div>
              </div>
            </div>

            {/* Step Sequence Bar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                  Step-by-Step Screen Sequence ({selectedFlow.steps.length} Steps)
                </span>
                <span className="text-xs font-mono opacity-80">
                  Active Step: {flowCurrentStepIndex + 1} of {selectedFlow.steps.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 items-center p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                {selectedFlow.steps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFlowCurrentStepIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                      flowCurrentStepIndex === idx
                        ? 'bg-[#005684] text-white shadow-sm'
                        : 'bg-white dark:bg-[#0B1626] border border-[rgba(11,37,89,0.1)] dark:border-[#233550] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span>{step}</span>
                    {idx < selectedFlow.steps.length - 1 && (
                      <span className="text-gray-400 font-sans ml-1">→</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Active Step Interactive Card */}
            <div className="p-6 rounded-2xl border-2 border-[#005684]/30 bg-[#EFF6FB]/50 dark:bg-[#08101C] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#005684] dark:text-[#93ccff]">
                    Step {flowCurrentStepIndex + 1} Details
                  </span>
                  <h4 className="text-lg font-black font-mono">
                    Screen ID: {selectedFlow.steps[flowCurrentStepIndex]}
                  </h4>
                </div>
                <button
                  onClick={() => {
                    const stepId = selectedFlow.steps[flowCurrentStepIndex].replace('..', '').split('/')[0];
                    const matchedScreen = PHASE_1_SCREENS.find((s) => s.id === stepId);
                    if (matchedScreen) {
                      handleJumpToScreen(matchedScreen);
                    }
                  }}
                  className="px-4 py-2 bg-[#005684] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#00476d] transition-all flex items-center gap-1.5"
                >
                  <span>Launch Screen Live</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>
              </div>

              <div className="text-xs opacity-80 leading-relaxed">
                {selectedFlow.notes}
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={flowCurrentStepIndex === 0}
                  onClick={() => setFlowCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-black/10 dark:border-white/10 disabled:opacity-30"
                >
                  ← Previous Step
                </button>
                <button
                  disabled={flowCurrentStepIndex === selectedFlow.steps.length - 1}
                  onClick={() => setFlowCurrentStepIndex((prev) => Math.min(selectedFlow.steps.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#005684] text-white disabled:opacity-30"
                >
                  Next Step in Flow →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 25 NOTIFICATION & MESSAGE TEMPLATES */}
      {activeMainTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Templates List */}
          <div className="lg:col-span-5 space-y-2 max-h-[700px] overflow-y-auto pr-1">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-3">
              Notification Templates (25 Total across M1 &amp; M2)
            </h3>
            {NOTIFICATION_TEMPLATES.map((notif) => (
              <button
                key={notif.id}
                onClick={() => {
                  setSelectedNotification(notif);
                  setCustomNotificationCopy(notif.sampleBody);
                  setNotificationChannelPreview(notif.channels[0] as any);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all flex flex-col gap-1 ${
                  selectedNotification?.id === notif.id
                    ? 'bg-[#005684] text-white border-[#005684] shadow-md'
                    : 'bg-white dark:bg-[#0B1626] border-[rgba(11,37,89,0.08)] dark:border-[#233550] hover:border-[#005684]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    selectedNotification?.id === notif.id ? 'bg-white/20' : 'bg-black/5 dark:bg-white/5'
                  }`}>
                    {notif.id}
                  </span>
                  <span className="text-[10px] opacity-80">{notif.milestone} • {notif.recipient}</span>
                </div>
                <div className="font-bold text-sm">{notif.event}</div>
                <div className="text-[11px] opacity-70 flex gap-1">
                  {notif.channels.map((c) => (
                    <span key={c} className="bg-black/5 dark:bg-white/10 px-1.5 py-0.2 rounded text-[9px] font-mono">
                      {c}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Template Preview & Editor Column */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0B1626] p-6 sm:p-8 rounded-3xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm space-y-6">
            {selectedNotification ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
                  <div>
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[#005684]/15 text-[#005684] dark:text-[#93ccff]">
                      {selectedNotification.id}
                    </span>
                    <h2 className="text-xl font-black mt-1">{selectedNotification.event}</h2>
                    <p className="text-xs opacity-70">
                      Recipient: <strong>{selectedNotification.recipient}</strong> • Milestone: {selectedNotification.milestone}
                    </p>
                  </div>

                  {/* Channel Switcher */}
                  <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                    {selectedNotification.channels.map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setNotificationChannelPreview(ch as any)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          notificationChannelPreview === ch
                            ? 'bg-[#005684] text-white'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rendered Live Simulation */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                    Live Channel Simulation: {notificationChannelPreview}
                  </div>

                  {notificationChannelPreview === 'Email' && (
                    <div className="rounded-2xl border border-[rgba(11,37,89,0.15)] dark:border-[#233550] overflow-hidden shadow-sm">
                      <div className="bg-[#001848] text-white p-4 flex items-center justify-between text-xs">
                        <div className="font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">mail</span>
                          <span>Postmark Transactional Delivery</span>
                        </div>
                        <span className="opacity-70 text-[11px]">from: support@nursespillow.com</span>
                      </div>
                      <div className="p-5 bg-white dark:bg-[#08101C] text-xs space-y-3">
                        <div className="font-bold text-sm border-b border-black/5 pb-2">
                          Subject: {selectedNotification.subject}
                        </div>
                        <p className="leading-relaxed opacity-90">
                          {customNotificationCopy || selectedNotification.sampleBody}
                        </p>
                        <div className="pt-4 border-t border-black/5 flex justify-between items-center text-[10px] opacity-60">
                          <span>Nurses Pillow Inc. • Clinical Housing Network</span>
                          <span>Transactional ID: #NP-TX-8492</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {notificationChannelPreview === 'SMS' && (
                    <div className="max-w-md mx-auto p-4 rounded-3xl bg-[#E9E9EB] dark:bg-[#1C2533] text-black dark:text-white shadow-sm space-y-2">
                      <div className="text-[10px] text-center opacity-60 font-semibold">
                        Twilio SMS Verified Gateway • 1-800-PILLOWS
                      </div>
                      <div className="bg-[#007AFF] text-white p-3 rounded-2xl rounded-bl-none text-xs leading-relaxed max-w-[85%]">
                        {customNotificationCopy || selectedNotification.sampleBody}
                      </div>
                      <div className="text-[9px] opacity-50 text-right pr-2">Delivered • Just now</div>
                    </div>
                  )}

                  {(notificationChannelPreview === 'Push' || notificationChannelPreview === 'In-App') && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#08101C] border-2 border-[#005684]/30 shadow-lg flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#005684] text-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">notifications</span>
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">NURSES PILLOW ALERT</span>
                          <span className="text-[10px] opacity-60">now</span>
                        </div>
                        <p className="leading-relaxed opacity-90">
                          {customNotificationCopy || selectedNotification.sampleBody}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin-Editable Copy Box */}
                <div className="space-y-2 pt-2 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70 block">
                    Admin Copy Customizer (Test Variable Merge)
                  </label>
                  <textarea
                    rows={3}
                    value={customNotificationCopy}
                    onChange={(e) => setCustomNotificationCopy(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[rgba(11,37,89,0.2)] dark:border-[#233550] bg-transparent text-xs leading-relaxed focus:outline-none focus:border-[#005684]"
                  />
                  <div className="text-[10px] opacity-60 flex justify-between">
                    <span>Variables supported: [ClinicianName], [HospitalName], [DoorCode], [MonthlyRent]</span>
                    <button
                      onClick={() => setCustomNotificationCopy(selectedNotification.sampleBody)}
                      className="text-[#005684] dark:text-[#93ccff] font-bold hover:underline"
                    >
                      Reset to Default Copy
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 opacity-60">
                Select a notification template from the left to view its rendered design and delivery logic.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: 11 CROSS-CUTTING STATE PATTERNS */}
      {activeMainTab === 'states' && (
        <div className="space-y-8">
          <div className="flex flex-wrap gap-2 bg-white dark:bg-[#0B1626] p-2 rounded-2xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            {CROSS_CUTTING_STATES.map((st) => (
              <button
                key={st.id}
                onClick={() => setActiveStateDemo(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeStateDemo === st.id
                    ? 'bg-[#005684] text-white shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 opacity-80 hover:opacity-100'
                }`}
              >
                <span className="font-mono text-[10px] mr-1 opacity-75">{st.id}</span>
                <span>{st.state}</span>
              </button>
            ))}
          </div>

          {/* Active Demo Canvas */}
          <div className="bg-white dark:bg-[#0B1626] p-8 rounded-3xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm">
            {/* Pattern Rule Banner */}
            {(() => {
              const currentPattern = CROSS_CUTTING_STATES.find((s) => s.id === activeStateDemo)!;
              return (
                <div className="mb-6 pb-4 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#005684]/15 text-[#005684] dark:text-[#93ccff]">
                        {currentPattern.id}
                      </span>
                      <h3 className="text-lg font-black">{currentPattern.state}</h3>
                    </div>
                    <p className="text-xs opacity-70">{currentPattern.treatment}</p>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-bold self-start sm:self-auto">
                    Design Rule: {currentPattern.rule}
                  </div>
                </div>
              );
            })()}

            {/* Renderings */}
            <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 min-h-[220px] flex items-center justify-center">
              {/* STATE-01: Skeleton */}
              {activeStateDemo === 'STATE-01' && (
                <div className="w-full max-w-lg space-y-3">
                  <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-28 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse" />
                    <div className="h-28 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse" />
                    <div className="h-28 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse" />
                  </div>
                  <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>
              )}

              {/* STATE-02: In-button loading */}
              {activeStateDemo === 'STATE-02' && (
                <div className="text-center space-y-3">
                  <button
                    onClick={() => {
                      setDemoButtonLoading(true);
                      setTimeout(() => setDemoButtonLoading(false), 2000);
                    }}
                    className="w-48 py-3 px-6 rounded-xl bg-[#005684] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 mx-auto transition-all"
                  >
                    {demoButtonLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authorizing...</span>
                      </>
                    ) : (
                      <span>Capture Payment ($2,800)</span>
                    )}
                  </button>
                  <p className="text-[11px] opacity-60">Click button to preview spinner replacing label with locked width</p>
                </div>
              )}

              {/* STATE-03: Empty no data yet */}
              {activeStateDemo === 'STATE-03' && (
                <div className="text-center py-6 max-w-sm space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#005684]/10 text-[#005684] dark:text-[#93ccff] flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[32px]">favorite_border</span>
                  </div>
                  <h4 className="text-sm font-bold">No Saved Pillows Yet</h4>
                  <p className="text-xs opacity-70">
                    Tap the heart icon on any listing near your hospital to save it for side-by-side contract comparison.
                  </p>
                  <button
                    onClick={() => onNavigateTab('find-housing')}
                    className="px-4 py-2 rounded-xl bg-[#005684] text-white text-xs font-bold"
                  >
                    Explore Sanctuaries
                  </button>
                </div>
              )}

              {/* STATE-04: Empty filters widen */}
              {activeStateDemo === 'STATE-04' && (
                <div className="text-center py-6 max-w-md space-y-3">
                  <div className="text-sm font-bold">No rooms within 5 miles of Duke University Hospital.</div>
                  <p className="text-xs opacity-70">
                    Your daytime blackout and pet-friendly filters narrowed all results in this radius.
                  </p>
                  <button
                    onClick={() => onNavigateTab('search-listings')}
                    className="px-5 py-2.5 rounded-xl bg-[#005684] text-white text-xs font-bold flex items-center gap-1.5 mx-auto shadow-sm"
                  >
                    <span>Try 10 miles radius</span>
                    <span className="material-symbols-outlined text-[16px]">expand</span>
                  </button>
                </div>
              )}

              {/* STATE-06: Inline error */}
              {activeStateDemo === 'STATE-06' && (
                <div className="w-full max-w-sm space-y-2">
                  <label className="text-xs font-bold block">California RN Board License Number</label>
                  <input
                    type="text"
                    defaultValue="RN-INV-99"
                    className="w-full p-2.5 rounded-xl border-2 border-rose-500 bg-rose-500/5 text-xs font-semibold focus:outline-none"
                  />
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>{demoInlineError}</span>
                  </div>
                </div>
              )}

              {/* STATE-09: Permission / Access Denied */}
              {activeStateDemo === 'STATE-09' && (
                <div className="text-center py-6 max-w-sm space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[30px]">lock</span>
                  </div>
                  <h4 className="text-sm font-bold">Clinical Credentialing Required to Book</h4>
                  <p className="text-xs opacity-70">
                    To maintain safe, quiet sanctuaries for healthcare workers, verified RN license or hospital contract is required prior to checkout.
                  </p>
                  <button
                    onClick={() => onNavigateTab('verification')}
                    className="px-4 py-2 bg-[#005684] text-white rounded-xl text-xs font-bold"
                  >
                    Complete 2-Minute Verification
                  </button>
                </div>
              )}

              {/* STATE-10: Offline */}
              {activeStateDemo === 'STATE-10' && (
                <div className="w-full max-w-md p-3.5 rounded-2xl bg-[#001848] text-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[20px]">cloud_off</span>
                    <div>
                      <div className="font-bold">Offline Mode Active</div>
                      <div className="text-[10px] opacity-75">Displaying cached door code (*4821#)</div>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-bold hover:bg-white/30">
                    Retry Connection
                  </button>
                </div>
              )}

              {/* STATE-11: Pending Value */}
              {activeStateDemo === 'STATE-11' && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1626] border text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="opacity-70">Clinician License Number:</span>
                    <span className="font-mono font-bold">RN-284910-NC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Nursys Board Multi-State Status:</span>
                    <span className="italic text-gray-500 dark:text-gray-400">Pending review</span>
                  </div>
                </div>
              )}

              {/* Remaining patterns */}
              {!['STATE-01', 'STATE-02', 'STATE-03', 'STATE-04', 'STATE-06', 'STATE-09', 'STATE-10', 'STATE-11'].includes(activeStateDemo) && (
                <div className="text-center py-6 max-w-sm space-y-2">
                  <div className="text-xs font-mono font-bold text-[#005684]">{activeStateDemo}</div>
                  <div className="text-sm font-bold">State Treatment Live in System</div>
                  <p className="text-xs opacity-70">
                    This cross-cutting state pattern is globally applied across all Phase 1 views.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUMMARY & LIVE COUNTS */}
      {activeMainTab === 'summary' && (
        <div className="space-y-6">
          {/* Header reference card */}
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#005684]/10 text-[#005684] dark:text-[#93ccff]">
                INTERNAL BUILD REFERENCE • NOT CLIENT-FACING IN THIS FORM
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span> Live Computed Counts
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Nurses Pillow — Phase 1 Screen, Page &amp; Flow Inventory
            </h2>
            <p className="text-xs opacity-70 font-semibold mb-4">
              Prepared by Joe • Companion to the Design System • Signed $2,500 Scope (M1 + M2 + M3)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <div className="space-y-1">
                <strong className="text-[#005684] dark:text-[#93ccff]">Purpose:</strong>
                <p className="opacity-80 leading-relaxed">
                  Complete inventory of every screen, page, flow, and message template needed to deliver Phase 1 — the signed $2,500 scope (M1 + M2 + M3). Use it to plan design generation, sequence the build, and track progress.
                </p>
              </div>
              <div className="space-y-1">
                <strong className="text-rose-600 dark:text-rose-400">Scope Boundary:</strong>
                <p className="opacity-80 leading-relaxed">
                  Phase 1 only. Everything on the After-Scope Roadmap is listed on the 'Out of Scope' tab for reference and is <strong>NOT</strong> designed or built without being flagged, priced, and signed off in writing first.
                </p>
              </div>
            </div>
          </div>

          {/* Master 4 High-Level Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-5 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm">
              <span className="text-xs opacity-60 font-semibold block mb-1">Screens &amp; Pages</span>
              <div className="text-3xl font-extrabold text-[#005684] dark:text-[#93ccff]">
                {summaryStats.total}
              </div>
              <span className="text-[11px] opacity-70 mt-1 block">Master Master List</span>
            </div>

            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-5 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm">
              <span className="text-xs opacity-60 font-semibold block mb-1">End-to-End Flows</span>
              <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                19
              </div>
              <span className="text-[11px] opacity-70 mt-1 block">Sequenced User Journeys</span>
            </div>

            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-5 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm">
              <span className="text-xs opacity-60 font-semibold block mb-1">Notification Templates</span>
              <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                25
              </div>
              <span className="text-[11px] opacity-70 mt-1 block">Email, SMS, Push &amp; In-App</span>
            </div>

            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-5 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm">
              <span className="text-xs opacity-60 font-semibold block mb-1">Cross-Cutting States</span>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                11
              </div>
              <span className="text-[11px] opacity-70 mt-1 block">Global Component Patterns</span>
            </div>
          </div>

          {/* Breakdown Matrices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* By Milestone */}
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-5 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm space-y-3">
              <h3 className="text-sm font-bold flex items-center justify-between">
                <span>By Milestone</span>
                <span className="text-xs font-mono opacity-50">150 Screens</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-blue-900 dark:text-blue-100">Milestone 1 (M1)</div>
                    <div className="text-[11px] opacity-70">Foundation &amp; Core Marketplace</div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-base text-blue-700 dark:text-blue-300">{summaryStats.m1}</span>
                    <span className="text-[10px] block opacity-60">
                      {Math.round((summaryStats.m1 / summaryStats.total) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-purple-900 dark:text-purple-100">Milestone 2 (M2)</div>
                    <div className="text-[11px] opacity-70">Dashboards, Trust &amp; Communication</div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-base text-purple-700 dark:text-purple-300">{summaryStats.m2}</span>
                    <span className="text-[10px] block opacity-60">
                      {Math.round((summaryStats.m2 / summaryStats.total) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-teal-900 dark:text-teal-100">Milestone 3 (M3)</div>
                    <div className="text-[11px] opacity-70">Mobile Apps, Testing &amp; Launch</div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-base text-teal-700 dark:text-teal-300">{summaryStats.m3}</span>
                    <span className="text-[10px] block opacity-60">
                      {Math.round((summaryStats.m3 / summaryStats.total) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* By Priority */}
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-5 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm space-y-3">
              <h3 className="text-sm font-bold flex items-center justify-between">
                <span>By Priority</span>
                <span className="text-xs font-mono opacity-50">Impact Hierarchy</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-rose-900 dark:text-rose-100">Must</div>
                    <div className="text-[11px] opacity-70">Launch Blocker (Critical Path)</div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-base text-rose-700 dark:text-rose-300">{summaryStats.must}</span>
                    <span className="text-[10px] block opacity-60">
                      {Math.round((summaryStats.must / summaryStats.total) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-amber-900 dark:text-amber-100">Should</div>
                    <div className="text-[11px] opacity-70">Expected at launch but degradable</div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-base text-amber-700 dark:text-amber-300">{summaryStats.should}</span>
                    <span className="text-[10px] block opacity-60">
                      {Math.round((summaryStats.should / summaryStats.total) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-500/10 border border-gray-500/20 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">Could</div>
                    <div className="text-[11px] opacity-70">In scope, include if effort allows</div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-base text-gray-700 dark:text-gray-300">{summaryStats.could}</span>
                    <span className="text-[10px] block opacity-60">
                      {Math.round((summaryStats.could / summaryStats.total) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* By Platform */}
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-5 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm space-y-3">
              <h3 className="text-sm font-bold flex items-center justify-between">
                <span>By Platform</span>
                <span className="text-xs font-mono opacity-50">Viewport Targets</span>
              </h3>
              <div className="grid grid-cols-3 gap-2.5 text-xs text-center">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  <div className="text-lg font-bold text-[#005684] dark:text-[#93ccff]">{summaryStats.webOnly}</div>
                  <div className="font-bold mt-1">Web Only</div>
                  <div className="text-[10px] opacity-60 mt-0.5">Responsive Web</div>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  <div className="text-lg font-bold text-[#005684] dark:text-[#93ccff]">{summaryStats.bothPlatform}</div>
                  <div className="font-bold mt-1">Both</div>
                  <div className="text-[10px] opacity-60 mt-0.5">Design Each Width</div>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  <div className="text-lg font-bold text-[#005684] dark:text-[#93ccff]">{summaryStats.mobileOnly}</div>
                  <div className="font-bold mt-1">Mobile Only</div>
                  <div className="text-[10px] opacity-60 mt-0.5">Flutter iOS/Android</div>
                </div>
              </div>
            </div>

            {/* By Build Tier (Demo-first sequencing) */}
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-5 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm space-y-3">
              <h3 className="text-sm font-bold flex items-center justify-between">
                <span>By Build Tier (Demo-First Sequencing)</span>
                <span className="text-xs font-mono opacity-50">T1 → T4</span>
              </h3>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-800 dark:text-emerald-200">T1: Fast Visual Wins</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-300 text-sm">{summaryStats.t1}</span>
                  </div>
                  <span className="text-[10px] opacity-70 block mt-0.5">Marketing, Auth &amp; Views</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-800 dark:text-blue-200">T2: Payments &amp; Verify</span>
                    <span className="font-extrabold text-blue-700 dark:text-blue-300 text-sm">{summaryStats.t2}</span>
                  </div>
                  <span className="text-[10px] opacity-70 block mt-0.5">Stripe, Licenses, Payouts</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-800 dark:text-purple-200">T3: Dashboards &amp; Admin</span>
                    <span className="font-extrabold text-purple-700 dark:text-purple-300 text-sm">{summaryStats.t3}</span>
                  </div>
                  <span className="text-[10px] opacity-70 block mt-0.5">Nurse/Host hubs, Analytics</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-800 dark:text-amber-200">T4: Mobile &amp; Infra</span>
                    <span className="font-extrabold text-amber-700 dark:text-amber-300 text-sm">{summaryStats.t4}</span>
                  </div>
                  <span className="text-[10px] opacity-70 block mt-0.5">Flutter parity, Error pages</span>
                </div>
              </div>
            </div>
          </div>

          {/* How to use with Design System & Column Key */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* How to Use with the Design System */}
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-6 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#005684] dark:text-[#93ccff]">
                <span className="material-symbols-outlined text-[20px]">architecture</span>
                <h4>How to Use with the Design System</h4>
              </div>
              <ol className="text-xs space-y-3 opacity-90 leading-relaxed list-decimal list-inside">
                <li>
                  <strong>Pick a milestone's rows</strong> from the 'Screen Inventory' master table.
                </li>
                <li>
                  <strong>Fill the Appendix B prompt template</strong> in the design system doc using the Purpose, Key components, and States columns.
                </li>
                <li>
                  <strong>Generate in Google Stitch</strong>, export into one Figma file, and group Figma pages in the ID order used here.
                </li>
                <li>
                  <strong>Track design and build progress</strong> by adding custom status tracking columns to the sheet.
                </li>
              </ol>
            </div>

            {/* Column Key Reference */}
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-6 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm space-y-3 text-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-[#005684] dark:text-[#93ccff]">
                <span className="material-symbols-outlined text-[20px]">table_chart</span>
                <h4>Column Key Definitions</h4>
              </div>
              <div className="space-y-2 opacity-90 leading-relaxed">
                <div>
                  <strong>Milestone:</strong> M1 = Foundation &amp; Core Marketplace · M2 = Dashboards, Trust &amp; Communication · M3 = Mobile Apps, Testing &amp; Launch
                </div>
                <div>
                  <strong>Build tier:</strong> Demo-first sequencing. T1 = fast visual wins · T2 = payments &amp; verification · T3 = dashboards &amp; admin · T4 = mobile &amp; infrastructure
                </div>
                <div>
                  <strong>Platform:</strong> Web = responsive web app · Mobile = Flutter iOS/Android · Both = needs a design at each width
                </div>
                <div>
                  <strong>Priority:</strong> Must = launch blocker · Should = expected at launch but degradable · Could = in scope, include if effort allows
                </div>
                <div>
                  <strong>Flags:</strong> Rows marked PENDING depend on a client decision or the North Carolina attorney review and cannot be finalised until that lands.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DECISION-BLOCKED ITEMS (SECTION 5) */}
      {activeMainTab === 'blocked' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-700 dark:text-amber-300 text-[24px] shrink-0 mt-0.5">
              pending_actions
            </span>
            <div>
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">
                Phase 1 Inventory Section 5: Items Still Blocked on a Decision
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                These screens are fully designed and functional with the blocked region shown explicitly as pending review by Lawrence's North Carolina attorney. They cannot be finalized until legal approval lands.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DECISION_BLOCKED_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0B1626] rounded-2xl p-6 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-200">
                    {item.id}
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Awaiting Attorney Signoff
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold">{item.screen}</h4>
                  <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
                    Blocked on: {item.blockedOn}
                  </div>
                </div>

                <p className="text-xs opacity-80 leading-relaxed">
                  Status: {item.status}
                </p>

                <div className="pt-3 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex justify-between items-center">
                  <span className="text-[11px] opacity-60">{item.scopeNote}</span>
                  <button
                    onClick={() => onNavigateTab('legal-policies')}
                    className="px-3 py-1.5 rounded-lg bg-[#005684] text-white text-xs font-bold hover:bg-[#00476d]"
                  >
                    View Pending Legal Screen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: OUT OF SCOPE (PHASE 2 & AFTER-SCOPE) */}
      {activeMainTab === 'out-of-scope' && (
        <div className="space-y-6">
          {/* Pre-Approval Blocker & Confirmation Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[20px]">check_circle</span>
                <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-200">
                  Blocker 1 &amp; 2: Fully Resolved by Lawrence
                </h4>
              </div>
              <ul className="text-xs space-y-1.5 text-emerald-900/90 dark:text-emerald-100/90 leading-relaxed">
                <li>
                  <strong>Blocker 1 (Feature Definitions):</strong> Roommate Matching, Assignment Confirmed, Gap Filler, and Host Lead Profiles have been explicitly defined and confirmed as <em>strictly optional After-Scope Roadmap items</em> outside the $2,500 core build.
                </li>
                <li>
                  <strong>Blocker 2 (Refund Tiers):</strong> Confirmed exact day-thresholds: Flexible (100% 30+d, 50% 14–29d, 0% &lt;14d), Moderate (100% 60+d, 50% 30–59d, 0% &lt;30d), Strict (100% 90+d, 50% 60–89d, 0% &lt;60d). Cleaning fee 100% refunded if never checked in.
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px]">pause_circle</span>
                <h4 className="font-bold text-sm text-amber-800 dark:text-amber-200">
                  Milestone 1 Kickoff: Active Legal Review Hold
                </h4>
              </div>
              <p className="text-xs text-amber-900/90 dark:text-amber-100/90 leading-relaxed">
                Lawrence placed an explicit hold on opening Milestone 1 pending final legal clarification regarding NC real-estate licensing (NCREC) and occupancy tax rules: <em>"Please do not open Milestone 1 until I provide written authorization"</em>.
              </p>
              <div className="text-[11px] font-semibold bg-amber-500/20 px-2.5 py-1 rounded-lg text-amber-800 dark:text-amber-200">
                Stripe &amp; Twilio test/sandbox mode active: all QA runs safely with zero live money movement.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-[24px] shrink-0 mt-0.5">
              shield_with_heart
            </span>
            <div>
              <h3 className="text-sm font-bold text-rose-800 dark:text-rose-200">
                Phase 1 Inventory Section 7: Standing Rule on Out-of-Scope Items
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                <strong>Standing Rule:</strong> Anything from this table that the client asks for gets flagged, priced, and signed off in writing before a single screen is designed for it. These are deliberately excluded from Phase 1.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B1626] rounded-3xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/5 dark:bg-white/5 font-bold uppercase tracking-wider text-[10px] opacity-70 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
                  <tr>
                    <th className="p-4">Deferred Feature / Item</th>
                    <th className="p-4">Phase / Classification</th>
                    <th className="p-4">Scope Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(11,37,89,0.06)] dark:divide-[#233550]">
                  {OUT_OF_PHASE_1_ITEMS.map((item, idx) => (
                    <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-sm text-[#001848] dark:text-[#E6ECF7]">
                        {item.item}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.phase === 'Phase 2'
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
                        }`}>
                          {item.phase}
                        </span>
                      </td>
                      <td className="p-4 opacity-80 leading-relaxed">
                        {item.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal for detailed screen preview if requested */}
      {selectedScreenForDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs overflow-y-auto p-4 sm:p-6 flex justify-center items-start"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedScreenForDetail(null);
            }
          }}
        >
          <div
            className="bg-white dark:bg-[#0B1626] rounded-3xl max-w-lg w-full my-auto p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-[#005684]/15 text-[#005684] dark:text-[#93ccff]">
                SCREEN [{selectedScreenForDetail.id}]
              </span>
              <button
                onClick={() => setSelectedScreenForDetail(null)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-bold">{selectedScreenForDetail.name}</h3>
            <div className="text-xs opacity-70">
              Role: {selectedScreenForDetail.role} • Milestone: {selectedScreenForDetail.milestone} • Priority: {selectedScreenForDetail.priority}
            </div>

            <p className="text-sm opacity-90 leading-relaxed">
              {selectedScreenForDetail.description}
            </p>

            <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 text-xs space-y-1">
              <div className="font-bold">Technical Mapping:</div>
              <div>Platform: {selectedScreenForDetail.platform}</div>
              <div>Target Route / Tab: {selectedScreenForDetail.appTab || 'Direct Dynamic Component'}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedScreenForDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-black/10 dark:border-white/10"
              >
                Close
              </button>
              {selectedScreenForDetail.appTab && (
                <button
                  onClick={() => {
                    const tab = selectedScreenForDetail.appTab;
                    setSelectedScreenForDetail(null);
                    if (tab) onNavigateTab(tab as NavigationTab);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#005684] text-white text-xs font-bold"
                >
                  Navigate to View
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

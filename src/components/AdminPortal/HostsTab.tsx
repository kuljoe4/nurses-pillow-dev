import React from 'react';
import { HostFeeOverride } from '../../services/stripeConnect';

export interface HostsTabProps {
  setSelectedHostIds: (val: string[]) => void;
  hosts: HostFeeOverride[];
  platformFeePercent: number;
  showAddHostForm: boolean;
  setShowAddHostForm: (val: boolean) => void;
  newHostForm: any;
  setNewHostForm: (val: any) => void;
  handleAddNewHost: (e: React.FormEvent) => void;
  hostSearchQuery: string;
  setHostSearchQuery: (val: string) => void;
  hostFilter: 'all' | 'override' | 'global';
  setHostFilter: (val: any) => void;
  selectedHostIds: string[];
  handleApplyBatchOverride: (hasOverride: boolean, specificPercent?: number) => void;
  batchOverridePercent: string;
  setBatchOverridePercent: (val: string) => void;
  handleSelectAllFiltered: (filteredList: HostFeeOverride[]) => void;
  filteredHosts: HostFeeOverride[];
  handleToggleSelectHost: (hostId: string) => void;
  handleToggleHostFeeOverride: (hostId: string) => void;
  handleUpdateHostFeePercent: (hostId: string, val: number) => void;
  handleDeleteHost: (hostId: string, hostName: string) => void;
}

export const HostsTab: React.FC<HostsTabProps> = ({
  setSelectedHostIds,
  hosts,
  platformFeePercent,
  showAddHostForm,
  setShowAddHostForm,
  newHostForm,
  setNewHostForm,
  handleAddNewHost,
  hostSearchQuery,
  setHostSearchQuery,
  hostFilter,
  setHostFilter,
  selectedHostIds,
  handleApplyBatchOverride,
  batchOverridePercent,
  setBatchOverridePercent,
  handleSelectAllFiltered,
  filteredHosts,
  handleToggleSelectHost,
  handleToggleHostFeeOverride,
  handleUpdateHostFeePercent,
  handleDeleteHost,
}) => {
  return (
    <div
          role="tabpanel"
          id="admin-panel-hosts"
          aria-labelledby="admin-tab-hosts"
          className="space-y-6"
        >
          {/* Header & Quick Action */}
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-[#0B2559] dark:text-white">
                    Host Directory &amp; Take-Rate Overrides
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#195b4c]/30 dark:text-[#aff0db]">
                    Stripe Connect Active
                  </span>
                </div>
                <p className="text-xs text-gray-500 max-w-2xl">
                  Manage host accounts, configure custom platform take-rates (which bypass the global {platformFeePercent.toFixed(1)}% rate during checkout), and protect founder cohort guarantees.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddHostForm(!showAddHostForm)}
                  className="px-4 py-2 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0C7EBF] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showAddHostForm ? 'close' : 'person_add'}
                  </span>
                  <span>{showAddHostForm ? 'Close Form' : 'Register Host'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-[#EFF6FB] dark:bg-[#14233a] border border-[#0A6FA8]/15">
                <div className="text-[11px] font-medium text-gray-500">Total Managed Hosts</div>
                <div className="text-xl font-bold text-[#0B2559] dark:text-white tabular-nums mt-0.5">
                  {hosts.length}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Stripe Connected</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EFF6FB] dark:bg-[#14233a] border border-[#0A6FA8]/15">
                <div className="text-[11px] font-medium text-gray-500">Custom Fee Overrides</div>
                <div className="text-xl font-bold text-[#0A6FA8] dark:text-[#3E9AD1] tabular-nums mt-0.5">
                  {hosts.filter((h) => h.hasOverride).length}
                </div>
                <div className="text-[10px] text-[#0A6FA8] font-medium mt-0.5">Bypassing global rate</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EFF6FB] dark:bg-[#14233a] border border-[#0A6FA8]/15">
                <div className="text-[11px] font-medium text-gray-500">Founder Cohort (5%)</div>
                <div className="text-xl font-bold text-[#2F6E5E] dark:text-[#aff0db] tabular-nums mt-0.5">
                  {hosts.filter((h) => h.isGrandfathered).length}
                </div>
                <div className="text-[10px] text-[#2F6E5E] font-medium mt-0.5">Grandfathered for life</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EFF6FB] dark:bg-[#14233a] border border-[#0A6FA8]/15">
                <div className="text-[11px] font-medium text-gray-500">Global Baseline Rate</div>
                <div className="text-xl font-bold text-[#0B2559] dark:text-white tabular-nums mt-0.5">
                  {platformFeePercent.toFixed(1)}%
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Default take-rate</div>
              </div>
            </div>

            {/* Expandable Add Host Modal / Form */}
            {showAddHostForm && (
              <form
                onSubmit={handleAddNewHost}
                className="mb-6 p-5 rounded-2xl bg-[#EFF6FB] dark:bg-[#15233a] border border-[#0A6FA8]/25 space-y-4 animate-fade-in"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#0A6FA8]/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0A6FA8] text-[20px]">add_circle</span>
                    <h3 className="text-sm font-bold text-[#0B2559] dark:text-white">
                      Register Host &amp; Set Initial Fee Terms
                    </h3>
                  </div>
                  <span className="text-[11px] text-gray-500">Creates Stripe Connect profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      Host Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rachel Adams"
                      value={newHostForm.hostName}
                      onChange={(e) => setNewHostForm({ ...newHostForm, hostName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1626] text-[#0B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A6FA8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      Property Sanctuary Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Duke Medical Garden Suite"
                      value={newHostForm.propertyTitle}
                      onChange={(e) => setNewHostForm({ ...newHostForm, propertyTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1626] text-[#0B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A6FA8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      Direct Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="rachel@durhamstays.com"
                      value={newHostForm.email}
                      onChange={(e) => setNewHostForm({ ...newHostForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1626] text-[#0B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A6FA8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+1 (919) 555-0199"
                      value={newHostForm.phone}
                      onChange={(e) => setNewHostForm({ ...newHostForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1626] text-[#0B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A6FA8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      Platform Take-Rate (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="15"
                        step="0.5"
                        value={newHostForm.overridePercent}
                        onChange={(e) =>
                          setNewHostForm({
                            ...newHostForm,
                            overridePercent: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24 px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1626] text-[#0B2559] dark:text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0A6FA8]"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newHostForm.hasOverride}
                          onChange={(e) =>
                            setNewHostForm({ ...newHostForm, hasOverride: e.target.checked })
                          }
                          className="rounded text-[#0A6FA8] focus:ring-[#0A6FA8]"
                        />
                        <span>Enable as Override</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      Agreement Reason / Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Founder Host Cohort"
                      value={newHostForm.reason}
                      onChange={(e) => setNewHostForm({ ...newHostForm, reason: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B1626] text-[#0B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A6FA8]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddHostForm(false)}
                    className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0C7EBF] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Save Host &amp; Issue Account
                  </button>
                </div>
              </form>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search hosts, listings, emails, or Stripe IDs..."
                  value={hostSearchQuery}
                  onChange={(e) => setHostSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0B1626] text-[#0B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A6FA8]"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setHostFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    hostFilter === 'all'
                      ? 'bg-[#0B2559] text-white dark:bg-[#3E9AD1] dark:text-[#0B1626]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-200 dark:bg-[#182840] dark:text-gray-300'
                  }`}
                >
                  All ({hosts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHostFilter('override')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    hostFilter === 'override'
                      ? 'bg-[#0A6FA8] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-200 dark:bg-[#182840] dark:text-gray-300'
                  }`}
                >
                  Override Active ({hosts.filter((h) => h.hasOverride).length})
                </button>
                <button
                  type="button"
                  onClick={() => setHostFilter('global')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    hostFilter === 'global'
                      ? 'bg-[#0B2559] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-200 dark:bg-[#182840] dark:text-gray-300'
                  }`}
                >
                  Global Rate ({hosts.filter((h) => !h.hasOverride).length})
                </button>
              </div>
            </div>

            {/* Batch Action Bar */}
            {selectedHostIds.length > 0 && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#0B2559] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0A6FA8] text-white flex items-center justify-center text-xs font-bold tabular-nums">
                    {selectedHostIds.length}
                  </span>
                  <span className="text-xs font-medium">
                    {selectedHostIds.length} host{selectedHostIds.length > 1 ? 's' : ''} selected for batch updates
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-xl">
                    <span className="text-[11px] text-gray-300">Set %:</span>
                    {['3.0', '5.0', '7.0'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBatchOverridePercent(preset)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold tabular-nums transition-colors ${
                          batchOverridePercent === preset
                            ? 'bg-[#0A6FA8] text-white'
                            : 'bg-white/10 hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/20 text-gray-200'
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                    <input
                      type="number"
                      min="0"
                      max="15"
                      step="0.5"
                      value={batchOverridePercent}
                      onChange={(e) => setBatchOverridePercent(e.target.value)}
                      className="w-14 px-1.5 py-0.5 text-[11px] rounded bg-white text-[#0B2559] font-bold tabular-nums text-center"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyBatchOverride(true)}
                    className="px-3 py-1.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0C7EBF] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply Override
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyBatchOverride(false)}
                    className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/25 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Revert to Global
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedHostIds([])}
                    className="text-gray-300 hover:text-white focus-visible:text-white text-xs underline p-1 cursor-pointer"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}

            {/* Hosts Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
              <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                <thead className="bg-[#EFF6FB] dark:bg-[#14233a] text-[#0B2559] dark:text-[#E6ECF7] font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        aria-label="Select all hosts in current view"
                        checked={
                          filteredHosts.length > 0 &&
                          selectedHostIds.length === filteredHosts.length
                        }
                        onChange={() => handleSelectAllFiltered(filteredHosts)}
                        className="rounded text-[#0A6FA8] focus:ring-[#0A6FA8] cursor-pointer"
                      />
                    </th>
                    <th className="p-3">Host &amp; Sanctuary</th>
                    <th className="p-3">Cohort Status</th>
                    <th className="p-3 text-center">Fee Override</th>
                    <th className="p-3">Effective Take-Rate</th>
                    <th className="p-3">Monthly Split ($2,000)</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#0B1626]">
                  {filteredHosts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No hosts found matching your search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredHosts.map((host) => {
                      const isSelected = selectedHostIds.includes(host.hostId);
                      const effectiveRate = host.hasOverride ? host.overridePercent : platformFeePercent;
                      const hostNetPayout = 2000 * (1 - effectiveRate / 100);
                      const platformFee = 2000 * (effectiveRate / 100);

                      return (
                        <tr
                          key={host.hostId}
                          className={`hover:bg-[#EFF6FB] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#EFF6FB]/40 dark:hover:bg-[#14233a] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#14233a]/40 transition-colors ${
                            isSelected ? 'bg-[#EFF6FB]/70 dark:bg-[#182840]' : ''
                          }`}
                        >
                          {/* Selection Checkbox */}
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              aria-label={`Select host ${host.hostName}`}
                              checked={isSelected}
                              onChange={() => handleToggleSelectHost(host.hostId)}
                              className="rounded text-[#0A6FA8] focus:ring-[#0A6FA8] cursor-pointer"
                            />
                          </td>

                          {/* Host & Property Info */}
                          <td className="p-3">
                            <div className="font-bold text-[#0B2559] dark:text-white text-sm">
                              {host.hostName}
                            </div>
                            <div className="text-gray-500 text-xs font-medium mt-0.5">
                              {host.propertyTitle}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                              <span>{host.email}</span>
                              <span>•</span>
                              <span className="font-mono">{host.connectedAccountId}</span>
                            </div>
                          </td>

                          {/* Cohort Status */}
                          <td className="p-3">
                            {host.isGrandfathered ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#195b4c]/30 dark:text-[#aff0db] text-[11px] font-bold">
                                <span className="material-symbols-outlined text-[12px]">lock</span>
                                Founder 5% For Life
                              </span>
                            ) : host.hasOverride ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EFF6FB] text-[#0A6FA8] dark:bg-[#182840] dark:text-[#3E9AD1] text-[11px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0A6FA8]" />
                                Custom Partner Rate
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-[11px] font-medium">
                                Standard Global
                              </span>
                            )}
                            {host.reason && (
                              <div className="text-[10px] text-gray-400 mt-1 truncate max-w-xs" title={host.reason}>
                                {host.reason}
                              </div>
                            )}
                          </td>

                          {/* Override Toggle Switch */}
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={host.hasOverride}
                              onClick={() => handleToggleHostFeeOverride(host.hostId)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0A6FA8] ${
                                host.hasOverride ? 'bg-[#0A6FA8]' : 'bg-gray-300 dark:bg-gray-700'
                              }`}
                            >
                              <span className="sr-only">Toggle fee override for {host.hostName}</span>
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  host.hasOverride ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <div className="text-[10px] font-medium mt-1">
                              {host.hasOverride ? (
                                <span className="text-[#0A6FA8] dark:text-[#3E9AD1] font-bold">Active Override</span>
                              ) : (
                                <span className="text-gray-400">Global Rate</span>
                              )}
                            </div>
                          </td>

                          {/* Effective Take-Rate Controls */}
                          <td className="p-3">
                            {host.hasOverride ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateHostFeePercent(host.hostId, host.overridePercent - 0.5)}
                                  className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-200 text-[#0B2559] dark:text-white font-bold flex items-center justify-center cursor-pointer transition-colors"
                                  title="Decrease rate by 0.5%"
                                >
                                  -
                                </button>
                                <span className="font-mono font-bold text-sm text-[#0A6FA8] dark:text-[#3E9AD1] tabular-nums min-w-14 text-center">
                                  {host.overridePercent.toFixed(1)}%
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateHostFeePercent(host.hostId, host.overridePercent + 0.5)}
                                  className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-200 text-[#0B2559] dark:text-white font-bold flex items-center justify-center cursor-pointer transition-colors"
                                  title="Increase rate by 0.5%"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <div className="text-gray-400 font-mono text-xs tabular-nums">
                                {platformFeePercent.toFixed(1)}% <span className="text-[10px] text-gray-400">(global)</span>
                              </div>
                            )}
                          </td>

                          {/* Live Checkout Math Simulation */}
                          <td className="p-3">
                            <div className="space-y-0.5 text-[11px] tabular-nums">
                              <div className="flex justify-between gap-2">
                                <span className="text-gray-500">Host Net:</span>
                                <span className="font-bold text-[#2F6E5E] dark:text-[#aff0db]">
                                  ${hostNetPayout.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span className="text-gray-500">Platform ({effectiveRate.toFixed(1)}%):</span>
                                <span className="font-bold text-[#0A6FA8] dark:text-[#3E9AD1]">
                                  ${platformFee.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteHost(host.hostId, host.hostName)}
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-red-50 dark:hover:bg-red-950 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-red-950/30 transition-colors cursor-pointer"
                              title={`Remove ${host.hostName}`}
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
  );
};

import React from 'react';

export interface FeesTabProps {
  platformFeePercent: number;
  handlePlatformFeeSliderChange: (newVal: number) => void;
  hostPayoutSample: number;
  platformRevenueSample: number;
  feeNoticeSent: boolean;
  setFeeNoticeSent: (val: boolean) => void;
  founderCohort: any[];
  showAddFounderForm: boolean;
  setShowAddFounderForm: (val: boolean) => void;
  newHostName: string;
  setNewHostName: (val: string) => void;
  newHostProperty: string;
  setNewHostProperty: (val: string) => void;
  setFounderCohort: (val: any[]) => void;
}

export const FeesTab: React.FC<FeesTabProps> = ({
  platformFeePercent,
  handlePlatformFeeSliderChange,
  hostPayoutSample,
  platformRevenueSample,
  feeNoticeSent,
  setFeeNoticeSent,
  founderCohort,
  showAddFounderForm,
  setShowAddFounderForm,
  newHostName,
  setNewHostName,
  newHostProperty,
  setNewHostProperty,
  setFounderCohort
}) => {
  return (
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
                onChange={(e) => handlePlatformFeeSliderChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#001848]"
              />
            </div>

            {/* Monthly Payout Breakdown Card */}
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-[#14233a] border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-4">
                Monthly Reservation Payout Breakdown ($2,000 / Month)
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
                  onClick={() => { setFeeNoticeSent(true); setTimeout(() => setFeeNoticeSent(false), 3000); }}
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
                    className="px-3 py-1.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0C7EBF] text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
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
                      className="px-4 py-1.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0C7EBF] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
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
                      <tr key={host.id} className="hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-50/50 dark:hover:bg-[#111e33] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#111e33]">
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
                            className="text-gray-400 hover:text-red-500 focus-visible:text-red-500 transition-colors p-1"
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
  );
};

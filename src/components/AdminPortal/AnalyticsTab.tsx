import React from 'react';
import { MarketDemandReport, PromoCode } from '../../types';
import { AdminSheetsPreset } from '../GoogleSheetsSyncModal';

export interface AnalyticsTabProps {
  demandReports: MarketDemandReport[];
  newPromoCode: string;
  setNewPromoCode: (val: string) => void;
  newPromoDiscount: number;
  setNewPromoDiscount: (val: number) => void;
  handleAddPromo: (e: React.FormEvent) => void;
  promoCodes: PromoCode[];
  onOpenGoogleSheets?: (preset?: AdminSheetsPreset) => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  demandReports,
  newPromoCode,
  setNewPromoCode,
  newPromoDiscount,
  setNewPromoDiscount,
  handleAddPromo,
  promoCodes,
  onOpenGoogleSheets
}) => {
  return (
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
  );
};

import React from 'react';
import { MarketDemandReport, AdminLicenseReview, BookingRequest, HousingListing } from '../../types';
import { AdminSheetsPreset } from '../GoogleSheetsSyncModal';

export interface SheetsTabProps {
  onOpenGoogleSheets?: (preset?: AdminSheetsPreset) => void;
  demandReports: MarketDemandReport[];
  reviews: AdminLicenseReview[];
  bookingRequests: BookingRequest[];
  listings: HousingListing[];
}

export const SheetsTab: React.FC<SheetsTabProps> = ({
  onOpenGoogleSheets,
  demandReports,
  reviews,
  bookingRequests,
  listings
}) => {
  return (
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
  );
};

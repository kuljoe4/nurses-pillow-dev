import React from 'react';
import { AdminLicenseReview } from '../../types';
import { AdminSheetsPreset } from '../GoogleSheetsSyncModal';

export interface QueueTabProps {
  reviews: AdminLicenseReview[];
  onOpenGoogleSheets?: (preset?: AdminSheetsPreset) => void;
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
}

export const QueueTab: React.FC<QueueTabProps> = ({
  reviews,
  onOpenGoogleSheets,
  handleApprove,
  handleReject
}) => {
  return (
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
  );
};

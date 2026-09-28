import React, { useState, useRef } from 'react';
import { VerificationFormData, VerificationStepId } from '../types';
import { PROFESSION_OPTIONS, STATE_BOARDS } from '../data/mockData';

interface ClinicalLicenseStepProps {
  data: VerificationFormData;
  onChange: (updates: Partial<VerificationFormData>) => void;
  onNextStep: () => void;
  onSelectStep: (step: VerificationStepId) => void;
  isNightShiftMode: boolean;
  onOpenSuccessModal: () => void;
}

export const ClinicalLicenseStep: React.FC<ClinicalLicenseStepProps> = ({
  data,
  onChange,
  onNextStep,
  onSelectStep,
  isNightShiftMode,
  onOpenSuccessModal,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      onChange({
        uploadedDocument: {
          name: file.name,
          size: `${sizeMb} MB`,
          uploadedAt: 'Uploaded just now',
          fileType: file.type || 'application/pdf',
        },
      });
      showTemporaryNotice(`Attached"${file.name}"`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      onChange({
        uploadedDocument: {
          name: file.name,
          size: `${sizeMb} MB`,
          uploadedAt: 'Uploaded just now',
          fileType: file.type || 'application/pdf',
        },
      });
      showTemporaryNotice(`Attached"${file.name}"`);
    }
  };

  const handleRemoveFile = () => {
    onChange({ uploadedDocument: null });
    showTemporaryNotice('License document removed');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const showTemporaryNotice = (msg: string) => {
    setSavedNotification(msg);
    setTimeout(() => {
      setSavedNotification(null);
    }, 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check if demo account
    const isDemo = data.legalFirstName === 'Sarah' && data.legalLastName === 'Jenkins';

    if (isDemo) {
        setTimeout(() => {
          setIsSubmitting(false);
          onChange({ licenseStatus: 'verified' });
          onOpenSuccessModal();
        }, 900);
        return;
    }

    try {
        const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
        const res = await fetch('/api/verify/license', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                licenseNumber: data.licenseNumber,
                stateBoard: data.issuingStateBoard,
                specialty: data.professionSpecialty,
                documentName: data.uploadedDocument?.name || 'document.pdf'
            })
        });

        if (!res.ok) {
            throw new Error('Failed to submit credentials');
        }

        onChange({ licenseStatus: 'pending_review' }); // Changed to pending for admin review
        onOpenSuccessModal();
    } catch (error) {
        console.error(error);
        alert('Failed to submit credentials');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSaveLater = () => {
    showTemporaryNotice('Progress saved! You can resume credentialing anytime.');
  };

  return (
    <div
      className={`w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors ${
        isNightShiftMode ? 'bg-[#08101C]' : 'bg-[#f2f3ff]'
      }`}
    >
      {/* Stepper Navigation Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div
          className={`rounded-full p-2 sm:p-3 shadow-md transition-colors ${
            isNightShiftMode ? 'bg-[#0E1A2E] border border-[#233550]' : 'bg-white'
          }`}
        >
          <div className="grid grid-cols-4 items-center gap-2">
            {/* Step 1: Identity Verified */}
            <button
              onClick={() => onSelectStep(1)}
              type="button"
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full bg-[#aff0db]/30 text-[#195b4c] text-left hover:bg-[#aff0db] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#aff0db]/50 transition-all duration-200 ease-in-out cursor-pointer"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#195b4c] text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-base font-bold">check</span>
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-bold truncate leading-tight">Step 1</p>
                <p className="text-[11px] truncate opacity-85">Identity Verified</p>
              </div>
            </button>

            {/* Step 2: Email & Phone */}
            <button
              onClick={() => onSelectStep(2)}
              type="button"
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full bg-[#aff0db]/30 text-[#195b4c] text-left hover:bg-[#aff0db] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#aff0db]/50 transition-all duration-200 ease-in-out cursor-pointer"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#195b4c] text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-base font-bold">check</span>
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-bold truncate leading-tight">Step 2</p>
                <p className="text-[11px] truncate opacity-85">Email &amp; Phone</p>
              </div>
            </button>

            {/* Step 3: Clinical License (Active) */}
            <button
              onClick={() => onSelectStep(3)}
              type="button"
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full bg-[#0a6fa8] text-white shadow-sm text-left cursor-default"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#005684] font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                3
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-bold truncate leading-tight">Step 3</p>
                <p className="text-[11px] text-[#dcecff] truncate">Clinical License</p>
              </div>
            </button>

            {/* Step 4: Work Contract */}
            <button
              onClick={() => onSelectStep(4)}
              type="button"
              className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full text-left transition-all duration-200 ease-in-out cursor-pointer ${
                isNightShiftMode
                  ? 'bg-[#15233a] text-[#8ea5c8] hover:bg-[#1a2d4b] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#1a2d4b]'
                  : 'bg-[#eaedff] text-[#707881] hover:bg-[#dfe4fc] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#dfe4fc]'
              }`}
            >
              <span
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-medium text-sm flex items-center justify-center shrink-0 ${
                  isNightShiftMode ? 'bg-[#233550] text-[#8ea5c8]' : 'bg-[#707881]/20 text-[#404850]'
                }`}
              >
                4
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-medium truncate leading-tight">Step 4</p>
                <p className="text-[11px] truncate opacity-85">Work Contract</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {savedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#001848] text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 border border-white/20 animate-fade-in">
          <span className="material-symbols-outlined text-[#aff0db] text-xl">info</span>
          <span className="text-sm font-medium">{savedNotification}</span>
        </div>
      )}

      {/* Main Form Card */}
      <div
        className={`max-w-2xl mx-auto rounded-3xl p-6 sm:p-10 shadow-md transition-all duration-200 ease-in-out ${
          isNightShiftMode
            ? 'bg-[#0E1A2E] border border-[#233550] text-[#E6ECF7]'
            : 'bg-white text-[#001848]'
        }`}
      >
        {/* Header section */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isNightShiftMode
                  ? 'bg-[#3E9AD1]/20 text-[#93ccff]'
                  : 'bg-[#cde5ff] text-[#005684]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">verified_user</span>
              Clinical Credentialing Portal
            </span>
            <span
              className={`text-xs font-medium ${
                isNightShiftMode ? 'text-[#8ea5c8]' : 'text-[#404850]'
              }`}
            >
              Estimated: 2 mins
            </span>
          </div>

          <h1
            className={`text-2xl sm:text-[32px] font-bold tracking-tight mb-2 leading-tight ${
              isNightShiftMode ? 'text-white' : 'text-[#001848]'
            }`}
          >
            Verify your nursing credentials
          </h1>
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isNightShiftMode ? 'text-[#9CB3D3]' : 'text-[#404850]'
            }`}
          >
            To unlock nurse-only housing rates and connect with vetted hosts who respect 12–hour shifts, verify your active healthcare license.
          </p>
        </div>

        {/* Status Callout Banner */}
        <div
          className={`mb-6 rounded-2xl p-4 transition-colors ${
            isNightShiftMode
              ? 'bg-[#745b0d]/25 border border-[#745b0d]/40'
              : 'bg-[#ffdc84]/40 border border-[#ffdc84]/60'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="relative flex h-2.5 w-2.5 mt-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#745b0d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#745b0d]"></span>
            </span>
            <div>
              <p className="text-sm font-semibold text-[#795f12] dark:text-[#ffdf91]">
                {data.licenseStatus === 'verified'
                  ? 'Status: Verified by Clinical Nurse Team'
                  : 'Preview: Pending Review'}
              </p>
              <p
                className={`text-xs leading-snug mt-0.5 ${
                  isNightShiftMode ? 'text-[#e4c36d]' : 'text-[#745b0d]'
                }`}
              >
                {data.licenseStatus === 'verified'
                  ? 'Your active license standing is confirmed with the California BRN. Nurse-only rates unlocked!'
                  : 'Verifications are reviewed within 2 hours by our licensed nurse support team prior to assignment matching.'}
              </p>
            </div>
          </div>
        </div>

        {/* The Credentialing Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profession / Specialty */}
          <div>
            <label
              className={`block text-sm font-semibold mb-1.5 ${
                isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#001848]'
              }`}
            >
              Profession / Specialty
            </label>
            <div className="relative">
              <select
                value={data.professionSpecialty}
                onChange={(e) => onChange({ professionSpecialty: e.target.value })}
                className={`w-full appearance-none rounded-xl px-4 py-3.5 pr-10 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none shadow-xs cursor-pointer ${
                  isNightShiftMode
                    ? 'bg-[#15233a] text-white border border-[#233550] focus:border-[#3E9AD1]'
                    : 'bg-[#f2f3ff] text-[#001848] border border-transparent focus:border-[#0a6fa8] focus:bg-white'
                }`}
              >
                {PROFESSION_OPTIONS.map((prof) => (
                  <option key={prof} value={prof} className={isNightShiftMode ? 'bg-[#0E1A2E]' : 'bg-white'}>
                    {prof}
                  </option>
                ))}
              </select>
              <div
                className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 ${
                  isNightShiftMode ? 'text-[#8ea5c8]' : 'text-[#404850]'
                }`}
              >
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          {/* License Number & State Board Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-semibold mb-1.5 ${
                  isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#001848]'
                }`}
              >
                License Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.licenseNumber}
                  onChange={(e) => onChange({ licenseNumber: e.target.value })}
                  placeholder="e.g. RN-9482015-CA"
                  className={`w-full rounded-xl px-4 py-3.5 pr-10 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none shadow-xs ${
                    isNightShiftMode
                      ? 'bg-[#15233a] text-white border border-[#233550] focus:border-[#3E9AD1]'
                      : 'bg-[#f2f3ff] text-[#001848] border border-transparent focus:border-[#0a6fa8] focus:bg-white'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#195b4c] dark:text-[#aff0db]">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                </div>
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-semibold mb-1.5 ${
                  isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#001848]'
                }`}
              >
                Issuing State / Board
              </label>
              <div className="relative">
                <select
                  value={data.issuingStateBoard}
                  onChange={(e) => onChange({ issuingStateBoard: e.target.value })}
                  className={`w-full appearance-none rounded-xl px-4 py-3.5 pr-10 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none shadow-xs cursor-pointer ${
                    isNightShiftMode
                      ? 'bg-[#15233a] text-white border border-[#233550] focus:border-[#3E9AD1]'
                      : 'bg-[#f2f3ff] text-[#001848] border border-transparent focus:border-[#0a6fa8] focus:bg-white'
                  }`}
                >
                  {STATE_BOARDS.map((board) => (
                    <option key={board} value={board} className={isNightShiftMode ? 'bg-[#0E1A2E]' : 'bg-white'}>
                      {board}
                    </option>
                  ))}
                </select>
                <div
                  className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 ${
                    isNightShiftMode ? 'text-[#8ea5c8]' : 'text-[#404850]'
                  }`}
                >
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          {/* License Expiration Date */}
          <div>
            <label
              className={`block text-sm font-semibold mb-1.5 ${
                isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#001848]'
              }`}
            >
              License Expiration Date
            </label>
            <div className="relative max-w-xs">
              <input
                type="text"
                value={data.licenseExpirationDate}
                onChange={(e) => onChange({ licenseExpirationDate: e.target.value })}
                placeholder="MM/YYYY"
                className={`w-full rounded-xl px-4 py-3.5 pr-10 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none shadow-xs ${
                  isNightShiftMode
                    ? 'bg-[#15233a] text-white border border-[#233550] focus:border-[#3E9AD1]'
                    : 'bg-[#f2f3ff] text-[#001848] border border-transparent focus:border-[#0a6fa8] focus:bg-white'
                }`}
              />
              <div
                className={`absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none ${
                  isNightShiftMode ? 'text-[#8ea5c8]' : 'text-[#404850]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">calendar_today</span>
              </div>
            </div>
          </div>

          {/* Document Upload Area */}
          <div>
            <label
              className={`block text-sm font-semibold mb-1.5 ${
                isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#001848]'
              }`}
            >
              Primary License or Nursys e-Notify Document
            </label>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative rounded-2xl p-7 text-center transition-all duration-200 ease-in-out cursor-pointer shadow-xs border border-dashed ${
                isDragging
                  ? 'border-[#0a6fa8] bg-[#0a6fa8]/10'
                  : isNightShiftMode
                  ? 'bg-[#15233a] border-[#233550] hover:bg-[#192a47] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#192a47] hover:border-[#3E9AD1]'
                  : 'bg-[#f2f3ff] border-transparent hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff] hover:border-[#0a6fa8]/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload document"
              />

              <div className="flex flex-col items-center justify-center">
                <div className="relative mb-3">
                  <div className="w-14 h-14 rounded-full bg-[#cde5ff] flex items-center justify-center text-[#005684] shadow-xs group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#195b4c] text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-sm">medical_services</span>
                  </div>
                </div>

                <p
                  className={`text-base font-semibold mb-1 ${
                    isNightShiftMode ? 'text-white' : 'text-[#001848]'
                  }`}
                >
                  Drag and drop your State Nursing License or Nursys e-Notify certificate
                </p>
                <p
                  className={`text-xs max-w-md mx-auto leading-relaxed ${
                    isNightShiftMode ? 'text-[#8ea5c8]' : 'text-[#404850]'
                  }`}
                >
                  PDF, JPG, or PNG up to 15MB. Your sensitive data is encrypted with HIPAA-compliant standards.
                </p>
                <p className="text-[11px] text-[#195b4c] dark:text-[#aff0db] font-semibold mt-2">
                  🔒 Uploaded license documents and IDs are permanently purged post-approval. Raw license numbers remain private and hidden from hosts.
                </p>
              </div>
            </div>

            {/* Uploaded Document Row */}
            {data.uploadedDocument && (
              <div
                className={`mt-3 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs border transition-all duration-200 ease-in-out ${
                  isNightShiftMode
                    ? 'bg-[#15233a] border-[#233550]'
                    : 'bg-[#eaedff] border-[#dae2ff]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#aff0db] flex items-center justify-center text-[#195b4c] shrink-0 font-bold">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isNightShiftMode ? 'text-white' : 'text-[#001848]'
                        }`}
                      >
                        {data.uploadedDocument.name}
                      </span>
                      <span className="material-symbols-outlined text-[#195b4c] dark:text-[#aff0db] text-base shrink-0">
                        check_circle
                      </span>
                    </div>
                    <span
                      className={`text-xs block ${
                        isNightShiftMode ? 'text-[#8ea5c8]' : 'text-[#404850]'
                      }`}
                    >
                      {data.uploadedDocument.size} • {data.uploadedDocument.uploadedAt}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="shrink-0 text-xs font-semibold text-[#ba1a1a] hover:underline px-2.5 py-1.5 rounded-lg hover:bg-[#ba1a1a] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#ba1a1a]/10 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Privacy / Verification Guarantee Note */}
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 transition-colors ${
              isNightShiftMode
                ? 'bg-[#15233a]/60 border border-[#233550]'
                : 'bg-[#f2f3ff]'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#367464]/20 text-[#195b4c] dark:text-[#aff0db] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">shield</span>
            </div>
            <p
              className={`text-xs leading-relaxed ${
                isNightShiftMode ? 'text-[#8ea5c8]' : 'text-[#404850]'
              }`}
            >
              <strong>Clinician Privacy Guarantee:</strong> Uploaded license documents and IDs are permanently purged post-approval. Raw license numbers remain private and hidden from hosts.
            </p>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0a6fa8] hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] active:bg-[#085885] text-white text-base font-semibold transition-all duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75"
            >
              <span>{isSubmitting ? 'Verifying with BRN...' : 'Submit for review'}</span>
              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>

            <button
              type="button"
              onClick={handleSaveLater}
              className={`w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold transition-colors text-center cursor-pointer ${
                isNightShiftMode
                  ? 'text-[#E6ECF7] hover:bg-[#15233a] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#15233a]'
                  : 'text-[#001848] hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff]'
              }`}
            >
              Save and continue later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

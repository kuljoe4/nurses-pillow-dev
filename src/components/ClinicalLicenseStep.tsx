import React, {  useState, useRef , useEffect } from 'react';
import { VerificationFormData, VerificationStepId } from '../types';
import { PROFESSION_OPTIONS, STATE_BOARDS } from '../data/mockData';
import { VerificationStepperNav } from './VerificationStepperNav';

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [submitError]);
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
      showTemporaryNotice(`Attached "${file.name}"`);
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
      showTemporaryNotice(`Attached "${file.name}"`);
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
    setSubmitError(null);

    // Check if demo account
    const isDemo = data.legalFirstName === 'Sarah' && data.legalLastName === 'Jenkins';

    if (isDemo) {
      setTimeout(() => {
        setIsSubmitting(false);
        onChange({ licenseStatus: 'verified' });
        onOpenSuccessModal();
      }, 500);
      return;
    }

    try {
      const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
      const res = await fetch('/api/verify/license', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseNumber: data.licenseNumber,
          stateBoard: data.issuingStateBoard,
          specialty: data.professionSpecialty,
          documentName: data.uploadedDocument?.name || 'document.pdf',
        }),
      });

      if (!res.ok) {
        throw new Error('Verification service temporarily unavailable.');
      }

      onChange({ licenseStatus: 'pending_review' });
      onOpenSuccessModal();
    } catch (error: any) {
      setSubmitError(error.message || 'Verification could not be processed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveLater = () => {
    showTemporaryNotice('Progress saved.');
  };

  return (
    <div
      className={`w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors ${
        isNightShiftMode ? 'bg-[#08101C]' : 'bg-[#EFF6FB]'
      }`}
    >
      {/* Stepper Navigation Bar */}
      <VerificationStepperNav
        currentStep={3}
        data={data}
        onSelectStep={onSelectStep}
        isNightShiftMode={isNightShiftMode}
      />

      {/* Floating Notification Toast */}
      {savedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B2559] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 border border-white/20 text-xs font-medium">
          <span className="material-symbols-outlined text-[#aff0db] text-[18px]">check_circle</span>
          <span>{savedNotification}</span>
        </div>
      )}

      {/* Main Form Card */}
      <div
        className={`max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 shadow-sm transition-all ${
          isNightShiftMode
            ? 'bg-[#0B1626] border border-[#233550] text-[#E6ECF7]'
            : 'bg-white border border-[rgba(11,37,89,0.06)] text-[#0B2559]'
        }`}
      >
        {/* Header section */}
        <div className="mb-5">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FB] dark:bg-[#15233a] text-[#0A6FA8] dark:text-[#3E9AD1]">
              <span className="material-symbols-outlined text-[15px]">verified_user</span>
              Step 3 of 4 • Clinical License
            </span>
            <span className="text-xs font-medium text-gray-500">
              ~2 min
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-[#0B2559] dark:text-white">
            Verify nursing credentials
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Confirms active healthcare standing to unlock clinician rates and priority host booking.
          </p>
        </div>

        {submitError && (
          <div ref={errorRef} className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
            {submitError}
          </div>
        )}

        {/* Status Callout Banner */}
        <div
          className={`mb-5 rounded-2xl p-3.5 transition-colors ${
            data.licenseStatus === 'verified'
              ? 'bg-[#E1EFE9] dark:bg-[#142823] text-[#2F6E5E] dark:text-[#aff0db]'
              : 'bg-[#FBF0D6] dark:bg-[#2e2311] text-[#795f12] dark:text-[#ffdf91]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
              {data.licenseStatus === 'verified' ? 'check_circle' : 'hourglass_top'}
            </span>
            <div>
              <p className="text-xs font-bold">
                {data.licenseStatus === 'verified'
                  ? 'Status: Verified with State Board'
                  : 'Status: Awaiting Verification Review'}
              </p>
              <p className="text-[11px] leading-snug mt-0.5 opacity-90">
                {data.licenseStatus === 'verified'
                  ? 'Active license verified. Clinician discounts and instant booking enabled.'
                  : 'State board verifications are verified against primary source registries.'}
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
                {data.professionSpecialty?.includes('CNA')
                  ? 'Nurse Aide Registry / Certification Number'
                  : 'License Number'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.licenseNumber}
                  onChange={(e) => onChange({ licenseNumber: e.target.value })}
                  placeholder={
                    data.professionSpecialty?.includes('CNA')
                      ? 'e.g. NA-109482-NC or Registry ID'
                      : 'e.g. RN-9482015-NC'
                  }
                  className={`w-full rounded-xl px-4 py-3.5 pr-10 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none shadow-xs ${
                    isNightShiftMode
                      ? 'bg-[#15233a] text-white border border-[#233550] focus:border-[#3E9AD1]'
                      : 'bg-[#f2f3ff] text-[#001848] border border-transparent focus:border-[#0a6fa8] focus:bg-white'
                  }`}
                />
                {data.licenseStatus === 'verified' && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#195b4c] dark:text-[#aff0db]">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                  </div>
                )}
              </div>
              {data.professionSpecialty?.includes('CNA') && (
                <p className="text-[11px] text-[#0A6FA8] dark:text-[#3E9AD1] mt-1 font-medium">
                  Verified through State Nurse Aide Registry records.
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-semibold mb-1.5 ${
                  isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#001848]'
                }`}
              >
                {data.professionSpecialty?.includes('CNA')
                  ? 'State Registry / Department of Health'
                  : 'Issuing State / Board'}
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
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] active:bg-[#095C8C] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying credentials...' : 'Save & continue'}</span>
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </button>

            <button
              type="button"
              onClick={handleSaveLater}
              className="w-full sm:w-auto px-4 py-2 rounded-full text-xs font-semibold text-gray-500 hover:text-[#0B2559] dark:hover:text-white transition-colors text-center cursor-pointer"
            >
              Save progress
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

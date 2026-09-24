import React, { useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  currentUser: { role: UserRole; name: string };
  isNightShiftMode: boolean;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  currentUser,
  isNightShiftMode,
}) => {
  useBodyScrollLock(isOpen);

  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus the cancel or confirm button when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'nurse':
        return {
          label: 'Verified Clinician',
          bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
          icon: 'stethoscope',
        };
      case 'host':
        return {
          label: 'Property Host',
          bg: 'bg-blue-500/10 text-[#005684] dark:text-[#93ccff] border-blue-500/20',
          icon: 'home',
        };
      case 'super_admin':
        return {
          label: 'Operations Admin',
          bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
          icon: 'shield_person',
        };
      case 'developer':
        return {
          label: 'Lead Developer',
          bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
          icon: 'terminal',
        };
      default:
        return {
          label: 'Guest Explorer',
          bg: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20',
          icon: 'person',
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <div
      id="logout-confirmation-modal"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-desc"
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-black/60 backdrop-blur-xs flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-md my-auto rounded-3xl p-6 sm:p-7 shadow-2xl transition-all duration-200 ease-out relative border ${
          isNightShiftMode
            ? 'bg-[#0E1A2E] border-[#233550] text-[#E6ECF7]'
            : 'bg-white border-gray-200 text-[#001848]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close "X" Button */}
        <button
          id="close-logout-modal-button"
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684]"
          aria-label="Close logout confirmation modal"
        >
          <span className="material-symbols-outlined text-[20px] leading-none">close</span>
        </button>

        {/* Modal Header with Warning/Logout Icon */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-[22px]">logout</span>
          </div>
          <div>
            <h2
              id="logout-dialog-title"
              className="text-base sm:text-lg font-bold leading-snug tracking-tight text-[#001848] dark:text-white"
            >
              Log Out of Your Account?
            </h2>
            <p
              id="logout-dialog-desc"
              className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed"
            >
              Are you sure you want to end your active session on Nurse&apos;s Pillow?
            </p>
          </div>
        </div>

        {/* Active Session Card */}
        <div
          className={`p-3.5 rounded-2xl border mb-5 ${
            isNightShiftMode
              ? 'bg-[#15233a] border-[#233550]'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            Active Session
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#001848] dark:bg-[#005684] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <span className="material-symbols-outlined text-[18px]">{roleInfo.icon}</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#001848] dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  North Carolina Sanctuary Network
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${roleInfo.bg}`}
            >
              {roleInfo.label}
            </span>
          </div>
        </div>

        {/* Informational bullet points */}
        <div className="space-y-2 mb-6 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-rose-500 text-[16px] shrink-0 mt-0.5">
              delete_sweep
            </span>
            <span>Clears all active session tokens and authenticated credentials on this device.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-[16px] shrink-0 mt-0.5">
              person_outline
            </span>
            <span>Resets application state to the <strong>Guest</strong> role with public browsing access.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-500 text-[16px] shrink-0 mt-0.5">
              explore
            </span>
            <span>Navigates back to the Explore Stays marketplace.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-[#233550]">
          <button
            id="cancel-logout-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#233550] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#182840] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-300"
          >
            Cancel
          </button>
          <button
            id="confirm-logout-btn"
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirmLogout}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-rose-500"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Confirm &amp; Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

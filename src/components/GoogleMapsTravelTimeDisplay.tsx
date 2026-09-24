import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommuteCalculationResult } from '../lib/googleMapsCommute';

export interface GoogleMapsTravelTimeDisplayProps {
  commute: CommuteCalculationResult;
  compact?: boolean;
  className?: string;
  isNightShiftMode?: boolean;
}

export const GoogleMapsTravelTimeDisplay: React.FC<GoogleMapsTravelTimeDisplayProps> = ({
  commute,
  compact = false,
  className = '',
  isNightShiftMode = false,
}) => {
  const [selectedMode, setSelectedMode] = useState<'drive' | 'transit' | 'walk'>('drive');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        isNightShiftMode
          ? 'bg-[#15233a] border-[#233550] text-[#E6ECF7]'
          : 'bg-[#EFF6FB]/80 border-[rgba(11,37,89,0.08)] text-[#0B2559]'
      } ${className}`}
    >
      {/* 1. Header: Target Hospital & Proximity Tag */}
      <div className="p-3 pb-2 flex items-center justify-between gap-2 border-b border-[rgba(11,37,89,0.06)] dark:border-[#233550]/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="material-symbols-outlined text-[16px] text-[#0A6FA8] dark:text-[#3E9AD1] shrink-0">
            local_hospital
          </span>
          <span className="text-xs font-bold truncate">
            {commute.hospitalShortName}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              commute.isShiftSafe
                ? 'bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#195b4c]/30 dark:text-[#aff0db]'
                : 'bg-[#FBF0D6] text-[#B9822E] dark:bg-amber-950/40 dark:text-amber-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                commute.isShiftSafe ? 'bg-[#2F6E5E] dark:bg-[#aff0db]' : 'bg-[#B9822E]'
              }`}
            />
            <span>{commute.isShiftSafe ? 'Shift-Safe Route' : 'Suburban Commute'}</span>
          </span>
        </div>
      </div>

      {/* 2. Interactive Travel Time Mode Grid */}
      <div className="p-3 pt-2.5 space-y-2">
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {/* Drive Time */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMode('drive');
            }}
            className={`p-1.5 rounded-xl border transition-all duration-150 cursor-pointer ${
              selectedMode === 'drive'
                ? 'bg-white dark:bg-[#111e33] border-[#0A6FA8] shadow-xs text-[#0B2559] dark:text-white'
                : 'bg-white/50 dark:bg-[#111e33]/50 border-transparent hover:bg-white/80 dark:hover:bg-[#111e33]/80 text-[#0B2559]/80 dark:text-[#E6ECF7]/80'
            }`}
            title="Drive Time to Hospital"
          >
            <div className="flex items-center justify-center gap-1 text-xs font-bold tabular-nums">
              <span className="material-symbols-outlined text-[14px] text-[#0A6FA8] dark:text-[#3E9AD1]">
                directions_car
              </span>
              <span>{commute.driveMinutes}m</span>
            </div>
            <div className="text-[10px] text-[#0B2559]/70 dark:text-[#9CB3D3] font-medium">Drive</div>
          </button>

          {/* Transit Time */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMode('transit');
            }}
            className={`p-1.5 rounded-xl border transition-all duration-150 cursor-pointer ${
              selectedMode === 'transit'
                ? 'bg-white dark:bg-[#111e33] border-[#0A6FA8] shadow-xs text-[#0B2559] dark:text-white'
                : 'bg-white/50 dark:bg-[#111e33]/50 border-transparent hover:bg-white/80 dark:hover:bg-[#111e33]/80 text-[#0B2559]/80 dark:text-[#E6ECF7]/80'
            }`}
            title="Hospital Shuttle or Public Transit"
          >
            <div className="flex items-center justify-center gap-1 text-xs font-bold tabular-nums">
              <span className="material-symbols-outlined text-[14px] text-[#0A6FA8] dark:text-[#3E9AD1]">
                directions_bus
              </span>
              <span>{commute.transitMinutes}m</span>
            </div>
            <div className="text-[10px] text-[#0B2559]/70 dark:text-[#9CB3D3] font-medium">Transit</div>
          </button>

          {/* Distance */}
          <div
            className="p-1.5 rounded-xl bg-white/50 dark:bg-[#111e33]/50 border border-transparent select-none"
            title="Distance in miles"
          >
            <div className="flex items-center justify-center gap-1 text-xs font-bold tabular-nums text-[#0B2559] dark:text-white">
              <span className="material-symbols-outlined text-[14px] text-[#0A6FA8] dark:text-[#3E9AD1]">
                distance
              </span>
              <span>{commute.distanceMiles} mi</span>
            </div>
            <div className="text-[10px] text-[#0B2559]/70 dark:text-[#9CB3D3] font-medium">Distance</div>
          </div>
        </div>

        {/* Route Snapshot Bar */}
        <div className="flex items-center justify-between text-[11px] text-[#0B2559]/70 dark:text-[#9CB3D3] pt-0.5">
          <span className="flex items-center gap-1 truncate max-w-[70%]">
            <span className="material-symbols-outlined text-[13px] text-[#2F6E5E] dark:text-[#aff0db] shrink-0">
              alt_route
            </span>
            <span className="truncate">{commute.routeSummary}</span>
          </span>
          <span className="text-[10px] font-semibold text-[#0A6FA8] dark:text-[#3E9AD1] shrink-0 tabular-nums">
            {commute.trafficStatus}
          </span>
        </div>

        {/* 3. Progressive Disclosure Toggle: Shift Departure Advisor */}
        {!compact && (
          <div className="pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailsOpen(!isDetailsOpen);
              }}
              className="w-full py-1 text-[11px] font-semibold text-[#0A6FA8] dark:text-[#3E9AD1] hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{isDetailsOpen ? 'Hide shift departure schedule' : 'View shift departure advisor'}</span>
              <span
                className={`material-symbols-outlined text-[14px] transition-transform duration-200 ${
                  isDetailsOpen ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            <AnimatePresence>
              {isDetailsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mt-1.5 pt-2 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-1.5 text-[11px]"
                >
                  <div className="flex items-center justify-between bg-white/70 dark:bg-[#111e33] px-2.5 py-1.5 rounded-lg">
                    <span className="flex items-center gap-1.5 text-[#0B2559] dark:text-white font-medium">
                      <span className="material-symbols-outlined text-[13px] text-amber-500">wb_sunny</span>
                      <span>Day Shift (7 AM)</span>
                    </span>
                    <span className="font-bold text-[#0A6FA8] dark:text-[#3E9AD1] tabular-nums">
                      Depart by {commute.dayShiftDepartureEstimate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white/70 dark:bg-[#111e33] px-2.5 py-1.5 rounded-lg">
                    <span className="flex items-center gap-1.5 text-[#0B2559] dark:text-white font-medium">
                      <span className="material-symbols-outlined text-[13px] text-indigo-400">bedtime</span>
                      <span>Night Shift (7 PM)</span>
                    </span>
                    <span className="font-bold text-[#0A6FA8] dark:text-[#3E9AD1] tabular-nums">
                      Depart by {commute.nightShiftDepartureEstimate}
                    </span>
                  </div>

                  {commute.distanceMiles <= 2.0 && (
                    <div className="flex items-center gap-1 px-2.5 py-1 text-[10px] text-[#2F6E5E] dark:text-[#aff0db] bg-[#E1EFE9]/60 dark:bg-[#195b4c]/20 rounded-md">
                      <span className="material-symbols-outlined text-[12px]">directions_walk</span>
                      <span>Walkable / bikeable: ~{commute.walkMinutes} min shift walk or ~{Math.round(commute.walkMinutes * 0.35)} min bike ride</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

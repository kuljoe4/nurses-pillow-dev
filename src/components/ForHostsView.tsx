import React from 'react';

interface ForHostsViewProps {
  isNightShiftMode: boolean;
  onGoToHousing: () => void;
}

export const ForHostsView: React.FC<ForHostsViewProps> = ({
  isNightShiftMode,
  onGoToHousing,
}) => {
  return (
    <div
      className={`w-full py-12 px-4 sm:px-6 lg:px-12 transition-colors ${
        isNightShiftMode ? 'bg-[#08101C]' : 'bg-[#f2f3ff]'
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#aff0db]/30 text-[#195b4c] dark:text-[#aff0db] mb-3">
            Host Community
          </span>
          <h1
            className={`text-3xl sm:text-4xl font-bold tracking-tight mb-3 ${
              isNightShiftMode ? 'text-white' : 'text-[#001848]'
            }`}
          >
            Host Verified Traveling Healthcare Professionals
          </h1>
          <p
            className={`text-base leading-relaxed ${
              isNightShiftMode ? 'text-[#9CB3D3]' : 'text-[#404850]'
            }`}
          >
            Nurses Pillow hosts provide tranquil, clean sanctuaries for travel nurses working 13-week rotations. Enjoy 100% verified clinical guests, zero parties, and reliable monthly rent.
          </p>
        </div>

        {/* Host standard requirements */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-lg ${
            isNightShiftMode
              ? 'bg-[#0E1A2E] border-[#233550] text-[#E6ECF7]'
              : 'bg-white border-[rgba(11,37,89,0.08)] text-[#001848]'
          }`}
        >
          <h2 className="text-xl font-bold mb-4">Nurses Pillow Host Sanctuary Standards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div
              className={`p-4 rounded-2xl ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <div className="font-bold flex items-center gap-2 mb-1 text-[#0a6fa8] dark:text-[#3E9AD1]">
                <span className="material-symbols-outlined text-base">bedtime</span>
                <span>Day-Sleeper Blackout Curtains</span>
              </div>
              <p className="text-xs opacity-80">
                Required in all bedrooms to support night-shift clinicians resting between 08:00 and 16:00.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <div className="font-bold flex items-center gap-2 mb-1 text-[#195b4c] dark:text-[#aff0db]">
                <span className="material-symbols-outlined text-base">verified_user</span>
                <span>Contract Flex Agreement</span>
              </div>
              <p className="text-xs opacity-80">
                Hosts agree to penalty-free early lease terminations if a clinician's hospital contract is cancelled early.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <div className="font-bold flex items-center gap-2 mb-1 text-[#745b0d] dark:text-[#ffdf91]">
                <span className="material-symbols-outlined text-base">lock</span>
                <span>Self Check-in 24/7</span>
              </div>
              <p className="text-xs opacity-80">
                Keypad or smart-lock entry accommodating unusual arrival hours between clinical hospital shifts.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <div className="font-bold flex items-center gap-2 mb-1 text-[#0a6fa8] dark:text-[#3E9AD1]">
                <span className="material-symbols-outlined text-base">local_laundry_service</span>
                <span>In-Unit Laundry &amp; Clean Linens</span>
              </div>
              <p className="text-xs opacity-80">
                Scrubs sanitation is essential. In-unit washer/dryer and hospital-grade hypoallergenic beddings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ProductPreviewHero } from './ProductPreviewHero';
import { MOCK_LISTINGS } from '../data/mockData';

interface HowItWorksViewProps {
  isNightShiftMode: boolean;
  onGoToVerification: () => void;
  onGoToHousing: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({
  isNightShiftMode,
  onGoToVerification,
  onGoToHousing,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isSaved, setIsSaved] = useState(false);
  const heroListing = MOCK_LISTINGS[0]; // Use the first listing for the demo

  const commitments = [
    {
      icon: 'verified_user',
      title: '1. Clinician Verification & RN Rates',
      description:
        'We cross-reference every clinician with their State Board of Nursing (BRN/Nursys). Verified clinicians unlock negotiated, stipend-friendly rates up to 25% lower than Airbnb or Furnished Finder.',
    },
    {
      icon: 'dark_mode',
      title: '2. The 100% Day-Sleeper Protocol',
      description:
        'Every sanctuary requires laboratory-grade thermal blackout curtains (blocking 99.8% of light), white noise sound machines, and strict daytime quiet-hour agreements from neighbors.',
    },
    {
      icon: 'shield_with_heart',
      title: '3. Contract Flex Guarantee',
      description:
        'If a hospital cancels, reschedules, or floats your travel contract early, you can exit your lease with zero penalty fees and 100% deposit returns upon presenting your agency notice.',
    },
    {
      icon: 'local_hospital',
      title: '4. Sub-15 Minute Hospital Proximity',
      description:
        'Zero exhausting commutes after brutal 12-hour shifts. Every listing maps exact transit times, bike pathways, and secure parking structures for day and night shift rotations.',
    },
  ];

  return (
    <div
      className={`w-full py-12 px-4 sm:px-6 lg:px-12 transition-colors ${
        isNightShiftMode ? 'bg-[#08101C]' : 'bg-[#f2f3ff]'
      }`}
    >
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto pt-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#aff0db]/30 text-[#195b4c] dark:text-[#aff0db] mb-3">
            Built by Nurses for Nurses
          </span>
          <h1
            className={`text-3xl sm:text-4xl font-bold tracking-tight mb-3 ${
              isNightShiftMode ? 'text-white' : 'text-[#001848]'
            }`}
          >
            How Nurses Pillow Guarantees Real Rest
          </h1>
          <p
            className={`text-base leading-relaxed ${
              isNightShiftMode ? 'text-[#9CB3D3]' : 'text-[#404850]'
            }`}
          >
            Traveling clinicians work 12+ hour shifts under life-or-death pressure. We created a sanctuary network designed to eliminate the anxiety of unreliable sublets and noisy daytime neighborhoods.
          </p>
        </motion.div>

        {/* Product Preview Interactive Screenshot - Sells Trust & Functionality */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-4 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#0a6fa8] dark:text-[#3E9AD1]">
              Interactive Preview
            </span>
          </div>
          <ProductPreviewHero
            listing={heroListing}
            isSaved={isSaved}
            onToggleSave={() => setIsSaved(!isSaved)}
            onSelectListing={onGoToHousing}
            onRequestToBook={onGoToHousing}
            shouldReduceMotion={shouldReduceMotion}
          />
        </motion.div>

        {/* 4 Sanctuary Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {commitments.map((c, i) => (
            <motion.div
              key={i}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : i * 0.1, ease: 'easeOut' }}
              className={`p-6 sm:p-8 rounded-3xl border shadow-md transition-all duration-200 ease-in-out ${
                isNightShiftMode
                  ? 'bg-[#0E1A2E] border-[#233550] text-[#E6ECF7]'
                  : 'bg-white border-[rgba(11,37,89,0.08)] text-[#001848]'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0a6fa8]/15 text-[#0a6fa8] dark:text-[#3E9AD1] flex items-center justify-center mb-4 font-bold">
                <span className="material-symbols-outlined text-2xl">{c.icon}</span>
              </div>
              <h3 className="text-lg font-bold mb-2">{c.title}</h3>
              <p
                className={`text-sm leading-relaxed ${
                  isNightShiftMode ? 'text-[#9CB3D3]' : 'text-[#404850]'
                }`}
              >
                {c.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Action card */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`rounded-3xl p-8 sm:p-10 border text-center shadow-md ${
            isNightShiftMode
              ? 'bg-[#15233a] border-[#233550] text-white'
              : 'bg-white border-[rgba(11,37,89,0.12)] text-[#001848]'
          }`}
        >
          <h2 className="text-2xl font-bold mb-2">Ready to secure your assignment housing?</h2>
          <p
            className={`text-sm max-w-lg mx-auto mb-6 ${
              isNightShiftMode ? 'text-[#9CB3D3]' : 'text-[#404850]'
            }`}
          >
            Verify your nursing credentials in 2 minutes to unlock locked inventory and host direct messaging.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToVerification}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0a6fa8] hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] text-white font-semibold text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Verify Nursing License (Step 3)</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <button
              onClick={onGoToHousing}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-current text-sm font-semibold hover:bg-[#EFF6FB] dark:hover:bg-[#182840] hover:text-[#0A6FA8] dark:hover:text-[#3E9AD1] focus-visible:ring-2 focus-visible:ring-[#0A6FA8] transition-colors cursor-pointer"
            >
              Browse Housing Sanctuaries
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

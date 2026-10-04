# Nurses Pillow: Motion Design & Interaction Architecture

Based on the core philosophy of "Warm, competent, unhurried" outlined in the `AGENTS.md` and current motion tokens, here are the targeted motion design recommendations, prioritizing aesthetic elegance, cognitive load reduction, and absolute performance.

## Core Principles

1.  **Intentionality over Decoration:** Every animation must serve a cognitive purpose: drawing attention to an actionable item, providing spatial awareness during navigation, or offering immediate feedback on interaction.
2.  **Performance First:** Animations must strictly use GPU-accelerated properties (`transform`, `opacity`). Layout animations (changing width, height, margin) are banned unless absolutely necessary and wrapped in `<motion.div layout>` with strict bounds.
3.  **Accessibility (WCAG 2.1):** All motion must respect `prefers-reduced-motion` natively. This is already correctly established in `src/lib/animation-utilities.ts`, but must be strictly enforced on new components.

## Recommended Motion Patterns by Section

### 1. Global Navigation & Core Interactions (All Pages)

*   **Pillow Save Button (Signature Interaction):**
    *   **Current State:** Implemented via `pillowSaveVariant` (spring bounce).
    *   **Recommendation:** Ensure the transition between the empty and filled state utilizes a very slight color crossfade alongside the spring bounce (`scale: [1, 1.25, 1]`) to make the state change feel more substantial but soft.
    *   **Where:** Every listing card, listing detail modal.
*   **Button Press States:**
    *   **Current State:** Instant (100ms).
    *   **Recommendation:** Use a subtle `scale: 0.98` on `:active` for all primary CTAs (e.g., "Search housing", "Request to book"). This provides tactile feedback without feeling sluggish.

### 2. Search & Discovery (FindHousingView & SearchListingsView)

*   **The Assignment Card (Hero Component):**
    *   **Recommendation:** The staged reveal of the question, the autocomplete input, and the CTA should use `heroContainerVariant` and `heroItemVariant`. The key is staggered entrance (`staggerChildren: 0.1`) so the user's eye naturally follows the intended flow top-to-bottom.
    *   **Performance Note:** Pre-warm the Google Maps Places API during this animation to hide latency.
*   **Listing Grid & Cards (`SearchListingsView`):**
    *   **Recommendation:** As the user scrolls, new listing cards should elegantly fade and slide up using `listingCardRevealVariant` (`y: 24`, `opacity: 0` -> `y: 0`, `opacity: 1`).
    *   **Crucial:** Tie this to `IntersectionObserver` (via Framer Motion's `whileInView` with `viewport={{ once: true, margin: "-50px" }}`) to ensure they only animate once as they enter the viewport, preventing annoying re-animations on upward scroll.

### 3. Progressive Disclosure & Modals (ListingDetailModal & HealthcareAmenitiesFilterModal)

*   **Modal Entrances:**
    *   **Recommendation:** Continue using `modalFadeScaleVariant` (scale `0.95` -> `1`, `y: 10` -> `0`). This provides a "coming forward" spatial relationship.
    *   **Background Blur:** Add a subtle `backdrop-filter: blur(4px)` to the modal overlay, animating in over `motionTokens.duration.base` (280ms) to gently obscure the background without full opacity loss.
*   **Expandable Sections (e.g., "Show all amenities"):**
    *   **Recommendation:** Use Framer Motion's `<AnimatePresence>` and `height: "auto"` for smooth accordion expansions.
    *   **Performance:** Use `overflow: hidden` during the animation and immediately remove it when complete to prevent clipping issues.

### 4. The Verification Flow (PostmarkEmailVerificationView, TwilioPhoneOtpView, ClinicalLicenseStep)

*   **Step Transitions (Stepper Navigation):**
    *   **Recommendation:** When moving between steps (e.g., Email -> Phone), do *not* use complex crossfades. Use a horizontal slide (`x: 20` -> `x: 0` for next, `x: -20` -> `x: 0` for previous) with a quick fade (`opacity: 0` -> `1`).
    *   **Why:** A horizontal slide reinforces the mental model of forward progression.
*   **Success States (VerificationSuccessModal):**
    *   **Recommendation:** This is the *only* place to use `motionTokens.duration.celebrate` (600ms). The Warm Gold Accent (`#F1CF78`) should be used here. A soft, expanding ring animation behind the success icon (Teal-Green `#2F6E5E`) signifies completion without being visually overwhelming.

### 5. Checkout & Booking (ItemizedCheckoutModal)

*   **Price Breakdown Reveal:**
    *   **Recommendation:** When a user selects dates and the pricing recalculates, animate the numbers slightly (a quick fade down and up, or a specialized number ticker if the delta is small).
    *   **Crucial:** Ensure tabular numerals (`tabular-nums`) are enforced to prevent layout horizontal jitter during price changes.

## Architectural Implementation Guidelines

1.  **Component Modularity:** Never inline `variants`. Always import them from `src/lib/animation-utilities.ts` to maintain the design system's single source of truth.
2.  **Strict `<AnimatePresence>` Usage:** Only use `<AnimatePresence>` when elements are actually being removed from the React Tree. Do not use it for simple style toggles (use standard `animate` props instead).
3.  **Reflect `useReducedMotion`:** When building custom components, always wrap motion properties in a check:
    ```tsx
    const shouldReduceMotion = useReducedMotion();
    const transition = shouldReduceMotion ? { duration: 0 } : defaultTransition;
    ```

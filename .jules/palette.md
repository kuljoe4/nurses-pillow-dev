## 2023-10-25 - [Fix] Support Modal Submit Button Lacks Loading State
**Learning:** During asynchronous form submissions inside modals, like the `NurseSupportModal`, users can repeatedly click the 'Send' button because it lacks an explicit loading state (`isSubmitting`) or disabled property. This omission can result in multiple unintended API requests or redundant logic execution.
**Action:** When working on modals with asynchronous logic (like `setTimeout` or actual API calls), ensure a proper `isSubmitting` state is maintained. Disable the submit button and provide clear visual feedback (e.g. "Sending..." or a spinner animation) to prevent concurrent submissions and reassure the user that their request is being processed.

## 2026-10-07 - Accessible Progressive Disclosure
**Learning:** When using Framer Motion's AnimatePresence for progressive disclosure (expand/collapse) in React, the toggle button inherently lacks semantic connection to the animated content. Screen readers cannot announce the expanded state or locate the revealed content without explicit ARIA attributes.
**Action:** Always link the toggle button and the motion.div using `aria-controls` and an `id`, and reflect the current state using `aria-expanded={isOpen}` on the button.
## 2024-10-08 - Add accessibility attributes to expand/collapse panels
**Learning:** React components using `AnimatePresence` and `motion.div` for progressive disclosure often miss critical screen reader linkages. Toggle buttons need `aria-expanded` reflecting the open state, and `aria-controls` pointing to the `id` of the expanding region to ensure assistive technologies can announce the relationship and state changes.
**Action:** When implementing expand/collapse UI, consistently add `id` to the toggled container and `aria-controls`/`aria-expanded` to the button that controls it.

## 2026-10-08 16:57 - Toggle Button Accessibility (`aria-pressed`)
**Metric Impact:** +1 accessible toggle button.
**Overall Progress:** 4th iteration, accessibility score improved.
**Learning:** Custom components serving as toggle buttons (like the `PillowSaveButton` for saving/unsaving) rely on `aria-pressed` to communicate their current active state to screen readers. Relying solely on `aria-label` is insufficient for true toggle semantics.
**Action:** Added the `aria-pressed={isSaved}` attribute to the Framer Motion button in `PillowSaveButton.tsx`.
**Next Scheduled Target:** Target a specific modal or filter panel to eliminate redundant introductory phrasing and simplify visual hierarchy.

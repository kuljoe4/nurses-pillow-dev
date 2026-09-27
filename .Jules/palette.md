## 2025-10-27 - Initial Findings
**Learning:** This repo has a lot of components lacking aria-labels or missing labels for inputs (for example, there is no `htmlFor` used in `NurseSupportModal.tsx` and some `<select>`/`<textarea>` elements have missing IDs). There are also `aria-label`s missing on buttons, but the `<button aria-label="Close">` is an easy target for today.
**Action:** Add aria-labels to buttons where helpful or missing, and implement htmlFor on labels.

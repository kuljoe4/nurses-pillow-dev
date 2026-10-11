# Production Fails & Codebase Audit Report

## 1. Performance & Memory Bottlenecks
*   **Chained Array Methods in Render:** Multiple components (e.g., `src/components/SearchListingsView.tsx`, `src/components/HostPortalView.tsx`, `src/components/NurseDashboardView.tsx`) are chaining array methods like `.filter().filter()` or `.split().map().filter()`. These are $O(M \times N)$ operations that create excessive intermediate array allocations on every render.
*   **O(N log N) Map Distance Sorting:** In `src/components/SearchListingsView.tsx` (lines 305+), there is an expensive nested commute calculation happening directly inside the `.sort()` callback. This needs to be replaced with a Schwartzian transform (pre-calculating the distances into a Map before sorting) to optimize to $O(N)$.
*   **Excessive `useMemo` Re-evaluations:** Some `useMemo` blocks are tied to rapidly updating state, causing unnecessary full-list filtering passes.

## 2. Security & Backend Architecture
*   **Missing IDOR Protection:** The `/api/checkout/create-booking-request` endpoint handles critical booking state creation but lacks an Insecure Direct Object Reference (IDOR) check to ensure the `traveler_user_id` matches the authenticated `req.user.id`.
*   **Stripe Intent Creation Weakness:** In `server.ts` (`/api/checkout/create-booking-request` and `/api/stripe/payment-intent`), the handling of `insufficient_capabilities_for_transfer` falls back to escrow, but the fallback parameters might not properly remove conflicting keys (like `application_fee_amount`) in all branches.
*   **Missing Exclusion Constraint Implementation:** While the database has `btree_gist` enabled, checking for the exact `EXCLUDE` constraint on bookings (to strictly prevent overlapping dates at the DB level) needs to be validated against the active schema.
*   **Untyped `req` Object in Auth Middleware Usage:** Many endpoints (like those starting around `server.ts:424`) still use `async (req: any, res)` instead of the strongly typed `AuthenticatedRequest` from `authMiddleware.ts`.

## 3. UI/UX & Accessibility (WCAG 2.1)
*   **Icon-Only Buttons Missing ARIA Labels:** The script `find_missing_aria.cjs` identified numerous `<button>` elements that rely solely on text symbols (like `✕` or `✓`) or visual icons, missing the required `aria-label`. Examples include buttons in `ItemizedCheckoutModal.tsx`, `ListingDetailModal.tsx`, and `TwilioPhoneOtpView.tsx`.
*   **Missing `aria-pressed` on Toggles:** Toggle buttons (e.g., in `MapRouteVisualLayer.tsx` or `ProductPreviewHero.tsx`) lack the `aria-pressed` attribute to communicate their active state to screen readers.
*   **Incomplete "Loading" States on Submit Buttons:** There are `<button type="submit">` elements that do not adequately reflect an `isSubmitting` state visually (or disable properly), which risks double-submission and fails to provide perceptible affordances as per Don Norman's principles.

## 4. Stability & Quality Assurance
*   **Test Failures:** Running `vitest run` shows failures in `cna-verification.test.ts` related to database connections (`connect ECONNREFUSED 127.0.0.1:5432`), indicating that tests requiring a DB connection are not gracefully skipping or using the in-memory fallback correctly in the CI/local environment when Postgres is down.
*   **Stripe Identity Verification Logic:** In `IdentityStep.tsx`, there's a branch that warns "Stripe verification failed but proceeding for development. Prod would block this." which could mask actual errors if the `import.meta.env.PROD` check is ever misconfigured.

This report summarizes the findings. The actual implementation of fixes will occur in a separate, dedicated session.

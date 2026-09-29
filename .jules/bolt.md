## 2026-09-27 - Stable References for Memoized Components
**Learning:** `SearchListingCard` was wrapped in `React.memo` but many of the callback functions it received from `SearchListingsView` and `App.tsx` were re-created on every render, completely breaking the memoization and causing unnecessary re-renders when parent states changed.
**Action:** When adding `React.memo` to child components, systematically trace all callback props up the component tree to ensure they are wrapped in `useCallback` with stable dependencies (or empty arrays if using functional state updates like `setBookingRequests(prev => ...)`).

## 2026-10-05 - Avoid Inline Arrow Functions for Memoized Components
**Learning:** Even when a parent component wraps a callback prop in `useCallback` (e.g., `handleToggleSaveListing` in `App.tsx`), passing it down to a memoized child component (`PillowSaveButton`) as an inline arrow function (e.g., `() => onToggleSave(listing.id)`) defeats the memoization. The inline function creates a new reference on every render, causing the memoized child to re-render unnecessarily.
**Action:** When a memoized child component needs to execute a callback with arguments, wrap the specific invocation in its own `useCallback` in the intermediate component to preserve stable reference identities for the memoized child.
## 2023-10-25 - Bulk Insert Seeding Optimization
 **Learning:** When seeding databases during application bootstrap via loops of single row INSERT statements over arrays, it causes significant latency (N+1 networking problem). This can quickly cause bootstrap scripts to exceed timeouts.
 **Action:** Refactored the `bootstrapDatabase` routines in `src/services/railway.ts` to map data arrays into batched parameter queries, constructing multi-value strings in memory to perform large inserts in a single roundtrip. Estimated 5-10x throughput improvement during cold starts depending on array sizes.

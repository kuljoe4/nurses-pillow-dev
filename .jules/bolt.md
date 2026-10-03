## 2025-01-01 - [Refactored Multiple Array Filters to Single Pass Early Returns]
**Learning:** Found multiple chained array `.filter()` calls in React component `useMemo` blocks handling data. This is an O(M * N) anti-pattern where M is the number of filters and N is the number of elements.
**Action:** Always combine array `.filter()` conditions into a single pass using early returns, reducing complexity to O(N) and significantly reducing allocations.
## 2026-10-02 - Lazy Load Modals
**Learning:** Using React.lazy for modals can significantly reduce the initial JavaScript bundle size, improving Time to Interactive (TTI), particularly on views with many complex modals that may never be opened by the user during a session.
**Action:** When adding heavy modals, always wrap them in React.lazy() and <Suspense>.
## 2024-10-03 - [GoogleHospitalAutocomplete Debounce Optimization]
**Learning:** `GoogleHospitalAutocomplete` uses the Places API via `placesLibrary?.AutocompleteSuggestion.fetchAutocompleteSuggestions` directly in the `handleInputChange` handler, which fires on every keystroke (`onChange`). This results in unnecessary network requests and API quota usage for every letter typed.
**Action:** Implement a standard debounce pattern (e.g., using `setTimeout`) in the `handleInputChange` to reduce API calls to the Google Maps Places API, significantly improving performance and reducing quota.

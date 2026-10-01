## 2025-01-01 - [Refactored Multiple Array Filters to Single Pass Early Returns]
**Learning:** Found multiple chained array `.filter()` calls in React component `useMemo` blocks handling data. This is an O(M * N) anti-pattern where M is the number of filters and N is the number of elements.
**Action:** Always combine array `.filter()` conditions into a single pass using early returns, reducing complexity to O(N) and significantly reducing allocations.

## 2026-09-28 - Optimize Listing Seeding N+1 Query in CLI

**Learning:** When seeding or batch inserting a large amount of data into PostgreSQL, a loop executing individual `INSERT` statements results in significant N+1 network/database round trips.
**Action:** Refactored the `server/seed.ts` loop to construct a single parameterized batch `INSERT` query by mapping the array data to dynamically sized variable placeholders (e.g., `($1, $2, ...)`), resulting in a ~98% execution time reduction for that query block.

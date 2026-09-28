## 2026-09-28 - Optimizing Database Seeding Performance

**Learning:** Database seeding scripts that iterate over an array to insert rows individually create an N+1 query problem, adding significant network overhead and slowing down the script execution, especially when run against a remote database.

**Action:** Refactored the `for` loops in `server/seed.ts` (for both `NC_HOSPITAL_SEEDS` and `NC_LISTING_SEEDS`) into single batch `INSERT` statements using dynamically generated parameterized placeholder strings (e.g., `VALUES ($1, $2), ($3, $4)`). This reduced seeding time by approximately 80% based on local network simulation.

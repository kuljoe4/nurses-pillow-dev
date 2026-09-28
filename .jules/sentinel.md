## 2025-02-28 - Secure Booking Creation Endpoint

**Vulnerability:** The `/api/bookings` endpoint lacked authentication and allowed anyone to create unverified bookings. It also had a dangerous `INSERT INTO users` fallback that created dummy users on the fly. This could lead to Insecure Direct Object Reference (IDOR) and unauthorized data insertion.

**Learning:** Always require authentication on API endpoints that mutate or access user-owned records. Never rely on request body parameters (like `traveler_id`) without verifying them against the authenticated session (`req.user.id`).

**Prevention:** Apply `authenticateToken` middleware to protected routes. Enforce strict authorization checks to ensure the authenticated user owns the resource they are attempting to modify or create.

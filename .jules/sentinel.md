## 2025-02-18 - Fix Unauthenticated Audit Logs Access
 **Vulnerability:** Unauthenticated access to GET and POST `/api/audit-logs` endpoints allowing potential data leaks and log tampering.
 **Learning:** Ensure all sensitive endpoints, particularly internal logging and administrative APIs, enforce authentication at the route level using middleware like `authenticateToken`.
 **Prevention:** Implement comprehensive route audits and consistently apply authentication middleware to all non-public APIs.
## 2025-02-28 - Secure Booking Creation Endpoint

**Vulnerability:** The `/api/bookings` endpoint lacked authentication and allowed anyone to create unverified bookings. It also had a dangerous `INSERT INTO users` fallback that created dummy users on the fly. This could lead to Insecure Direct Object Reference (IDOR) and unauthorized data insertion.

**Learning:** Always require authentication on API endpoints that mutate or access user-owned records. Never rely on request body parameters (like `traveler_id`) without verifying them against the authenticated session (`req.user.id`).

**Prevention:** Apply `authenticateToken` middleware to protected routes. Enforce strict authorization checks to ensure the authenticated user owns the resource they are attempting to modify or create.
## 2025-03-02 - Sentinel: Added missing authentication to sensitive API endpoints
**Vulnerability:** Missing authentication on endpoints like POST /api/bookings, POST /api/audit-logs, and GET /api/audit-logs in `server/server.ts`. This allowed arbitrary unauthenticated users to create bookings and write/read sensitive audit logs.
**Learning:** The `authenticateToken` middleware was defined in `server/authMiddleware.ts` but was not consistently applied to all sensitive endpoints in the main Express router configuration, highlighting a gap in secure-by-default routing practices.
**Prevention:** Establish a convention to apply authentication globally at the router level for API scopes (e.g., `app.use('/api', authenticateToken)` and selectively disable it, or rigorously code-review all new routes to ensure they have the appropriate auth middleware applied.
## 2026-09-28 - Unvalidated Input in Audit Logs Creation
 **Vulnerability:** Unvalidated input in the `/api/audit-logs` endpoint allowed malicious actors to insert arbitrary or malformed data into the database. Specifically, `req.body` properties like `event_type`, `record_id`, `details`, and `actor` were directly inserted into the PostgreSQL `audit_logs` table without type, presence, or length validation. This could lead to 500 server errors, database constraint violations (e.g., null constraints), and potential exploitation by inserting excessively large strings or malformed objects.
 **Learning:** Always validate and sanitize all incoming request payloads before interacting with the database. Do not rely solely on parameterized queries to protect against all forms of bad data; parameterized queries prevent SQL injection, but they do not enforce business logic or schema constraints.
 **Prevention:** Implement comprehensive input validation (e.g., checking for type, presence, and length restrictions matching the database schema) on all API endpoints that accept data. Use validation libraries or strict manual checks, and ensure default or missing values are handled gracefully (e.g., returning a 400 Bad Request instead of crashing).
## 2024-05-20 - Insufficient Input Validation in API Routes
 **Vulnerability:** Unvalidated `req.body` data was being directly inserted into database queries in the `POST /api/bookings` route. This exposed the application to database errors, missing required fields, and potential injection attacks by allowing maliciously formatted payloads (like negative fees).
 **Learning:** Direct destructuring and usage of request bodies without explicit schema validation bypasses the application's required data integrity constraints and security bounds.
 **Prevention:** Implement strict payload validation using a library like `zod` at the route boundary before processing any business logic or interacting with the database. Use `.safeParse()` and reject invalid requests immediately with a 400 Bad Request.
## 2025-02-26 - [CRITICAL] Fix Hardcoded Password Hash in Booking Creation

**Vulnerability:** A hardcoded string ('dummy') was used as the `password_hash` when implicitly creating new users during a booking process (`POST /api/bookings`). This meant any auto-generated placeholder account had a known, easily guessable password hash. Since the `ON CONFLICT DO NOTHING` logic allowed creating these users if they didn't exist, an attacker could potentially guess or know the dummy password and attempt to compromise these automatically created placeholder accounts.

**Learning:** When implicitly auto-creating user accounts (e.g., placeholder accounts during booking), it is crucial to generate a secure random password using `crypto.randomBytes(32).toString('hex')` and hash it with `bcrypt` rather than using hardcoded dummy values. Additionally, optimizing the operation by querying the database first to ensure the user doesn't already exist before performing computationally expensive `bcrypt` hashing mitigates potential DoS risks.

**Prevention:** Always rely on a cryptographically secure random number generator (like Node's `crypto` module) combined with a strong hashing algorithm (`bcrypt`, `argon2`) for any programmatic account creation, even for placeholder accounts. Enforce pre-commit static analysis rules to flag hardcoded strings being passed into password hash fields.

## 2025-03-02 - Secure Identity and License Verification Endpoints
 **Vulnerability:** The `/api/verify/identity` and `/api/verify/license` endpoints were unauthenticated and vulnerable to Insecure Direct Object Reference (IDOR). They relied on client-provided `userId` or `email` in the request body to update sensitive verification status and personally identifiable information (PII). An attacker could forge requests to verify arbitrary users or modify their data.
 **Learning:** Security critical endpoints managing identity verification must enforce strong authentication (e.g., via middleware like `authenticateToken`) and strictly derive the target user's identity from the verified session context (e.g., `req.user.id`), never trusting client-supplied identifiers for authorization or context.
 **Prevention:** Implement strict route definitions where all endpoints modifying user data mandate authentication middleware. Always use the authenticated session context (`req.user`) to determine the actor and target resource, falling back to a 401/403 response if the context is missing or mismatched.

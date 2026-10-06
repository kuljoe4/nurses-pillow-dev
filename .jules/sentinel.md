## 2025-02-12 - [CRITICAL] Fix IDOR in Auth Me Endpoint & Hardcoded Secrets
**Vulnerability:** The `/api/auth/me` endpoint permitted unauthenticated querying of sensitive user profiles by passing a `?email=` query param (IDOR bypass). Furthermore, the fallback token for Postmark was hardcoded into `server/authRoutes.ts`.
**Learning:** Legacy bypasses or development convenience logic on authenticated endpoints create catastrophic attack surfaces if left in production. Mock secrets should never reside within production execution paths.
**Prevention:** Always verify identity strictly off the JWT Bearer token on all secure routes. Rely strictly on environment variables for external secrets with secure fallbacks (e.g. failing gracefully) when absent.
## 2026-10-03 - Fix hardcoded JWT fallback secret
**Vulnerability:** A hardcoded, insecure JWT secret fallback ('nurses_pillow_secret_2026') was present in 'src/server/phoneAuthMiddleware.ts', bypassing standard environment configurations.
**Learning:** Middleware initialized independently of the main app lifecycle may inadvertently duplicate or loosen environment validation checks, leading to mismatched fallback credentials across services.
**Prevention:** Ensure all services and middleware within a codebase source their environment variables and security fallbacks from a centralized, unified initialization script or explicitly mirror the main application's fail-safe behavior.

## 2026-10-04 - Secure Random Value Generation
**Vulnerability:** Weak pseudo-random number generator (`Math.random()`) was used to generate sensitive security tokens including email verification PINs, SMS OTPs, and Twilio Session IDs. This makes tokens predictable and vulnerable to brute-force or sequencing attacks.
**Learning:** Both server-side Express routes and isomorphic API services were relying on `Math.floor(100000 + Math.random() * 900000)` for OTP generation.
**Prevention:** Always use cryptographically secure pseudo-random number generators (CSPRNG). Use `crypto.randomInt()` or `crypto.randomBytes()` in Node.js environments, and `window.crypto.getRandomValues()` in browser environments.
## 2026-10-06 - Secure Random Value Generation
**Vulnerability:** Weak pseudo-random number generator (`Math.random()`) was used across the application to generate sensitive security tokens, transaction IDs, escrow holds, OTP session IDs, and database audit logs. This predictability introduces severe vulnerabilities to token sequencing and brute-force attacks.
**Learning:** Development-grade ID and token generators often leak into production if cryptographically secure replacements are not strictly enforced during code review.
**Prevention:** Always rely on Node.js `crypto` (`crypto.randomBytes`, `crypto.randomUUID`) on the backend and `window.crypto` (`crypto.getRandomValues`, `crypto.randomUUID`) on the frontend to guarantee unpredictability in critical identifiers and tokens.
## 2025-02-28 - Add authentication to admin endpoints
**Vulnerability:** Admin endpoints (`/api/admin/verifications`, `/api/admin/verifications/:userId/approve`, etc.) lacked authentication and authorization checks, allowing unauthenticated requests to view and approve/reject clinical verifications and property listings.
**Learning:** High-privilege API routes must explicitly include authentication middleware and role validation to ensure only authorized administrators can access or execute sensitive actions.
**Prevention:** Always apply the `authenticateToken` middleware and verify `req.user.role` (e.g. `super_admin`, `admin`) for any newly added `/api/admin/*` endpoints.

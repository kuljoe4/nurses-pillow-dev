## 2025-02-12 - [CRITICAL] Fix IDOR in Auth Me Endpoint & Hardcoded Secrets
**Vulnerability:** The `/api/auth/me` endpoint permitted unauthenticated querying of sensitive user profiles by passing a `?email=` query param (IDOR bypass). Furthermore, the fallback token for Postmark was hardcoded into `server/authRoutes.ts`.
**Learning:** Legacy bypasses or development convenience logic on authenticated endpoints create catastrophic attack surfaces if left in production. Mock secrets should never reside within production execution paths.
**Prevention:** Always verify identity strictly off the JWT Bearer token on all secure routes. Rely strictly on environment variables for external secrets with secure fallbacks (e.g. failing gracefully) when absent.

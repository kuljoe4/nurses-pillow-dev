## 2025-02-25 - Secure Admin Bootstrapping
**Vulnerability:** A hardcoded backdoor existed in `server/authRoutes.ts` allowing anyone to login as an admin if they knew the specific email (`admin@nursespillow.com`) and password (`AdminSecure2026!`).
**Learning:** Hardcoding credentials in production code, even for bootstrapping, is a critical security risk because the source code or version control history can be compromised or inadvertently exposed.
**Prevention:** Always use out-of-band provisioning for initial administrative accounts, such as database seeding scripts (`server/seed.ts`) that read secure credentials from deployment environment variables (`INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`).

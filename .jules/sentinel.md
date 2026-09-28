## 2025-02-26 - [CRITICAL] Fix Hardcoded Password Hash in Booking Creation

**Vulnerability:** A hardcoded string ('dummy') was used as the `password_hash` when implicitly creating new users during a booking process (`POST /api/bookings`). This meant any auto-generated placeholder account had a known, easily guessable password hash. Since the `ON CONFLICT DO NOTHING` logic allowed creating these users if they didn't exist, an attacker could potentially guess or know the dummy password and attempt to compromise these automatically created placeholder accounts.

**Learning:** When implicitly auto-creating user accounts (e.g., placeholder accounts during booking), it is crucial to generate a secure random password using `crypto.randomBytes(32).toString('hex')` and hash it with `bcrypt` rather than using hardcoded dummy values. Additionally, optimizing the operation by querying the database first to ensure the user doesn't already exist before performing computationally expensive `bcrypt` hashing mitigates potential DoS risks.

**Prevention:** Always rely on a cryptographically secure random number generator (like Node's `crypto` module) combined with a strong hashing algorithm (`bcrypt`, `argon2`) for any programmatic account creation, even for placeholder accounts. Enforce pre-commit static analysis rules to flag hardcoded strings being passed into password hash fields.

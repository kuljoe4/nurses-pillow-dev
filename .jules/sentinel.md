## 2024-05-24 - [Hardcoded JWT Secret]
**Vulnerability:** Hardcoded JWT secret used as fallback (`fallback_secret_for_development_only`) in `server/authRoutes.ts` and `server/authMiddleware.ts`.
**Learning:** Hardcoding a fallback JWT secret can be disastrous if the `JWT_SECRET` environment variable is not set in production. It exposes the system to token forgery and full authentication bypass.
**Prevention:** If `JWT_SECRET` is missing in production, the application should throw an error instead of silently falling back to an insecure value.

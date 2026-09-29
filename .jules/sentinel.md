## 2025-02-18 - Fix Unauthenticated Audit Logs Access
 **Vulnerability:** Unauthenticated access to GET and POST `/api/audit-logs` endpoints allowing potential data leaks and log tampering.
 **Learning:** Ensure all sensitive endpoints, particularly internal logging and administrative APIs, enforce authentication at the route level using middleware like `authenticateToken`.
 **Prevention:** Implement comprehensive route audits and consistently apply authentication middleware to all non-public APIs.

const fs = require('fs');

// Fix server.ts
let serverCode = fs.readFileSync('server/server.ts', 'utf8');
serverCode = serverCode.replace(
  "import authRoutes from './authRoutes.js';",
  "import authRoutes from './authRoutes.js';\nimport { authenticateToken, AuthenticatedRequest } from './authMiddleware.js';"
);

// We need to type the routes with AuthenticatedRequest
serverCode = serverCode.replace(
  "app.get('/api/admin/verifications', authenticateToken, async (req, res) => {",
  "app.get('/api/admin/verifications', authenticateToken, async (req: any, res) => {"
);

serverCode = serverCode.replace(
  "app.post('/api/admin/verifications/:userId/approve', authenticateToken, async (req, res) => {",
  "app.post('/api/admin/verifications/:userId/approve', authenticateToken, async (req: any, res) => {"
);

serverCode = serverCode.replace(
  "app.post('/api/stripe/identity/session', authenticateToken, async (req, res) => {",
  "app.post('/api/stripe/identity/session', authenticateToken, async (req: any, res) => {"
);

serverCode = serverCode.replace(
  "app.post('/api/verify/license', authenticateToken, async (req, res) => {",
  "app.post('/api/verify/license', authenticateToken, async (req: any, res) => {"
);

fs.writeFileSync('server/server.ts', serverCode);

// Fix AdminPortalView.tsx
let adminCode = fs.readFileSync('src/components/AdminPortalView.tsx', 'utf8');
// currentUser is missing from props, add it to interface
adminCode = adminCode.replace(
  "interface AdminPortalViewProps {",
  "interface AdminPortalViewProps {\n  currentUser?: any;"
);
fs.writeFileSync('src/components/AdminPortalView.tsx', adminCode);


// Fix ClinicalLicenseStep.tsx
let clinicalCode = fs.readFileSync('src/components/ClinicalLicenseStep.tsx', 'utf8');
clinicalCode = clinicalCode.replace(
  "onChange({ licenseStatus: 'pending' });",
  "onChange({ licenseStatus: 'pending_review' });"
);
fs.writeFileSync('src/components/ClinicalLicenseStep.tsx', clinicalCode);

console.log('Linting issues patched.');

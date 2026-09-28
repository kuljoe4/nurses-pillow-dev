const fs = require('fs');
const file = 'server/server.ts';
let code = fs.readFileSync(file, 'utf8');

const adminBackendCode = `

// Admin endpoint to list pending verifications
app.get('/api/admin/verifications', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    const result = await db.query(\`
      SELECT id, email, full_name, clinical_license_number, clinical_state_board, profession_specialty, clinical_document_url, verification_status
      FROM users
      WHERE verification_status = 'pending_review'
    \`);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin endpoint to approve verification and trigger data purge (NV-04, NV-06)
app.post('/api/admin/verifications/:userId/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    const { userId } = req.params;

    // In a real application, you would make an API call to delete the document from S3 here.
    // We simulate the data purge by clearing the document URL and license number from the DB.

    await db.query(\`
      UPDATE users
      SET
        is_nurse_verified = true,
        verification_status = 'verified',
        document_purged = true,
        document_purged_at = NOW(),
        clinical_document_url = NULL,
        clinical_license_number = NULL -- Purge raw license number for privacy
      WHERE id = $1
    \`, [userId]);

    res.json({ success: true, message: 'Verification approved and sensitive data purged.' });
  } catch (error) {
    console.error('Error approving verification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

`;

code = code.replace(
  "// Endpoint to fetch hospitals",
  adminBackendCode + "\n// Endpoint to fetch hospitals"
);

fs.writeFileSync(file, code);
console.log('Admin backend patched.');

const fs = require('fs');
const file = 'server/server.ts';
let code = fs.readFileSync(file, 'utf8');

const clinicalBackendCode = `

// Endpoint to upload clinical credentials
app.post('/api/verify/license', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // In a real application, you'd handle multipart/form-data with a library like multer
    // and upload the PDF to AWS S3. For this implementation, we will accept a JSON payload
    // and store the information in the database.
    const { licenseNumber, stateBoard, specialty, documentName } = req.body;

    if (!licenseNumber || !stateBoard) {
        return res.status(400).json({ error: 'License number and state board are required' });
    }

    // We update the user record to indicate verification is pending
    await db.query(\`
      UPDATE users
      SET
        clinical_license_number = $1,
        clinical_state_board = $2,
        profession_specialty = $3,
        clinical_document_url = $4,
        is_nurse_verified = false,
        verification_status = 'pending_review'
      WHERE id = $5
    \`, [licenseNumber, stateBoard, specialty, documentName || 'uploaded_document.pdf', userId]);

    res.json({ success: true, message: 'Credentials submitted for admin review.' });
  } catch (error) {
    console.error('Error submitting clinical credentials:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
`;

code = code.replace(
  "// Basic health check",
  clinicalBackendCode + "\n// Basic health check"
);

fs.writeFileSync(file, code);
console.log('Clinical backend patched.');

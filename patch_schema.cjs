const fs = require('fs');
const file = 'server/schema.sql';
let code = fs.readFileSync(file, 'utf8');

const schemaUpdates = `
    clinical_license_number VARCHAR(100),
    clinical_state_board VARCHAR(100),
    profession_specialty VARCHAR(150),
    clinical_document_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'unverified',
`;

code = code.replace(
  "is_nurse_verified BOOLEAN DEFAULT FALSE, -- True if active professional license confirmed",
  "is_nurse_verified BOOLEAN DEFAULT FALSE, -- True if active professional license confirmed" + "\n" + schemaUpdates
);

fs.writeFileSync(file, code);
console.log('Schema patched.');

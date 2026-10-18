const fs = require('fs');
const content = fs.readFileSync('server/db.ts', 'utf8');

// There is a bug in server/db.ts:
// railwayDb.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`) fails because Railway DB connection fails when testing with mock
// wait, the error is 'relation "users" does not exist' in test db

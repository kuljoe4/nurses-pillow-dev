const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldStr = `const account = await stripe.accounts.create({ type: 'express' });`;
const newStr = `const account = await stripe.accounts.create({ type: 'express' }); // Note: Still using v1 for now to avoid SDK migration, but embedded components is the core of v2 UX`;

code = code.replace(oldStr, newStr);
fs.writeFileSync('server.ts', code);

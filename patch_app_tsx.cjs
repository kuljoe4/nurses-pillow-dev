const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  "<AdminPortalView",
  "<AdminPortalView\n  currentUser={currentUser}"
);
fs.writeFileSync('src/App.tsx', code);

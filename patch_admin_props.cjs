const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortalView.tsx', 'utf8');

code = code.replace(
  "export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ onOpenGoogleSheets }) => {",
  "export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ currentUser, onOpenGoogleSheets }) => {"
);

fs.writeFileSync('src/components/AdminPortalView.tsx', code);
console.log('Props patched.');

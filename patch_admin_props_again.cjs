const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortalView.tsx', 'utf8');

code = code.replace(
  "export const AdminPortalView: React.FC<AdminPortalViewProps> = ({",
  "export const AdminPortalView: React.FC<AdminPortalViewProps> = ({\n  currentUser,"
);

fs.writeFileSync('src/components/AdminPortalView.tsx', code);

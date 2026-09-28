const fs = require('fs');
const file = 'src/components/AdminPortalView.tsx';
let code = fs.readFileSync(file, 'utf8');

const fetchVerificationsPatch = `  const [reviews, setReviews] = useState<AdminLicenseReview[]>([]);

  useEffect(() => {
    const fetchVerifications = async () => {
        try {
            const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
            const res = await fetch('/api/admin/verifications', {
                headers: {
                    'Authorization': \`Bearer \${token}\`
                }
            });
            if (res.ok) {
                const data = await res.json();
                const mappedReviews = data.map((d: any) => ({
                    id: d.id,
                    clinicianLegalName: d.full_name || d.email,
                    profession: d.profession_specialty || 'RN',
                    issuingState: d.clinical_state_board || 'NC',
                    licenseNumber: d.clinical_license_number || 'PENDING',
                    licenseStatus: d.verification_status,
                    hospitalAffiliation: 'Pending Assignment',
                    submittedAt: 'Recently',
                    nursysLookupUrl: 'https://www.nursys.com',
                    documentPurged: false
                }));
                setReviews(mappedReviews);
            }
        } catch (error) {
            console.error("Failed to fetch pending verifications", error);
        }
    };

    // Only fetch if admin
    if (currentUser?.role === 'super_admin') {
        fetchVerifications();
    }
  }, [currentUser]);`;

code = code.replace(
  /  const \[reviews, setReviews\] = useState<AdminLicenseReview\[\]>\(\[\n    \{\n      id: 'rev-1',[\s\S]*?documentPurged: false,\n    \},\n  \]\);/,
  fetchVerificationsPatch
);

const handleApprovePatch = `  const handleApprove = async (id: string) => {
    try {
        const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
        const res = await fetch(\`/api/admin/verifications/\${id}/approve\`, {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${token}\`
            }
        });

        if (res.ok) {
            setReviews((prev) =>
              prev.map((r) =>
                r.id === id ? { ...r, licenseStatus: 'verified', documentPurged: true, licenseNumber: 'PURGED' } : r
              )
            );
            alert('Verification approved and sensitive data purged securely.');
        } else {
            alert('Failed to approve verification');
        }
    } catch (error) {
        console.error("Approval error", error);
    }
  };`;

code = code.replace(
  /  const handleApprove = \(id: string\) => \{\n    const rev = reviews\.find\(\(r\) => r\.id === id\);\n    if \(rev\) \{\n      db\.purgeClinicianDocuments\(rev\.id, rev\.clinicianLegalName\);\n    \}\n    setReviews\(\(prev\) =>\n      prev\.map\(\(r\) =>\n        r\.id === id \? \{ \.\.\.r, licenseStatus: 'verified', documentPurged: true \} : r\n      \)\n    \);\n  \};/,
  handleApprovePatch
);

fs.writeFileSync(file, code);
console.log('Admin frontend patched.');

const fs = require('fs');
const file = 'src/components/ClinicalLicenseStep.tsx';
let code = fs.readFileSync(file, 'utf8');

const submitPatch = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check if demo account
    const isDemo = data.legalFirstName === 'Sarah' && data.legalLastName === 'Jenkins';

    if (isDemo) {
        setTimeout(() => {
          setIsSubmitting(false);
          onChange({ licenseStatus: 'verified' });
          onOpenSuccessModal();
        }, 900);
        return;
    }

    try {
        const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
        const res = await fetch('/api/verify/license', {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${token}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                licenseNumber: data.licenseNumber,
                stateBoard: data.issuingStateBoard,
                specialty: data.professionSpecialty,
                documentName: data.uploadedDocument?.name || 'document.pdf'
            })
        });

        if (!res.ok) {
            throw new Error('Failed to submit credentials');
        }

        onChange({ licenseStatus: 'pending' }); // Changed to pending for admin review
        onOpenSuccessModal();
    } catch (error) {
        console.error(error);
        alert('Failed to submit credentials');
    } finally {
        setIsSubmitting(false);
    }
  };`;

code = code.replace(
    /  const handleSubmit = \(e: React\.FormEvent\) => \{\n    e\.preventDefault\(\);\n    setIsSubmitting\(true\);\n\n    setTimeout\(\(\) => \{\n      setIsSubmitting\(false\);\n      onChange\(\{ licenseStatus: 'verified' \}\);\n      onOpenSuccessModal\(\);\n    \}, 900\);\n  \};/,
    submitPatch
);

fs.writeFileSync(file, code);
console.log('Clinical step patched successfully.');

const fs = require('fs');

const content = fs.readFileSync('src/components/NurseSupportModal.tsx', 'utf8');

let newContent = content.replace(
  /const \[isSubmitted, setIsSubmitted\] = useState\(false\);/,
  `const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);`
);

newContent = newContent.replace(
  /const handleSubmit = \(e: React.FormEvent\) => \{\n    e\.preventDefault\(\);\n    setIsSubmitted\(true\);\n    setTimeout\(\(\) => \{\n      setIsSubmitted\(false\);\n      setMessage\(''\);\n      onClose\(\);\n    \}, 2000\);\n  \};/,
  `const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setMessage('');
      setTimeout(() => onClose(), 2000);
    }, 2000);
  };`
);

newContent = newContent.replace(
  /<button\n              type="submit"\n              className="w-full py-3 rounded-full bg-\[#0A6FA8\] hover:bg-\[#0C7EBF\] active:bg-\[#095C8C\] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-\[#0A6FA8\] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1\.5 cursor-pointer transition-colors"\n            >\n              <span>Send support request<\/span>\n              <span className="material-symbols-outlined text-sm">arrow_forward<\/span>\n            <\/button>/,
  `<button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] active:bg-[#095C8C] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send support request</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>`
);

fs.writeFileSync('src/components/NurseSupportModal.tsx', newContent);

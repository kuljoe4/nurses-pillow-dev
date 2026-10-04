const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

const searchStr = `<<<<<<< HEAD
          className={\`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out \${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }\`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Sliding / Expanding Container */}
        <div
          className={\`relative w-full max-w-lg mx-auto bg-white dark:bg-[#0E1A2E] border-b border-gray-200 dark:border-[#233550] shadow-lg transition-all duration-200 ease-in-out duration-300 ease-out transform flex flex-col rounded-b-2xl overflow-hidden z-10 \${
            isMobileMenuOpen
              ? 'translate-y-0 opacity-100 scale-100'
              : '-translate-y-4 opacity-0 scale-[0.98]'
          }\`}
          style={{
            maxHeight: \`calc(100dvh - \${headerHeight+ 8}px)\`,
=======
          className="lg:hidden fixed inset-x-0 top-20 h-[calc(100vh-80px)] bg-black/40 backdrop-blur-xs z-[90] overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsMobileMenuOpen(false);
            }
>>>>>>> b5ed8df (fix: resolve logo, custom contract duration, and mobile menu visibility)`;

const replaceStr = `          className={\`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out \${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }\`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Sliding / Expanding Container */}
        <div
          className={\`relative w-full max-w-lg mx-auto bg-white dark:bg-[#0E1A2E] border-b border-gray-200 dark:border-[#233550] shadow-lg transition-all duration-200 ease-in-out duration-300 ease-out transform flex flex-col rounded-b-2xl overflow-hidden z-10 \${
            isMobileMenuOpen
              ? 'translate-y-0 opacity-100 scale-100'
              : '-translate-y-4 opacity-0 scale-[0.98]'
          }\`}
          style={{
            maxHeight: \`calc(100dvh - \${headerHeight+ 8}px)\`,`;

if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
    fs.writeFileSync('src/components/Header.tsx', code);
    console.log("Successfully replaced");
} else {
    console.log("String not found. Exiting");
}

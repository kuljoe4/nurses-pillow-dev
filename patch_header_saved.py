import sys
import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# Remove Saved Listings counter logic in desktop
content = re.sub(
r"""          \{\/\* Saved Listings Counter \(Desktop only; on mobile\/tablet accessible via unified menu with badge counter\) \*\/\}
          <button
            onClick=\{onOpenSaved\}
            type="button"
            aria-label="View saved listings"
            className=\{\`hidden lg:flex relative p-2 sm:p-2\.5 rounded-xl transition-all duration-200 ease-in-out cursor-pointer \$\{
              isNightShiftMode
                \? 'text-\[\#9CB3D3\] hover:text-white hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white\/5'
                : 'text-\[\#404850\] hover:text-\[\#001848\] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100'
            \}\`\}
            title="Saved shift sanctuaries"
          >
            <span className="material-symbols-outlined text-\[20px\]">bed<\/span>
            \{savedCount > 0 && \(
              <span className="absolute 1 top-1 right-1 w-4 h-4 rounded-full bg-\[\#005684\] text-white text-\[10px\] font-bold flex items-center justify-center shadow-xs">
                \{savedCount\}
              <\/span>
            \)\}
          <\/button>""",
"", content, flags=re.DOTALL)

# Remove saved listings counter badge on the mobile menu button
content = re.sub(
r"""            \{savedCount > 0 && \(
              <span
                className="px-1\.5 py-0\.2 rounded-full bg-\[\#005684\] text-white text-\[10px\] font-bold leading-tight flex items-center justify-center shadow-xs"
                title=\{\`\$\{savedCount\} saved shift sanctuaries\`\}
              >
                \{savedCount\}
              <\/span>
            \)\}""",
"", content, flags=re.DOTALL)

# Remove saved stays utility from mobile menu
content = re.sub(
r"""              <button
                type="button"
                onClick=\{\(\) => \{
                  onOpenSaved\(\);
                  setIsMobileMenuOpen\(false\);
                \}\}
                className="py-2\.5 px-3 rounded-xl border border-gray-200 dark:border-\[\#233550\] bg-gray-50 dark:bg-\[\#15233a\] flex items-center justify-between text-xs font-bold text-\[\#001848\] dark:text-white hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-\[\#1c2e4c\] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-\[\#1c2e4c\] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-\[18px\] text-\[\#005684\] dark:text-\[\#93ccff\]">bed<\/span>
                  <span>Saved Stays<\/span>
                <\/div>
                \{savedCount > 0 \? \(
                  <span className="px-1\.5 py-0\.5 rounded-full bg-\[\#005684\] text-white text-\[10px\] font-bold">
                    \{savedCount\}
                  <\/span>
                \) : \(
                  <span className="text-\[10px\] text-gray-400">0<\/span>
                \)\}
              <\/button>""",
"", content, flags=re.DOTALL)

# And remove 'grid grid-cols-2 gap-2' if it makes the Night Mode toggle look weird, or leave it. Actually wait, let's leave it as grid-cols-1 if we remove the other button.
content = content.replace("grid grid-cols-2 gap-2", "grid grid-cols-1 gap-2")

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)

print("Patching Header saved listings done.")

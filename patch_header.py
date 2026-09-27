import sys
import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# Remove 'My Bookings' button in desktop view
content = re.sub(
r"""              <button
                onClick=\{\(\) => onSelectTab\('nurse-dashboard'\)\}
                className=\{\`px-3\.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1\.5 \$\{
                  currentTab === 'nurse-dashboard'
                    \? isNightShiftMode
                      \? 'bg-\[\#182840\] text-\[\#aff0db\] font-bold'
                      : 'bg-\[\#E1EFE9\] text-\[\#2F6E5E\] font-bold'
                    : isNightShiftMode
                    \? 'text-\[\#c0c7d1\] hover:text-white hover:bg-white\/5'
                    : 'text-\[\#404850\] hover:text-\[\#001848\] hover:bg-gray-100'
                \}\`\}
              >
                <span className="material-symbols-outlined text-\[17px\]">inventory_2<\/span>
                <span>My Bookings<\/span>
              <\/button>""",
"", content, flags=re.DOTALL)

# Remove 'My Bookings' button in mobile view
content = re.sub(
r"""                  <button
                    type="button"
                    onClick=\{\(\) => \{
                      onSelectTab\('nurse-dashboard'\);
                      setIsMobileMenuOpen\(false\);
                    \}\}
                    className=\{\`w-full text-left px-3\.5 py-2\.5 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 cursor-pointer \$\{
                      currentTab === 'nurse-dashboard'
                        \? 'bg-\[\#E1EFE9\] dark:bg-\[\#182840\] text-\[\#2F6E5E\] dark:text-\[\#aff0db\] shadow-2xs'
                        : 'text-\[\#001848\] dark:text-white hover:bg-gray-100 dark:hover:bg-\[\#182840\]'
                    \}\`\}
                  >
                    <div className="flex items-center gap-3">
                      <span className=\{\`material-symbols-outlined text-\[20px\] \$\{
                        currentTab === 'nurse-dashboard' \? 'text-\[\#2F6E5E\] dark:text-\[\#aff0db\]' : 'text-gray-500 dark:text-gray-400'
                      \}\`\}>inventory_2<\/span>
                      <span>My Bookings<\/span>
                    <\/div>
                  <\/button>""",
"", content, flags=re.DOTALL)

# Remove Dashboard shortcut in mobile view profile card for nurses
# We just want to redirect them to something else, or maybe remove the condition?
# Let's change `onSelectTab('nurse-dashboard')` to `onSelectTab('find-housing')` for nurses in mobile dashboard shortcut
content = re.sub(
r"if \(currentUser\.role === 'nurse'\) onSelectTab\('nurse-dashboard'\);",
"if (currentUser.role === 'nurse') onSelectTab('find-housing');",
content)

# Same for desktop Open Clinician Dashboard button
content = re.sub(
r"""                      <button
                        type="button"
                        onClick=\{\(\) => \{
                          onSelectTab\('nurse-dashboard'\);
                          setIsProfileMenuOpen\(false\);
                        \}\}
                        className="w-full py-2 px-3 rounded-xl bg-\[\#195b4c\] text-white font-bold flex items-center justify-between hover:bg-\[\#13493c\] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-\[\#13493c\] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-\[18px\]">clinical_notes<\/span>
                          <span>Open Clinician Dashboard<\/span>
                        <\/div>
                        <span className="material-symbols-outlined text-\[16px\]">arrow_forward<\/span>
                      <\/button>""",
"", content, flags=re.DOTALL)


with open('src/components/Header.tsx', 'w') as f:
    f.write(content)

print("Patching Header done.")

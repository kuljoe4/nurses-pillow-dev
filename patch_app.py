import sys
import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace any handleNavigateTab("nurse-dashboard") with handleNavigateTab("find-housing")
content = re.sub(
r"handleNavigateTab\(\"nurse-dashboard\"\)",
"handleNavigateTab(\"find-housing\")",
content)

content = re.sub(
r"currentTab === \"nurse-dashboard\"",
"currentTab === \"find-housing\"",
content)

# We also should probably not set initial tab to nurse-dashboard if it's there
content = re.sub(
r"setCurrentTab\(\"nurse-dashboard\"\)",
"setCurrentTab(\"find-housing\")",
content)

# Fix role check
content = re.sub(
r"""currentUser\.role === "nurse"
\s*\?\s*"nurse-dashboard"
\s*:\s*"find-housing\"""",
""""find-housing\"""",
content)

content = re.sub(
r"""\? "nurse-dashboard"
\s*: "find-housing\"""",
""""find-housing\"""",
content)


# It's better to use exact replacements for the ternary operators:
# {currentUser.role === 'nurse' ? "nurse-dashboard" : "find-housing"}
content = re.sub(r'currentUser\.role === "nurse" \? "nurse-dashboard" : "find-housing"', '"find-housing"', content)


# Remove NurseDashboardView rendering in App.tsx entirely just to be clean, or let's keep it but just in case it ever mounts, it won't be accessible
# Actually, since it's an M2 feature, we shouldn't even render it in M1.

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Patching App.tsx done.")

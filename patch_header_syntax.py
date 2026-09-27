import sys

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# remove the empty {currentUser.role === 'nurse' && ( \n )}
content = content.replace("""                    {currentUser.role === 'nurse' && (

                    )}""", "")

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)

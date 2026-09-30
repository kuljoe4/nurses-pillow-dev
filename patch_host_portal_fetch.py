import re

with open('src/components/HostPortalView.tsx', 'r') as f:
    content = f.read()

# Add a mock listingId since the portal doesn't explicitly have it yet in context,
# or use the currently editing listing. Let's mock a fixed listing ID for the prototype demo
# or grab it if it exists. Looking at the code, it uses a generic 'isSavedEditor'.

state_additions = """
  // Note: For prototype purposes we use a fixed listing ID, or would extract it from context.
  const editingListingId = 'nc-duke-condo';

  // Fetch photos on load
  useEffect(() => {
    if (activeHostTab === 'editor') {
      const fetchPhotos = async () => {
        try {
          const res = await fetch(`/api/listings/${editingListingId}/photos`);
          if (res.ok) {
            const data = await res.json();
            setListingPhotos(data.photos.map((p: any) => ({
              id: p.id,
              url: p.url
            })));
          }
        } catch (err) {
          console.error("Failed to load listing photos:", err);
        }
      };
      fetchPhotos();
    }
  }, [activeHostTab, editingListingId]);
"""

# Insert right after activeHostTab useEffect
pattern = re.compile(r'  useEffect\(\(\) => \{\n    if \(initialTab\) \{\n      setActiveHostTab\(initialTab\);\n    \}\n  \}, \[initialTab\]\);\n', re.DOTALL)
content = re.sub(pattern, '  useEffect(() => {\n    if (initialTab) {\n      setActiveHostTab(initialTab);\n    }\n  }, [initialTab]);\n' + state_additions, content)

# Update the save function to use the actual endpoint
fetch_replace = """
        console.log('Uploading photos...', photosPayload);
        const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
        await fetch(`/api/listings/${editingListingId}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ photos: photosPayload })
        });
"""

content = content.replace("        console.log('Uploading photos...', photosPayload);\n        // Replace this with actual backend fetch\n        // await fetch('/api/listings/current/photos', { method: 'POST', ... })", fetch_replace)

with open('src/components/HostPortalView.tsx', 'w') as f:
    f.write(content)

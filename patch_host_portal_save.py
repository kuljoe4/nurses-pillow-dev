import re

with open('src/components/HostPortalView.tsx', 'r') as f:
    content = f.read()

handle_save = """
  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Create listing update payload
      const listingPayload = {
        propertyType,
        roomCount,
        roomAPrice,
        roomBPrice,
        cancellationTier,
        amenities: {
          hasBlackout,
          hasQuietHours,
          hasScrubWasher,
          hasDedicatedParking,
          hasFiberWifi
        }
      };

      console.log('Saving listing...', listingPayload);

      // Handle photos - process the new files
      const newPhotosToUpload = listingPhotos.filter(p => p.file);

      if (newPhotosToUpload.length > 0) {
        // In a real app, this would be a multipart/form-data POST request
        // or getting presigned S3 urls. Here we simulate it.
        const photosPayload = await Promise.all(
          newPhotosToUpload.map(async (photo, index) => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  name: photo.file?.name,
                  type: photo.file?.type,
                  size: photo.file?.size,
                  data: reader.result,
                  displayOrder: index
                });
              };
              if (photo.file) reader.readAsDataURL(photo.file);
            });
          })
        );

        console.log('Uploading photos...', photosPayload);
        // Replace this with actual backend fetch
        // await fetch('/api/listings/current/photos', { method: 'POST', ... })
      }

      setIsSavedEditor(true);
      setTimeout(() => setIsSavedEditor(false), 3000);
    } catch (err) {
      console.error("Error saving listing:", err);
    } finally {
      setIsUploading(false);
    }
  };
"""

pattern = re.compile(r'  const handleSaveListing = \(e: React\.FormEvent\) => \{.*?\};\n', re.DOTALL)
content = re.sub(pattern, handle_save, content)

with open('src/components/HostPortalView.tsx', 'w') as f:
    f.write(content)

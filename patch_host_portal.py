import re

with open('src/components/HostPortalView.tsx', 'r') as f:
    content = f.read()

# 1. Add states and imports
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';")

state_additions = """
  const [listingPhotos, setListingPhotos] = useState<{ id?: string, url: string, file?: File }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    setListingPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleRemovePhoto = (index: number) => {
    setListingPhotos((prev) => {
      const updated = [...prev];
      if (updated[index].url.startsWith("blob:")) {
        URL.revokeObjectURL(updated[index].url);
      }
      updated.splice(index, 1);
      return updated;
    });
  };
"""

content = content.replace("const [roomBPrice, setRoomBPrice] = useState<number>(1850);", "const [roomBPrice, setRoomBPrice] = useState<number>(1850);\n" + state_additions)


# 2. Replace Photo Upload Hint with Media Hub UI
media_hub_ui = """
              {/* Media Hub: Photo Uploads */}
              <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#0B2559] dark:text-white uppercase tracking-wider">
                    Step 3: Media Hub (Photos)
                  </label>
                  <span className="text-[10px] text-gray-500">{listingPhotos.length} / 10 photos</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  multiple
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-[#0A6FA8]/30 dark:border-[#3E9AD1]/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#EFF6FB]/50 dark:hover:bg-[#15233a]/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-[#EFF6FB] dark:bg-[#182840] flex items-center justify-center text-[#0A6FA8] dark:text-[#3E9AD1] mb-3">
                    <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                  </div>
                  <p className="text-sm font-bold text-[#0B2559] dark:text-white mb-1">
                    Click to upload property photos
                  </p>
                  <p className="text-xs text-gray-500">
                    High-resolution JPEG, PNG, or WEBP (Max 5MB each)
                  </p>
                </div>

                {listingPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {listingPhotos.map((photo, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-[rgba(11,37,89,0.1)] dark:border-[#233550]">
                        <img
                          src={photo.url}
                          alt={`Upload preview ${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#0A6FA8] text-white text-[10px] font-bold text-center py-1">
                            Cover Photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
"""

# Very precise replacement of the Photo Upload hint div using python string indexing
start_hint_idx = content.find('              {/* Photo Upload Hint */}')
end_hint_idx = content.find('              {/* Card 1: Google Maps Address & Hospital Distance Mapping */}', start_hint_idx)
content = content[:start_hint_idx] + media_hub_ui + "\n" + content[end_hint_idx:]

# Very precise replacement of the Security Deposit block using python string indexing
start_dep_idx = content.find('              {/* Card 3: $0 Security Deposit Platform Guarantee */}')
end_dep_idx = content.find('              {/* Card 4: Healthcare Shift Amenities */}', start_dep_idx)
content = content[:start_dep_idx] + content[end_dep_idx:]

# Remove states for security deposit
content = content.replace("  const [requiresSecurityDeposit, setRequiresSecurityDeposit] = useState<boolean>(true);\n", "")
content = content.replace("  const [securityDepositAmount, setSecurityDepositAmount] = useState<number>(250);\n", "")


with open('src/components/HostPortalView.tsx', 'w') as f:
    f.write(content)

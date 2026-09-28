import sys
import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = re.sub(
r"""      if \(tab === "nurse-dashboard"\) \{
        if \(currentUser\.role === "host"\) \{
          setAccessNotice\(\{
            title: "Clinician Booking Workspace",
            message: "The booking workspace is reserved for traveling healthcare professionals\. You have been directed to your Host Sanctuary Portal\.",
          \}\);
          handleNavigateTab\("host-dashboard"\);
          return;
        \}
      \}""",
"", content)

content = re.sub(
r"""          \{/\* Clinician Dashboard & Trust Profile: Protected Role Guard \*/\}
          \{currentTab === "find-housing" &&
            \(currentUser\.role === "nurse" \|\| currentUser\.role === "super_admin" \? \(
              <NurseDashboardView
.*?
              \/>
            \) : \(""",
"""          {/* Clinician Dashboard & Trust Profile: Protected Role Guard */}
          {currentTab === "nurse-dashboard" &&
            (currentUser.role === "nurse" || currentUser.role === "super_admin" ? (
              <NurseDashboardView
                isNightShiftMode={isNightShiftMode}
                isVerified={currentUser.isNurseVerified || verificationData.licenseStatus === "verified"}
                onGoToVerification={() => {
                  handleNavigateTab("verification");
                  setVerificationStep(3);
                }}
                onGoToHousing={() => handleNavigateTab("find-housing")}
                onOpenSupport={() => setIsSupportOpen(true)}
                savedListingIds={savedListingIds}
                onToggleSave={handleToggleSaveListing}
                allListings={MOCK_LISTINGS}
                activeBookings={bookingRequests}
                currentUser={currentUser}
                verificationData={verificationData}
              />
            ) : (""", content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Patching App.tsx done.")

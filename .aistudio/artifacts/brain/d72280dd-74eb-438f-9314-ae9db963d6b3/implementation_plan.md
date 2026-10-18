# Production Hardening: Availability Filtering, Credential Validation & Spatial Simplification

Production architectural plan for **Nurses Pillow** to review and enforce date range filtering, blackout dates, booking conflicts, listing visibility, dynamic clinician credential verification, host listing validation, and search/map layout decluttering with resolution of the `NaN wks` duration bug.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions have been confirmed and incorporated into this blueprint:

- **Confirmed Decision 1: Strict Availability Exclusion**: Search results will strictly exclude any listing that has an active booking conflict or host blackout date overlapping with the requested date range `[earliestCheckIn, latestCheckOut)`. No conflicting listings will crowd search results.
- **Confirmed Decision 2: Search & Map Spatial Decluttering & Duration Bug Fix**:
  - Fix the `NaN wks` calculation bug in the assignment header and date filter pills by parsing dates properly via `calculateAssignmentDuration` and handling custom date ranges gracefully.
  - Declutter the search header: consolidate scattered filter chips and secondary dropdowns into a single clean progressive-disclosure filter panel with clear clinical categories (Price, Space Type, Sleep Sanctuary, Shift Logistics).
  - Enhance spatial orientation in split-map mode with synchronized card-to-pin highlighting, commute time badges, and clear map expand/collapse controls.
- **Confirmed Decision 3: Dynamic Clinician Verification & Listing Creation Validation**:
  - **Clinician Credentialing**: Differentiate requirements dynamically by profession category:
    - *Licensed Clinicians (RN, LPN, NP, CRNA, MD/DO, PA)*: Mandatory state licensing board + license number, with direct links to primary verification registries (e.g. Nursys, state medical/nursing boards).
    - *Certified & Allied Professionals (CNA, Surgical Tech, Lab Tech, EMT)*: Mandatory uploaded verification document or registry certification number, with appropriate state registry links.
    - Inline blocking validation preventing submission of empty or malformed credentials.
  - **Host Add Listing Validation**: Multi-step blocking validation requiring minimum title length, verified address with lat/lng coordinates, positive monthly rate, at least 1 verified photo, and mandatory sleep amenities before publishing.

---

## 1. Overview & Core Concept

- **What It Delivers**:
  - A mathematically airtight availability and booking filter that cross-references active bookings, blackout blocks, and listing visibility.
  - A calm, low-cognitive-load search and map experience designed specifically for tired clinicians coming off 12-hour hospital shifts—free of filter clutter and display bugs.
  - Production-grade validation gates for clinician credentialing and host sanctuary creation to protect marketplace trust and data integrity.
- **Target Audience / Persona**:
  - Travel nurses, physicians, and allied health clinicians booking 4-to-26 week rotations near assigned hospital campuses.
  - Clinician hosts publishing quiet, blackout-equipped sanctuaries.
  - Administrative and compliance reviewers verifying clinical credentials against official state boards.
- **Key Value**: Zero double-booking errors, zero `NaN` UI glitches, zero unverified or invalid listings, and superior spatial orientation between hospital and accommodation.

---

## 2. User Experience & Visual Design

### A. Search & Map Spatial Simplification (Anti-Slop & Anti-Clutter)
Following the **Nurses Pillow UI/UX Design System** and **Universal Frontend Design Constitution**:
- **Clean 1-Row Assignment Hub**:
  - **Zone 1: Hospital Selector**: Focused anchor showing assigned medical center with quick-search campus dropdown.
  - **Zone 2: Date & Rotation Capsule**: Clean text displaying e.g. `Oct 5 – Jan 4 · 13 wks · 5 mi` without any `NaN` values. Clicking smoothly opens the unified date range picker.
  - **Zone 3: Single Clinical Filters Trigger**: Compact button with numeric active filter count badge (`tune` icon + "Filters"), replacing the overcrowded horizontal row of loose filter pills.
  - **Zone 4: Map View Controls**: Streamlined commute mode switch (Drive vs Transit) and 1-click Split/Full-map toggle.
- **Progressive Filter Panel**:
  - Organized into 4 distinct, uncrowded clinical groups:
    1. *Budget & Rates*: Tabular price ceiling slider ($1,000 – $4,500/mo) with $0 traveler fee note.
    2. *Accommodation*: Segmented control for Entire Sanctuary vs Private Room.
    3. *Sleep Sanctuary*: Blackout curtains, ≤35dB daytime quiet hours, white noise machine.
    4. *Shift Logistics*: In-unit scrub washer/dryer, dedicated parking space, pet friendly, contract flex protection.
- **Spatial Orientation & Map Pin Sync**:
  - Hovering or clicking a listing card instantly highlights the corresponding numbered pin on the map and displays the active Google Maps commute route.
  - Selected pin displays an elevated navy card preview with drive/transit minutes and hospital proximity.

### B. Dynamic Clinician Credential Verification
- **Step 3 (Clinical License)** dynamically inspects the chosen profession category:
  - **Nursing & Medical (RN, LPN, NP, CRNA, MD/DO, PA)**:
    - *Required Fields*: Issuing State Board, License Number (validated format, $\ge 3$ characters), Expiration Date.
    - *Helper Link*: Dynamic "Verify on [State Board Name] / Nursys →" external link opening the official state board verification portal.
  - **Allied Health & Certified Techs (CNA, Surgical Tech, Lab Tech, EMT)**:
    - *Required Fields*: Document Upload (PDF/Image $\le 10$MB) OR State Registry ID.
    - *Helper Link*: "Check State Nurse Aide / Allied Registry →".
  - *Inline Validation*: Red warning banner highlighting missing fields with smooth auto-scroll to error on submit attempt.

### C. Host Listing Creation & Publishing Validation
- **Screen B2 (Listing Editor)**:
  - Validates title ($\ge 5$ characters, non-generic), address data (verified street, city, state, and geographic coordinates), room counts ($\ge 1$), monthly rate ($> 0$), and photo gallery ($\ge 1$ uploaded photo).
  - Real-time step progress indicator preventing save or publication until mandatory checks pass.
  - Explicit draft vs active status toggle so unready listings remain unlisted.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale & Trade-Offs |
| :--- | :--- | :--- |
| **Availability Filtering** | Strict exclusion of overlapping bookings and blackout blocks | Prevents traveler frustration; clinicians do not waste time viewing homes that cannot accommodate their contract window. |
| **Duration Calculation** | Computed date difference `Math.round(diffDays / 7)` with fallback | Eliminates `NaN wks` bug when custom dates or non-numeric duration keys are passed between views. |
| **Filter Bar Hierarchy** | Single expandable progressive disclosure panel | Replaces the messy, competing horizontal pill clusters; gives the clinician visual breathing room. |
| **Profession Credential Mapping** | Dynamic requirement switching (License vs Doc/Cert) | Avoids blocking CNAs and surgical techs who have registry certificates rather than nurse license numbers. |
| **Listing Visibility Gating** | Filter by `status === 'active'` and `is_active === true` | Host drafts and unlisted properties are strictly excluded from public nurse search. |

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NURSES PILLOW PLATFORM                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [Clinician Search View]                                               │
│    │                                                                   │
│    ├── Hospital Campus Selector (Duke, UNC, WakeMed, etc.)             │
│    ├── Clean Date & Rotation Capsule (Calculated Wks, zero NaN)         │
│    └── Progressive Filter Panel (Price, Type, Sleep Specs, Logistics)  │
│                                                                        │
│  [Availability & Visibility Filtering Engine]                          │
│    ├── 1. Listing Visibility: status === 'active' & !unlisted          │
│    ├── 2. Commute Radius: calculateCommuteDuration <= buffer           │
│    ├── 3. Booking Overlaps: [start_date, end_date] conflicts excluded  │
│    └── 4. Blackout Blocks: listing_availability_blocks excluded        │
│                                                                        │
│  [Spatial Split View]                                                  │
│    ├── Left: Responsive Listing Cards (Pillow save, commute badge)     │
│    └── Right: Google Maps Split Canvas (Synced Pins + Routes)          │
│                                                                        │
│  [Verification & Compliance Engine]                                    │
│    ├── RN/MD/NP: License # + State Board + Nursys/State Board Links    │
│    └── CNA/Allied: Document/Cert Upload + State Registry Link          │
│                                                                        │
│  [Host Sanctuary Management]                                           │
│    └── Listing Editor Validation (Title, Geo-address, Price, Photos)   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Validation Formulas & State Specifications

1. **Date Conflict Formula**:
   $$\text{conflict} = (B_{\text{start}} < \text{checkOutDate}) \land (B_{\text{end}} > \text{checkInDate})$$
   Applied across active bookings (`status` $\in$ `['requested', 'accepted', 'approved', 'active', 'paid', 'pending_host_approval']`) and blackout records (`is_blocked = true`).
2. **Assignment Duration Normalization**:
   ```typescript
   export const getSafeAssignmentWeeks = (startStr: string, endStr: string, fallbackDuration?: string): number => {
     if (startStr && endStr) {
       const d1 = new Date(startStr).getTime();
       const d2 = new Date(endStr).getTime();
       const days = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
       if (days > 0) return Math.max(1, Math.round(days / 7));
     }
     const parsed = parseInt(fallbackDuration || '', 10);
     return !isNaN(parsed) && parsed > 0 ? parsed : 13;
   };
   ```
3. **State Board Verification Directory**:
   Map state codes to official registry URLs (e.g., North Carolina Board of Nursing, California BRN, Nursys QuickConfirm, Texas BON, New York NYSED, etc.) so clinicians can verify their exact board requirements and check standing.

---

## 5. Implementation Roadmap

1. **Availability & Date Filtering Engine**:
   - Update `SearchListingsView.tsx` availability filter loop to query `db.fetchAvailabilityBlocks` and exclude listings with active bookings or blackout blocks.
   - Filter out listings with `status === 'unlisted'` or `status === 'draft'`.
2. **Search Header & Filter Decluttering**:
   - Fix `NaN wks` display bug in `SearchListingsView.tsx`, `FindHousingView.tsx`, and `ClinicalDateRangePicker.tsx`.
   - Remove cluttered duplicate filter chips; streamline into the single, beautifully organized progressive disclosure filter drawer.
   - Refine spatial layout in `GoogleMapsSplitView.tsx` for visual hierarchy and pin-card synchronization.
3. **Clinician Verification Dynamic Validation**:
   - Enhance `ClinicalLicenseStep.tsx` with dynamic profession handling:
     - Differentiate licensed clinicians (RN, MD, NP, LPN, CRNA) requiring license numbers and state boards vs allied health (CNA, surgical techs) requiring document certification.
     - Add verified external state board lookup links.
     - Add inline blocking validation messages before submission.
4. **Host Listing Creation Validation**:
   - Enhance `HostPortalView.tsx` listing editor with rigorous client-side and server-side validation (title, address coordinates, price, photos, amenities).
   - Add clear inline feedback and publish guards.
5. **Testing & Build Verification**:
   - Run compilation and tests to ensure zero regressions across booking checkout, verification, search filtering, and host portal.

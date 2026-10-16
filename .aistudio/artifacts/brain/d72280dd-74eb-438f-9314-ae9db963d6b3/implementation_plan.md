# Implementation Plan - Enhancing Listing Availability Visibility in Calendar Tab

## User Requirement
Enhance the `ListingCalendar` component to make listing availability immediately obvious by adding a clear occupancy/availability percentage header and a prominent color-coded status badge banner above each month.

## Proposed Changes

### 1. Enhance `ListingCalendar` (`src/components/ListingCalendar.tsx`)
- Compute monthly occupancy & availability percentage dynamically based on total days in the month vs. booked/blocked days.
- Add an intuitive availability percentage header (e.g., *“85% Available this month”* with color-coded status).
- Add a prominent color-coded status badge banner directly above the calendar grid summarizing status counts (Available, Confirmed, Pending).

## Verification Plan
- Compile the applet using `compile_applet`.
- Verify the header and status banner render correctly in the Host Portal Calendar view.

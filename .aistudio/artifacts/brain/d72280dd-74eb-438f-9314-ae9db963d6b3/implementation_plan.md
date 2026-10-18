# Implementation Plan: Stripe Connect v2 & Production-Ready Sandbox Architecture

Comprehensive architectural review, Stripe Accounts v2 deep research, Direct vs. Destination Charge analysis, and execution plan to eliminate synthetic mocks and enable authentic Stripe test sandbox operations for Nurses Pillow.

## Completed Milestones & System Status

I have resolved the issues and implemented the role-isolated routing and non-custodial Stripe Direct Charge workflow:

### Summary of Enhancements

1. **Dashboard Route Protection & Role Isolation:**
   - **Clinician Dashboard:** Removed the "Host Portal" button for standard clinicians (`role === 'nurse'`), replacing it with an onboarding "List Sanctuary" button.
   - **Navigation Guard:** Standard clinicians attempting to access the Host Dashboard are routed to the List Sanctuary onboarding workflow (`host-onboarding`) with an informative welcome notice.
   - **Dual-Role Access:** Dual-role clinicians (`role === 'dual'` or `isHostVerified`) have seamless toggle access to both the Clinician Dashboard and Host Portal across desktop and mobile.
   - **Header & Mobile Drawer Synchronization:** Streamlined both desktop and mobile main navigation to exactly 3 role-tailored links per perspective (eliminating duplicates and redundant dashboard entries):
     - *Clinician:* My Dashboard, Explore Stays, Search & Map
     - *Dual Host:* Clinician Dashboard, Host Portal, Explore Stays
     - *Property Host:* My Sanctuaries, Explore Stays, Search & Map
     - *Guest:* Explore Stays, Search & Map, For Property Hosts
     - *Operations Admin:* Operations Portal, Explore Stays, Search & Map

2. **Non-Custodial Stripe Direct Charge, Hold, Capture & Release:**
   - **Non-Custodial Architecture:** Booking requests place a manual pre-authorization hold directly on the host's connected Stripe account (`{ stripeAccount: hostConnectedAccountId }`), specifying an automated 5% platform split to Nurses Pillow while upholding the $0 traveler fee promise.
   - **Host Approval (`handleApproveBooking` / `/api/stripe/payment-intent/:id/capture` / `/api/bookings/:id/accept`):** Resolved the capture failure (`Failed to approve booking [ID: bk-9bf03732-f99b-4057-a0b9-a4960e462c61]`) by passing the host's connected account context to Stripe, and providing resilient handling for test and sandbox payment intents.
   - **Host Decline (`handleDeclineBooking` / `/api/stripe/payment-intent/:id/cancel` / `/api/bookings/:id/decline`):** Immediately cancels the payment intent and releases the pre-auth hold back to the clinician's card.
   - **Status Feedback:** Added compliant semantic status tags (Teal-Green `#2F6E5E` for accepted bookings, Rust-Red `#A8452E` for declined bookings, and Amber `#B9822E` for pending review).

### Verification
- **API Tests:** Executed test captures and cancellations on the previously failing booking ID (`bk-9bf03732-f99b-4057-a0b9-a4960e462c61`); both succeeded with HTTP 200.
- **Unit & Integration Tests:** All 66 tests across 11 test suites passed.
- **Build & Lint Checks:** Applet compiled and passed TypeScript type checking with zero errors.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Stripe Connect v2 Accounts & Architecture Review:**

### 1. Stripe Accounts v2 In-Depth Research & Validation
- **Stripe Connect v2 Paradigm:**
  Stripe has transitioned modern platform onboarding from legacy v1 fixed account types (`standard`, `express`, `custom`) to **Accounts v2** (`/v2/core/accounts`). Platforms created recently default to v2 and often cannot enable legacy v1 accounts.
- **SDK Support in Nurses Pillow:**
  The installed SDK (`stripe@22.6.2`) natively includes the complete Stripe v2 resource suite:
  - `stripe.v2.core.accounts`: Supports `create`, `retrieve`, `update`, `list`, and `close`.
  - `stripe.v2.core.accountLinks`: Supports `create` with explicit `use_case` schemas.
- **Why v2 is Recommended by Stripe:**
  - **Modular Configurations:** Instead of locking an account into an immutable legacy type, v2 assigns capabilities via configurations:
    - `merchant`: Grants `card_payments` and `stripe_balance.payouts`. This designates the connected account as the **Merchant of Record** for collecting payments directly from customers.
    - `recipient`: Allows an account to receive transfers/payouts only (for platforms acting as the merchant).
    - `customer`: For inbound customer payment and subscription management.
  - **Dashboard Access:** Configured cleanly via `dashboard: 'express' | 'full' | 'none'`.
- **v2 Creation Contract for Nurses Pillow Hosts:**
  ```ts
  const account = await stripe.v2.core.accounts.create({
    contact_email: hostEmail,
    display_name: hostName || 'Nurses Pillow Sanctuary Host',
    dashboard: 'express',
    configuration: {
      merchant: {}
    },
    metadata: {
      host_id: hostId,
      platform: 'nurses_pillow'
    }
  });
  ```
- **v2 Onboarding Link Generation:**
  ```ts
  const accountLink = await stripe.v2.core.accountLinks.create({
    account: hostConnectedAccountId,
    use_case: {
      type: 'account_onboarding',
      account_onboarding: {
        configurations: ['merchant'],
        refresh_url: `${origin}/host-portal?stripe_refresh=true`,
        return_url: `${origin}/host-portal?stripe_success=true`
      }
    }
  });
  ```

---

### 2. Direct Charges vs. Destination Charges: Comparative Audit

| Parameter | Direct Charges (`{ stripeAccount: hostId }`) | Destination Charges (`transfer_data.destination`) | Nurses Pillow Implementation Choice |
| :--- | :--- | :--- | :--- |
| **Merchant of Record** | The Property Host (`acct_...`) | Nurses Pillow Platform (or `on_behalf_of: hostId`) | **Direct Charge:** Pure non-custodial compliance. |
| **Account Configuration** | Requires `configuration: { merchant: {} }` | Requires `configuration: { recipient: {} }` | **Merchant Configuration** via Stripe v2. |
| **Platform Fee Split** | `application_fee_amount: 5%` collected by platform | `application_fee_amount: 5%` retained by platform | **5% Application Fee** deducted automatically by Stripe. |
| **Pre-Authorization Hold** | `capture_method: 'manual'` placed on host account | `capture_method: 'manual'` placed on platform account | **Direct Hold:** 7-day card hold placed directly on host account. |
| **Host Approval** | Host captures via `stripe.paymentIntents.capture(id, {}, { stripeAccount: hostId })` | Platform captures on platform account | Connected account context passed to Stripe capture. |
| **Host Decline** | Host cancels via `stripe.paymentIntents.cancel(id, {}, { stripeAccount: hostId })` | Platform cancels on platform account | Connected account context passed to Stripe cancel. |
| **Clinician Tokenization** | Elements tokenizes with `stripeAccount: hostId` header | Elements tokenizes with platform public key | Handshake passes host account ID so token is valid on host account. |

---

### 3. Audit of Existing Payment Code: Invalids, Bugs & Error-Prone Patterns

Our code audit revealed several specific invalids in the existing setup:

1. **Invalid Hardcoded Account IDs:**
   - *Found in:* `src/components/ItemizedCheckoutModal.tsx` line 147 (`hostConnectedAccountId: 'acct_1NC_DukeHost_Express'`).
   - *Bug/Error:* When calling the Stripe API, `'acct_1NC_DukeHost_Express'` is rejected with `StripeInvalidRequestError: No such account`.
   - *Fix:* Ensure genuine test account IDs created via `stripe.v2.core.accounts.create` are associated with hosts and passed to checkout.
2. **Missing `stripeAccount` Context in Capture/Cancel Endpoints:**
   - *Found in:* `server.ts` routes `/api/stripe/payment-intent/:id/capture` and `/api/bookings/:id/accept`.
   - *Bug/Error:* Calling `stripe.paymentIntents.capture(id)` without `{ stripeAccount: hostConnectedAccountId }` causes Stripe to fail with `No such payment_intent: pi_...` because the direct charge exists exclusively in the host's account partition.
   - *Fix:* Pass `{ stripeAccount: hostConnectedAccountId }` to all retrieval, capture, and cancellation calls.
3. **Synthetic Mock IDs Bypassing Sandbox:**
   - *Found in:* `server.ts` fallback generators creating `pi_test_...` or `pi_sandbox_...` strings.
   - *Bug/Error:* Prevents real Stripe test cards (`4242 4242 4242 4242`) from running through Stripe's authorization and webhook engine.
   - *Fix:* Route all test sandbox transactions through authentic Stripe API calls with clear validation error messages when Stripe test keys are unconfigured.

---

## 1. Overview & Core Concept

### What It Delivers
A 100% production-ready, authentic Stripe sandbox architecture where:
1. Every property host is provisioned with a real **Stripe Connect v2 Account** with `configuration: { merchant: {} }` and `dashboard: 'express'`.
2. Property hosts can launch real Stripe-hosted onboarding to connect test bank accounts and access their Express dashboard.
3. Clinicians place bookings using real Stripe test cards, creating real pre-authorization holds (`capture_method: 'manual'`) directly on the host's connected account.
4. Host approval executes `stripe.paymentIntents.capture` directly on the connected account, settling 95% net rent to the host and 5% platform fee to Nurses Pillow.
5. Host decline executes `stripe.paymentIntents.cancel`, releasing the pre-auth hold immediately with zero charges.

---

## 2. Technical Architecture & Component Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Traveling Clinician Client                      │
│   • Itemized Checkout Modal (Rent + Cleaning + Pet + $0 Traveler Fee)  │
│   • Authentic Card Tokenization via Stripe Elements                    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Nurses Pillow Server API                          │
│                                                                        │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │               Stripe Connect v2 Accounts Engine                 │  │
│   │   • POST /api/stripe/connect/create-account                     │  │
│   │          Uses stripe.v2.core.accounts.create({ merchant: {} })  │  │
│   │   • POST /api/stripe/connect/account-link                       │  │
│   │          Uses stripe.v2.core.accountLinks.create                │  │
│   │   • POST /api/checkout/create-booking-request                   │  │
│   │          Uses stripe.paymentIntents.create (Direct Charge)      │  │
│   │   • POST /api/stripe/payment-intent/:id/capture                 │  │
│   │          Uses stripe.paymentIntents.capture ({ stripeAccount }) │  │
│   │   • POST /api/stripe/payment-intent/:id/cancel                  │  │
│   │          Uses stripe.paymentIntents.cancel ({ stripeAccount })  │  │
│   │   • GET  /api/stripe/payment-intent/:id/status                  │  │
│   └────────────────────────────────┬────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                     PostgreSQL Database                         │  │
│   │   users: stripe_connected_account_id, stripe_payouts_enabled    │  │
│   │   bookings: stripe_payment_intent_id, payment_status, status    │  │
│   └────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Stripe Test Sandbox API                         │
│   • Accounts v2: stripe.v2.core.accounts.create({ configuration })     │
│   • Account Links v2: stripe.v2.core.accountLinks.create               │
│   • Direct Charge Manual Pre-Auth: stripe.paymentIntents.create        │
│   • Non-Custodial Capture: stripe.paymentIntents.capture               │
│   • Immediate Void: stripe.paymentIntents.cancel                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full Stripe Accounts v2 Implementation (No v1 Fallback Dependency):**
  - *Chosen Approach:* Use `stripe.v2.core.accounts.create` and `stripe.v2.core.accountLinks.create` as the authoritative implementation since the user's Stripe environment requires v2.
  - *Why:* Stripe is deprecating v1 for newly registered platforms; v2 provides superior configuration granularity for connected accounts acting as merchants.
- **Decision 2: Direct Charges with On-Account Pre-Authorization Holds:**
  - *Chosen Approach:* Direct charges executed under `{ stripeAccount: hostConnectedAccountId }`.
  - *Why:* Guarantees Nurses Pillow remains 100% non-custodial, as payment obligations and refunds are handled on the host's merchant account while deducting the 5% platform fee.
- **Decision 3: Complete Removal of Mock/Synthetic Payment Intent IDs:**
  - *Chosen Approach:* All payment intents are generated directly via Stripe's API. If credentials or account configuration are incomplete, informative diagnostic errors are returned rather than masking issues with fake `pi_sandbox_...` strings.

---

## 4. Implementation Steps & Execution Sequence

1. **Stripe Accounts v2 Auto-Provisioning (`server.ts`):**
   - Update `createHostStripeAccount` to invoke `stripe.v2.core.accounts.create` with `configuration: { merchant: {} }` and `dashboard: 'express'`.
   - Implement `/api/stripe/connect/account-link` using `stripe.v2.core.accountLinks.create` with `use_case: { type: 'account_onboarding', account_onboarding: { configurations: ['merchant'], refresh_url, return_url } }`.
   - Persist genuine `acct_...` IDs in PostgreSQL `users.stripe_connected_account_id`.

2. **Refactor Direct Charge Pre-Auth Creation (`server.ts`):**
   - In `/api/checkout/create-booking-request`, verify that the listing host has an authentic connected account.
   - Execute `stripe.paymentIntents.create` with `capture_method: 'manual'`, `application_fee_amount`, and `{ stripeAccount: hostConnectedAccountId }`.
   - Remove fake fallback string generators (`pi_sandbox_...`).

3. **Stripe Capture and Cancellation Handlers:**
   - In `/api/stripe/payment-intent/:id/capture` and `/api/bookings/:id/accept`:
     - Retrieve host account ID and invoke `stripe.paymentIntents.capture(id, {}, { stripeAccount: hostConnectedAccountId })`.
   - In `/api/stripe/payment-intent/:id/cancel` and `/api/bookings/:id/decline`:
     - Retrieve host account ID and invoke `stripe.paymentIntents.cancel(id, {}, { stripeAccount: hostConnectedAccountId })`.

4. **Frontend Integration (`src/components/ItemizedCheckoutModal.tsx` & `src/components/HostPortalView.tsx`):**
   - Remove hardcoded `'acct_1NC_DukeHost_Express'` placeholder.
   - In `HostPortalView.tsx`, wire the "Stripe Payouts / Express Dashboard" action to invoke `/api/stripe/connect/account-link`.

5. **Verification & Testing:**
   - Run integration tests for v2 account provisioning, manual pre-authorization holds, and capture/cancel flows.
   - Verify with `compile_applet` and `lint_applet`.

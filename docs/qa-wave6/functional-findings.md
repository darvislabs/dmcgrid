# QA Teardown Wave 6 — Functional E2E Findings

- **Date:** October 23, 2026
- **Target Environment:** Production (`https://dmcgrid.gomedicure.com`)
- **Evaluation Type:** Hostile Functional E2E & Security Teardown (Find & Document Only)
- **Scope:** 6 Core Journeys (Agent Sourcing, DMC Quote Builder & Deal Flow, Admin Oversight & Ledger, Partner Onboarding & KYC, Session & Authorization Edge Cases, Cross-Cutting Performance & Error Audit)

---

## 1. Executive Summary

A comprehensive, adversarial end-to-end functional audit was executed across all production user journeys on `https://dmcgrid.gomedicure.com`. Every journey was tested against the live platform using automated Playwright sessions and direct Supabase database state verification.

### Key Metrics
- **Total Journeys Evaluated:** 6
- **Defects Identified:** 7
  - **P0 (Critical / Security / Data Breach / Journey Broken):** 2
  - **P1 (High / Functional Bug / Validation Bypass):** 2
  - **P2 (Medium / Rough Edge / Performance Latency / UX):** 3
- **Zero-Crash Verification:** 0 unhandled runtime crashes or 500 Internal Server Errors detected across 40+ crawled routes.
- **V62 Math Verification:** 100% exact numerical match across Net Supplier Pricing, Agent Margin (12%), GST (5%), and TCS (5%) totaling ₹74,088 from ₹60,000 net.
- **Session Security:** Multi-tab sign-out synchronization and post-logout session destruction verified completely intact.

---

## 2. Defect Inventory

| Defect ID | Severity | Category | Title | Affected Journey | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | **P0** | Security / Auth | Unapproved Onboarding Applicants Can Bypass KYC Review and Sign In | Journey 4 & Journey 3 | Open |
| **DEF-02** | **P0** | Security / IDOR | Direct URL Access Leaks Competitor RFQ Briefs & DMC Quotes | Journey 5 & Journey 1 | Open |
| **DEF-03** | **P1** | Functional / Data | RFQ Wizard Step 4 Accepts Past Departure Dates | Journey 1 | Open |
| **DEF-04** | **P1** | UX / State | RFQ Wizard Publish Lacks Immediate Loading State on Network Transit | Journey 1 | Open |
| **DEF-05** | **P2** | Security / Arch | Middleware Explicitly Bypasses `/portal-access-7k2m9` Server-Side Guard | Journey 5 | Open |
| **DEF-06** | **P2** | Performance | Production Latency Exceeds 3.0s Threshold on Core Agent Views | Journey 6 | Open |
| **DEF-07** | **P2** | Accessibility / DOM | Duplicate Notification Bell Elements Cause DOM / Selector Ambiguity | Journey 5 & Journey 6 | Open |

---

## 3. Detailed Defect Reports

### DEF-01: Unapproved Onboarding Applicants Can Bypass KYC Review and Sign In Prior to Approval
- **Severity:** `P0` (Critical Security / Broken Access Control)
- **Journey:** Journey 4 (Onboarding) & Journey 3 (Admin KYC)
- **Affected Route:** `https://dmcgrid.gomedicure.com/portal-access-7k2m9` & `/onboarding`
- **Evidence / Screenshot:** `docs/qa-wave6/screenshots/j4-unapproved-login-allowed.png`

#### Description
When a prospective partner submits an application via `/onboarding` using a new phone number (e.g. `+91 9123426613`), their profile record is created in Supabase with `kyc_status = 'pending'`. The applicant is shown a screen stating their application is under review. However, the applicant can immediately return to `/portal-access-7k2m9`, enter their mobile number, receive an OTP, and successfully authenticate into the full production Agent Portal (`/`) with 45 credits. They can post RFQs, view deals, and consume platform resources before an administrator has reviewed or approved their KYC documents.

#### Root Cause Analysis
In `platform/apps/web/src/app/portal-access-7k2m9/actions.ts`, `requestPhoneOtp` checks whether a user exists in Supabase `auth.users`:
```typescript
const { data: userExists } = await adminClient.auth.admin.listUsers();
// if user exists, issue OTP
```
Because the onboarding RPC `onboarding_submit_application` immediately inserts the user into `auth.users` upon form submission, `requestPhoneOtp` treats the applicant as an active user. It fails to check `profiles.kyc_status === 'verified'`, allowing unverified applicants to log in.

#### Reproduction Steps
1. Navigate to `https://dmcgrid.gomedicure.com/portal-access-7k2m9` in an incognito window.
2. Enter an unregistered Indian mobile number (e.g. `+91 9123426613`).
3. System routes to `/onboarding`. Complete Step 1 (Agency), Step 2 (Company Details: PAN, GST, Address), and Step 3 (Review & Submit).
4. Observe confirmation screen: *"Application Under Review"*. Do **not** approve in Admin portal.
5. In the same browser, navigate back to `https://dmcgrid.gomedicure.com/portal-access-7k2m9`.
6. Enter the same phone number (`+91 9123426613`).
7. Enter the displayed 6-digit dev verification code and click **Verify & Enter Workspace**.
8. **Actual Result:** User is granted full access to the Agent Portal (`/`), granted 45 credits, and can create live RFQs.
9. **Expected Result:** Authentication should fail with an error: *"Your application is currently pending KYC review by our compliance team. You will be notified once approved."*

---

### DEF-02: Direct URL Access Leaks Competitor RFQ Briefs & DMC Quotes (IDOR)
- **Severity:** `P0` (Critical Security / Broken Object Level Authorization)
- **Journey:** Journey 5 (Edge Cases) & Journey 1 (Agent Sourcing)
- **Affected Route:** `https://dmcgrid.gomedicure.com/rfq/[id]`
- **Evidence / Screenshot:** `docs/qa-wave6/screenshots/j5-idor-rfq-leak.png`

#### Description
RFQ briefs, client traveler requirements, internal notes, target budgets, and multi-tier quotes submitted by competing DMCs are private commercial data belonging strictly to the authoring travel agent. However, if Agent B navigates directly to `/rfq/[id]` of an RFQ authored by Agent A (e.g., `RFQ-2026-0016`, UUID `0bd6852f-3967-4de6-bc49-a5f69af7993a`), the page renders the full RFQ brief, private agent notes, and all submitted supplier quotes without verifying whether `rfq.agent_id === current_user.id`.

#### Root Cause Analysis
In `platform/apps/web/src/app/(agent)/rfq/[id]/page.tsx`, the server component fetches the RFQ record using an elevated Supabase service client or queries the table without scoping the query by the authenticated user's ID (`agent_id = user.id`). If the record exists, it renders unconditionally instead of returning a `404 Not Found` or `403 Forbidden`.

#### Reproduction Steps
1. Sign in as Agent A (`+91 98201 44829`) and publish an RFQ (e.g. `0bd6852f-3967-4de6-bc49-a5f69af7993a`).
2. Log out and sign in as Agent B (`+91 9123426613`).
3. As Agent B, navigate directly to `https://dmcgrid.gomedicure.com/rfq/0bd6852f-3967-4de6-bc49-a5f69af7993a`.
4. **Actual Result:** Agent B can inspect Agent A's private trip requirements, target budget (₹2.8L - ₹3.2L), and all incoming DMC quotes.
5. **Expected Result:** Application should return `404 Not Found` or redirect Agent B back to `/rfq` with an unauthorized alert.

---

### DEF-03: RFQ Wizard Step 4 Accepts Past Departure Dates
- **Severity:** `P1` (High / Data Validation Bypass)
- **Journey:** Journey 1 (Agent Wizard)
- **Affected Route:** `https://dmcgrid.gomedicure.com/rfq/new` (Step 4)
- **Evidence / Screenshot:** `docs/qa-wave6/screenshots/j1-past-date-accepted.png`

#### Description
Step 4 of the RFQ Wizard ("Travel Dates & Seasonality") allows travel agents to input historical departure dates (e.g. `2024-01-01`). The frontend date validation permits past dates, advances through all 8 wizard steps, and the database procedure `agent_create_rfq` persists the RFQ with departure dates in the past.

#### Root Cause Analysis
- Client-side: The date input lacks a `min={new Date().toISOString().split('T')[0]}` attribute or Zod schema validation requiring `startDate >= today`.
- Database RPC: `agent_create_rfq` lacks a guard condition enforcing `p_start_date >= CURRENT_DATE`.

#### Reproduction Steps
1. Sign in as Agent (`+91 98201 44829`) and click **New RFQ Wizard**.
2. Proceed through Steps 1 to 3 with valid selections.
3. In Step 4, enter Start Date: `2024-01-01` and End Date: `2024-01-08`.
4. Click **Continue**.
5. **Actual Result:** Wizard accepts `2024-01-01` and advances to Step 5 (Accommodations).
6. **Expected Result:** An inline validation error should block progression: *"Departure date must be today or in the future."*

---

### DEF-04: RFQ Wizard Publish Lacks Immediate Loading State on Network Transit
- **Severity:** `P1` (High / User Experience & State)
- **Journey:** Journey 1 (Agent Wizard)
- **Affected Route:** `https://dmcgrid.gomedicure.com/rfq/new` (Step 7 Review)
- **Evidence / Screenshot:** `docs/qa-wave6/screenshots/j1-publish-no-redirect.png`

#### Description
On the final Step 7 Review step, clicking "Publish RFQ & Debit 2 CR" initiates the publication RPC. However, the submit button remains in its default active state without a spinner or disabling interaction. On production networks taking 2-3 seconds to execute the debit and redirect, users frequently click the button repeatedly or suspect the submission failed.

#### Reproduction Steps
1. Complete Steps 1 through 6 of the RFQ wizard.
2. In Step 7 Review, click **Publish RFQ & Debit 2 CR**.
3. **Actual Result:** The page displays no intermediate progress indicator while the server action executes, maintaining the active button until the router push completes.
4. **Expected Result:** Button should immediately disable and render a loading spinner with text *"Publishing RFQ..."*.

---

### DEF-05: Middleware Explicitly Bypasses `/portal-access-7k2m9` Server-Side Guard
- **Severity:** `P2` (Architecture / Route Guard Consistency)
- **Journey:** Journey 5 (Edge Cases)
- **Affected Route:** `platform/apps/web/src/middleware.ts`

#### Description
Line 13 in `middleware.ts` includes an early return:
```typescript
if (pathname.startsWith('/portal-access-7k2m9')) {
  return NextResponse.next();
}
```
Later in the file (lines 34-38), logic exists to redirect already-authenticated users to their respective role dashboards (`/` for agents, `/feed` for DMCs, `/admin` for admins). Because of the early exit on line 13, this redirect logic is unreachable. Authenticated users navigating to the login gate briefly see the phone input form until a client-side hook redirects them, creating visible layout flash.

---

### DEF-06: Production Latency Exceeds 3.0s Threshold on Core Agent Views
- **Severity:** `P2` (Performance / Latency Budget Breach)
- **Journey:** Journey 6 (Cross-Cutting Audit)
- **Affected Routes:** Multiple Agent Views

#### Description
Auditing live page transitions on `https://dmcgrid.gomedicure.com` revealed that several high-traffic operational views breach the 3.0-second performance ceiling:
- `/deals` (Deals & Pipeline): **4.11s**
- `/rfq` (My RFQs List): **3.79s**
- `/proposals` (Proposals List): **3.69s**
- `/#settings` (Agency Settings): **3.35s**
- `/connections` (DMC Connections): **3.14s**
- `/#kyc` (KYC Profile): **3.11s**

#### Root Cause Analysis
Server-side data fetching waterfalls and unindexed joins across `rfqs`, `quotes`, and `deals` tables. In contrast, the public traveler proposal share page (`/p/prop_...`) loads in **0.81s**.

---

### DEF-07: Duplicate Notification Bell Elements Cause DOM / Selector Ambiguity
- **Severity:** `P2` (Accessibility / DOM Structure)
- **Journey:** Journey 5 & 6
- **Affected Route:** Global Header & Mobile Drawer

#### Description
The notification bell component is mounted multiple times in the DOM simultaneously (once in the desktop header and once inside the mobile navigation drawer). In desktop viewports (1440x900), the drawer element remains present in the DOM with `display: none` or hidden actionability. Automated tools, assistive screen readers, and automated scripts encounter multiple conflicting elements matching `button[aria-label="View notifications"]`.

---

## 4. Journeys that PASSED (Comprehensive Verification)

The following core functional journeys and subsystems were exhaustively validated and **PASSED** production testing:

### 1. Agent Journey (`+91 98201 44829` — Zenith Luxury Voyages)
- [x] **Secure OTP Authentication:** Phone number validated, 6-digit dev OTP verified, authenticated session established.
- [x] **Real-time Wallet Display:** Topbar and `/wallet` accurately displayed initial balance of **14 CR**.
- [x] **Full 8-Step RFQ Wizard:**
  - Step 0 (AI Brief / Sourcing Mode): Mode selection works.
  - Step 1 (Trip Type): "Multi-City" selected.
  - Step 2 (Travelers): 2 Adults configured.
  - Step 3 (Route): Bangkok (3 Nights) + Phuket (4 Nights) configured. Empty destination validation correctly triggers: *"Please enter all destination city names"*.
  - Step 4 (Dates): Next month dates configured.
  - Step 5 (Accommodations): 5-Star Villa + CP Meal Plan (Breakfast) configured.
  - Step 6 (Experiences): Phi Phi Island Tour + Private Airport Transfers configured.
  - Step 7 (Budget & Review): Budget set to ₹2,80,000 - ₹3,20,000. Zero budget (`0`) is strictly rejected.
- [x] **RFQ Publishing & Debit:** Published successfully as `RFQ-2026-0016` (UUID `0bd6852f-3967-4de6-bc49-a5f69af7993a`).
- [x] **Exact Ledger Debit:** Wallet balance immediately debited exactly 2 credits (**14 CR -> 12 CR**). Verified in DB `wallets` table and `/wallet` ledger.

### 2. DMC Journey (`+91 98700 11223` — Siam Horizon Journeys)
- [x] **Feed Real-Time Discovery:** Newly published `RFQ-2026-0016` immediately appeared in `/feed`.
- [x] **Brief Inspection:** Brief modal opened cleanly displaying traveler requirements, route, dates, and budget.
- [x] **Multi-Tier Quote Builder:** Configured and submitted 3 tiers (`QTE-2026-1924`):
  - Tier 1 (Comfort): ₹1,33,000 net
  - Tier 2 (Luxury): ₹2,68,000 net
  - Tier 3 (Custom Option 3): ₹60,000 net
- [x] **Agent Quote Comparison Matrix:** Agent viewed submitted quote in `/rfq/[id]` compare matrix.
- [x] **Deal Acceptance & V62 Math:** Agent accepted Option 3 (Net ₹60,000). System generated Deal UUID `b0a7a352-bb96-463a-8ce0-0ffc38b5e25b`.
  - **Supplier Net:** ₹60,000.00
  - **Agent Margin (12%):** ₹7,200.00
  - **Subtotal:** ₹67,200.00
  - **GST (5% on subtotal):** ₹3,360.00
  - **Pre-TCS Customer Price:** ₹70,560.00
  - **TCS (5% on ₹70,560):** ₹3,528.00
  - **Total Customer Price:** **₹74,088.00** (Verified 100% exact match in DB `deals` table).
- [x] **Traveler Proposal Generation:** Created client proposal with public share token `prop_116bfdddf185`.
- [x] **Traveler Share Page:** Unauthenticated public access to `https://dmcgrid.gomedicure.com/p/prop_116bfdddf185` loaded in 0.81s, rendered all itinerary tiers, and recorded traveler selection into the database without requiring login.

### 3. Admin Journey (`+91 98700 44556` — Admin Operator)
- [x] **Admin Authentication & Dashboard:** Logged into `/admin` with full operational metrics visible.
- [x] **KYC Verification Queue:** `/admin/verification` rendered pending applicants including `+91 9123426613` (*Horizon Royal Journeys*).
- [x] **KYC Approval:** Executed admin approval action. Database record in `profiles` flipped `kyc_status` from `pending` to `verified`.
- [x] **Platform Credit Ledger:** `/admin/ledger` rendered platform double-entry accounts with 42 verified journal entries for credit purchases and revenue.
- [x] **Plans & Pricing Management:** `/admin/plans` updated plan pricing (₹1099.00) and persisted to the database.
- [x] **Emergency RFQ Force-Close:** Force-closed `RFQ-2026-0016` via admin oversight. Status flipped to `closed` with audit log entry.

### 4. Partner Onboarding Journey
- [x] **Fresh Phone Branching:** Entering unassociated Indian phone number (`+91 9123426613`) automatically branched from login gate to 3-step application.
- [x] **Role Selection:** Clean selection between Travel Agent and DMC.
- [x] **PAN Validation:** Bad PAN format (`INVALIDPAN`) rejected with inline error: *"PAN must look like ABCDE1234F"*.
- [x] **Duplicate Phone Prevention:** Existing numbers cannot submit duplicate onboarding applications.
- [x] **Submission Confirmation:** Application successfully submitted into administrative review queue.

### 5. Edge Cases & Session Security
- [x] **Sign-Out Session Destruction:** Clicking **Sign Out** immediately invoked Supabase `signOut()`, purged all `sb-*` auth tokens and cookies, and redirected to `/portal-access-7k2m9`.
- [x] **Back Button Protection:** Pressing browser Back button after sign-out prevented access to protected views. Reloading redirected to login gate with `?redirect=...`.
- [x] **Two-Tab Sign-Out Sync:** Signing out in Tab 1 immediately invalidated the session; subsequent navigation in Tab 2 instantly redirected to the login gate.
- [x] **Instant Wallet Cache Invalidation:** Navigating to `/wallet` immediately following RFQ creation showed updated credit balance without stale cache.

### 6. Cross-Cutting Health & Error Audit
- [x] **404 Route Handling:** Navigating to `/garbage` when unauthenticated cleanly redirected to `/portal-access-7k2m9?redirect=%2Fgarbage`. Navigating to `/garbage` when authenticated returned a standard HTTP 404 page with no server crash.
- [x] **Sidebar Route Integrity:** All valid sidebar links for Agent, DMC, and Admin resolved with HTTP 200.
- [x] **Zero Uncaught Page Errors:** 0 unhandled runtime errors or unhandled promise rejections detected during automated crawling.

---

## 5. Summary of Captured Screenshots

All captured screenshots are archived under `docs/qa-wave6/screenshots/`:
- `j4-unapproved-login-allowed.png`: DEF-01 (Unapproved onboarding applicant logged in with 45 CR)
- `j5-idor-rfq-leak.png`: DEF-02 (Agent B inspecting Agent A's private brief and DMC quotes)
- `j1-past-date-accepted.png`: DEF-03 (RFQ wizard accepting departure date 2024-01-01)
- `j1-publish-no-redirect.png`: DEF-04 (RFQ wizard publish button lack of loading transition)
- `j5-notification-dropdown.png`: Notification dropdown rendering in agent header
- `j6-404-unauth.png`: 404 redirect to login gate for unauthenticated users
- `traveler-traveler-share-desktop-dark.png` / `traveler-traveler-share-desktop-light.png`: Public traveler proposal view
- Full desktop, mobile, and drawer UI matrices across all views under `docs/qa-wave6/screenshots/`.

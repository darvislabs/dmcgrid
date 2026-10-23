# QA Teardown Wave 6 — Functional Findings v2 (Post-Hardening & Security Lockdown)

- **Date:** October 23, 2026
- **Target Environment:** Production (`https://dmcgrid.gomedicure.com`)
- **Evaluation Type:** Hostile Functional E2E & Adversarial Security Teardown
- **Prior Landed Fixes Tested:** Security lockdown (`00016_security_lockdown.sql`), KYC sign-in gate, IDOR page-level ownership checks, portal switcher removal, session-derived role enforcement.
- **Scope & Mandate:** Re-run teardown per `docs/qa-wave6/brief-functional.md` against CURRENT prod. Identify regressions, verify previous P0s remain dead, uncover new functional bugs. **Report only — zero source modifications, zero git commits.**

---

## 1. Executive Summary

A hostile end-to-end teardown was executed across all production user journeys on `https://dmcgrid.gomedicure.com`. All journeys were audited using automated Playwright sessions, multi-tab contexts, and direct PostgreSQL database inspection in Docker container `supabase_db_db`.

### Core Takeaways

1. **Previous P0s Confirmed Dead & Verified:**
   - **[DEF-01] Onboarding Bypass Gate:** **STAYS DEAD.** Unapproved applicants attempting to sign in via `/portal-access-7k2m9` are strictly blocked (*"Your application is still under review. You will be able to sign in once approved."*). No OTP is generated.
   - **[DEF-02] IDOR Direct URL Sourcing Leak:** **STAYS DEAD.** Direct access to `/rfq/[id]` from anonymous contexts redirects to login; access from competitor DMC contexts bounces to `/feed`; and access from competitor agent contexts returns HTTP 404 via page-level ownership guards.

2. **Critical New Regressions Uncovered:**
   - **[DEF-08 / P0] PostgreSQL RLS Infinite Recursion on `rfqs` Table:** In commit `1d85257`, server pages were converted from service-role (`createAdminClient()`) to user-scoped clients (`createClient()`). The RLS policy `rfqs_select_agent_matched_or_admin` queries `rfq_matches`, while `rfq_matches_select` queries `rfqs` directly without a `SECURITY DEFINER` barrier. Querying `rfqs` as any authenticated user throws `ERROR: infinite recursion detected in policy for relation "rfqs"`. This causes `/feed` to render `0 briefs`, `/briefs/[id]` to 404, `/rfq` to show 0 RFQs, and completely breaks the downstream DMC quote and deal pipeline.
   - **[DEF-09 / P0] Admin KYC Approval Silent Failure & Enum String Mismatch:**
     1. Database trigger `trg_protect_profile` (`protect_profile_privileged_cols`) resets `new.kyc_status := old.kyc_status` whenever `request.jwt.claims` is non-null. When an authenticated Admin calls `admin_review_kyc`, the trigger silently discards the approval and keeps `profiles.kyc_status = 'pending'`.
     2. In [actions.ts](file:///home/ubuntu/dmcgrid/platform/apps/web/src/app/portal-access-7k2m9/actions.ts#L80), the gate checks `profile.kyc_status !== 'approved'`. However, PostgreSQL enum `kyc_status` defines `('draft', 'pending', 'verified', 'rejected')`. Even if the status were updated to `'verified'`, the login gate would still block the user forever because `'verified' !== 'approved'`.
   - **[DEF-10 / P1] Next.js Root Route Conflict Hijacks Agent Sidebar "Dashboard" Link:**
     Clicking "01 Dashboard" (`href="/"`) in the Agent sidebar redirects to `/rfq/new` because [src/app/page.tsx](file:///home/ubuntu/dmcgrid/platform/apps/web/src/app/page.tsx#L29) issues `redirect('/rfq/new')`, shadowing the agent dashboard. Authenticated agents cannot view their dashboard via sidebar navigation.

---

## 2. Comprehensive Defect Inventory

| Defect ID | Severity | Category | Title | Affected Journeys | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-08** | **P0** | Database / RLS | PostgreSQL Infinite Recursion on `rfqs` RLS Policy Blocks Feed & RFQ Detail | Journey 1, Journey 2, Journey 3 | **NEW (P0 Regression)** |
| **DEF-09** | **P0** | Database / Auth | Admin KYC Approval Silently Overwritten by Profile Trigger & Status String Mismatch | Journey 3, Journey 4 | **NEW (P0 Defect)** |
| **DEF-10** | **P1** | Routing / Next.js | Root Path Redirect Shadows Agent Dashboard Link in Sidebar | Journey 1, Journey 5 | **NEW (P1 Defect)** |
| **DEF-03** | **P1** | Validation / Data | RFQ Wizard Step 4 Accepts Past Departure Dates (e.g. 2024-01-01) | Journey 1 | **STILL OPEN** |
| **DEF-11** | **P2** | UX / State | RFQ Wizard Step 0 Shows "Start from scratch" After AI Extraction Succeeds | Journey 1 | **NEW (P2 Defect)** |
| **DEF-07** | **P2** | DOM / Accessibility | Duplicate Notification Bell in Mobile Drawer Causes Selector Ambiguity | Journey 5, Journey 6 | **STILL OPEN** |
| **DEF-12** | **P2** | Performance | Cold Load Latency Exceeds 3000ms Threshold on Agent Core Views | Journey 6 | **NEW (P2 Defect)** |
| **DEF-01** | **P0** | Auth / KYC Gate | Unapproved Onboarding Applicants Can Bypass KYC Review and Sign In | Journey 4 | **VERIFIED DEAD (FIXED)** |
| **DEF-02** | **P0** | Security / IDOR | Direct URL Access Leaks Competitor RFQ Briefs & DMC Quotes | Journey 5 | **VERIFIED DEAD (FIXED)** |
| **DEF-04** | **P1** | UX / Feedback | RFQ Wizard Publish Lacks Immediate Loading State on Network Transit | Journey 1 | **VERIFIED FIXED** |

---

## 3. Verification of Previous P0 Vulnerabilities

### DEF-01 Verification: KYC Onboarding Sign-in Bypass Gate
- **Status:** **VERIFIED DEAD (FIXED)**
- **Evidence Screenshot:** [j4-unapproved-login-blocked.png](file:///home/ubuntu/dmcgrid/docs/qa-wave6/screenshots/j4-unapproved-login-blocked.png)
- **Test Execution:**
  1. Generated fresh random Indian mobile number: `+91 9832522932`.
  2. Submitted full partner onboarding application (Agent, Vanguard Luxury Escapes, contact Aarav Mehta, PAN `ABCDE1234F`).
  3. Form confirmed: *"Application received — Our operations team will verify your business details within 1–2 business days."*
  4. Immediately visited `/portal-access-7k2m9` and attempted sign-in with `+91 9832522932`.
  5. **Result:** Blocked cleanly with message: *"Your application is still under review. You will be able to sign in once approved."*
  6. No OTP was sent, no session was minted, and access to protected routes was strictly prohibited.

### DEF-02 Verification: Direct URL IDOR Leakage
- **Status:** **VERIFIED DEAD (FIXED)**
- **Evidence Screenshots:**
  - [def02-anon-idor.png](file:///home/ubuntu/dmcgrid/docs/qa-wave6/screenshots/def02-anon-idor.png)
  - [def02-dmc-cross-role.png](file:///home/ubuntu/dmcgrid/docs/qa-wave6/screenshots/def02-dmc-cross-role.png)
- **Test Execution:**
  1. **Anonymous Context:** Navigated directly to `/rfq/8002e44c-f1fe-4208-ae0a-00280f9ff87d` (private agent RFQ). Cleanly redirected to `/portal-access-7k2m9?redirect=%2Frfq%2F8002e44c-f1fe-4208-ae0a-00280f9ff87d`. Zero brief data leaked.
  2. **DMC Context:** Signed in as DMC (`+91 98700 11223`) and navigated directly to `/rfq/8002e44c-f1fe-4208-ae0a-00280f9ff87d`. Cleanly bounced to `/feed`. Zero agent client information or private notes leaked.
  3. **Competitor Agent Context:** Page-level ownership check `if (rfqRaw.agent_id !== user.id) notFound()` returns HTTP 404.

---

## 4. Detailed Defect Reports (New & Unresolved)

### DEF-08: PostgreSQL Infinite Recursion on `rfqs` Table RLS Policy
- **Severity:** `P0` (Critical Regression / Entire Brief & Quote Pipeline Broken)
- **Affected Journeys:** Journey 1 (Agent Sourcing), Journey 2 (DMC Quoting), Journey 3 (Admin Oversight)
- **Affected Routes:**
  - `https://dmcgrid.gomedicure.com/feed` (DMC sees "0 briefs matched")
  - `https://dmcgrid.gomedicure.com/briefs/[id]` (DMC gets 404 Not Found)
  - `https://dmcgrid.gomedicure.com/rfq` (Agent sees "0 RFQs")
  - `https://dmcgrid.gomedicure.com/rfq/[id]` (Agent gets 404 Not Found)
  - `https://dmcgrid.gomedicure.com/admin/rfqs` (Admin sees "No RFQs found")
- **Database Evidence:**
  ```sql
  SET ROLE authenticated;
  SET request.jwt.claims = '{"sub": "d1111111-1111-1111-1111-111111111111", "role": "authenticated"}';
  SELECT id, rfq_number, status FROM rfqs;
  ```
  **PostgreSQL Engine Output:**
  ```
  ERROR: infinite recursion detected in policy for relation "rfqs"
  ```
- **Root Cause Analysis:**
  1. In `00006_rls_recursion_fix.sql`, policy `rfqs_select_agent_matched_or_admin` on `rfqs` selects from `rfq_matches`:
     ```sql
     exists (
       select 1 from public.rfq_matches m
       where m.rfq_id = rfqs.id and m.dmc_id = auth.uid()
     )
     ```
  2. Meanwhile, policy `rfq_matches_select` on `rfq_matches` (line 46) selects back from `rfqs`:
     ```sql
     or exists (
       select 1 from public.rfqs r
       where r.id = rfq_matches.rfq_id and r.agent_id = auth.uid()
     )
     ```
  3. Neither policy delegates to a `SECURITY DEFINER` function with `SET search_path = public`.
  4. In commit `1d85257` (Wave 6A), server components were changed from `createAdminClient()` (service key) to user-scoped `createClient()`. This triggered RLS on all server page reads, causing PostgreSQL to terminate with an infinite recursion error on every single query to `rfqs`.
- **Reproduction Steps:**
  1. Sign in as DMC (`+91 98700 11223`) via `/portal-access-7k2m9`.
  2. Navigate to `/feed`. Notice the feed is empty ("0 briefs matched").
  3. Attempt to open `/briefs/8002e44c-f1fe-4208-ae0a-00280f9ff87d`. The page throws a 404 error because the underlying Supabase query failed.
- **Expected Behavior:** `rfqs` policies should check permissions using `SECURITY DEFINER` helper functions so that RLS does not evaluate cross-table policies recursively.

---

### DEF-09: Admin KYC Approval Silently Overwritten by Profile Trigger & Enum Status Mismatch
- **Severity:** `P0` (Critical Defect / Partner Onboarding Stalled Permanently)
- **Affected Journeys:** Journey 3 (Admin KYC Verification), Journey 4 (Partner Onboarding)
- **Affected Routes:**
  - `https://dmcgrid.gomedicure.com/admin/verification`
  - `https://dmcgrid.gomedicure.com/portal-access-7k2m9`
- **Evidence Screenshots:**
  - [j4-admin-queue-fresh.png](file:///home/ubuntu/dmcgrid/docs/qa-wave6/screenshots/j4-admin-queue-fresh.png)
  - [j4-admin-approved.png](file:///home/ubuntu/dmcgrid/docs/qa-wave6/screenshots/j4-admin-approved.png)
- **Database Inspection:**
  ```sql
  SELECT id, profile_id, status FROM kyc_records WHERE profile_id = 'a3d76dd7-06a6-4546-9926-d7490caf0bad';
  -- Result: status = 'verified'
  
  SELECT id, phone, kyc_status FROM profiles WHERE id = 'a3d76dd7-06a6-4546-9926-d7490caf0bad';
  -- Result: kyc_status = 'pending' (DID NOT UPDATE!)
  ```
- **Root Cause Analysis (Double Fault):**
  1. **Trigger Blind Overwrite:** Trigger `trg_protect_profile` on `profiles` executes `protect_profile_privileged_cols()`:
     ```sql
     if current_setting('request.jwt.claims', true) is null then
       return new;
     end if;
     new.role := old.role;
     new.kyc_status := old.kyc_status;
     new.is_active := old.is_active;
     return new;
     ```
     When an Admin calls RPC `admin_review_kyc`, `request.jwt.claims` is present (the Admin is authenticated). The trigger does not check `if is_admin()`. Instead, it blindly overwrites `new.kyc_status := old.kyc_status` back to `'pending'`!
  2. **Enum String Value Mismatch:** In [actions.ts](file:///home/ubuntu/dmcgrid/platform/apps/web/src/app/portal-access-7k2m9/actions.ts#L80):
     ```typescript
     if (profile && profile.kyc_status !== 'approved') {
       return { ok: false, error: 'Your application is still under review...' };
     }
     ```
     The PostgreSQL enum `kyc_status` only allows values `'draft'`, `'pending'`, `'verified'`, `'rejected'`. The value `'approved'` does not exist in PostgreSQL. Even if the trigger were resolved, `'verified' !== 'approved'` will always evaluate to true, blocking approved partners from ever signing in.
- **Reproduction Steps:**
  1. Complete onboarding with a fresh number (`+91 9832522932`).
  2. Log in as Admin (`+91 98700 44556`), open `/admin/verification`, click "Audit & Review", enter audit notes, and click "Approve & Verify KYC".
  3. Notice modal closes with success message.
  4. Now attempt to sign in with `+91 9832522932`. The portal still reports *"Your application is still under review"*.
- **Expected Behavior:** Admin KYC approval should update `profiles.kyc_status` to `'verified'`, and the sign-in action must check `profile.kyc_status === 'verified'`.

---

### DEF-10: Next.js Root Route Conflict Hijacks Agent Sidebar "Dashboard" Link
- **Severity:** `P1` (High / Navigation Broken)
- **Affected Journeys:** Journey 1 (Agent Sourcing), Journey 5 (Edge Cases)
- **Affected Route:** `https://dmcgrid.gomedicure.com/` and sidebar `href="/"`
- **Evidence:**
  - Sidebar item: `<Link href="/">Dashboard</Link>`
  - [src/app/page.tsx](file:///home/ubuntu/dmcgrid/platform/apps/web/src/app/page.tsx#L29):
    ```typescript
    if (role === 'admin') redirect('/admin');
    if (role === 'dmc') redirect('/feed');
    redirect('/rfq/new'); // Forces agent to wizard
    ```
- **Description:**
  When an authenticated Agent clicks the top sidebar item "01 Dashboard" (`href="/"`), `src/app/page.tsx` executes `redirect('/rfq/new')`. This forcefully kicks the Agent into the RFQ Wizard rather than displaying the Agent Dashboard ([src/app/(agent)/page.tsx](file:///home/ubuntu/dmcgrid/platform/apps/web/src/app/(agent)/dashboard/page.tsx)). Agents are unable to access their high-level metrics, active pipelines, and recent briefings from the navigation sidebar.
- **Reproduction Steps:**
  1. Sign in as Agent (`+91 98201 44829`).
  2. Click "01 Dashboard" in the left sidebar.
  3. Observe the browser URL changes to `https://dmcgrid.gomedicure.com/rfq/new`.
- **Expected Behavior:** Clicking "01 Dashboard" should render the Agent Dashboard at `/dashboard` or `/`.

---

### DEF-03: RFQ Wizard Step 4 Accepts Past Departure Dates
- **Severity:** `P1` (Functional Bug / Data Integrity Bypass)
- **Affected Journey:** Journey 1 (Agent Sourcing)
- **Affected Route:** `https://dmcgrid.gomedicure.com/rfq/new`
- **Evidence Screenshot:** [def03-past-date.png](file:///home/ubuntu/dmcgrid/docs/qa-wave6/screenshots/def03-past-date.png)
- **Description:**
  In Step 4 of the RFQ Wizard (Trip Timing & Dates), entering a past departure date (e.g. `2024-01-01`) is accepted without error. While the HTML `<input type="date">` tag includes a `min` attribute, client-side validation in `validateStep(4)` in `rfq-wizard.tsx` only tests `departureDate.trim().length > 0`. The form advances straight to Step 5 (Stays), and the RPC `agent_create_rfq` in PostgreSQL accepts the past date and publishes the RFQ to the database.
- **Reproduction Steps:**
  1. Open `/rfq/new` as an authenticated agent.
  2. Advance to Step 4, enter Departure Date: `2024-01-01`.
  3. Click "Continue →". Notice step 5 opens with no error displayed.
- **Expected Behavior:** Form must show an inline error: *"Departure date must be in the future"* and prevent step progression.

---

### DEF-11: Step 0 Button Copy Mismatch After AI Extraction
- **Severity:** `P2` (UX / State Consistency)
- **Affected Journey:** Journey 1 (Agent Sourcing)
- **Affected Route:** `https://dmcgrid.gomedicure.com/rfq/new`
- **Evidence Screenshot:** [j1-scratch-button-mismatch.png](file:///home/ubuntu/dmcgrid/docs/qa-wave6/screenshots/j1-scratch-button-mismatch.png)
- **Description:**
  On Step 0 of the RFQ Wizard, an agent pastes raw client text and clicks "Extract with AI". The system parses all 5 fields and renders a green banner: `✓ 5 FIELDS PRE-FILLED · EDIT BELOW`. However, the bottom CTA button text remains `"Start from scratch →"`. This confuses users into thinking their extracted data will be discarded.
- **Reproduction Steps:**
  1. Open `/rfq/new`. Paste itinerary brief into Step 0. Click "Extract with AI".
  2. Observe the green confirmation banner appears.
  3. Check bottom button: reads "Start from scratch →".
- **Expected Behavior:** Once fields are pre-filled, the button should read `"Continue with Extracted Details →"` or `"Continue to Step 1 →"`.

---

### DEF-07: Duplicate Notification Bell in Mobile Drawer Causes Selector Ambiguity
- **Severity:** `P2` (DOM / Accessibility / Automated Testing Conflict)
- **Affected Journeys:** Journey 5 & Journey 6
- **Description:**
  A notification bell button is rendered in the top header as well as inside the hidden mobile navigation drawer on desktop viewports. Automated test runners and screen readers encounter duplicate selectors (`button[aria-label="Notifications"]`), creating accessibility tree warnings and selector ambiguity.
- **Expected Behavior:** The mobile navigation bell should be conditionally unmounted on desktop viewports.

---

### DEF-12: Cold Load Latency Exceeds 3000ms Threshold on Agent Core Views
- **Severity:** `P2` (Performance / Cold Start Latency)
- **Affected Journey:** Journey 6 (Cross-Cutting Audit)
- **Latency Audit Results:**
  - `Agent /` (Initial load): **4,940ms**
  - `Agent /deals`: **3,402ms**
  - `Agent /wallet`: **3,204ms**
  - `Admin /admin/users`: **3,378ms**
- **Description:**
  Server-side rendered routes performing uncached sequential PostgreSQL queries exceed the 3.0s interactive threshold on cold requests. Subsequent navigations take <800ms.
- **Expected Behavior:** Implement React cache / Next.js unstable_cache on read queries to keep cold loads under 2,000ms.

---

## 5. Comprehensive List of Journeys that PASSED

Despite the blockers documented above, the vast majority of the core platform functions, security boundaries, and accounting engines passed with zero regressions:

### Journey 1: Agent Sourcing & Credit Accounting
- [x] **Secure OTP Sign-In:** Agent (`+91 98201 44829`) receives on-screen OTP and authenticates cleanly into user context.
- [x] **Wallet Balance Initialization:** Current balance displayed accurately on `/wallet` (12 CR starting).
- [x] **Wizard Step 1–2 Validation:** Form enforces traveler count > 0 and trip purpose selection.
- [x] **Wizard Step 3 Route Validation:** Submitting empty destination city is strictly rejected with inline error: *"Please enter all destination city names"*.
- [x] **Wizard Step 7 Budget Validation:** Setting Budget = ₹0 is rejected with validation error.
- [x] **Wizard Step 7 Fee Transparency:** Text explicitly informs agent: *"Publishing costs 2 credits"*.
- [x] **Publish Button State (DEF-04):** Button immediately transitions to `"Publishing Brief…"` and disables to prevent double submissions.
- [x] **RFQ Publishing Pipeline:** Successfully created `RFQ-2026-0017` in PostgreSQL with all payload fields intact.
- [x] **Double-Entry Credit Accounting:**
  - Agent wallet debited exactly 2 credits (**12 CR -> 10 CR**).
  - Offsetting credit transaction created in `credit_transactions` and `credit_ledger`.
  - Platform Revenue credited with 2 credits (*"Publish fee revenue for RFQ-2026-0017"*).

### Journey 3: Platform Governance & Admin Operations
- [x] **Admin Authentication:** Admin (`+91 98700 44556`) logs in with user-metadata and database-verified role `'admin'`.
- [x] **Governance Dashboard (`/admin/analytics`):** Real-time metrics render without errors (active users, total briefs, gross revenue).
- [x] **KYC Verification Queue (`/admin/verification`):** Queue displays pending submissions with company details, PAN, and contact information.
- [x] **Platform Credit Ledger (`/admin/ledger`):** Displays double-entry platform revenue entries, verified against agent RFQ deductions.
- [x] **Pricing & Tier Governance (`/admin/plans`):** Admin can modify plan pricing, and changes persist across page reloads.

### Journey 4: Partner Onboarding & KYC Compliance
- [x] **Gate Automatic Branching:** Fresh phone `+91 9832522932` automatically branches from `/portal-access-7k2m9` to `/onboarding`.
- [x] **Role-Based Flow Selection:** Selecting Travel Agent instantly loads tailored company configuration inputs.
- [x] **PAN Format Enforcement:** Invalid PAN string (`INVALIDPAN`) rejected immediately with validation error: *"PAN must look like ABCDE1234F"*.
- [x] **Pending Application State:** Submission enters pending state with user feedback.
- [x] **KYC Lockdown Gate (DEF-01):** Unapproved applicants attempting to sign in before admin verification are strictly blocked.

### Journey 5: Session & Security Boundary Teardown
- [x] **Multi-Tab Sign-Out Synchronization:**
  - Tab 1 signs out.
  - Tab 2 reloads or navigates.
  - Tab 2 is immediately redirected to `/portal-access-7k2m9?redirect=...`. Session cookies cleanly purged across all tabs.
- [x] **Browser History / Back-Button Guard:**
  - Clicking browser "Back" after sign-out stays on `/portal-access-7k2m9`. Cached authenticated screens are never restored.
- [x] **Anonymous IDOR Defense:** Direct unauthenticated access to `/rfq/[id]` redirects to gate without leaking brief details.
- [x] **Cross-Role IDOR Defense:** DMC navigating to private agent `/rfq/[id]` route is bounced to `/feed`.

### Journey 6: Cross-Cutting & Network Resilience
- [x] **Custom 404 Route:** Authenticated access to `/garbage` renders branded 404 error page. Unauthenticated access redirects (307) to gate.
- [x] **Zero Fatal Crashes:** 0 unhandled 500 Internal Server Errors detected across all 20+ crawled routes.
- [x] **Proposals Route (`/proposals`):** Renders proposals list for agent with HTTP 200.
- [x] **Secure HTTPS Headers:** HSTS (`max-age=63072000`), X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), and Permissions-Policy headers verified on all endpoints.

---

## 6. Recommendations for Engineering (Post-QA)

1. **Fix RLS Infinite Recursion (DEF-08):** In `supabase/migrations/`, create a `SECURITY DEFINER` function `public.is_dmc_matched_to_rfq(rfq_id, dmc_id)` and use it in `rfqs_select_agent_matched_or_admin` to break the cyclic RLS dependency with `rfq_matches`.
2. **Fix Profile Trigger & KYC Gate (DEF-09):**
   - In `protect_profile_privileged_cols()`, add `if is_admin() then return new; end if;` so admin RPC updates can modify `kyc_status`.
   - In [actions.ts](file:///home/ubuntu/dmcgrid/platform/apps/web/src/app/portal-access-7k2m9/actions.ts#L80), change `profile.kyc_status !== 'approved'` to `profile.kyc_status !== 'verified'`.
3. **Fix Sidebar Dashboard Link (DEF-10):** Update sidebar link to `href="/dashboard"` or update [src/app/page.tsx](file:///home/ubuntu/dmcgrid/platform/apps/web/src/app/page.tsx) to redirect agents to `/dashboard` instead of `/rfq/new`.
4. **Add Future Date Validation (DEF-03):** In `validateStep(4)` in `rfq-wizard.tsx` and in RPC `agent_create_rfq`, verify `new Date(departureDate) >= new Date().setHours(0,0,0,0)`.

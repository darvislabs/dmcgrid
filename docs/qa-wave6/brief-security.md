# QA TEARDOWN BRIEF B — SECURITY + BACKEND (find bugs, DO NOT fix yet)

Repo: /home/ubuntu/dmcgrid. DB: docker container supabase_db_db (psql -U postgres -d postgres),
local kong :54321. Prod: https://dmcgrid.gomedicure.com. Test identities (phone OTP via
/portal-access-7k2m9, code shows on-screen): agent +91 98201 44829, dmc +91 98700 11223,
admin +91 98700 44556. Playwright available (pattern in qa/*.py).

YOUR JOB: hostile security engineer + backend QA. Audit and produce a defect list.

1. RLS coverage: for EVERY table (profiles, kyc_records, rfqs, rfq_destinations, rfq_stays,
   rfq_experiences, rfq_matches, quotes, quote_options, quote_line_items, connections, deals,
   proposals, share_tokens, credit_ledger, credit_transactions, credit_accounts, credit_packs,
   plans, notifications, audit_log) — list policies, then ATTEMPT cross-role violations with real
   anon/authenticated tokens (agent token trying to read other agents' rfqs, dmc reading other
   dmc quotes, direct table INSERT via REST bypassing the RPC fee logic, updating rfq status
   client-side, spending another agent's wallet, editing deals/proposals, writing audit_log,
   self-approving KYC via admin_* RPCs, share_token enumeration, IDOR on /rfq/[id] /deals/[id]
   /briefs/[id] /proposals/[id] /share/[token]).
2. SECURITY DEFINER functions: agent_create_rfq, agent_accept_quote, agent_unlock_connection,
   agent_update_deal_status, dmc_submit_quote, admin_* (review_kyc, toggle_user_active,
   force_close_rfq, adjust_credits, save_plan), onboarding_submit_application, kyc_verified —
   check role checks, balance locking, SQL-injection surfaces, missing ownership checks, race
   conditions (double-accept, double-unlock, concurrent publish).
3. Auth flows: OTP brute force (rate limits), OTP reuse after session start, magic-link token
   single-use, PKCE verifier handling, /portal-access-7k2m9 discoverability (is it referenced in
   sitemap/robots/HTML?), session cookie flags (secure/httpOnly/sameOrigin), the dev instant-login
   (NEXT_PUBLIC_DEV_LOGIN=true IS CURRENTLY ON IN PROD — verify what that exposes and flag it).
4. Fee integrity: can you publish an RFQ without paying 2 credits (direct table insert, RPC
   tampering, replay)? Can wallet go negative? Double-spend the same credits concurrently?
5. Server actions / API routes: enumerate src/app/api/* and any 'use server' exports — auth checks,
   input validation, error leakage.
6. Config: supabase config.toml (site_url, external_url, SMTP, rate limits), next.config headers
   (CSP? HSTS? X-Frame-Options?), exposed Mailpit at /inbox-7f3k9 (what can an attacker read there?
   full magic links? any real user PII?), error messages leaking internals.

Output: /home/ubuntu/dmcgrid/docs/qa-wave6/security-findings.md — numbered, each with severity
(P0 exploit now / P1 high / P2 hardening), evidence (exact repro: curl/playwright snippet + observed
output), impact, fix suggestion. Do NOT fix anything. Include a 'what is actually OK' section so we
don't re-audit working parts.

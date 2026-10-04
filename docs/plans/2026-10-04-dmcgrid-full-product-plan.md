# DMCGrid — Full Product Plan

> **For Hermes:** Execute phase-by-phase using subagent-driven-development. Dispatch `agy` (or a delegate_task subagent) per phase with the phase brief below; review each phase's output for spec compliance + code quality before proceeding. Per-task TDD task lists get generated at each phase's kickoff from its brief.

**Goal:** Turn the DMCGrid v18 prototype into a production two-sided B2B travel marketplace: agents post structured RFQs, DMCs respond with anonymous quotes, agents compare → connect (max 2 DMCs) → white-label → sell a customer-ready PDF proposal.

**Architecture:** React SPA (role-gated) + FastAPI + PostgreSQL. Append-only credit ledger. Server-side contact redaction. Server-side HTML→PDF (WeasyPrint) for the structured customer proposal. Manual (concierge) matching in MVP, matching engine behind a feature flag.

**Source prototype:** `reference/prototype-v18.html` (v18 structured-PDF-Itinerary demo, 19 screens).

---

## 0. Locked decisions (defaults — overridable by Dhrumil)

| # | Decision | Locked value | Rationale |
|---|----------|--------------|-----------|
| D1 | Stack | React 18 + Vite + TypeScript + Tailwind · FastAPI + SQLAlchemy 2 + Alembic · PostgreSQL 15 | House pattern (GMC, ClaimReclaim). One SPA, role-gated routes. |
| D2 | Design system | **New DMCGrid identity** extending the prototype's gold-on-dark proposal sheet: Night `#0B1626` dark surfaces, Brass `#C8A45C` primary, Gold `#D9AE52` accent, Parchment `#F4EFE6` app bg / `#EBE3CE` alt, success `#1D7149`, warn `#8A5B00`, danger `#B3261E`. Fonts: **Fraunces** (display), **Inter** (UI), **IBM Plex Mono** (prices/IDs/numbers). | The proposal sheet is the piece that demos the product ("2026 not 2010"). Merges the Notion reference palette (Fraunces/IBM Plex/brass/night/parchment) with the prototype. |
| D3 | First shippable milestone | **Agent portal MVP + ops console (concierge MVP)** — DMC matching/distribution run manually from the ops console; DMC portal ships in the following phase. | Dhrumil says the demand market exists; test conversion fastest by seeding supply manually. |

---

## 1. Product spec (canonical — supersedes prototype contradictions)

### 1.1 Roles
- **Agent (travel agency):** posts RFQs, receives anonymous quotes, connects with max 2 DMCs per RFQ, builds margin + white-label proposal, sells to customer.
- **DMC (destination management company):** receives matched RFQs, builds up to 3 package options per quote (hotels, vehicle, day-wise itinerary), submits anonymously.
- **Ops/Admin (DMCGrid team):** verifies businesses, manually distributes RFQs to DMCs (MVP), monitors ledger, audits everything.

### 1.2 Credit & monetization rules (single source of truth)
- **Agent "deal credit"** is consumed **once per RFQ** on the **first DMC connect**. Connecting a 2nd DMC on the same RFQ is free. All options from connected DMCs are free. Max **2 distinct DMCs** per RFQ (DB-enforced).
- **DMC "quote credit"** is consumed on a DMC's **first quote submission** per RFQ. Up to **3 package options** included in that quote. No credit for edits/withdraw+resubmit of the same RFQ.
- **Free tier:** first **5 deals** free for each side (activated at registration, no card).
- **Plans (GST 18% on subscriptions):**
  - Agent: Starter ₹999 (5 credits, 1 user) · Growth ₹2,499 (20 credits, 3 users, priority matching) · Pro ₹5,999 (60 credits, 10 users, analytics).
  - DMC: Starter ₹1,499 (10 credits, 1 user) · Growth ₹3,999 (40 credits, 5 users, priority RFQ alerts) · Pro ₹7,999 (100 credits, 15 users, multi-destination teams).
- **Top-ups:** agent credits from ₹499; DMC credits from ₹799; extra seats ₹399/user/mo.
- **Wallet alternative:** prepay wallet, ₹999/connect debit (pick wallet OR subscription at connect time; prototype's dual dropdown collapses to one).
- **Customer pricing formula:** `net + margin(percent|fixed, per-deal) → +GST 5% → +TCS 5%` (both configurable rates; validated tax-rule table in production — varies by transaction structure).
- **Trust rules (non-negotiable):** paid visibility never changes quote ranking; quote comparison is neutral; sponsored placements labelled; DMC identity/net rates/margin never printed on customer PDF; contact redaction happens **server-side**.

### 1.3 RFQ structure (the 6 wizard tabs = the schema)
`travel` (destination, adults, children, date range → nights) · `flights` (timing, cabin) · `hotel` (category, room type) · `vehicle` (type) · `food` (preferences, allergies) · `budget` (band ₹1–2L…₹10L+, priorities, dont_wants). Stored as structured columns + JSONB preference blocks.

### 1.4 RFQ lifecycle (state machine)
```
draft → active → connected_1 → connected_2 (locked: no new DMC quotes)
                    ↓                ↓
                  closed ←───────────┘  → reactivate → active (only if connected < 2)
```
- Quotes allowed while `active` or `connected_1` (from unmatched DMCs) and always from already-connected DMCs until `connected_2`.
- `connected_2`/`closed` disable new quote submissions; option selection stays available to the agent from connected DMCs.
- Every transition audited (`audit_logs`).

### 1.5 Quote → proposal flow
DMC submits quote (≤3 options) → agent sees **anonymous** comparison (match %, requested-vs-proposed, day-wise side-by-side) → connects → identity revealed to agent only → agent picks an option → Proposal Studio: per-deal margin/GST/TCS calc, editable day-wise itinerary, brand profile (reusable), AI day-rewrite (later phase), real images w/ license metadata → **WeasyPrint A4 PDF** (structured layout from prototype v18: hero + trip strip + day-wise + package details + inclusions + agent footer + disclaimer).

---

## 2. Data model (ERD — PostgreSQL)

```
users(id PK, email UQ, phone UQ, password_hash, role ∈ {agent,dmc,admin},
      status ∈ {pending,active,suspended}, email_verified bool, phone_verified bool,
      created_at, updated_at)

otps(id PK, user_id FK, channel ∈ {email,phone}, code_hash, expires_at, consumed_at)

agencies(id PK, user_id FK UQ, name, gstin, iata_id, business_type,
         city, state, country, years_in_business, destinations_sold text[],
         verification_status ∈ {unverified,pending,verified,rejected}, created_at)

dmc_companies(id PK, user_id FK UQ, name, country, hq_city, reg_no, years_operating,
              services text[] (hotels,transfers,sightseeing,guides,mice,luxury),
              destinations text[], verification_status, verified_badge bool, created_at)

verification_docs(id PK, owner_type ∈ {agency,dmc}, owner_id, kind, s3_key, status, reviewed_by, created_at)

brands(id PK, agent_user_id FK, name, logo_s3_key, gst, phone, whatsapp, email, website,
       address, is_default bool, created_at)          -- reusable white-label brand profiles

rfqs(id PK, ref_no UQ "RFQ-1048", agent_user_id FK, status ∈ lifecycle, 
     destination, adults int, children int, start_date, end_date, nights int,
     flights jsonb, hotel jsonb, vehicle jsonb, food jsonb,
     budget_band, priorities text, dont_wants text, created_at, updated_at,
     closed_at, closed_reason)

rfq_matches(id PK, rfq_id FK, dmc_company_id FK, score numeric, 
            distribution ∈ {manual,engine}, notified_at, response_status ∈ {pending,quoted,expired},
            UQ(rfq_id, dmc_company_id))

quotes(id PK, ref_no UQ, rfq_id FK, dmc_company_id FK,
       status ∈ {draft,submitted,withdrawn}, submitted_at, credit_txn_id FK NULL,
       UQ(rfq_id, dmc_company_id))                    -- one quote per DMC per RFQ

quote_options(id PK, quote_id FK, position int 1..3, name, net_price numeric,
              vehicle jsonb, inclusions text, exclusions text)

option_hotels(id PK, option_id FK, city, nights int, hotel_name, category, room, meal)

itinerary_days(id PK, option_id FK, day_no int, date)
itinerary_activities(id PK, day_id FK, time_from, time_to, city, description, transfer, included)

connections(id PK, rfq_id FK, agent_user_id FK, dmc_company_id FK,
            billing_mode ∈ {wallet,subscription}, amount numeric, payment_id FK,
            created_at, UQ(rfq_id, dmc_company_id),
            CHECK((SELECT COUNT(*) FROM connections c WHERE c.rfq_id=rfq_id)<=2))  -- via service + trigger

credit_ledger(id PK, user_id FK, delta int, balance_after int,
              reason ∈ {plan_grant,free_grant,topup,connect_debit,quote_debit,refund,expiry},
              ref_type, ref_id, created_at)           -- APPEND-ONLY; balance = SUM(delta)

subscriptions(id PK, user_id FK, plan, credits_monthly int, status ∈ {active,expired,cancelled},
              period_start, period_end, razorpay_sub_id)

payments(id PK, user_id FK, kind ∈ {subscription,credits,connect,topup}, amount numeric,
         gst numeric, total numeric, status ∈ {created,paid,failed,refunded},
         razorpay_order_id, razorpay_payment_id, created_at)

invoices(id PK, payment_id FK UQ, number UQ "DMCG-2026-XXXXX", pdf_s3_key, created_at)

proposals(id PK, rfq_id FK, agent_user_id FK, quote_option_id FK, brand_id FK,
          margin_type ∈ {percent,fixed}, margin_value numeric, gst_rate numeric, tcs_rate numeric,
          travellers int, validity text, content jsonb (final itinerary rows, incl/excl, hero),
          pdf_s3_key, status ∈ {draft,final}, created_at)

chat_threads(id PK, rfq_id FK, agent_user_id FK, dmc_company_id FK, UQ(rfq_id,dmc_company_id))
chat_messages(id PK, thread_id FK, sender_role, body text, redacted_body text,
              had_redaction bool, created_at)

notifications(id PK, user_id FK, type, payload jsonb, read_at, created_at)
audit_logs(id PK, actor_user_id FK NULL, action, entity, entity_id, diff jsonb, created_at)
```

**Ledger invariants (test in Phase 4):** append-only (no UPDATE/DELETE — enforce via trigger or revoking perms); every debit references an RFQ/quote; balance never negative; connect debit fires exactly once per RFQ; quote debit fires once per (rfq, dmc).

---

## 3. API surface (FastAPI, `/api/v1`)

```
AUTH        POST /auth/register/agent · /auth/register/dmc · /auth/verify-otp
            POST /auth/login · /auth/refresh · /auth/logout
ME          GET/PATCH /me · GET /me/credits (balance + ledger tail)
BRANDS      GET/POST /brands · PATCH/DELETE /brands/{id}
RFQS        POST /rfqs · GET /rfqs?status=&page= · GET /rfqs/{ref} · PATCH /rfqs/{ref}
            POST /rfqs/{ref}/close · POST /rfqs/{ref}/reactivate
            GET  /rfqs/{ref}/matches (ops+agent) · POST /rfqs/{ref}/notify (ops, MVP manual)
QUOTES      POST /rfqs/{ref}/quotes (DMC — burns quote credit; 402 if exhausted)
            GET  /rfqs/{ref}/quotes (agent — anonymized until connected)
            PATCH /quotes/{id} · POST /quotes/{id}/withdraw · GET /dmc/quotes?status=
CONNECT     POST /rfqs/{ref}/connections (agent — max 2, burns deal credit once per RFQ)
            GET  /rfqs/{ref}/connections
PROPOSALS   POST /rfqs/{ref}/proposals · GET /proposals/{id} · PATCH /proposals/{id}
            POST /proposals/{id}/pdf (WeasyPrint → S3, returns URL)
CHAT        GET /threads · GET /threads/{id}/messages · POST /threads/{id}/messages
            (server-side redaction: email/phone/URL/social keywords → [CONTACT REDACTED])
BILLING     GET /plans · POST /billing/checkout (Razorpay order) · POST /billing/webhook
            POST /credits/topup · GET /invoices · GET /invoices/{n}/pdf
UPLOADS     POST /uploads/presign (S3 presigned PUT; images, verification docs)
ADMIN       GET /admin/metrics · GET /admin/rfqs · POST /admin/rfqs/{ref}/distribute
            GET /admin/dmcs?verification=pending · POST /admin/dmcs/{id}/verify|reject
            GET /admin/users · GET /admin/ledger · GET /admin/audit
SHARE       GET /p/{token} (customer-facing proposal view, public, no DMC data)
```

**Anonymity rule:** `GET /rfqs/{ref}/quotes` strips DMC identity until a `connections` row exists for that DMC; match scores always visible.

---

## 4. Screen inventory (React routes)

**Marketing (public):** `/` (hero, network stats, dual CTA) · `/pricing` (agent/DMC toggle) · `/register` (role chooser)
**Auth:** `/login` · `/register/agent` · `/register/dmc` · `/verify`
**Agent portal:** `/agent` (dashboard: credits stat, active RFQs, quotes, RFQ queue) · `/agent/rfq/new` (6-step wizard + calendar range picker) · `/agent/rfqs` (list, lifecycle badges) · `/agent/rfq/:ref` (compare: requested-vs-proposed table, match %, day-wise side-by-side, connect panel w/ billing mode, close/reactivate) · `/agent/proposal/:id` (studio: brand form, controls, live proposal sheet) · `/agent/credits` (balance, ledger, topup) · `/agent/brands` · `/agent/settings`
**DMC portal:** `/dmc` (matched opportunities) · `/dmc/quotes` · `/dmc/quote/:ref/builder` (≤3 options, hotel table, vehicle, day-wise itinerary editor) · `/dmc/profile` · `/dmc/credits`
**Ops console:** `/admin` (metrics) · `/admin/rfqs` + `/admin/rfq/:ref/distribute` (manual match → notify) · `/admin/dmcs` (verification queue) · `/admin/users` · `/admin/ledger` · `/admin/audit`
**Shared:** `/chat/:threadId` · `/p/:token` (public customer proposal)

---

## 5. Frontend structure

```
dmcgrid/
  frontend/
    src/
      app/            routes.tsx, providers (Query, Auth, Theme)
      api/            client.ts (axios + JWT refresh), endpoints/*.ts, types.ts
      components/ui/  Button, Card, Badge, Pill, Tabs, Modal, Stepper, Table, Field…
      features/
        marketing/  auth/  agent/  dmc/  admin/  chat/  proposal/
      design/         tokens.css (from D2), fonts, print.css (A4 structured proposal)
  backend/
    app/
      main.py  config.py  db.py
      models/     (§2 tables)
      schemas/    (pydantic)
      routers/    auth, rfqs, quotes, connections, proposals, chat, billing, admin, uploads
      services/   credits.py (ledger, idempotent debits) · redaction.py ·
                  matching.py (manual + engine flag) · pdf.py (WeasyPrint) ·
                  anonymize.py · audit.py · notifications.py
      workers/    expiry.py (credit cycle, rfq expiry)
    alembic/      migrations
    tests/        unit + integration (pytest + httpx)
```

---

## 6. Prototype bugs — do NOT carry forward (verified in v18)

1. Day-wise comparison rows mismatch itinerary length (7 days vs 4 quote rows) — drive both from the same `itinerary_days` data.
2. "Max 2 connections" vs "DMC1–DMC3 columns" vs "1 connect = all options from both" inconsistency — §1.2 is canonical; max **2 DMCs**, one debit, unlimited options from connected DMCs.
3. Broken `<div class="notice">` nesting in home hero card.
4. Duplicate `id="pBrand"` — React makes ID collisions impossible-by-structure, but keep single source of truth for brand.
5. Dead nav target (`data-page="subscription"` nonexistent) — route inventory in §4 is exhaustive.
6. Hotlinked third-party images (1 of 7 403s) — all proposal images via S3 with license metadata; no hotlinking.
7. Client-side-only redaction — redaction moves server-side (§3 chat).
8. 8 duplicated `<style>` blocks / stacked re-binding scripts — single tokens.css, no handler re-binding.
9. Demo login creds committed in-page — real auth, secrets in env.
10. RFQ "AI structure" and "notify 18 DMCs" fake success — MVP: ops-console manual distribution; engine behind flag.

---

## 7. Phase-wise build plan (agy briefs)

### Phase 0 — Scaffold + design system (0.5 day)
- Repo `dmcgrid` (push to darvislabs), Vite React TS + Tailwind + Router + TanStack Query; FastAPI + SQLAlchemy + Alembic + pytest; docker-compose (postgres).
- `design/tokens.css`: D2 palette + Fraunces/Inter/IBM Plex Mono via fontsource; dark proposal surface + light parchment workspace themes.
- Verify: `docker compose up` → backend `/health` 200; frontend renders shell with tokens.

### Phase 1 — Auth + user management (2 days agy)
- User/OTP models + migrations; register agent/dmc (§3 auth endpoints); JWT access+refresh; email OTP verification (SMTP); password hashing (argon2); role middleware; GET/PATCH /me.
- Tests: register→verify→login→refresh→me; wrong-role route 403.
- Verify: agent + DMC can register and reach their empty dashboards.

### Phase 2 — RFQ engine + Agent portal MVP (3–4 days agy)
- RFQ models + lifecycle service + audit; RFQ CRUD + close/reactivate; 6-step wizard (calendar range picker from prototype, structured payloads); agent dashboard (credits placeholder stat, RFQ queue with lifecycle badges); comparison page shell (empty states).
- Tests: lifecycle transitions enforced (quote-blocked when locked/closed; reactivate rules), audit rows written.
- Verify: agent creates RFQ-1001, sees it queued, closes + reactivates it.

### Phase 3 — DMC portal + quote builder (3–4 days agy)
- DMC company model + verification docs upload (presigned S3); opportunities dashboard (matched RFQs via `rfq_matches` seeded by ops); quote builder: ≤3 options (name, net price, hotel table, vehicle, day-wise itinerary editor with per-day tabs — port prototype's editor UX), draft/submit; submit burns quote credit (free_grant path first); anonymized agent view.
- Tests: one-quote-per-(rfq,dmc); ≤3 options; credit debit once; anonymity until connect.
- Verify: DMC submits 3-option quote for RFQ-1001; agent sees it anonymized.

### Phase 4 — Compare + connect + credits + billing (3–4 days agy)
- Requested-vs-proposed comparison + match % + day-wise side-by-side (single data source); connect flow (max 2 DMCs, billing mode wallet|subscription, one debit per RFQ); append-only credit ledger + invariants (§2); Razorpay subscriptions + topup + webhook + invoices (GST 18%); credits page + topup UI.
- Tests: ledger invariants (§2 list); max-2 constraint; double-connect idempotency; webhook dedupe.
- Verify: end-to-end — free-deal agent connects DMC → ledger shows one debit → paid plan switches billing mode.

### Phase 5 — Proposal Studio + PDF (2–3 days agy)
- Proposal model + per-deal margin/GST/TCS calc service; studio UI (brand form + reusable brands, controls, live gold-on-dark sheet); contenteditable itinerary → structured content jsonb; **WeasyPrint A4 PDF** with the v18 structured layout (hero + trip strip + day-wise + package details + agent footer + disclaimer; page-break rules); public share link `/p/:token`; image upload w/ license metadata.
- Tests: pricing formula (percent + fixed, rounding); PDF generates and contains no DMC identity/net rates; share link hides DMC data.
- Verify: generate PDF for RFQ-1001 — matches the v18 sheet visually, opens from `/p/{token}`.

### Phase 6 — Ops console + notifications + hardening (3 days agy)
- Admin metrics, RFQ list + manual distribute→notify (email; in-app notifications), DMC verification queue, ledger + audit views; rate limiting, security headers, input validation audit, redaction server-side tests; seed script (demo DMCs, sample RFQ); deployment to Zeabur (darvis-tokyo): frontend static, backend container, Postgres service, backups.
- Verify: ops distributes RFQ-1002 to 3 DMCs → DMC sees opportunity + notification; `/admin/audit` shows every state change.

### Later (backlog, not MVP)
- AI copilot (RFQ structuring from free text, day-rewrite, 3-option drafting) · matching engine + score (behind flag from Phase 3) · WhatsApp Cloud API notifications · protected chat with server redaction UI polish (chat ships in Phase 6 minimal) · supplier marketplace · market intelligence reports · agent microsites.

---

## 8. Test & deployment strategy
- **Backend:** pytest + httpx async; per-phase test list above; ledger/lifecycle/anonymity/redaction are the four invariant suites — never skip.
- **Frontend:** Playwright smoke per phase (register→login→core flow); visual check of proposal PDF vs v18 reference.
- **Deploy:** Zeabur (darvis-tokyo `43.153.173.156`): frontend static build, backend Docker, Postgres service + daily backup; env: DATABASE_URL, JWT_SECRET, RAZORPAY keys, SMTP, S3 keys. Domain later (e.g. `dmcgrid.in`) via GoDaddy API pattern.
- **Git:** conventional commits per task; `docs/plans/` in repo; push to darvislabs after Phase 0.

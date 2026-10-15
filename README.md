# DMCGrid — B2B Travel Sourcing Platform

**The operating network for modern B2B travel sourcing.** Travel agents publish structured RFQs; verified DMCs respond with day-wise quotes; agents compare anonymously, unlock identities with credits, and close deals with V62-standard margin math. Built as a single Next.js monorepo on a self-hosted Supabase stack.

**Live:** https://dmcgrid.gomedicure.com

---

## The flow (who uses what)

| Role | Portal | What they do |
|---|---|---|
| **Travel Agent** | `/rfq`, `/wallet`, `/deals`, `/proposals`, `/connections` | Build RFQs with the 8-step wizard (or paste a WhatsApp brief and let AI extraction pre-fill), publish (2 credits), compare anonymous quotes side-by-side, unlock DMC identity (5 credits), win/lose deals, share branded proposals with travelers |
| **DMC / Supplier** | `/feed`, `/briefs/:id`, `/quotes`, `/deals` | Get matched briefs, respond with the quote builder (day-wise itinerary, cost build-up, up to 3 options), track quotes and deals |
| **Admin** | `/admin/*` | KYC verification queue, RFQ oversight, plans, credit ledger, analytics |
| **Traveler** | `/share/:token` | View the branded proposal and record their choice (no login) |

**Auth:** passwordless. Partners sign in with an Indian mobile number + 6-digit OTP at the hidden gate `/portal-access-7k2m9`. Email magic-link remains as a fallback at `/login`. Admin approvals flip a pending onboarding application into a working login.

**Money:** double-entry credit ledger (`credit_ledger`). Publishing an RFQ costs 2 credits; DMC identity unlock costs 5. Plans: Starter ₹999/5cr · Growth ₹2,499/20cr · Scale ₹9,999/100cr. All privileged writes go through SECURITY DEFINER Postgres functions — the service key never reaches the browser.

**V62 pricing formula** (server-side, enforced): `net → +12% markup → +5% GST → +5% TCS`. ₹1,00,000 net → ₹1,23,480 traveler price. Verified end-to-end from quote build to deal sheet.

---

## Architecture

```
platform/                     pnpm monorepo
├── apps/web/                 Next.js 15 (App Router) — all four portals
│   └── src/
│       ├── app/              route groups: (agent) (dmc) (admin) share/ portal-access-7k2m9/
│       ├── components/       sidebar, notification dropdown, brand symbols
│       └── lib/supabase/     server/browser/middleware clients (PKCE flow)
├── packages/db/              schema, migrations, generated types
│   └── supabase/
│       ├── migrations/       00001…00015 — apply in order, all idempotent-safe
│       └── config.toml       local supabase config (site_url, external_url, email)
├── packages/ui/              design system: Button, Input, Card, Badge, StatCard, Modal
└── packages/tokens/          CSS-var themes (light ground #F2F3F5 / dark #0B0F14, gold #D4B483)

qa/                           Playwright E2E suites (see Testing)
design/                       static design-system reference
docs/                         briefs, PRD, runbook pointers
OPS.md                        production runbook (deploy, migrations, health checks)
```

**Stack:** Next.js 15 · TypeScript strict · TailwindCSS 4 · Supabase (Postgres + Auth + RLS) · Playwright · self-hosted Supabase via Supabase CLI (docker).

**Design system:** Cabinet Grotesk (display) + Satoshi/Inter (body) + JetBrains Mono (micro-labels). Light ground `#F2F3F5`, white surfaces, deep-navy text, gold `#D4B483` as the only accent. Theming is CSS-variable only — no `data-[theme]` variants; both themes switch everywhere automatically. Questionnaire-style UIs (RFQ wizard, onboarding) follow the centered single-column chip-card pattern.

---

## Getting started (local dev)

**Prereqs:** Node 20+ · pnpm 11 · Docker (for local Supabase) · Supabase CLI (`npm i -g supabase`)

```bash
# 1. clone + install
git clone https://github.com/darvislabs/dmcgrid.git
cd dmcgrid/platform
pnpm install

# 2. local supabase (postgres :54322, kong :54321, mailpit :54324)
cd packages/db
supabase start                       # first boot takes a few minutes
# apply all migrations in order:
for f in supabase/migrations/0*.sql; do
  psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f "$f"
done

# 3. env
cd ../../apps/web
cp .env.example .env.local           # then fill in real values (below)

# 4. run
pnpm dev                             # http://localhost:3000 — move to :3100 if :3000 is taken
```

**Env vars** (`.env.local`):

| Var | What |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your supabase URL (`http://127.0.0.1:54321` locally) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key — `supabase status` prints it |
| `SUPABASE_SERVICE_ROLE_KEY` | service key — server-only, never prefix with NEXT_PUBLIC |
| `NEXT_PUBLIC_APP_URL` | app origin used in links |
| `NEXT_PUBLIC_DEMO_MODE` | `true` enables the demo OTP shortcut on non-prod builds |
| `NEXT_PUBLIC_DEV_LOGIN` | `true` enables the one-click instant sign-in buttons on `/login` |

**Test identities** (seeded by migrations, phone OTP through the hidden gate; with Mailpit running locally the OTP code is in the inbox at `http://127.0.0.1:54324`):

| Number | Role |
|---|---|
| +91 98700 44556 | Admin |
| +91 98201 44829 | Agent (Apex Journeys) |
| +91 98700 11223 | DMC (Siam Horizon) |

**Conventions you must not break:**

- **Never** write privileged data with the client. Every admin/agent/DMC write is a Server Action or client call into a `*_` SECURITY DEFINER RPC with `audit_log` written server-side.
- RLS is always on; recursion-prone checks go through SECURITY DEFINER helpers (`is_agent()`, `kyc_verified()`), not direct policy joins.
- UI theming via CSS variables only. No hardcoded theme variants in components.
- Every migration is a new numbered file in `packages/db/supabase/migrations/` — never edit applied ones.
- Never commit secrets (`.env.local` and `deploy/` are gitignored; GitHub Push Protection is active on this repo).

---

## Testing

```bash
cd qa/
pip install playwright && playwright install chromium   # once

python3 e2e-wave5.py      # RFQ wizard E2E: 8 steps -> publish -> fee -> detail page
python3 e2e-prod.py       # full prod regression (login, all portals, quote flow) — 12 checks
python3 e2e-admin.py      # admin portal (10 checks)
python3 e2e-wave3.py      # agent/DMC depth + traveler share (13 checks)
```

Suites run against whatever `BASE` the script points at (prod by default). Each suite self-boots its browser session via the phone-OTP gate and reads OTP codes from Mailpit — no secrets needed.

**Definition of done for any change:** `pnpm -r exec tsc --noEmit` clean → `pnpm --filter @dmcgrid/web run build` clean → relevant E2E suite green → then commit.

---

## Deploying (short version)

Full runbook in [OPS.md](./OPS.md). Shape: `output: 'standalone'` build → assembled bundle in `deploy/` → systemd unit `dmcgrid-platform.service` on :3101 → nginx same-origin proxy (app + `/auth/*` + `/verify` + Mailpit inbox) with TLS. Migrations apply directly against the running Postgres container.

---

## Repo map for a new developer

| Start here | Why |
|---|---|
| `docs/PLATFORM-PRD.md` | the product contract: portals, rules R1-R4, data model |
| `packages/db/supabase/migrations/00001_initial_schema.sql` | every table + RLS, top to bottom |
| `platform/apps/web/src/app/(agent)/rfq/new/page.tsx` | the questionnaire pattern (chip cards, steppers, review summary) — copy it for any new multi-step flow |
| `platform/packages/db/supabase/migrations/00015_rfq_publish.sql` | the canonical SECURITY DEFINER write path (wallet lock, ledger double-entry, matching, audit) |
| `qa/e2e-prod.py` | how login + every portal is verified before any push |
| `OPS.md` | how the box runs: systemd, nginx, supabase, redeploy |

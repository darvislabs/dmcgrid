# DMCGrid Platform — PRD v1.0
## The operating network for modern B2B travel sourcing

**Live design system (baseline):** https://dmcgrid.gomedicure.com · repo `/home/ubuntu/dmcgrid`
**Stack (locked):** Next.js 15 monorepo (pnpm) + Supabase (Postgres, Auth magic-link/OTP, Realtime, Storage) + Tailwind v4 tokens ported from `design/tokens.css` + shadcn/ui
**Payments:** Credits ledger (Postgres, double-entry) + Razorpay test-mode, one-flag switch to live
**Auth:** Email + OTP (Supabase magic code). Roles: agent, dmc, admin. Traveler share pages = no auth (tokenized links)

## Roles & surfaces (4 portals)
1. **AGENT** (demand side, verified travel agents)
2. **DMC** (supply side, verified destination management companies)
3. **ADMIN** (Golden Circle platform ops)
4. **TRAVELER** (white-label share pages, no login)

## Compliance red lines (from the design system, binding)
- R1 anonymity: DMC identity hidden until agent spends credits to connect
- R2 server-side approvals with actor + timestamp (admin actions immutable audit log)
- R3 money in mono, tabular, Indian digit grouping (₹1,42,800)
- R4 credits debited on quote unlock/connect, never on browse
- R5 every brief is verified (KYC before first RFQ)
- R6 response clock visible (SLA timer on every quote request)
- R7 both themes (dark default) on every screen; 44px touch targets; WCAG AA
- R8 V62 cost formula is binding: selling = (net × markup) + ancillary; agent margin = 12% default, configurable

## Core loop (Wave 1)
Agent: dashboard → RFQ wizard (6 steps: travelers → destination → dates/pacing → stays → experiences → budget+review) → AI extract fills fields (confidence chips, editable) → publish → matched DMCs notified
DMC: feed of matched briefs (structured, real) → respond with quote builder (day-wise itinerary + cost build-up + 3 options max) → submit (anonymous)
Agent: compare matrix (side-by-side, anonymous: Quote A/B/C) → unlock identity (credits) → connect → deal sheet (margin calculator) → proposal (Pattern D) → traveler share page
Credits: wallet, plans (Starter ₹999/5cr, Growth ₹2,499/20cr, Scale custom), ledger, Razorpay top-up

## Wave 1 screens (agent + dmc)
Agent: /login, /dashboard, /rfq/new (wizard), /rfqs, /rfqs/[id] (quotes/compare), /rfqs/[id]/deal, /wallet, /settings
DMC: /login, /feed, /briefs/[id], /briefs/[id]/quote (builder), /quotes, /kyc, /wallet
Shared: /share/[token] (traveler proposal view)
DB tables: profiles, kyc_records, rfqs, rfq_destinations, rfq_stays, rfq_experiences, rfq_matches, quotes, quote_options, quote_line_items, connections, deals, proposals, share_tokens, credit_ledger, credit_packs, plans, notifications, audit_log
RLS on everything. Realtime: new quote → agent ping; new RFQ match → DMC ping.

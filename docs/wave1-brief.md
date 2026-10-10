Working directory: /home/ubuntu/dmcgrid/platform

Scaffold the DMCGrid platform monorepo (PRD at /home/ubuntu/dmcgrid/docs/PLATFORM-PRD.md — read it first).

Deliver, in order:
1. pnpm monorepo: apps/web (Next.js 15 App Router + TypeScript + Tailwind v4), packages/ui, packages/tokens, packages/db
2. packages/tokens: port design tokens from /home/ubuntu/dmcgrid/design/tokens.css (colors midnight/ivory/sand-gold #D4B483, Satoshi via existing fonts, spacing 4pt, radii 14/9, dark default + light) as Tailwind v4 @theme
3. packages/db: Supabase schema migration SQL for ALL tables in the PRD (profiles, kyc_records, rfqs, rfq_* children, rfq_matches, quotes, quote_options, quote_line_items, connections, deals, proposals, share_tokens, credit_ledger, credit_packs, plans, notifications, audit_log) with RLS policies per role (agent/dmc/admin), the V62 cost formula as a DB function, credit_ledger as double-entry
4. apps/web: auth via Supabase email OTP (magic code), middleware role-gate (agent|dmc|admin), app shell with sidebar (use the design system's sidebar pattern, Cabinet Grotesk/Satoshi + Inter + JetBrains Mono)
5. Three empty route groups: app/(agent), app/(dmc), app/(admin) with placeholder dashboards rendering correctly in dark theme
6. pnpm build must pass. Do NOT run supabase (no docker) — schema ships as SQL files.

Constraints: production-grade from day one. TypeScript strict. No any. Everything theme-aware (data-theme). Do not touch anything outside /home/ubuntu/dmcgrid/platform.
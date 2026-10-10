Working directory: /home/ubuntu/dmcgrid/platform

Build Wave 2: the ADMIN PORTAL. PRD at /home/ubuntu/dmcgrid/docs/PLATFORM-PRD.md (read it). Read the existing schema in packages/db/supabase/migrations/ and the app shell in apps/web/src/components/ first — follow the established patterns exactly.

Scope (route group apps/web/src/app/(admin)):
1. /admin/verification — KYC queue: list kyc_records joined to profiles, pending first, approve/reject with mandatory reason, every action writes to audit_log (actor + timestamp + action + entity) via a Supabase DB function (security definer) — NOT client-side inserts
2. /admin/users — user directory: search + filter by role/kyc_status, view profile detail, deactivate/activate (is_active), all admin actions → audit_log
3. /admin/rfqs — RFQ oversight: all RFQs with status filter + date range, view full brief detail, force-close an RFQ (writes audit_log + notifies agent)
4. /admin/ledger — credits: credit_accounts balances table + credit_ledger entries with filters (type, date, user), daily totals row, debit/credit adjustment form (admin-only, reason mandatory → audit_log)
5. /admin/plans — plans CRUD (create/edit/toggle active), price + credits + features JSON
6. /admin/analytics — dashboard: counts (agents, DMCs, pending KYC, published RFQs, quotes submitted, connections made), quote response-time avg, 14-day RFQ/quote sparkline (SQL via rpc or a view), revenue (plans sold approximation from ledger credits)
7. Every page: server components fetching via packages/db client, RLS-safe (service role ONLY in server routes/rpc where legitimately needed), design system tokens (dark default, sand-gold accents, tabular mono for money), 44px targets, empty states, loading states
8. Admin access: extend middleware to require role=admin for /admin/* (read the existing middleware first)

Definition of done: pnpm -r exec tsc --noEmit passes, pnpm --filter @dmcgrid/web run build passes. Do NOT touch files outside /home/ubuntu/dmcgrid/platform. Do NOT start/stop any services.
# WAVE 6a App Fix Summary — De-Service-Key Reads & KYC-Gate Hardening

## Overview
All requirements in `docs/qa-wave6/brief-appfix.md` have been executed:
- All server pages under `src/app` reading data via `createAdminClient()` (service key / RLS bypass) have been switched to user-scoped `createClient()` from `lib/supabase/server`.
- Public proposal share token lookup switched from direct table read to the `public.share_lookup` RPC (`migration 00016`).
- All hardcoded fallback user IDs (`a1111111-1111-1111-1111-111111111111` and `d1111111-1111-1111-1111-111111111111`) removed from application pages, layout, and mutations.
- Unauthenticated requests redirect defensively to `/portal-access-7k2m9`.
- Defense-in-depth page-level ownership checks enforced with `notFound()` on `(agent)/rfq/[id]`, `deals/[id]`, `proposals/[id]`, and `(dmc)/briefs/[id]`.
- `/api/notifications/route.ts` requires an active session (401 if unauthenticated) and strictly scopes queries and marks read to `recipient_id = user.id`.
- The "Instant Sign-In" UI on `/login` is conditionally rendered only when `process.env.NEXT_PUBLIC_DEV_LOGIN === 'true'`.
- Database migrations and DB schema were untouched. No git commits made.

---

## Files Changed

### 1. Notifications API
- `platform/apps/web/src/app/api/notifications/route.ts`
  - Replaced `createAdminClient()` with user-scoped `createClient()`.
  - Added session requirement (returns HTTP 401 if `!user`).
  - Removed role cookie and hardcoded fallback UUIDs (`a1111111-...` / `d1111111-...`).
  - Filtered notifications select and read updates strictly to `recipient_id = user.id`.

### 2. Agent Portal
- `platform/apps/web/src/app/(agent)/wallet/page.tsx`
  - Switched data queries (`credit_accounts`, `credit_ledger`, `credit_packs`, `plans`) to `createClient()`.
  - Removed fallback UUID; redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/(agent)/rfq/page.tsx`
  - Switched `rfqs` query to `createClient()`.
  - Removed fallback UUID; redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/(agent)/rfq/[id]/page.tsx`
  - Switched `rfqs`, `quotes`, `connections`, `deals`, `share_tokens`, and `credit_accounts` queries to `createClient()`.
  - Removed fallback UUID; redirects to `/portal-access-7k2m9` if no session.
  - Added page-level ownership check: `if (rfqRaw.agent_id !== user.id) notFound()`.
- `platform/apps/web/src/app/(agent)/connections/page.tsx`
  - Switched `connections`, `profiles`, and `credit_accounts` queries to `createClient()`.
  - Removed fallback UUID; redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/(agent)/layout.tsx`
  - Removed fallback UUID; redirects to `/portal-access-7k2m9` if no session.
  - Queries wallet balance using user ID from session.
- `platform/apps/web/src/app/(agent)/rfq/new/page.tsx`
  - Removed fallback UUID from client data loading; routes to `/portal-access-7k2m9` if unauthenticated.
- `platform/apps/web/src/app/(agent)/actions.ts`
  - Required active user session across actions (`unlockConnectionAction`, `acceptQuoteAction`, `rejectQuoteAction`, `buyCreditPackAction`, `updateDealStatusAction`, `markNotificationsReadAction`, `publishRfqAction`).
  - Switched RPC calls to user-scoped `createClient()` so Postgres RLS ownership guards (`auth.uid() = p_agent_id`) apply.
  - Removed fallback UUIDs.

### 3. DMC Portal
- `platform/apps/web/src/app/(dmc)/briefs/[id]/page.tsx`
  - Switched `rfqs` and `quotes` reads to `createClient()`.
  - Removed fallback UUID; redirects to `/portal-access-7k2m9` if no session.
  - Added page-level ownership check: verifies `rfq_matches` exists for `dmc_id = user.id` on this `rfq_id`, else calls `notFound()`.
- `platform/apps/web/src/app/(dmc)/quotes/page.tsx`
  - Switched `quotes` reads to `createClient()`.
  - Removed fallback UUID; redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/(dmc)/feed/page.tsx`
  - Switched `rfqs`, `quotes`, and `connections` reads to `createClient()`.
  - Removed fallback UUID; redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/(dmc)/actions.ts`
  - Required active user session; returns error if unauthenticated.
  - Replaced `createAdminClient()` with `createClient()` for `dmc_submit_quote` RPC.
  - Removed fallback UUID.

### 4. Deals & Proposals
- `platform/apps/web/src/app/deals/page.tsx`
  - Switched `deals` and `credit_accounts` reads to `createClient()`.
  - Removed fallback UUIDs; redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/deals/[id]/page.tsx`
  - Switched `deals`, `credit_accounts`, and `share_tokens` reads to `createClient()`.
  - Removed fallback UUIDs; redirects to `/portal-access-7k2m9` if no session.
  - Added page-level ownership check: requires `dealData.agent_id === user.id || dealData.dmc_id === user.id || role === 'admin'`, else `notFound()`.
- `platform/apps/web/src/app/proposals/page.tsx`
  - Switched `proposals`, `credit_accounts`, and `share_tokens` reads to `createClient()`.
  - Removed fallback UUIDs; redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/proposals/[id]/page.tsx`
  - Switched `proposals`, `credit_accounts`, and `share_tokens` reads to `createClient()`.
  - Removed fallback UUIDs; redirects to `/portal-access-7k2m9` if no session.
  - Added page-level ownership check: requires `proposalData.deal?.agent_id === user.id || proposalData.deal?.dmc_id === user.id || role === 'admin'`, else `notFound()`.

### 5. Public Share Tokens
- `platform/apps/web/src/app/share/[token]/page.tsx`
  - Switched from direct `.from('share_tokens').select('*')` table query to `public.share_lookup` RPC (`migration 00016`).

### 6. Admin Portal
- `platform/apps/web/src/app/(admin)/admin/rfqs/page.tsx`
  - Switched `rfqs` reads to user-scoped client from `createClient()`.
  - Redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/(admin)/admin/plans/page.tsx`
  - Switched `plans` reads to user-scoped client from `createClient()`.
  - Redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/(admin)/admin/ledger/page.tsx`
  - Switched `credit_accounts`, `credit_ledger`, and `profiles` reads to `createClient()`.
  - Redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/(admin)/admin/users/page.tsx`
  - Switched `profiles` reads to `createClient()`.
  - Redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/(admin)/admin/analytics/page.tsx`
  - Switched analytics RPCs and `audit_log` reads to `createClient()`.
  - Redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/(admin)/admin/verification/page.tsx`
  - Switched `kyc_records` reads to `createClient()`.
  - Redirects to `/portal-access-7k2m9` if no session.
- `platform/apps/web/src/app/(admin)/admin/actions.ts`
  - Replaced `createAdminClient()` with user-scoped `createClient()`.
  - Added `verifyAdminSession()` helper requiring authenticated session and `role === 'admin'`.

### 7. Auth & Login
- `platform/apps/web/src/app/login/page.tsx`
  - Gated the "Instant Sign-In" section with `{process.env.NEXT_PUBLIC_DEV_LOGIN === 'true' && (...)}`.

---

## Verification
- `pnpm -r exec tsc --noEmit`: Exited 0 (Clean, 0 errors).
- `NEXT_PUBLIC_SUPABASE_URL=https://dmcgrid.gomedicure.com NEXT_PUBLIC_DEMO_MODE=false NEXT_PUBLIC_DEV_LOGIN=false pnpm --filter @dmcgrid/web run build`: Exited 0 (Clean build, all routes compiled and optimized).

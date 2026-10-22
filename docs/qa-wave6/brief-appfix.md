# WAVE 6a APP FIX — de-service-key all reads + KYC-gate hardening (DO NOT touch DB migrations)

Repo /home/ubuntu/dmcgrid/platform. tsc must pass; do NOT commit.

CONTEXT: Security audit found every server page reads data via createAdminClient() (service key =
RLS bypass) — the root of IDOR (any agent can open another agent's /rfq/[id], /deals/[id], etc).
Some pages also fall back to a hardcoded user id 'a1111111-1111-1111-1111-111111111111' when no
session. This must become session-derived reads so Postgres RLS enforces ownership.

TASK:
1. In ALL files under src/app that call createAdminClient() for READS (list them: grep -rln
   createAdminClient src/app), switch reads to the user-scoped client from createClient() (lib/
   supabase/server). Keep service-key ONLY where genuinely required: (a) server actions that
   provision auth users (portal-access actions, login actions), (b) share/[token] public lookup —
   and there use the new public.share_lookup RPC instead of table reads (migration 00016 already
   grants anon).
2. Remove every hardcoded fallback user id (grep 'a1111111-1111-1111-1111-111111111111' src/app).
   If no session: redirect to /portal-access-7k2m9 (middleware mostly covers this — keep defensive).
3. OWNERSHIP CHECKS at page level (defense in depth on top of RLS):
   - (agent)/rfq/[id]: after fetch, if rfq.agent_id !== user.id -> notFound()
   - deals/[id], proposals/[id]: same pattern (agent_id or dmc side depending on role)
   - (dmc)/briefs/[id]: DMC can only see briefs rfq_matched to them (check rfq_matches exists for
     this dmc_id) — else notFound()
4. /api/notifications/route.ts: require session (401 if none); filter recipient_id = user.id.
5. sec hardening of login page: the 'Instant Sign-In' section must only render when
   process.env.NEXT_PUBLIC_DEV_LOGIN === 'true' (it already checks in the action; hide the UI too).
6. DO NOT change any migration, DO NOT touch DB. Keep UI identical.

VERIFY: pnpm -r exec tsc --noEmit clean; pnpm --filter @dmcgrid/web run build clean
(NEXT_PUBLIC_SUPABASE_URL=https://dmcgrid.gomedicure.com NEXT_PUBLIC_DEMO_MODE=false NEXT_PUBLIC_DEV_LOGIN=false).
Write a short summary to docs/qa-wave6/appfix-summary.md listing every file changed.

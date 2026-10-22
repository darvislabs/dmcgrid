cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "security: wave-6a lockdown — all P0s killed" -m "- migration 00016: admin_* RPCs revoked from anon; profiles privileged-column trigger (role/kyc_status/is_active client-PATCH blocked); agent_unlock_connection caller-ownership + fixed 5-credit cost; agent_update_deal_status ownership; share_tokens anon listing revoked (share_lookup RPC); rfqs direct INSERT blocked (fee bypass dead); quote/deal/credit tables locked from anon
- app: all server pages off service-key reads (RLS enforced), hardcoded fallback UUIDs removed, page-level ownership checks (rfq/deals/proposals/briefs), notifications API session-required + scoped, instant-login UI gated by env, onboarding KYC gate (pending applicants cannot sign in)
- infra: Mailpit behind basic auth (qa/inbox-password.txt, gitignored), security headers (HSTS/XFO/nosniff/permissions-policy), open-redirect guard on /auth/callback
- verified live: forged admin cookie dead, anon admin RPC dead, share listing dead, wallet drain dead, fee bypass dead, IDOR blocked, pending onboarding blocked, all 3 test logins + prod E2E 12/12 + wizard E2E green" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1

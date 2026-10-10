cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "Wave 2: admin portal (verification/users/rfqs/ledger/plans/analytics) + auth flow fixes" -m "- 6 admin routes with SECURITY DEFINER action RPCs (admin_review_kyc, admin_toggle_user_active, admin_force_close_rfq, admin_adjust_credits, admin_save_plan) + immutable audit_log
- login: emailRedirectTo -> /auth/callback, role-aware root redirect, demo OTP gated behind NEXT_PUBLIC_DEMO_MODE, removed stale-UUID role-cookie backdoor from middleware
- seed: fixed hardcoded agy-era UUIDs (admin/agent/dmc), duplicate credit account, missing ledger account ref; quote options + line items addendum (schema-correct)
- PostgREST PGRST201: disambiguated profiles embeds with FK hints on all admin pages
- verified: E2E 10/10 (magic-link login -> admin portal), tsc clean, next build clean" 2>&1 | tail -2
git log --oneline -1

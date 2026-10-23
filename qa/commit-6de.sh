cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "wave-6d+6e: wallet top-up, admin oversight, RLS recursion fix, dashboard route" -m "6d: wallet top-up flow — credit_packs cards on /wallet, Razorpay test-mode order+HMAC verify server actions, wallet_topup_credit SECURITY DEFINER RPC (00017) with idempotent double-entry ledger, demo path when gateway unconfigured
6e (re-teardown fixes):
- DEF-08 P0: rfqs RLS infinite recursion (exposed when service-key reads were removed) — SECURITY DEFINER helpers rfq_visible_to/rfq_matched_to_dmc (00018); DMC feed 17 briefs, agent 40 rfqs restored
- DEF-09 P0: admin KYC approval blocked by my own profile-privilege trigger — admin exemption added (00019); approval propagates verified end-to-end
- admin oversight banners on agent/DMC layouts (admins no longer trapped)
- agents land on real /dashboard (root redirect no longer shadows it); past-date validation on wizard
- verified live: feed/rfq lists restored, KYC approve->sign-in path green, prod E2E 12/12, wizard E2E clean, V62 intact" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1

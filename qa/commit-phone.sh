cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "feat: phone OTP auth on hidden portal URL" -m "- new hidden sign-in gate /portal-access-7k2m9 (unlinked, secret path): India +91 mobile + 6-digit OTP
- server-side OTP (5-min TTL, max 5 attempts, registered numbers only); dev mode shows code on screen + logs; swap deliverCode() for Twilio later — nothing else changes
- real Supabase session via admin-API OTP exchange (service key stays server-side)
- middleware: unauth users now route to hidden portal (not /login); authed users bounced from portal to their workspace; /login kept as email fallback
- migration 00013: +91 phones attached to test identities, profiles.email now nullable
- verified: agent/dmc/admin phone login land correct portals; unauth redirect to hidden portal; email fallback intact" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1
git ls-remote origin master | cut -c1-7

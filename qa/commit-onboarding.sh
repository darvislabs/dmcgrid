cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "feat: self-serve partner onboarding (agent + DMC) with KYC" -m "- hidden portal now branches: unregistered +91 number -> 3-step application (role -> company -> KYC docs) -> under-review confirmation
- migration 00014: onboarding_submit_application SECURITY DEFINER RPC (auth user + profile + kyc_records + audit in one tx, dupe/phone/PAN validated)
- KYC gate: rfqs_insert_agent now requires kyc_verified(); seed partners marked verified
- profiles.email now nullable (phone-first identities); profile phone masked in queries
- verified: full application flow PASS on prod, pending apps land in DB, phone login + prod E2E 12/12 green" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1
git ls-remote origin master | cut -c1-7

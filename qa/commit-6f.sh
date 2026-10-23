cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "wave-6f: last polish — admin oversight banners, dashboard route, kyc table mobile, wizard copy" -m "- admin oversight banner (agent/DMC layouts): admins inspecting other portals get sticky 'ADMIN OVERSIGHT' bar + one-click Back to Admin
- agents land on real /dashboard (route conflict resolved: root page.tsx router -> /dashboard; sidebar updated)
- KYC verification table wrapped for mobile (was 501px blowout)
- wizard step-0: conditional 'Review pre-filled details' after successful extraction
- stale credits copy corrected (2-credit publish documented)
- verified: prod E2E 12/12, wizard E2E clean, feed 17 briefs / 40 rfqs restored, V62 74,088 intact" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1

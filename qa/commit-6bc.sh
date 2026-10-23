cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "wave-6b+6c: nav model fix + UX P1 sweep" -m "6b: Portal Switcher (AGT/DMC/ADM) deleted; dmc_role cookie eliminated from role detection — deals/proposals derive role from session profile; zombie mock dashboards removed
6c: 17 UX P1 fixes — WCAG contrast (gold text darkened for body), theme-aware 404 + banners, mobile overflow fixes (RFQ header, share hero, plans grid), drawer route-change close + gap fix, radius token consolidation, primary button de-golded, dead Top Up wired to /wallet, zombie labels (PRD WAVE/Wave 1/Confidence 94%) removed, fake financials replaced with real wallet data, Indian currency formatting, lakhs helper on budget inputs
- stale copy fixed: brief publishing documented as 2 credits
- verified live: switcher gone, deals/proposals session-role, zombies 404, prod E2E 12/12, V62 pipeline intact (74,088 exact)" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1

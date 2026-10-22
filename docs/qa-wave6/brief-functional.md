# QA TEARDOWN BRIEF C — FUNCTIONAL E2E (find bugs, DO NOT fix yet)

Repo: /home/ubuntu/dmcgrid. Prod: https://dmcgrid.gomedicure.com. Login: /portal-access-7k2m9,
phone +91 98201 44829 (agent), +91 98700 11223 (dmc), +91 98700 44556 (admin) — OTP shows on-screen.
Playwright installed; reuse login helper pattern from qa/e2e-wave5.py.

YOUR JOB: hostile functional QA. Walk EVERY user journey end-to-end on PROD and log every bug:

1. Agent journey: login -> wallet balance visible -> create RFQ via wizard (all 8 steps, use real
   data: 2 adults, Bangkok 3N + Phuket 4N, dates next month, 5-star villa, CP, Phi Phi + transfers,
   280000-320000) -> publish -> RFQ detail page correct? -> wallet debited exactly 2? -> feed
   reflects it. Then step 3 validation: try publishing with empty route, past date, budget=0.
2. DMC journey: login -> /feed shows the new RFQ -> open brief -> quote builder (day-wise itinerary,
   cost build-up, 3 options) -> submit -> agent sees quote in compare matrix -> accept an option ->
   deal created with V62 math (verify actual numbers: net 60000 -> 74088) -> proposal generated ->
   traveler share page renders + choice recording works.
3. Admin journey: login -> verification queue shows pending onboarding applications -> approve one
   (verify kyc_status flips + partner can now sign in) -> ledger reflects the platform revenue ->
   plans page edits persist -> force-close RFQ works.
4. Onboarding journey: fresh phone (+91 9XXXXX0000 style, randomize) -> branch to application ->
   all 3 steps -> submit -> confirmation -> try signing in before approval (must be blocked) ->
   PAN validation (bad PAN rejected), duplicate phone rejected.
5. Edge cases: sign-out -> back button -> session gone? Two tabs, sign out in one -> other tab?
   Wallet page after publish (instant update?). Notification bell after a quote arrives. Direct URL
   access to a /rfq/[id] belonging to another agent (should 404/redirect, not leak).
6. Cross-cutting: every 404 (visit /garbage), broken links (crawl all sidebar links), console errors
   on every page (capture page errors via playwright), slow loads (log any page >3s).

Output: /home/ubuntu/dmcgrid/docs/qa-wave6/functional-findings.md — numbered defects with severity
(P0 broken journey / P1 wrong behavior / P2 rough edge), repro steps, expected vs actual. Include a
'journeys that PASSED' list so we know what works. Do NOT modify source code. Screenshots for P0/P1
under docs/qa-wave6/.

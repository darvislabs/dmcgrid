# QA TEARDOWN BRIEF A — UI/UX + DESIGN SYSTEM (find bugs, DO NOT fix yet)

Repo: /home/ubuntu/dmcgrid (Next.js 15 + Tailwind + CSS-var theming).
Prod: https://dmcgrid.gomedicure.com (login: hidden gate /portal-access-7k2m9, phone +91 98201 44829
agent / +91 98700 11223 dmc / +91 98700 44556 admin; the 6-digit code shows on-screen in the gold box).
Dev server may not be running — test against PROD. Playwright is installed (python3, see qa/*.py for
the login helper pattern).

YOUR JOB: act as a hostile senior product designer + frontend QA. Audit EVERY page of all four
portals (agent: /, /rfq, /rfq/new, /rfq/[id], /wallet, /connections, /deals, /deals/[id],
/proposals, /proposals/[id]; dmc: /feed, /briefs/[id], /quotes, /deals; admin: /admin,
/admin/analytics, /admin/verification, /admin/rfqs, /admin/plans, /admin/ledger, /admin/users;
traveler: /share/<any token from db>) and produce a defect list.

Check EVERY page for:
1. Consistency: spacing scale, card radii, font hierarchy (Cabinet Grotesk display vs body), gold
   #D4B483 usage, icon sizes, chip/pill styles — flag every deviation.
2. Theme: light AND dark — text contrast (WCAG AA), invisible elements, theme leaks (hardcoded
   colors that break one theme), the gray ground must be #F2F3F5 in light.
3. Mobile (390px) AND desktop (1440px): overflow, cramped tap targets (<44px), fixed/sticky
   overlaps, sidebar drawer behavior, tables that don't scroll.
4. Real content states: empty states (no RFQs/quotes/notifications), loading states, error states,
   long content overflow (very long company names, big budgets, many destinations), zero-decimal
   vs formatted currency (₹2,80,000 Indian format vs raw numbers).
5. Confusion/mess report (USER'S #1 COMPLAINT): the sidebar 'Portal Switcher' (AGT/DMC/ADM) lets any
   role navigate into other portals; multiple layouts pass role props (agent layout hardcodes
   role='agent', deals page computes role, etc.) — map EXACTLY which pages show which nav, where the
   user experience breaks/confuses, and recommend the production-correct nav model.
6. Dead/misleading UI: buttons that don't do anything (e.g. 'One-Click Dev Preview' remnants,
   'Wave 1' labels, placeholder data like 'Confidence Score: 0.94'), lorem-ish copy, WIP badges.

Output: write /home/ubuntu/dmcgrid/docs/qa-wave6/uiux-findings.md — a numbered defect list, each
with: severity (P0 block / P1 major / P2 polish), page + repro step, evidence (screenshot path under
docs/qa-wave6/), and suggested fix (one line). Take screenshots liberally (light+dark+mobile for
every page you can). Do NOT modify any source code. End with a summary count by severity.

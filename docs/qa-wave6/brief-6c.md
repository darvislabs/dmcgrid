# WAVE 6C BRIEF — UI/UX P1 sweep (production polish). DO NOT touch DB, DO NOT commit.

Repo /home/ubuntu/dmcgrid/platform. Read docs/qa-wave6/uiux-findings.md for full details of each
defect (evidence + repro). Fix the P1 MAJOR defects ONLY (skip P0s — handled by another agent; skip
P2s unless trivial). Files you may touch: packages/ui/*, app components, page-level styling/copy.
DO NOT touch: components/sidebar.tsx, src/app/deals/*, src/app/proposals/*, login/page.tsx,
lib/supabase/middleware.ts (another agent owns those right now).

FIX LIST (P1s from the audit):
1. DEFECT 04: delete/block obsolete zombie mock dashboard routes (find the dead routes it names).
2. DEFECT 05: gold #D4B483 as body/table text fails WCAG AA on light — darken gold text usages to
   #8a6d3b-equivalent for TEXT ONLY in light mode (keep gold for accents/borders/badges bg).
3. DEFECT 06: agent home sourcing banner hardcoded pitch-black gradient in light mode — theme-aware.
4. DEFECT 07: 404 page ignores light theme — use CSS vars.
5. DEFECT 11: RFQ detail header badges overflow 390px — wrap/condense.
6. DEFECT 12: traveler share hero badges overflow mobile — same.
7. DEFECT 13: admin plans grid overflows desktop+mobile — responsive grid.
8. DEFECT 14: mobile drawer leaves 44px dead gap + stays open on navigation — close drawer on
   route change (usePathname effect), fix the gap.
9. DEFECT 17: consolidate the 11 border-radius values to the token scale (rounded-[6/9/12px] +
   rounded-full only).
10. DEFECT 18: primary Button variant hardcoded gold — per founder design law primary CTAs are
    dark (bg-text-inverted); keep gold for accents. Check packages/ui/button.tsx.
11. DEFECT 21: dead 'Top Up Credits' button on agent dashboard — wire it to /wallet.
12. DEFECT 22: remove internal 'PRD WAVE 1 & 2 MONITORING' label from admin UI.
13. DEFECT 23: remove 'Wave 1' label + wrong step count on agent dashboard.
14. DEFECT 24: remove hardcoded 'Confidence: 94% Verified' from admin RFQ modal.
15. DEFECT 25: remove fictitious static financial figures on agent dashboard (use real wallet data
    or remove the block).
16. DEFECT 26: format raw numbers as Indian currency (₹1,23,456 style) on admin overview/analytics.
17. DEFECT 27: budget inputs get an Indian lakhs helper (show formatted equivalent under input).

VERIFY: tsc --noEmit clean; build clean (NEXT_PUBLIC_SUPABASE_URL=https://dmcgrid.gomedicure.com
NEXT_PUBLIC_DEMO_MODE=false NEXT_PUBLIC_DEV_LOGIN=false).
Write docs/qa-wave6/wave6c-summary.md: each defect -> what changed.

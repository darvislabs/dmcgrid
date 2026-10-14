# WAVE 5 BRIEF: FinFly-style RFQ Wizard + Publish Fee

Working dir: /home/ubuntu/dmcgrid/platform (pnpm monorepo). Build in apps/web + packages/ui.
TypeScript strict; tsc --noEmit must pass; use existing @dmcgrid/ui components + CSS vars (--bg-page,
--bg-card, --text-primary, --border-line, gold #D4B483). Fonts: font-display (Cabinet Grotesk) for
headings, font-mono for micro-labels. Radii: cards 9-12px, pills rounded-full. Light ground #F2F3F5.

## Task: rebuild /rfq/new as a single-column questionnaire wizard (FinFly pattern)

Layout: max-w-xl mx-auto, page bg var(--bg-page). Mobile+desktop. NO sidebar on this route if needed
(it's inside the agent shell — keep shell, content column centers).

Header: back arrow (link /rfq) + 'DMCGrid' wordmark (font-display, gold 'Grid'), right side step
counter 'Step N of 8' font-mono text-[10px]. Below: progress bar = 8 segments (h-1.5 rounded-full;
filled = #D4B483, unfilled = var(--border-line)).

Question typography: big font-display semibold (text-xl~2xl) question, optional helper text-xs
text-[var(--text-secondary)] below.

### Steps (client state; single page component):

Step 0 — AI BRIEF (optional): Card with Sparkles icon; textarea 'Paste WhatsApp text, email, or
client notes…'; button 'Extract with AI' → client-side naive parse (dates regex, pax regex, budget
regex, city names against a static list of 40 popular destinations) → fills fields + shows Badge
'FIELDS PRE-FILLED'. Fields remain fully editable. Skip link: 'Start from scratch →' goes step 1.

Step 1 — TRIP TYPE (single-select, 2-col grid of 6 cards): 💑 Couples & Honeymoon, 👨‍👩‍👧 Family with
Kids, 🎉 Friends Group, 🎒 Solo, 🏢 Corporate MICE, 🕉 Pilgrimage. Card = white, border
var(--border-line), rounded-xl, p-4, emoji text-2xl + label font-medium text-sm; selected = border-
#D4B483 + bg-[#D4B483]/10. Auto-advance 250ms after select.

Step 2 — TRAVELERS: 3 counter rows (Adults ≥1, Children ≥0, Infants ≥0): label + minus/plus round
buttons (w-9 h-9, border, rounded-full) + value font-display font-bold. Also 'Any special
requirements?' optional Input (wheelchair access, dietary, etc).

Step 3 — ROUTE: city rows. Each row: city Input + country auto-suggest (static mapping) + nights
stepper (− N +) + remove (x). '+ Add City' ghost button. Min 1 row. Map to rfq_destinations
(destination_name, country, nights, order_index).

Step 4 — DATES & PACE: date Input (native, min tomorrow) + nights auto-computed from route sum
(display '7 nights · 8 days' font-mono); pacing = 3 cards single-row (😌 Relaxed — Leisure first /
⚖️ Balanced / ⚡ Packed — Max sightseeing), same selected style as step 1.

Step 5 — STAYS: 3 quick question rows, each a single-select chip row:
  Hotel category: 🏨 3★ Comfortable / 🌟 4★ Premium / 💎 5★ Luxury / 🏖 Pool Villa
  Hotel type: Hotel / Resort / Villa / Mix
  Meal plan: EP Room only / CP +Breakfast / MAP +Dinner / AP All meals
  Room count stepper (default 1). Map to rfq_stays (star_rating, hotel_type, meal_plan, room_count,
  preferences free-text optional).

Step 6 — EXPERIENCES: multi-select chips (Private Transfers, Island Hopping, Temple & Heritage
Tours, Food Walk, Adventure/Water Sports, Spa & Wellness, Shopping, Nightlife) + optional free-text
'Anything else?'. Map to rfq_experiences (category='experience', description, required=true).

Step 7 — BUDGET + REVIEW: quick budget chips (Under ₹1.5L, ₹1.5-2.5L, ₹2.5-4L, ₹4L+, Custom) set
min/max inputs (₹ INR, numeric). Then the REVIEW CARD (FinFly step-7 style): white card, grouped
labeled pill summaries — TRIP (type), TRAVELERS (2 adults · 1 child), ROUTE (Bangkok 3N → Phuket 4N),
DATES (12 Nov · 7 nights · Balanced), STAYS (5★ · Villa · MAP), EXPERIENCES (chips +N), BUDGET
(₹2.8L–₹3.2L). Pills: rounded-full border px-3 py-1.5 text-xs, label font-mono text-[10px] gold
uppercase above each group.

Fee line above CTA: font-mono text-xs — 'Publishing costs 2 credits · Your balance: {balance}'.
CTA: full-width dark button (bg #1F2937 dark-theme aware: bg var(--text-main) inverted? use
bg-[var(--text-primary)] text-[var(--bg-page)]) rounded-full py-3 font-semibold 'Publish to
Matched DMCs'. Sticky bottom on mobile (fixed bottom-0 inset-x-0 p-4 bg-[var(--bg-page)]/95
backdrop-blur border-t).

Back/Continue: bottom center row on desktop (Previous ghost / Continue dark pill). Continue
validates current step (route min 1 city, date set, budget set) — invalid = shake + helper text.

### Server pieces (you write; DB is running locally at kong :54321 — apply via
`sudo docker exec -i supabase_db_db psql -U postgres -d postgres < migration.sql`):

1. Migration 00015_rfq_publish.sql:
   - fn agent_create_rfq(p_title text, p_adults int, p_children int, p_infants int, p_start_date
     date, p_nights int, p_budget_min numeric, p_budget_max numeric, p_currency text default 'INR',
     p_notes text default null, p_extra jsonb default '{}' — pacing/hotel prefs live here,
     p_destinations jsonb — array of {destination_name, country, nights}, p_stays jsonb default null
     — {star_rating, hotel_type, meal_plan, room_count, preferences}, p_experiences jsonb default
     '[]' — array of {description}) returns uuid — SECURITY DEFINER, STABLE search_path:
     a. auth.uid() must be agent + kyc_verified() else raise 'KYC verification required'
     b. wallet FOR UPDATE lock: select id,balance from credit_accounts where profile_id=auth.uid()
        and account_type='agent_wallet'; if missing create with 0.
     c. cost = 2 credits. balance < 2 → raise 'INSUFFICIENT_CREDITS' (catch this exact string in UI)
     d. insert rfqs (rfq_number = 'RFQ-2026-' || lpad(nextval('rfq_number_seq')::text,4,'0') —
        create sequence if missing; title, travelers, dates (end_date = start + nights),
        duration_days = nights+1, duration_nights, budget, notes, ai_extracted_data = p_extra,
        status='published', published_at=now())
     e. insert rfq_destinations rows (order_index), rfq_stays row, rfq_experiences rows
     f. auto-match: insert rfq_matches for each verified+active DMC whose operating_destinations
        && destination names (case-insensitive) — if none overlap, match ALL verified DMCs (score
        0.5) else matched score 0.9; insert notification per matched DMC (use existing notifications
        table shape — check it first).
     g. wallet debit: balance -2; credit_ledger double entry (agent_wallet debit 2, platform_revenue
        credit 2) — inspect credit_ledger columns first and follow the existing pattern from
        agent_unlock_connection.
     h. audit_log 'RFQ_PUBLISHED'. Return rfq id.
   - grant execute to authenticated.

2. Wire the page: on Publish → call the RPC via supabase client (agent role session) → success =
   toast + router.push('/rfq/' + id); on 'INSUFFICIENT_CREDITS' error → replace step-7 content with
   upsell state (gold Card: 'Not enough credits' + balance + plan cards from plans table
   (Starter/Growth/Scale with price + credits) + 'View top-up options' link /wallet).

3. Fetch live balance for the fee line (credit_accounts where profile_id=auth.uid()).

## Verify before reporting done:
- pnpm -r exec tsc --noEmit CLEAN
- pnpm --filter @dmcgrid/web run build CLEAN (set NEXT_PUBLIC_SUPABASE_URL=https://dmcgrid.gomedicure.com)
- psql: call agent_create_rfq as a seeded agent (impersonate via service role session or direct SQL
  set local role authenticated + request.jwt.claims) — verify rfq + children + match + ledger rows
- second call → balance decremented again; call with balance 0 → INSUFFICIENT_CREDITS error
Write a qa/e2e-wave5.py playwright script covering: load wizard, step through all 8 steps with the
seed data from the screenshots (2 adults, Bangkok 3N + Phuket 4N, mid-Nov, 5★ villa, CP, Phi Phi +
transfers + temples, 280000-320000), publish, land on /rfq/[id], verify rfq_number shown.
Log everything to docs/agy-wave5.log (tee). Do NOT git commit — I review and commit.

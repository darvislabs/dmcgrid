-- ═══════════════════════════════════════════════════════════
-- DMCGrid Platform Database Migration 00011
-- Wave 3: Seed Data (Connections, Quotes, Share Tokens, Matches)
-- ═══════════════════════════════════════════════════════════

-- 1. Ensure rfq_matches exist for DMCs to see briefs in feed
insert into public.rfq_matches (id, rfq_id, dmc_id, match_score, match_reasons, status, notified_at, created_at)
values
(
  'e2000000-0000-0000-0000-000000000001'::uuid,
  'f1000000-0000-0000-0000-000000000001'::uuid,
  'd1111111-1111-1111-1111-111111111111'::uuid,
  96.50,
  '["Thailand licensed DMC with Bangkok/Phuket direct operations", "5-star luxury honeymoon track record", "Full compliance verified"]'::jsonb,
  'quoted',
  now() - interval '3 days',
  now() - interval '3 days'
),
(
  'e2000000-0000-0000-0000-000000000002'::uuid,
  'f1000000-0000-0000-0000-000000000002'::uuid,
  'd2222222-2222-2222-2222-222222222222'::uuid,
  98.00,
  '["Swiss Commercial Register licensed operator", "Alpine family winter pacing specialist"]'::jsonb,
  'notified',
  now() - interval '2 days',
  now() - interval '2 days'
),
(
  'e2000000-0000-0000-0000-000000000003'::uuid,
  'f1000000-0000-0000-0000-000000000002'::uuid,
  'd1111111-1111-1111-1111-111111111111'::uuid,
  82.00,
  '["Indochina partner with European partner network"]'::jsonb,
  'viewed',
  now() - interval '1 day',
  now() - interval '1 day'
)
on conflict (id) do nothing;

-- 2. Seed Submitted Quote by d222 on rfq 1 for comparison
insert into public.quotes (
  id, rfq_id, dmc_id, quote_number, status, valid_until, total_net_cost,
  currency, response_time_seconds, notes, created_at
) values
(
  'fc000000-0000-0000-0000-000000000003'::uuid,
  'f1000000-0000-0000-0000-000000000001'::uuid,
  'd2222222-2222-2222-2222-222222222222'::uuid,
  'QTE-2026-9022',
  'submitted',
  now() + interval '12 days',
  245000.00,
  'INR',
  5400,
  'Boutique Indochina concierge package featuring Mandarin Oriental Bangkok and Anantara Koh Yao Yai pool villas.',
  now() - interval '1 day'
)
on conflict (id) do nothing;

-- Seed Options for second quote
insert into public.quote_options (
  id, quote_id, option_name, description, net_cost, currency, is_selected, order_index, day_count, created_at
) values
(
  'f1000000-0000-0000-0000-000000000004'::uuid,
  'fc000000-0000-0000-0000-000000000003'::uuid,
  'Executive Heritage',
  'Riverside Deluxe Room + Private Longtail Canal Charter + Fast Track Immigrations',
  245000.00,
  'INR',
  false,
  1,
  7,
  now() - interval '1 day'
),
(
  'f1000000-0000-0000-0000-000000000005'::uuid,
  'fc000000-0000-0000-0000-000000000003'::uuid,
  'Ultra-Luxe Ocean Villa',
  'Kata Rocks Ocean Pool Villa + Private Catamaran Phi Phi Day Charter + Helicopter Transfer',
  298000.00,
  'INR',
  false,
  2,
  7,
  now() - interval '1 day'
)
on conflict (id) do nothing;

-- 3. Seed Connections for agent a111...
insert into public.connections (
  id, rfq_id, quote_id, agent_id, dmc_id, credit_amount_deducted, unlocked_at, created_at
) values
(
  'fd000000-0000-0000-0000-000000000002'::uuid,
  'f1000000-0000-0000-0000-000000000001'::uuid,
  'fc000000-0000-0000-0000-000000000001'::uuid,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'd1111111-1111-1111-1111-111111111111'::uuid,
  5,
  now() - interval '2 days',
  now() - interval '2 days'
),
(
  'fd000000-0000-0000-0000-000000000003'::uuid,
  'f1000000-0000-0000-0000-000000000002'::uuid,
  null,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'd2222222-2222-2222-2222-222222222222'::uuid,
  5,
  now() - interval '1 day',
  now() - interval '1 day'
)
on conflict do nothing;

-- 4. Seed Deal + Proposal + Share Token for proposal sharing demonstration
insert into public.deals (
  id, rfq_id, connection_id, agent_id, dmc_id, selected_quote_option_id,
  net_cost, markup_percentage, manager_approval_status, created_at
) values
(
  'd0000000-0000-0000-0000-000000000001'::uuid,
  'f1000000-0000-0000-0000-000000000001'::uuid,
  'fd000000-0000-0000-0000-000000000002'::uuid,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'd1111111-1111-1111-1111-111111111111'::uuid,
  'f1000000-0000-0000-0000-000000000002'::uuid, -- Comfort option
  158200.00,
  12.00,
  'approved',
  now() - interval '2 days'
)
on conflict (id) do nothing;

-- Seed Proposal linked to deal
insert into public.proposals (
  id, deal_id, version, title, customer_name, customer_email,
  total_price, currency, status, created_at
) values
(
  'ea000000-0000-0000-0000-000000000001'::uuid,
  'd0000000-0000-0000-0000-000000000001'::uuid,
  1,
  'Thailand: Kingdoms & Islands of Siam (7 Days)',
  'Dr. Kabir & Mrs. Ananya Sen',
  'kabir.sen@gmail.test',
  195328.00,
  'INR',
  'shared',
  now() - interval '2 days'
)
on conflict (id) do nothing;

-- Seed Share Token: 'demo-thailand-proposal'
insert into public.share_tokens (
  id, proposal_id, deal_id, quote_id, rfq_id, selected_option_id,
  token, views_count, last_viewed_at, expires_at, created_at
) values
(
  'eb000000-0000-0000-0000-000000000001'::uuid,
  'ea000000-0000-0000-0000-000000000001'::uuid,
  'd0000000-0000-0000-0000-000000000001'::uuid,
  'fc000000-0000-0000-0000-000000000001'::uuid,
  'f1000000-0000-0000-0000-000000000001'::uuid,
  'f1000000-0000-0000-0000-000000000002'::uuid,
  'demo-thailand-proposal',
  14,
  now() - interval '1 hour',
  now() + interval '30 days',
  now() - interval '2 days'
)
on conflict (id) do nothing;

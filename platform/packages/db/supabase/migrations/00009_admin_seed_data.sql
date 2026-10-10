-- ═══════════════════════════════════════════════════════════
-- DMCGrid Platform Database Migration 00007
-- Wave 2: Admin Portal Seed Data (Realistic Profiles, KYC, RFQs, Ledger, Audit)
-- ═══════════════════════════════════════════════════════════

-- 1. Update Existing Seed Profiles with Full Company Data
update public.profiles
set company_name = 'Apex Journeys LLP',
    contact_name = 'Riya Sharma',
    phone = '+91 98200 11223',
    kyc_status = 'verified',
    operating_destinations = ARRAY['Thailand', 'Bali', 'Vietnam', 'Singapore'],
    bio = 'Premium outbound travel agency catering to high-net-worth families in Mumbai and Pune.'
where id = 'a1111111-1111-1111-1111-111111111111';

update public.profiles
set company_name = 'Siam Horizon D.M.C. Ltd',
    contact_name = 'Somchai Prasert',
    phone = '+66 2 234 5678',
    kyc_status = 'verified',
    operating_destinations = ARRAY['Thailand', 'Cambodia', 'Laos'],
    bio = 'Licensed Destination Management Company based in Bangkok with over 15 years servicing outbound Indian travelers.'
where id = 'd1111111-1111-1111-1111-111111111111';

update public.profiles
set company_name = 'Golden Circle Platform Ops',
    contact_name = 'Dhrumil Mankodiya (Admin)',
    phone = '+91 99000 00001',
    kyc_status = 'verified',
    bio = 'DMCGrid Master Governance and Golden Circle Operations Desk.'
where role = 'admin';

-- 2. Seed Additional Auth Users & Profiles (via handle_new_user trigger)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
(
  'a1111111-1111-1111-1111-111111111111'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'zenith@luxurytravel.in',
  crypt('Password123!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"role":"agent","full_name":"Rajesh Mehta","company_name":"Zenith Luxury Journeys LLP"}'::jsonb,
  now() - interval '14 days', now()
),
(
  'a2222222-2222-2222-2222-222222222222'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'vedic@trails.co.in',
  crypt('Password123!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"role":"agent","full_name":"Pooja Sharma","company_name":"Vedic Trails Private Limited"}'::jsonb,
  now() - interval '12 days', now()
),
(
  'd1111111-1111-1111-1111-111111111111'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'bali@heritagetours.com',
  crypt('Password123!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"role":"dmc","full_name":"Ketut Wijaya","company_name":"Bali Serenity DMC PT"}'::jsonb,
  now() - interval '10 days', now()
),
(
  'd2222222-2222-2222-2222-222222222222'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'swiss@alpsdmc.ch',
  crypt('Password123!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"role":"dmc","full_name":"Lukas Weber","company_name":"Swiss Alpine Tours GmbH"}'::jsonb,
  now() - interval '7 days', now()
)
on conflict (id) do nothing;

-- gotrue (Go) cannot scan NULL token columns; backfill sentinel empties for seeded users
update auth.users
set confirmation_token = coalesce(confirmation_token, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change = coalesce(email_change, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    recovery_token = coalesce(recovery_token, ''),
    phone_change_token = coalesce(phone_change_token, '');

-- Explicit profiles for the seeded auth users (idempotent — the trigger may or may not have fired)
insert into public.profiles (id, role, contact_name, company_name, email, kyc_status, is_active)
select u.id,
       coalesce((u.raw_user_meta_data->>'role')::public.user_role, 'agent'),
       coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
       coalesce(u.raw_user_meta_data->>'company_name', '—'),
       u.email,
       'pending',
       true
from auth.users u
on conflict (id) do nothing;


-- Ensure profiles reflect realistic metadata
update public.profiles
set phone = '+91 98201 44829',
    kyc_status = 'pending',
    operating_destinations = ARRAY['Switzerland', 'France', 'Italy'],
    bio = 'Boutique bespoke holiday planner in Mumbai specializing in European luxury trains and alpine chalets.'
where id = 'a1111111-1111-1111-1111-111111111111';

update public.profiles
set phone = '+91 98112 33910',
    kyc_status = 'verified',
    operating_destinations = ARRAY['Bali', 'Japan', 'Vietnam'],
    bio = 'Corporate and leisure group tour specialist handling high-volume outbound from New Delhi and NCR.'
where id = 'a2222222-2222-2222-2222-222222222222';

update public.profiles
set phone = '+62 361 882910',
    kyc_status = 'pending',
    operating_destinations = ARRAY['Indonesia', 'Bali', 'Lombok', 'Komodo'],
    bio = 'Top-tier ground operator in Denpasar with private luxury villa allotments and VIP airport fast-track.'
where id = 'd1111111-1111-1111-1111-111111111111';

update public.profiles
set phone = '+41 22 718 2901',
    kyc_status = 'rejected',
    operating_destinations = ARRAY['Switzerland', 'Austria', 'Germany'],
    bio = 'Geneva-based alpine logistics specialist covering Zermatt, St. Moritz, and Interlaken.'
where id = 'd2222222-2222-2222-2222-222222222222';

-- 3. Seed KYC Records (admin reviewer resolved dynamically, never hardcoded)
insert into public.kyc_records (
    id, profile_id, business_reg_number, tax_id_pan, gst_number, documents_urls,
    status, reviewer_id, review_notes, submitted_at, reviewed_at, created_at
) values
(
  'e1000000-0000-0000-0000-000000000001'::uuid,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'LLPIN: AAR-9921',
  'AABCT3419K',
  '27AABCT3419K1ZV',
  '["https://dmcgrid.storage/kyc/zenith_gstin_cert.pdf", "https://dmcgrid.storage/kyc/zenith_pan_card.pdf"]'::jsonb,
  'pending',
  null,
  null,
  now() - interval '2 hours',
  null,
  now() - interval '2 hours'
),
(
  'e1000000-0000-0000-0000-000000000002'::uuid,
  'd1111111-1111-1111-1111-111111111111'::uuid,
  'NIB: 9120004921029',
  'NPWP: 02.847.192.8-904.000',
  null,
  '["https://dmcgrid.storage/kyc/bali_nib_license.pdf", "https://dmcgrid.storage/kyc/tourism_board_cert.pdf"]'::jsonb,
  'pending',
  null,
  null,
  now() - interval '5 hours',
  null,
  now() - interval '5 hours'
),
(
  'e1000000-0000-0000-0000-000000000003'::uuid,
  'a2222222-2222-2222-2222-222222222222'::uuid,
  'U63040DL2018PTC339182',
  'AAACV4981L',
  '07AAACV4981L1Z9',
  '["https://dmcgrid.storage/kyc/vedic_mca_certificate.pdf", "https://dmcgrid.storage/kyc/gst_regular_filing.pdf"]'::jsonb,
  'verified',
  (select id from public.profiles where role = 'admin' order by created_at limit 1),
  'Incorporation and GSTIN active on GST portal. Tax compliance verified.',
  now() - interval '2 days',
  now() - interval '1 day',
  now() - interval '2 days'
),
(
  'e1000000-0000-0000-0000-000000000004'::uuid,
  'd2222222-2222-2222-2222-222222222222'::uuid,
  'CHE-112.443.992',
  'CH-TAX-8821',
  null,
  '["https://dmcgrid.storage/kyc/swiss_che_extract.pdf"]'::jsonb,
  'rejected',
  (select id from public.profiles where role = 'admin' order by created_at limit 1),
  'Swiss Commercial Register extract was expired (dated 2021). Mandatory up-to-date apostille required.',
  now() - interval '5 days',
  now() - interval '4 days',
  now() - interval '5 days'
),
(
  'e1000000-0000-0000-0000-000000000005'::uuid,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'U74999MH2020PTC345678',
  'AAACA1234F',
  '27AABCA1234F1Z8',
  '["https://dmcgrid.storage/kyc/apex_gst_cert.pdf"]'::jsonb,
  'verified',
  (select id from public.profiles where role = 'admin' order by created_at limit 1),
  'Verified primary travel agent profile.',
  now() - interval '10 days',
  now() - interval '9 days',
  now() - interval '10 days'
),
(
  'e1000000-0000-0000-0000-000000000006'::uuid,
  'd1111111-1111-1111-1111-111111111111'::uuid,
  'DBD-0105562098412',
  'TH-TAX-998811',
  null,
  '["https://dmcgrid.storage/kyc/siam_dbd_license.pdf"]'::jsonb,
  'verified',
  (select id from public.profiles where role = 'admin' order by created_at limit 1),
  'Verified foreign DMC documentation.',
  now() - interval '10 days',
  now() - interval '9 days',
  now() - interval '10 days'
)
on conflict (id) do nothing;

-- 4. Seed Credit Accounts & Double-Entry Journal
insert into public.credit_accounts (id, profile_id, account_type, name, balance, created_at)
values
  ('c1000000-0000-0000-0000-000000000001'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 'agent_wallet', 'Zenith Luxury Journeys Credits Wallet', 45, now() - interval '10 days'),
  ('c1000000-0000-0000-0000-000000000003'::uuid, 'a2222222-2222-2222-2222-222222222222'::uuid, 'agent_wallet', 'Vedic Trails Credits Wallet', 15, now() - interval '6 days'),
  ('c1000000-0000-0000-0000-000000000004'::uuid, null, 'platform_revenue', 'DMCGrid Platform Revenue Pool', 28500, now() - interval '30 days'),
  ('c1000000-0000-0000-0000-000000000005'::uuid, null, 'system_reserve', 'Golden Circle Reserve Pool', 100000, now() - interval '30 days')
on conflict (id) do nothing;

insert into public.credit_transactions (id, description, reference_type, reference_id, created_by, created_at)
values
  ('fa000000-0000-0000-0000-000000000001'::uuid, 'Growth Pack Subscription (20 Credits)', 'pack_purchase', '20000000-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111'::uuid, now() - interval '8 days'),
  ('fa000000-0000-0000-0000-000000000002'::uuid, 'Scale Pack Purchase (50 Credits)', 'pack_purchase', '10000000-0000-0000-0000-000000000003', 'a1111111-1111-1111-1111-111111111111'::uuid, now() - interval '5 days'),
  ('fa000000-0000-0000-0000-000000000003'::uuid, 'Unlocked Siam Horizon DMC Connection', 'rfq_connect', 'conn_01', 'a1111111-1111-1111-1111-111111111111'::uuid, now() - interval '3 days'),
  ('fa000000-0000-0000-0000-000000000004'::uuid, 'Growth Pack Subscription (20 Credits)', 'pack_purchase', '20000000-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111'::uuid, now() - interval '2 days'),
  ('fa000000-0000-0000-0000-000000000005'::uuid, 'Admin Onboarding Loyalty Credit Adjustment', 'admin_adjustment', 'adj_01', (select id from public.profiles where role = 'admin' order by created_at limit 1), now() - interval '1 day')
on conflict (id) do nothing;

insert into public.credit_ledger (
  id, transaction_id, account_id, profile_id, entry_type, amount, balance_after,
  reference_type, reference_id, description, created_at
) values
  ('fb000000-0000-0000-0000-000000000001'::uuid, 'fa000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 'credit', 20, 20, 'pack_purchase', '20000000-0000-0000-0000-000000000002', 'Growth Pack Subscription (20 Credits)', now() - interval '8 days'),
  ('fb000000-0000-0000-0000-000000000002'::uuid, 'fa000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 'credit', 50, 70, 'pack_purchase', '10000000-0000-0000-0000-000000000003', 'Scale Pack Purchase (50 Credits)', now() - interval '5 days'),
  ('fb000000-0000-0000-0000-000000000003'::uuid, 'fa000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 'debit', 25, 45, 'rfq_connect', 'conn_01', 'Unlocked Siam Horizon DMC Connection', now() - interval '3 days'),
  ('fb000000-0000-0000-0000-000000000004'::uuid, 'fa000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 'credit', 20, 20, 'pack_purchase', '20000000-0000-0000-0000-000000000002', 'Growth Pack Subscription (20 Credits)', now() - interval '2 days'),
  ('fb000000-0000-0000-0000-000000000005'::uuid, 'fa000000-0000-0000-0000-000000000005'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 'a2222222-2222-2222-2222-222222222222'::uuid, 'credit', 15, 15, 'admin_adjustment', 'adj_01', 'Admin Onboarding Loyalty Credit Adjustment', now() - interval '1 day')
on conflict (id) do nothing;

-- 5. Seed RFQs
insert into public.rfqs (
  id, agent_id, rfq_number, status, title, travelers_adults, travelers_children, travelers_infants,
  start_date, end_date, duration_days, duration_nights, budget_min, budget_max, currency, notes,
  ai_extracted_data, published_at, closed_at, created_at
) values
(
  'f1000000-0000-0000-0000-000000000001'::uuid,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'RFQ-2026-7731',
  'quoted',
  'Luxury Honeymoon in Phuket & Bangkok',
  2, 0, 0,
  '2026-11-12'::date, '2026-11-19'::date,
  8, 7,
  280000.00, 350000.00, 'INR',
  'Clients prefer private pool villa in Phuket and riverside 5-star in Bangkok. Require airport VIP meet & greet.',
  '{"confidence_score": 0.94, "destinations": ["Phuket", "Bangkok"], "hotel_stars": "5_star"}'::jsonb,
  now() - interval '3 days', null, now() - interval '4 days'
),
(
  'f1000000-0000-0000-0000-000000000002'::uuid,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'RFQ-2026-6912',
  'published',
  'Family Alpine Winter Experience (Switzerland)',
  4, 2, 0,
  '2026-12-04'::date, '2026-12-13'::date,
  10, 9,
  650000.00, 800000.00, 'INR',
  'Multi-gen family traveling with 2 kids (ages 7 and 11). Glacier Express panoramic rail and ski school lessons mandatory.',
  '{"confidence_score": 0.91, "destinations": ["Zermatt", "Interlaken", "Zurich"]}'::jsonb,
  now() - interval '1 day', null, now() - interval '2 days'
),
(
  'f1000000-0000-0000-0000-000000000003'::uuid,
  'a2222222-2222-2222-2222-222222222222'::uuid,
  'RFQ-2026-5540',
  'connected',
  'Executive Wellness Retreat in Ubud & Seminyak',
  6, 0, 0,
  '2027-01-15'::date, '2027-01-20'::date,
  6, 5,
  420000.00, 500000.00, 'INR',
  'C-suite executive group requiring luxury wellness resort with daily private yoga and cliffside seafood dining.',
  '{"confidence_score": 0.98, "destinations": ["Ubud", "Seminyak"]}'::jsonb,
  now() - interval '6 days', null, now() - interval '7 days'
),
(
  'f1000000-0000-0000-0000-000000000004'::uuid,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'RFQ-2026-4419',
  'closed',
  'Heritage Culture & Lantern Festival (Hoi An)',
  2, 0, 0,
  '2026-10-01'::date, '2026-10-07'::date,
  7, 6,
  180000.00, 220000.00, 'INR',
  'Budget brief successfully executed and closed.',
  '{"confidence_score": 0.88, "destinations": ["Hoi An", "Da Nang"]}'::jsonb,
  now() - interval '12 days', now() - interval '1 day', now() - interval '14 days'
)
on conflict (id) do nothing;

-- 6. Seed RFQ Destinations & Stays
insert into public.rfq_destinations (rfq_id, destination_name, country, nights, order_index)
values
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Phuket', 'Thailand', 4, 1),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Bangkok', 'Thailand', 3, 2),
  ('f1000000-0000-0000-0000-000000000002'::uuid, 'Zermatt', 'Switzerland', 4, 1),
  ('f1000000-0000-0000-0000-000000000002'::uuid, 'Interlaken', 'Switzerland', 5, 2),
  ('f1000000-0000-0000-0000-000000000003'::uuid, 'Ubud', 'Indonesia', 3, 1),
  ('f1000000-0000-0000-0000-000000000003'::uuid, 'Seminyak', 'Indonesia', 2, 2)
on conflict do nothing;

insert into public.rfq_stays (rfq_id, star_rating, hotel_type, meal_plan, room_count, preferences)
values
  ('f1000000-0000-0000-0000-000000000001'::uuid, '5_star', 'resort', 'breakfast', 1, 'Sea view villa preferred, King bed'),
  ('f1000000-0000-0000-0000-000000000002'::uuid, '5_star', 'chalet', 'half_board', 2, 'Connecting family rooms with mountain view'),
  ('f1000000-0000-0000-0000-000000000003'::uuid, 'luxury', 'villa', 'breakfast', 3, 'Private 3-bedroom pool villa complex')
on conflict do nothing;

-- 7. Seed Quotes
insert into public.quotes (
  id, rfq_id, dmc_id, quote_number, status, valid_until, total_net_cost,
  currency, response_time_seconds, notes, created_at
) values
(
  'fc000000-0000-0000-0000-000000000001'::uuid,
  'f1000000-0000-0000-0000-000000000001'::uuid,
  'd1111111-1111-1111-1111-111111111111'::uuid,
  'QTE-2026-8812',
  'submitted',
  now() + interval '10 days',
  248500.00,
  'INR',
  7200, -- 2 hours response time
  'Includes private luxury speedboat transfer and 5-star Anantara Layan pool villa.',
  now() - interval '2 days'
),
(
  'fc000000-0000-0000-0000-000000000002'::uuid,
  'f1000000-0000-0000-0000-000000000003'::uuid,
  'd1111111-1111-1111-1111-111111111111'::uuid,
  'QTE-2026-8819',
  'connected',
  now() + interval '15 days',
  365000.00,
  'INR',
  14400, -- 4 hours response time
  'Complete wellness package with Four Seasons Sayan and private chef dinners.',
  now() - interval '5 days'
)
on conflict (id) do nothing;

-- 8. Seed Connections
insert into public.connections (
  id, rfq_id, quote_id, agent_id, dmc_id, credit_amount_deducted, unlocked_at, created_at
) values (
  'fd000000-0000-0000-0000-000000000001'::uuid,
  'f1000000-0000-0000-0000-000000000003'::uuid,
  'fc000000-0000-0000-0000-000000000002'::uuid,
  'a2222222-2222-2222-2222-222222222222'::uuid,
  'd1111111-1111-1111-1111-111111111111'::uuid,
  5,
  now() - interval '3 days',
  now() - interval '3 days'
) on conflict do nothing;

-- 9. Seed Audit Log (Demonstrating R2 compliance)
insert into public.audit_log (
  id, actor_id, action, entity_type, entity_id, previous_state, new_state, created_at
) values
(
  'fe000000-0000-0000-0000-000000000001'::uuid,
  (select id from public.profiles where role = 'admin' order by created_at limit 1),
  'KYC_APPROVED',
  'kyc_records',
  'e1000000-0000-0000-0000-000000000003',
  '{"status": "pending"}'::jsonb,
  '{"status": "verified", "reason": "Incorporation and GSTIN active on GST portal. Tax compliance verified."}'::jsonb,
  now() - interval '1 day'
),
(
  'fe000000-0000-0000-0000-000000000002'::uuid,
  (select id from public.profiles where role = 'admin' order by created_at limit 1),
  'KYC_REJECTED',
  'kyc_records',
  'e1000000-0000-0000-0000-000000000004',
  '{"status": "pending"}'::jsonb,
  '{"status": "rejected", "reason": "Swiss Commercial Register extract was expired (dated 2021). Mandatory up-to-date apostille required."}'::jsonb,
  now() - interval '4 days'
),
(
  'fe000000-0000-0000-0000-000000000003'::uuid,
  (select id from public.profiles where role = 'admin' order by created_at limit 1),
  'CREDIT_ADJUSTMENT_CREDIT',
  'credit_accounts',
  'c1000000-0000-0000-0000-000000000003',
  '{"balance": 0}'::jsonb,
  '{"entry_type": "credit", "amount": 15, "balance": 15, "reason": "Admin Onboarding Loyalty Credit Adjustment"}'::jsonb,
  now() - interval '1 day'
)
on conflict (id) do nothing;

-- ============================================================================
-- DMCGrid Platform Migration: 00001_initial_schema.sql
-- All PRD Tables & Domain Constraints
-- ============================================================================

-- Ensure uuid-ossp or pgcrypto is available
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enum Types
do $$ begin
  create type user_role as enum ('agent', 'dmc', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type kyc_status_type as enum ('unsubmitted', 'pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rfq_status_type as enum ('draft', 'published', 'matching', 'quoted', 'connected', 'deal_created', 'closed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quote_status_type as enum ('draft', 'submitted', 'shortlisted', 'connected', 'rejected', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type line_item_service_type as enum ('Flight', 'Local Cab', 'Transfer', 'Hotel', 'Activity', 'Meal', 'Other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ledger_account_type as enum ('system_reserve', 'agent_wallet', 'platform_revenue', 'escrow');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ledger_direction_type as enum ('DEBIT', 'CREDIT');
exception when duplicate_object then null; end $$;

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  email text not null,
  full_name text not null,
  company_name text not null,
  phone text,
  country text not null default 'IN',
  city text,
  website text,
  is_verified boolean not null default false,
  kyc_status kyc_status_type not null default 'unsubmitted',
  credit_balance integer not null default 0 check (credit_balance >= 0),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. KYC RECORDS (Compliance R5: every brief is verified)
create table if not exists public.kyc_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null check (entity_type in ('proprietorship', 'partnership', 'pvt_ltd', 'llp', 'dmc_foreign', 'other')),
  tax_id text, -- GSTIN or PAN or foreign tax ID
  business_reg_number text,
  id_document_url text,
  business_document_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. RFQS (Demand side briefs created by verified agents)
create table if not exists public.rfqs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.profiles(id) on delete cascade,
  reference_code text unique not null,
  status rfq_status_type not null default 'draft',
  title text not null,
  traveler_count integer not null check (traveler_count > 0),
  traveler_type text check (traveler_type in ('couples', 'family', 'friends', 'solo', 'corporate', 'group')),
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  duration_nights integer not null check (duration_nights > 0),
  pacing text check (pacing in ('relaxed', 'moderate', 'packed')),
  budget_currency text not null default 'INR',
  budget_min numeric(12,2) check (budget_min >= 0),
  budget_max numeric(12,2) check (budget_max >= coalesce(budget_min, 0)),
  ai_confidence_score numeric(3,2) check (ai_confidence_score >= 0 and ai_confidence_score <= 1.0),
  ai_extracted_data jsonb,
  sla_expires_at timestamptz, -- R6: response clock visible, SLA timer on quote requests
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. RFQ DESTINATIONS (Child table)
create table if not exists public.rfq_destinations (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  destination_country text not null,
  destination_city text not null,
  order_index integer not null default 0,
  nights integer not null default 1 check (nights > 0),
  notes text,
  created_at timestamptz not null default now()
);

-- 5. RFQ STAYS (Child table)
create table if not exists public.rfq_stays (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  category text check (category in ('3_star', '4_star', '5_star', 'luxury', 'boutique', 'resort', 'villa')),
  room_count integer not null default 1 check (room_count > 0),
  room_type text default 'Double / Twin',
  meal_plan text check (meal_plan in ('ep', 'cp', 'map', 'ap', 'all_inclusive')),
  preferred_chains text[],
  notes text,
  created_at timestamptz not null default now()
);

-- 6. RFQ EXPERIENCES (Child table)
create table if not exists public.rfq_experiences (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  experience_type text not null,
  is_mandatory boolean not null default true,
  description text,
  created_at timestamptz not null default now()
);

-- 7. RFQ MATCHES (Supply side match feed)
create table if not exists public.rfq_matches (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  dmc_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'viewed', 'quoted', 'declined', 'expired')),
  match_score numeric(3,2) check (match_score >= 0 and match_score <= 1.0),
  notified_at timestamptz not null default now(),
  viewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (rfq_id, dmc_id)
);

-- 8. QUOTES (PRD R1: DMC identity hidden until agent spends credits to connect)
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  dmc_id uuid not null references public.profiles(id) on delete cascade,
  quote_code text unique not null,
  anonymous_label text not null, -- e.g. "Quote A", "Quote B", "Quote C"
  status quote_status_type not null default 'submitted',
  currency text not null default 'INR',
  valid_until timestamptz not null,
  notes text,
  inclusions text[],
  exclusions text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. QUOTE OPTIONS (Up to 3 package options per quote)
create table if not exists public.quote_options (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  option_name text not null, -- e.g. "Option 1 - Standard", "Option 2 - Premium 5★"
  net_cost numeric(12,2) not null check (net_cost > 0),
  currency text not null default 'INR',
  hotel_summary text,
  vehicle_type text,
  is_recommended boolean not null default false,
  created_at timestamptz not null default now()
);

-- 10. QUOTE LINE ITEMS (Day-wise itinerary & itemized build-up)
create table if not exists public.quote_line_items (
  id uuid primary key default gen_random_uuid(),
  quote_option_id uuid not null references public.quote_options(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  time_slot text,
  service_type line_item_service_type not null,
  title text not null,
  description text,
  reference_notes text,
  unit_cost numeric(12,2) not null default 0 check (unit_cost >= 0),
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- 11. CONNECTIONS (Unlocked via credit debit per R1 & R4)
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  dmc_id uuid not null references public.profiles(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  credits_spent integer not null check (credits_spent > 0),
  status text not null default 'active' check (status in ('active', 'closed')),
  connected_at timestamptz not null default now(),
  unique (rfq_id, dmc_id)
);

-- 12. DEALS (Deal sheet with V62 cost formula binding R8)
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  quote_option_id uuid not null references public.quote_options(id) on delete cascade,
  net_cost numeric(12,2) not null check (net_cost >= 0),
  margin_type text not null default 'percentage' check (margin_type in ('percentage', 'fixed')),
  margin_rate numeric(6,2) not null default 12.00, -- 12% default agent margin
  margin_amount numeric(12,2) not null check (margin_amount >= 0),
  ancillary_costs numeric(12,2) not null default 0 check (ancillary_costs >= 0),
  ancillary_charges numeric(12,2) not null default 0 check (ancillary_charges >= 0),
  ancillary_margin numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  gst_pct numeric(5,2) not null default 5.00 check (gst_pct >= 0),
  gst_amount numeric(12,2) not null default 0 check (gst_amount >= 0),
  tcs_pct numeric(5,2) not null default 5.00 check (tcs_pct >= 0),
  tcs_amount numeric(12,2) not null default 0 check (tcs_amount >= 0),
  total_customer_price numeric(12,2) not null check (total_customer_price >= 0),
  tds_paid numeric(12,2) not null default 0 check (tds_paid >= 0),
  tds_payable numeric(12,2) not null default 0 check (tds_payable >= 0),
  gross_profit numeric(12,2) not null default 0,
  cash_profit numeric(12,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'approved', 'proposal_generated', 'completed', 'cancelled')),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 13. PROPOSALS (Pattern D itinerary proposal)
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  brand_name text not null,
  hero_headline text,
  total_display_price numeric(12,2) not null check (total_display_price >= 0),
  currency text not null default 'INR',
  itinerary_payload jsonb not null default '[]'::jsonb,
  inclusions_payload jsonb default '[]'::jsonb,
  exclusions_payload jsonb default '[]'::jsonb,
  terms_payload jsonb default '[]'::jsonb,
  status text not null default 'published' check (status in ('draft', 'published', 'accepted', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 14. SHARE TOKENS (Public tokenized traveler link, no auth)
create table if not exists public.share_tokens (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz,
  view_count integer not null default 0 check (view_count >= 0),
  last_viewed_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 15. PLANS (Credit packages & tier pricing)
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null, -- 'starter', 'growth', 'scale'
  name text not null,
  price_inr numeric(10,2) not null check (price_inr >= 0),
  credits_included integer not null check (credits_included > 0),
  features jsonb default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 16. CREDIT PACKS (Razorpay checkout orders & receipts)
create table if not exists public.credit_packs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.plans(id),
  credits integer not null check (credits > 0),
  amount_paid numeric(10,2) not null check (amount_paid >= 0),
  currency text not null default 'INR',
  payment_gateway text not null default 'razorpay',
  gateway_order_id text,
  gateway_payment_id text,
  status text not null default 'pending' check (status in ('pending', 'captured', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 17. CREDIT LEDGER (Double-Entry Bookkeeping System)
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null, -- links paired DEBIT and CREDIT journal entries
  profile_id uuid references public.profiles(id) on delete set null,
  account_type ledger_account_type not null,
  direction ledger_direction_type not null,
  amount integer not null check (amount > 0),
  balance_after integer,
  reference_type text not null check (reference_type in ('purchase', 'connect_fee', 'refund', 'bonus', 'admin_adjustment')),
  reference_id uuid,
  description text not null,
  created_at timestamptz not null default now()
);

-- 18. NOTIFICATIONS (Realtime triggers for agent & DMC)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  payload jsonb,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- 19. AUDIT LOG (Compliance R2: Server-side approvals with actor + timestamp)
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_role text not null,
  action text not null,
  target_type text not null,
  target_id uuid not null,
  previous_state jsonb,
  new_state jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Prevent edits or deletes on audit_log (Immutable Log)
create or replace function public.prevent_audit_log_modification()
returns trigger as $$
begin
  raise exception 'audit_log records are strictly immutable and cannot be updated or deleted';
end;
$$ language plpgsql;

drop trigger if exists trg_prevent_audit_log_mod on public.audit_log;
create trigger trg_prevent_audit_log_mod
  before update or delete on public.audit_log
  for each row execute function public.prevent_audit_log_modification();

-- Performance Indexes
create index if not exists idx_rfqs_agent_id on public.rfqs(agent_id);
create index if not exists idx_rfqs_status on public.rfqs(status);
create index if not exists idx_rfq_matches_dmc_id on public.rfq_matches(dmc_id);
create index if not exists idx_rfq_matches_rfq_id on public.rfq_matches(rfq_id);
create index if not exists idx_quotes_rfq_id on public.quotes(rfq_id);
create index if not exists idx_quotes_dmc_id on public.quotes(dmc_id);
create index if not exists idx_connections_rfq_id on public.connections(rfq_id);
create index if not exists idx_connections_agent_id on public.connections(agent_id);
create index if not exists idx_connections_dmc_id on public.connections(dmc_id);
create index if not exists idx_deals_rfq_id on public.deals(rfq_id);
create index if not exists idx_deals_connection_id on public.deals(connection_id);
create index if not exists idx_share_tokens_token on public.share_tokens(token);
create index if not exists idx_credit_ledger_tx on public.credit_ledger(transaction_id);
create index if not exists idx_credit_ledger_profile on public.credit_ledger(profile_id);
create index if not exists idx_notifications_profile on public.notifications(profile_id, is_read);
create index if not exists idx_audit_log_target on public.audit_log(target_type, target_id);

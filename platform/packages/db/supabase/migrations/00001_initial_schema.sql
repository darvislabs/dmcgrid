-- ═══════════════════════════════════════════════════════════
-- DMCGrid Platform Database Migration 00001
-- Initial Schema: Core Tables, Enums, Constraints, Indexes
-- ═══════════════════════════════════════════════════════════

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('agent', 'dmc', 'admin');
create type kyc_status as enum ('draft', 'pending', 'verified', 'rejected');
create type rfq_status as enum ('draft', 'published', 'quoted', 'connected', 'closed');
create type rfq_match_status as enum ('notified', 'viewed', 'quoted', 'passed');
create type quote_status as enum ('submitted', 'shortlisted', 'connected', 'declined');
create type time_window_type as enum ('morning', 'afternoon', 'evening', 'night');
create type markup_calc_type as enum ('percentage', 'fixed');
create type approval_status as enum ('draft', 'pending', 'approved', 'rejected');
create type proposal_status as enum ('draft', 'shared', 'accepted');
create type ledger_entry_type as enum ('debit', 'credit');
create type credit_account_type as enum ('agent_wallet', 'dmc_escrow', 'platform_revenue', 'system_reserve');

-- 1. Profiles Table (linked to Supabase auth.users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role user_role not null default 'agent',
    company_name text not null,
    contact_name text not null,
    email text not null unique,
    phone text,
    avatar_url text,
    kyc_status kyc_status not null default 'pending',
    bio text,
    operating_destinations text[] default '{}',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. KYC Records Table (verification before first RFQ / quote)
create table if not exists public.kyc_records (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references public.profiles(id) on delete cascade,
    business_reg_number text not null,
    tax_id_pan text not null,
    gst_number text,
    documents_urls jsonb not null default '[]'::jsonb,
    status kyc_status not null default 'draft',
    reviewer_id uuid references public.profiles(id),
    review_notes text,
    submitted_at timestamptz,
    reviewed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. RFQs Table (Request for Quotations)
create table if not exists public.rfqs (
    id uuid primary key default gen_random_uuid(),
    agent_id uuid not null references public.profiles(id) on delete restrict,
    rfq_number text not null unique,
    status rfq_status not null default 'draft',
    title text not null,
    travelers_adults integer not null default 2 check (travelers_adults >= 1),
    travelers_children integer not null default 0 check (travelers_children >= 0),
    travelers_infants integer not null default 0 check (travelers_infants >= 0),
    start_date date not null,
    end_date date not null,
    duration_days integer not null check (duration_days >= 1),
    duration_nights integer not null check (duration_nights >= 0),
    budget_min numeric(12, 2) check (budget_min >= 0),
    budget_max numeric(12, 2) check (budget_max >= budget_min),
    currency text not null default 'INR',
    notes text,
    ai_extracted_data jsonb default '{}'::jsonb,
    published_at timestamptz,
    closed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint valid_rfq_dates check (end_date >= start_date)
);

-- 4. RFQ Destinations (Child: multi-destination itinerary pacing)
create table if not exists public.rfq_destinations (
    id uuid primary key default gen_random_uuid(),
    rfq_id uuid not null references public.rfqs(id) on delete cascade,
    destination_name text not null,
    country text not null,
    nights integer not null check (nights >= 0),
    order_index integer not null default 0,
    created_at timestamptz not null default now()
);

-- 5. RFQ Stays (Child: hotel & accommodation requirements)
create table if not exists public.rfq_stays (
    id uuid primary key default gen_random_uuid(),
    rfq_id uuid not null references public.rfqs(id) on delete cascade,
    star_rating text not null default '4_star',
    hotel_type text not null default 'hotel',
    meal_plan text not null default 'breakfast',
    room_count integer not null default 1 check (room_count >= 1),
    preferences text,
    created_at timestamptz not null default now()
);

-- 6. RFQ Experiences (Child: activities, sightseeing & dietary requirements)
create table if not exists public.rfq_experiences (
    id uuid primary key default gen_random_uuid(),
    rfq_id uuid not null references public.rfqs(id) on delete cascade,
    category text not null,
    description text not null,
    required boolean not null default true,
    created_at timestamptz not null default now()
);

-- 7. RFQ Matches Table (matching briefs to qualified DMCs)
create table if not exists public.rfq_matches (
    id uuid primary key default gen_random_uuid(),
    rfq_id uuid not null references public.rfqs(id) on delete cascade,
    dmc_id uuid not null references public.profiles(id) on delete cascade,
    match_score numeric(5, 2) not null default 0.00 check (match_score >= 0 and match_score <= 100),
    match_reasons jsonb not null default '[]'::jsonb,
    status rfq_match_status not null default 'notified',
    notified_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    constraint unique_rfq_dmc_match unique (rfq_id, dmc_id)
);

-- 8. Quotes Table (submitted anonymously by DMCs)
create table if not exists public.quotes (
    id uuid primary key default gen_random_uuid(),
    rfq_id uuid not null references public.rfqs(id) on delete cascade,
    dmc_id uuid not null references public.profiles(id) on delete restrict,
    quote_number text not null unique,
    status quote_status not null default 'submitted',
    valid_until timestamptz not null,
    total_net_cost numeric(12, 2) not null check (total_net_cost >= 0),
    currency text not null default 'INR',
    response_time_seconds integer check (response_time_seconds >= 0),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 9. Quote Options Table (e.g. Standard, Premium, Luxury - max 3 options per quote)
create table if not exists public.quote_options (
    id uuid primary key default gen_random_uuid(),
    quote_id uuid not null references public.quotes(id) on delete cascade,
    option_name text not null,
    description text,
    net_cost numeric(12, 2) not null check (net_cost >= 0),
    currency text not null default 'INR',
    is_selected boolean not null default false,
    order_index integer not null default 0,
    day_count integer not null default 1,
    created_at timestamptz not null default now()
);

-- 10. Quote Line Items Table (day-wise & time-window activities)
create table if not exists public.quote_line_items (
    id uuid primary key default gen_random_uuid(),
    quote_option_id uuid not null references public.quote_options(id) on delete cascade,
    day_number integer not null check (day_number >= 1),
    time_window time_window_type not null default 'morning',
    title text not null,
    description text,
    cost_category text not null default 'activity',
    net_cost numeric(12, 2) not null default 0.00 check (net_cost >= 0),
    created_at timestamptz not null default now()
);

-- 11. Connections Table (Agent spends credits to unlock DMC identity)
create table if not exists public.connections (
    id uuid primary key default gen_random_uuid(),
    rfq_id uuid not null references public.rfqs(id) on delete restrict,
    quote_id uuid not null references public.quotes(id) on delete restrict,
    agent_id uuid not null references public.profiles(id) on delete restrict,
    dmc_id uuid not null references public.profiles(id) on delete restrict,
    credit_amount_deducted integer not null default 1 check (credit_amount_deducted >= 0),
    unlocked_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    constraint unique_agent_quote_connection unique (agent_id, quote_id)
);

-- 12. Deals Table (Deal Sheet & Profitability calculation)
create table if not exists public.deals (
    id uuid primary key default gen_random_uuid(),
    rfq_id uuid not null references public.rfqs(id) on delete restrict,
    connection_id uuid not null references public.connections(id) on delete restrict,
    agent_id uuid not null references public.profiles(id) on delete restrict,
    dmc_id uuid not null references public.profiles(id) on delete restrict,
    selected_quote_option_id uuid not null references public.quote_options(id) on delete restrict,
    net_cost numeric(12, 2) not null check (net_cost >= 0),
    markup_type markup_calc_type not null default 'percentage',
    markup_percentage numeric(5, 2) not null default 12.00 check (markup_percentage >= 0),
    markup_fixed numeric(12, 2) not null default 0.00 check (markup_fixed >= 0),
    ancillary_cost numeric(12, 2) not null default 0.00 check (ancillary_cost >= 0),
    ancillary_charge numeric(12, 2) not null default 0.00 check (ancillary_charge >= 0),
    gross_margin numeric(12, 2) not null default 0.00,
    gst_percentage numeric(5, 2) not null default 5.00 check (gst_percentage >= 0),
    gst_amount numeric(12, 2) not null default 0.00 check (gst_amount >= 0),
    tcs_percentage numeric(5, 2) not null default 5.00 check (tcs_percentage >= 0),
    tcs_amount numeric(12, 2) not null default 0.00 check (tcs_amount >= 0),
    customer_selling_price numeric(12, 2) not null default 0.00 check (customer_selling_price >= 0),
    tds_paid numeric(12, 2) not null default 0.00 check (tds_paid >= 0),
    tds_payable numeric(12, 2) not null default 0.00 check (tds_payable >= 0),
    cash_profit numeric(12, 2) not null default 0.00,
    manager_approval_status approval_status not null default 'draft',
    manager_approved_by uuid references public.profiles(id),
    manager_approved_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 13. Proposals Table (Customer-facing itinerary & presentation)
create table if not exists public.proposals (
    id uuid primary key default gen_random_uuid(),
    deal_id uuid not null references public.deals(id) on delete cascade,
    version integer not null default 1 check (version >= 1),
    title text not null,
    customer_name text not null,
    customer_email text,
    itinerary_json jsonb not null default '[]'::jsonb,
    terms text,
    total_price numeric(12, 2) not null check (total_price >= 0),
    currency text not null default 'INR',
    status proposal_status not null default 'draft',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 14. Share Tokens Table (Tokenized traveler links, unauthenticated access)
create table if not exists public.share_tokens (
    id uuid primary key default gen_random_uuid(),
    proposal_id uuid not null references public.proposals(id) on delete cascade,
    token text not null unique,
    views_count integer not null default 0 check (views_count >= 0),
    last_viewed_at timestamptz,
    expires_at timestamptz,
    created_at timestamptz not null default now()
);

-- 15. Double-Entry Credit Accounts & Transactions
create table if not exists public.credit_accounts (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid references public.profiles(id) on delete cascade,
    account_type credit_account_type not null,
    name text not null,
    balance integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint unique_profile_account unique (profile_id, account_type)
);

create table if not exists public.credit_transactions (
    id uuid primary key default gen_random_uuid(),
    description text not null,
    reference_type text not null, -- 'pack_purchase', 'rfq_connect', 'admin_adjustment', 'refund'
    reference_id text,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now()
);

-- 15b. Credit Ledger Table (Double-entry journal records)
create table if not exists public.credit_ledger (
    id uuid primary key default gen_random_uuid(),
    transaction_id uuid not null references public.credit_transactions(id) on delete restrict,
    account_id uuid not null references public.credit_accounts(id) on delete restrict,
    profile_id uuid references public.profiles(id) on delete cascade,
    entry_type ledger_entry_type not null,
    amount integer not null check (amount > 0),
    balance_after integer not null,
    reference_type text not null,
    reference_id text,
    description text not null,
    idempotency_key text unique,
    created_at timestamptz not null default now()
);

-- 16. Credit Packs Table (Purchasable credit bundles)
create table if not exists public.credit_packs (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    credits integer not null check (credits > 0),
    price_inr numeric(10, 2) not null check (price_inr >= 0),
    gst_rate numeric(5, 2) not null default 18.00,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- 17. Plans Table (Platform subscription plans)
create table if not exists public.plans (
    id uuid primary key default gen_random_uuid(),
    plan_code text not null unique,
    name text not null,
    monthly_leads_included integer not null check (monthly_leads_included >= 0),
    price_inr numeric(10, 2) not null check (price_inr >= 0),
    description text,
    features jsonb not null default '[]'::jsonb,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- 18. Notifications Table (System & Realtime notifications)
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    recipient_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    body text not null,
    type text not null, -- 'quote_received', 'rfq_matched', 'credits_low', 'kyc_update', 'system'
    link text,
    is_read boolean not null default false,
    read_at timestamptz,
    created_at timestamptz not null default now()
);

-- 19. Audit Log Table (Immutable server-side action audit trail - PRD Rule R2)
create table if not exists public.audit_log (
    id uuid primary key default gen_random_uuid(),
    actor_id uuid references auth.users(id),
    action text not null,
    entity_type text not null,
    entity_id text not null,
    previous_state jsonb,
    new_state jsonb,
    ip_address text,
    user_agent text,
    created_at timestamptz not null default now()
);

-- Block UPDATE and DELETE on audit_log to guarantee immutability
create or replace function public.fn_prevent_audit_log_modification()
returns trigger as $$
begin
    raise exception 'audit_log records are immutable and cannot be updated or deleted';
end;
$$ language plpgsql;

create trigger trg_audit_log_immutable
    before update or delete on public.audit_log
    for each row execute function public.fn_prevent_audit_log_modification();

-- ── Performance Indexes ──
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_kyc_status on public.profiles(kyc_status);
create index if not exists idx_rfqs_agent_id on public.rfqs(agent_id);
create index if not exists idx_rfqs_status on public.rfqs(status);
create index if not exists idx_rfq_matches_dmc_id on public.rfq_matches(dmc_id);
create index if not exists idx_rfq_matches_rfq_id on public.rfq_matches(rfq_id);
create index if not exists idx_quotes_rfq_id on public.quotes(rfq_id);
create index if not exists idx_quotes_dmc_id on public.quotes(dmc_id);
create index if not exists idx_connections_agent_id on public.connections(agent_id);
create index if not exists idx_connections_dmc_id on public.connections(dmc_id);
create index if not exists idx_deals_rfq_id on public.deals(rfq_id);
create index if not exists idx_share_tokens_token on public.share_tokens(token);
create index if not exists idx_credit_ledger_profile on public.credit_ledger(profile_id);
create index if not exists idx_credit_ledger_account on public.credit_ledger(account_id);
create index if not exists idx_notifications_recipient on public.notifications(recipient_id, is_read);
create index if not exists idx_audit_log_actor on public.audit_log(actor_id);
create index if not exists idx_audit_log_entity on public.audit_log(entity_type, entity_id);

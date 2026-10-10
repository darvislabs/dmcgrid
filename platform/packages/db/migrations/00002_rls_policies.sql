-- ============================================================================
-- DMCGrid Platform Migration: 00002_rls_policies.sql
-- Row Level Security (RLS) Policies per Role (Agent, DMC, Admin, Traveler)
-- ============================================================================

-- Helper functions for RLS checks
create or replace function public.current_profile_role()
returns text as $$
  select role::text from public.profiles where id = auth.uid();
$$ language sql security definer stable;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Enable RLS on all PRD tables
alter table public.profiles enable row level security;
alter table public.kyc_records enable row level security;
alter table public.rfqs enable row level security;
alter table public.rfq_destinations enable row level security;
alter table public.rfq_stays enable row level security;
alter table public.rfq_experiences enable row level security;
alter table public.rfq_matches enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_options enable row level security;
alter table public.quote_line_items enable row level security;
alter table public.connections enable row level security;
alter table public.deals enable row level security;
alter table public.proposals enable row level security;
alter table public.share_tokens enable row level security;
alter table public.plans enable row level security;
alter table public.credit_packs enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

-- ============================================================================
-- 1. PROFILES POLICIES
-- ============================================================================
create policy "Admin full access to profiles"
  on public.profiles for all to authenticated
  using (public.is_admin());

create policy "Users can read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid());

create policy "Connected users can read counterparty profile"
  on public.profiles for select to authenticated
  using (
    -- Agent viewing connected DMC
    id in (select dmc_id from public.connections where agent_id = auth.uid())
    or
    -- DMC viewing connected Agent
    id in (select agent_id from public.connections where dmc_id = auth.uid())
  );

-- ============================================================================
-- 2. KYC RECORDS POLICIES
-- ============================================================================
create policy "Admin full access to kyc_records"
  on public.kyc_records for all to authenticated
  using (public.is_admin());

create policy "Users can read own kyc"
  on public.kyc_records for select to authenticated
  using (profile_id = auth.uid());

create policy "Users can insert own kyc"
  on public.kyc_records for insert to authenticated
  with check (profile_id = auth.uid());

-- ============================================================================
-- 3. RFQS POLICIES
-- ============================================================================
create policy "Admin full access to rfqs"
  on public.rfqs for all to authenticated
  using (public.is_admin());

create policy "Agents can view own rfqs"
  on public.rfqs for select to authenticated
  using (agent_id = auth.uid());

create policy "Agents can insert own rfqs"
  on public.rfqs for insert to authenticated
  with check (agent_id = auth.uid());

create policy "Agents can update own rfqs"
  on public.rfqs for update to authenticated
  using (agent_id = auth.uid());

create policy "Matched DMCs can view published rfqs"
  on public.rfqs for select to authenticated
  using (
    status in ('published', 'matching', 'quoted', 'connected')
    and id in (
      select rfq_id from public.rfq_matches
      where dmc_id = auth.uid() and status != 'declined'
    )
  );

-- ============================================================================
-- 4. RFQ CHILD TABLES (destinations, stays, experiences)
-- ============================================================================
-- Destinations
create policy "Admin full access to rfq_destinations"
  on public.rfq_destinations for all to authenticated
  using (public.is_admin());

create policy "Agent full access to own rfq_destinations"
  on public.rfq_destinations for all to authenticated
  using (rfq_id in (select id from public.rfqs where agent_id = auth.uid()));

create policy "Matched DMCs can view rfq_destinations"
  on public.rfq_destinations for select to authenticated
  using (rfq_id in (select rfq_id from public.rfq_matches where dmc_id = auth.uid()));

-- Stays
create policy "Admin full access to rfq_stays"
  on public.rfq_stays for all to authenticated
  using (public.is_admin());

create policy "Agent full access to own rfq_stays"
  on public.rfq_stays for all to authenticated
  using (rfq_id in (select id from public.rfqs where agent_id = auth.uid()));

create policy "Matched DMCs can view rfq_stays"
  on public.rfq_stays for select to authenticated
  using (rfq_id in (select rfq_id from public.rfq_matches where dmc_id = auth.uid()));

-- Experiences
create policy "Admin full access to rfq_experiences"
  on public.rfq_experiences for all to authenticated
  using (public.is_admin());

create policy "Agent full access to own rfq_experiences"
  on public.rfq_experiences for all to authenticated
  using (rfq_id in (select id from public.rfqs where agent_id = auth.uid()));

create policy "Matched DMCs can view rfq_experiences"
  on public.rfq_experiences for select to authenticated
  using (rfq_id in (select rfq_id from public.rfq_matches where dmc_id = auth.uid()));

-- ============================================================================
-- 5. RFQ MATCHES POLICIES
-- ============================================================================
create policy "Admin full access to rfq_matches"
  on public.rfq_matches for all to authenticated
  using (public.is_admin());

create policy "Agent can view matches on own rfqs"
  on public.rfq_matches for select to authenticated
  using (rfq_id in (select id from public.rfqs where agent_id = auth.uid()));

create policy "DMC can view own matches"
  on public.rfq_matches for select to authenticated
  using (dmc_id = auth.uid());

create policy "DMC can update own match status"
  on public.rfq_matches for update to authenticated
  using (dmc_id = auth.uid());

-- ============================================================================
-- 6. QUOTES POLICIES (R1 Anonymity enforced)
-- ============================================================================
create policy "Admin full access to quotes"
  on public.quotes for all to authenticated
  using (public.is_admin());

create policy "DMCs can manage own quotes"
  on public.quotes for all to authenticated
  using (dmc_id = auth.uid());

create policy "Agents can view submitted quotes for own rfqs"
  on public.quotes for select to authenticated
  using (
    status in ('submitted', 'shortlisted', 'connected')
    and rfq_id in (select id from public.rfqs where agent_id = auth.uid())
  );

-- ============================================================================
-- 7. QUOTE OPTIONS & LINE ITEMS POLICIES
-- ============================================================================
-- Quote Options
create policy "Admin full access to quote_options"
  on public.quote_options for all to authenticated
  using (public.is_admin());

create policy "DMCs can manage own quote_options"
  on public.quote_options for all to authenticated
  using (quote_id in (select id from public.quotes where dmc_id = auth.uid()));

create policy "Agents can view quote_options on their rfqs"
  on public.quote_options for select to authenticated
  using (
    quote_id in (
      select q.id from public.quotes q
      join public.rfqs r on r.id = q.rfq_id
      where r.agent_id = auth.uid()
    )
  );

-- Quote Line Items
create policy "Admin full access to quote_line_items"
  on public.quote_line_items for all to authenticated
  using (public.is_admin());

create policy "DMCs can manage own line items"
  on public.quote_line_items for all to authenticated
  using (
    quote_option_id in (
      select qo.id from public.quote_options qo
      join public.quotes q on q.id = qo.quote_id
      where q.dmc_id = auth.uid()
    )
  );

create policy "Agents can view line items on their rfqs"
  on public.quote_line_items for select to authenticated
  using (
    quote_option_id in (
      select qo.id from public.quote_options qo
      join public.quotes q on q.id = qo.quote_id
      join public.rfqs r on r.id = q.rfq_id
      where r.agent_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. CONNECTIONS POLICIES
-- ============================================================================
create policy "Admin full access to connections"
  on public.connections for all to authenticated
  using (public.is_admin());

create policy "Agent can view own connections"
  on public.connections for select to authenticated
  using (agent_id = auth.uid());

create policy "Agent can insert connections"
  on public.connections for insert to authenticated
  with check (agent_id = auth.uid());

create policy "DMC can view connections where they are counterparty"
  on public.connections for select to authenticated
  using (dmc_id = auth.uid());

-- ============================================================================
-- 9. DEALS POLICIES
-- ============================================================================
create policy "Admin full access to deals"
  on public.deals for all to authenticated
  using (public.is_admin());

create policy "Agents can manage own deals"
  on public.deals for all to authenticated
  using (
    connection_id in (select id from public.connections where agent_id = auth.uid())
  );

create policy "DMCs can view deal status on their connections"
  on public.deals for select to authenticated
  using (
    connection_id in (select id from public.connections where dmc_id = auth.uid())
  );

-- ============================================================================
-- 10. PROPOSALS POLICIES
-- ============================================================================
create policy "Admin full access to proposals"
  on public.proposals for all to authenticated
  using (public.is_admin());

create policy "Agents can manage own proposals"
  on public.proposals for all to authenticated
  using (agent_id = auth.uid());

create policy "Public token holder can view published proposal"
  on public.proposals for select to anon, authenticated
  using (
    status = 'published'
    and id in (
      select proposal_id from public.share_tokens
      where is_active = true and (expires_at is null or expires_at > now())
    )
  );

-- ============================================================================
-- 11. SHARE TOKENS POLICIES
-- ============================================================================
create policy "Admin full access to share_tokens"
  on public.share_tokens for all to authenticated
  using (public.is_admin());

create policy "Agents can manage tokens for their proposals"
  on public.share_tokens for all to authenticated
  using (
    proposal_id in (select id from public.proposals where agent_id = auth.uid())
  );

create policy "Public token lookup"
  on public.share_tokens for select to anon, authenticated
  using (is_active = true and (expires_at is null or expires_at > now()));

-- ============================================================================
-- 12. PLANS POLICIES
-- ============================================================================
create policy "Admin full access to plans"
  on public.plans for all to authenticated
  using (public.is_admin());

create policy "Everyone can view active plans"
  on public.plans for select to authenticated
  using (is_active = true);

-- ============================================================================
-- 13. CREDIT PACKS POLICIES
-- ============================================================================
create policy "Admin full access to credit_packs"
  on public.credit_packs for all to authenticated
  using (public.is_admin());

create policy "Users can view and create own credit packs"
  on public.credit_packs for all to authenticated
  using (profile_id = auth.uid());

-- ============================================================================
-- 14. CREDIT LEDGER POLICIES
-- ============================================================================
create policy "Admin full access to credit_ledger"
  on public.credit_ledger for all to authenticated
  using (public.is_admin());

create policy "Users can view own ledger entries"
  on public.credit_ledger for select to authenticated
  using (profile_id = auth.uid());

-- ============================================================================
-- 15. NOTIFICATIONS POLICIES
-- ============================================================================
create policy "Users can manage own notifications"
  on public.notifications for all to authenticated
  using (profile_id = auth.uid());

-- ============================================================================
-- 16. AUDIT LOG POLICIES (Append only, Read own actions or Admin all)
-- ============================================================================
create policy "Admin can view all audit logs"
  on public.audit_log for select to authenticated
  using (public.is_admin());

create policy "Users can view own audit logs"
  on public.audit_log for select to authenticated
  using (actor_id = auth.uid());

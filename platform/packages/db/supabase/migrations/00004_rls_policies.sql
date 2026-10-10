-- ═══════════════════════════════════════════════════════════
-- DMCGrid Platform Database Migration 00004
-- Row Level Security (RLS) Policies per Role: Agent, DMC, Admin, Traveler
-- ═══════════════════════════════════════════════════════════

-- ── Role Helper Functions ──
create or replace function public.auth_user_id()
returns uuid
language sql
stable
as $$
    select auth.uid();
$$;

create or replace function public.auth_user_role()
returns user_role
language sql
stable
as $$
    select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin' and is_active = true
    );
$$;

create or replace function public.is_agent()
returns boolean
language sql
stable
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'agent' and is_active = true
    );
$$;

create or replace function public.is_dmc()
returns boolean
language sql
stable
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'dmc' and is_active = true
    );
$$;

-- ── Enable RLS on all tables ──
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
alter table public.credit_accounts enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.credit_packs enable row level security;
alter table public.plans enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

-- ── 1. Profiles Policies ──
create policy "profiles_select_own_or_admin"
    on public.profiles for select
    using (
        auth.uid() = id
        or public.is_admin()
        or exists (
            -- Agent can see connected DMC
            select 1 from public.connections c
            where (c.agent_id = auth.uid() and c.dmc_id = profiles.id)
               or (c.dmc_id = auth.uid() and c.agent_id = profiles.id)
        )
    );

create policy "profiles_update_own_or_admin"
    on public.profiles for update
    using (auth.uid() = id or public.is_admin())
    with check (auth.uid() = id or public.is_admin());

create policy "profiles_insert_own_or_admin"
    on public.profiles for insert
    with check (auth.uid() = id or public.is_admin());

-- ── 2. KYC Records Policies ──
create policy "kyc_select_own_or_admin"
    on public.kyc_records for select
    using (profile_id = auth.uid() or public.is_admin());

create policy "kyc_insert_own"
    on public.kyc_records for insert
    with check (profile_id = auth.uid() or public.is_admin());

create policy "kyc_update_own_or_admin"
    on public.kyc_records for update
    using (
        (profile_id = auth.uid() and status in ('draft', 'rejected'))
        or public.is_admin()
    );

-- ── 3. RFQs Policies ──
create policy "rfqs_select_agent_matched_or_admin"
    on public.rfqs for select
    using (
        agent_id = auth.uid()
        or public.is_admin()
        or (
            status in ('published', 'quoted', 'connected')
            and exists (
                select 1 from public.rfq_matches m
                where m.rfq_id = rfqs.id and m.dmc_id = auth.uid()
            )
        )
    );

create policy "rfqs_insert_agent"
    on public.rfqs for insert
    with check (
        (agent_id = auth.uid() and public.is_agent())
        or public.is_admin()
    );

create policy "rfqs_update_agent_or_admin"
    on public.rfqs for update
    using (agent_id = auth.uid() or public.is_admin())
    with check (agent_id = auth.uid() or public.is_admin());

-- ── 4. RFQ Children (Destinations, Stays, Experiences) ──
create policy "rfq_children_select"
    on public.rfq_destinations for select
    using (
        exists (select 1 from public.rfqs r where r.id = rfq_destinations.rfq_id and (
            r.agent_id = auth.uid() or public.is_admin() or exists (
                select 1 from public.rfq_matches m where m.rfq_id = r.id and m.dmc_id = auth.uid()
            )
        ))
    );

create policy "rfq_destinations_modify"
    on public.rfq_destinations for all
    using (
        exists (select 1 from public.rfqs r where r.id = rfq_destinations.rfq_id and (r.agent_id = auth.uid() or public.is_admin()))
    );

create policy "rfq_stays_select"
    on public.rfq_stays for select
    using (
        exists (select 1 from public.rfqs r where r.id = rfq_stays.rfq_id and (
            r.agent_id = auth.uid() or public.is_admin() or exists (
                select 1 from public.rfq_matches m where m.rfq_id = r.id and m.dmc_id = auth.uid()
            )
        ))
    );

create policy "rfq_stays_modify"
    on public.rfq_stays for all
    using (
        exists (select 1 from public.rfqs r where r.id = rfq_stays.rfq_id and (r.agent_id = auth.uid() or public.is_admin()))
    );

create policy "rfq_experiences_select"
    on public.rfq_experiences for select
    using (
        exists (select 1 from public.rfqs r where r.id = rfq_experiences.rfq_id and (
            r.agent_id = auth.uid() or public.is_admin() or exists (
                select 1 from public.rfq_matches m where m.rfq_id = r.id and m.dmc_id = auth.uid()
            )
        ))
    );

create policy "rfq_experiences_modify"
    on public.rfq_experiences for all
    using (
        exists (select 1 from public.rfqs r where r.id = rfq_experiences.rfq_id and (r.agent_id = auth.uid() or public.is_admin()))
    );

-- ── 5. RFQ Matches Policies ──
create policy "rfq_matches_select"
    on public.rfq_matches for select
    using (
        dmc_id = auth.uid()
        or public.is_admin()
        or exists (select 1 from public.rfqs r where r.id = rfq_matches.rfq_id and r.agent_id = auth.uid())
    );

create policy "rfq_matches_admin_manage"
    on public.rfq_matches for all
    using (public.is_admin());

-- ── 6. Quotes Policies ──
create policy "quotes_select_dmc_agent_or_admin"
    on public.quotes for select
    using (
        dmc_id = auth.uid()
        or public.is_admin()
        or exists (
            select 1 from public.rfqs r
            where r.id = quotes.rfq_id and r.agent_id = auth.uid()
        )
    );

create policy "quotes_insert_dmc"
    on public.quotes for insert
    with check (
        (dmc_id = auth.uid() and public.is_dmc())
        or public.is_admin()
    );

create policy "quotes_update_dmc_or_admin"
    on public.quotes for update
    using (dmc_id = auth.uid() or public.is_admin());

-- ── 7. Quote Options & Line Items ──
create policy "quote_options_select"
    on public.quote_options for select
    using (
        exists (
            select 1 from public.quotes q
            join public.rfqs r on r.id = q.rfq_id
            where q.id = quote_options.quote_id
              and (q.dmc_id = auth.uid() or r.agent_id = auth.uid() or public.is_admin())
        )
    );

create policy "quote_options_manage"
    on public.quote_options for all
    using (
        exists (
            select 1 from public.quotes q
            where q.id = quote_options.quote_id
              and (q.dmc_id = auth.uid() or public.is_admin())
        )
    );

create policy "quote_line_items_select"
    on public.quote_line_items for select
    using (
        exists (
            select 1 from public.quote_options qo
            join public.quotes q on q.id = qo.quote_id
            join public.rfqs r on r.id = q.rfq_id
            where qo.id = quote_line_items.quote_option_id
              and (q.dmc_id = auth.uid() or r.agent_id = auth.uid() or public.is_admin())
        )
    );

create policy "quote_line_items_manage"
    on public.quote_line_items for all
    using (
        exists (
            select 1 from public.quote_options qo
            join public.quotes q on q.id = qo.quote_id
            where qo.id = quote_line_items.quote_option_id
              and (q.dmc_id = auth.uid() or public.is_admin())
        )
    );

-- ── 8. Connections Policies ──
create policy "connections_select"
    on public.connections for select
    using (
        agent_id = auth.uid()
        or dmc_id = auth.uid()
        or public.is_admin()
    );

create policy "connections_insert_agent"
    on public.connections for insert
    with check (
        (agent_id = auth.uid() and public.is_agent())
        or public.is_admin()
    );

-- ── 9. Deals Policies ──
create policy "deals_select"
    on public.deals for select
    using (
        agent_id = auth.uid()
        or dmc_id = auth.uid()
        or public.is_admin()
    );

create policy "deals_manage_agent_admin"
    on public.deals for all
    using (agent_id = auth.uid() or public.is_admin());

-- ── 10. Proposals Policies ──
create policy "proposals_select"
    on public.proposals for select
    using (
        exists (
            select 1 from public.deals d
            where d.id = proposals.deal_id
              and (d.agent_id = auth.uid() or public.is_admin())
        )
    );

create policy "proposals_manage_agent_admin"
    on public.proposals for all
    using (
        exists (
            select 1 from public.deals d
            where d.id = proposals.deal_id
              and (d.agent_id = auth.uid() or public.is_admin())
        )
    );

-- ── 11. Share Tokens Policies (Public traveler access via token) ──
create policy "share_tokens_select_public"
    on public.share_tokens for select
    using (
        (expires_at is null or expires_at > now())
        or exists (
            select 1 from public.proposals p
            join public.deals d on d.id = p.deal_id
            where p.id = share_tokens.proposal_id and (d.agent_id = auth.uid() or public.is_admin())
        )
    );

create policy "share_tokens_manage_agent"
    on public.share_tokens for all
    using (
        exists (
            select 1 from public.proposals p
            join public.deals d on d.id = p.deal_id
            where p.id = share_tokens.proposal_id and (d.agent_id = auth.uid() or public.is_admin())
        )
    );

-- ── 12. Credit Accounts & Ledger Policies ──
create policy "credit_accounts_select"
    on public.credit_accounts for select
    using (profile_id = auth.uid() or public.is_admin());

create policy "credit_transactions_select"
    on public.credit_transactions for select
    using (
        created_by = auth.uid()
        or public.is_admin()
        or exists (
            select 1 from public.credit_ledger l
            where l.transaction_id = credit_transactions.id and l.profile_id = auth.uid()
        )
    );

create policy "credit_ledger_select"
    on public.credit_ledger for select
    using (profile_id = auth.uid() or public.is_admin());

-- ── 13. Credit Packs & Plans Policies (Public Read) ──
create policy "credit_packs_public_read"
    on public.credit_packs for select
    using (is_active = true or public.is_admin());

create policy "credit_packs_admin_write"
    on public.credit_packs for all
    using (public.is_admin());

create policy "plans_public_read"
    on public.plans for select
    using (is_active = true or public.is_admin());

create policy "plans_admin_write"
    on public.plans for all
    using (public.is_admin());

-- ── 14. Notifications Policies ──
create policy "notifications_select_recipient"
    on public.notifications for select
    using (recipient_id = auth.uid() or public.is_admin());

create policy "notifications_update_recipient"
    on public.notifications for update
    using (recipient_id = auth.uid() or public.is_admin())
    with check (recipient_id = auth.uid() or public.is_admin());

-- ── 15. Audit Log Policies (Admin only read) ──
create policy "audit_log_select_admin"
    on public.audit_log for select
    using (public.is_admin());

create policy "audit_log_insert_authenticated"
    on public.audit_log for insert
    with check (auth.uid() is not null or public.is_admin());

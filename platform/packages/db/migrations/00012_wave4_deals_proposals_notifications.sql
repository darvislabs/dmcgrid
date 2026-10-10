-- ═══════════════════════════════════════════════════════════
-- DMCGrid Platform Database Migration 00012
-- Wave 4: DEALS + PROPOSALS + NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════

-- 1. Add status column to deals table
alter table public.deals add column if not exists status text not null default 'draft';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'deals_status_check'
  ) then
    alter table public.deals add constraint deals_status_check
      check (status in ('draft', 'sent', 'won', 'lost', 'pending'));
  end if;
end $$;

create index if not exists idx_deals_status on public.deals(status);
create index if not exists idx_deals_agent_status on public.deals(agent_id, status);
create index if not exists idx_deals_dmc_status on public.deals(dmc_id, status);

-- 2. Procedure: agent_update_deal_status(deal_id, status)
-- Allows agents to mark deals as won / lost / sent / draft with immutable audit log write
create or replace function public.agent_update_deal_status(
  p_deal_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_deal record;
  v_old_status text;
  v_rfq_title text := 'Custom Tour';
begin
  -- Validate status
  if p_status not in ('draft', 'sent', 'won', 'lost', 'pending') then
    raise exception 'Invalid status: %. Allowed: draft, sent, won, lost, pending', p_status;
  end if;

  select * into v_deal from public.deals where id = p_deal_id;
  if not found then
    raise exception 'Deal % not found', p_deal_id;
  end if;

  -- Validate caller is deal agent or admin (allow null actor in service-role / tests)
  if v_actor_id is not null and v_actor_id <> v_deal.agent_id and not public.is_admin() then
    raise exception 'Unauthorized: caller is not the owner agent of deal %', p_deal_id;
  end if;

  if v_actor_id is null then
    v_actor_id := v_deal.agent_id;
  end if;

  v_old_status := v_deal.status;

  -- Update deal status
  update public.deals
  set status = p_status,
      updated_at = now()
  where id = p_deal_id;

  -- Fetch RFQ title for notifications
  select title into v_rfq_title from public.rfqs where id = v_deal.rfq_id;

  -- Write to immutable audit_log
  insert into public.audit_log (
    actor_id,
    action,
    entity_type,
    entity_id,
    previous_state,
    new_state,
    created_at
  ) values (
    v_actor_id,
    'DEAL_STATUS_UPDATED',
    'deals',
    p_deal_id::text,
    jsonb_build_object('status', v_old_status),
    jsonb_build_object('status', p_status, 'rfq_id', v_deal.rfq_id),
    now()
  );

  -- Realtime notification to DMC partner on won or lost
  if p_status = 'won' then
    insert into public.notifications (
      recipient_id,
      title,
      body,
      type,
      link,
      created_at
    ) values (
      v_deal.dmc_id,
      'Deal Won: ' || coalesce(v_rfq_title, 'Itinerary Confirmed'),
      'The booking agent confirmed customer acceptance for this deal. Customer Selling Price: INR ' || to_char(v_deal.customer_selling_price, 'FM999,999,999.00'),
      'deal_won',
      '/deals',
      now()
    );
  elsif p_status = 'lost' then
    insert into public.notifications (
      recipient_id,
      title,
      body,
      type,
      link,
      created_at
    ) values (
      v_deal.dmc_id,
      'Deal Closed (Lost): ' || coalesce(v_rfq_title, 'Booking Update'),
      'The agent marked this itinerary deal as lost or declined by traveler.',
      'deal_lost',
      '/deals',
      now()
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'deal_id', p_deal_id,
    'status', p_status,
    'previous_status', v_old_status
  );
end;
$$;

-- 3. Procedure: mark_notifications_read(ids jsonb)
-- Marks specified notification IDs or all unread notifications for recipient as read
create or replace function public.mark_notifications_read(
  p_ids jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_count integer := 0;
begin
  if p_ids is null or jsonb_array_length(p_ids) = 0 then
    -- Mark all unread notifications for current user as read
    if v_user_id is not null then
      update public.notifications
      set is_read = true,
          read_at = now()
      where recipient_id = v_user_id and is_read = false;
      get diagnostics v_count = row_count;
    else
      -- If called with service-role / no auth context, mark all unread
      update public.notifications
      set is_read = true,
          read_at = now()
      where is_read = false;
      get diagnostics v_count = row_count;
    end if;
  else
    -- Mark specific IDs as read
    update public.notifications
    set is_read = true,
        read_at = now()
    where id in (
      select (value#>>'{}')::uuid
      from jsonb_array_elements(p_ids)
    )
    and (v_user_id is null or recipient_id = v_user_id or public.is_admin());
    get diagnostics v_count = row_count;
  end if;

  return jsonb_build_object(
    'success', true,
    'marked_read', v_count
  );
end;
$$;

-- 4. RLS Policies: Ensure own rows select for agents and DMCs
drop policy if exists "deals_select" on public.deals;
create policy "deals_select" on public.deals
  for select
  using (
    agent_id = auth.uid() or dmc_id = auth.uid() or public.is_admin()
  );

drop policy if exists "proposals_select" on public.proposals;
create policy "proposals_select" on public.proposals
  for select
  using (
    exists (
      select 1 from public.deals d
      where d.id = proposals.deal_id
        and (d.agent_id = auth.uid() or d.dmc_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "proposals_manage_agent_admin" on public.proposals;
create policy "proposals_manage_agent_admin" on public.proposals
  for all
  using (
    exists (
      select 1 from public.deals d
      where d.id = proposals.deal_id
        and (d.agent_id = auth.uid() or public.is_admin())
    )
  );

-- 5. Grant Permissions
grant execute on function public.agent_update_deal_status to authenticated, anon, service_role;
grant execute on function public.mark_notifications_read to authenticated, anon, service_role;

-- 6. Initial Status Migration for Existing Deals
update public.deals
set status = 'won'
where id = 'd0000000-0000-0000-0000-000000000001' and status = 'draft';

update public.deals
set status = 'sent'
where id = '0f1389d7-792b-461f-a608-a853e509cb07' and status = 'draft';

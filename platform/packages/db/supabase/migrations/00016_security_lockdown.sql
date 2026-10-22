-- 00016: WAVE 6a SECURITY LOCKDOWN (P0 fixes)
-- SEC-04 admin RPC revokes · SEC-05 profile-privilege trigger · SEC-06/12 unlock ownership+fixed fee
-- SEC-16 deal-status ownership · SEC-08 share tokens via RPC · SEC-11 rfq direct-insert lock
-- DEF-01 onboarding KYC gate lands in the app layer with this deploy.

-- ============================================================
-- 1. SEC-04: admin_* RPCs — revoke from anon/public
-- ============================================================
revoke execute on function public.admin_adjust_credits from public, anon;
revoke execute on function public.admin_review_kyc from public, anon;
revoke execute on function public.admin_toggle_user_active from public, anon;
revoke execute on function public.admin_force_close_rfq from public, anon;
revoke execute on function public.admin_save_plan from public, anon;

-- ============================================================
-- 2. SEC-05: profiles privileged columns protected from client PATCH
-- ============================================================
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own_safe" on public.profiles;

create policy "profiles_update_own_safe" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create or replace function public.protect_profile_privileged_cols()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('request.jwt.claims', true) is null then
    return new;  -- server-side (postgres) writes bypass
  end if;
  new.role := old.role;
  new.kyc_status := old.kyc_status;
  new.is_active := old.is_active;
  new.id := old.id;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile on public.profiles;
create trigger trg_protect_profile
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_cols();

-- ============================================================
-- 3. SEC-06 + SEC-12: agent_unlock_connection — caller must BE the paying agent; cost fixed at 5
-- ============================================================
revoke execute on function public.agent_unlock_connection from public, anon;

CREATE OR REPLACE FUNCTION public.agent_unlock_connection(p_agent_id uuid, p_dmc_id uuid, p_quote_id uuid DEFAULT NULL::uuid, p_rfq_id uuid DEFAULT NULL::uuid, p_credit_cost integer DEFAULT 5)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
declare
  v_actor_id uuid := coalesce(auth.uid(), p_agent_id);
  v_account_id uuid;
  v_cur_balance integer := 0;
  v_new_balance integer := 0;
  v_conn_id uuid;
  v_tx_id uuid;
  v_dmc_name text := 'Destination Specialist';
  v_rfq_id uuid := p_rfq_id;
  v_cost integer := 5;  -- SEC-12: server-side constant, client value ignored
begin
  -- SEC-06 guard: caller must BE the paying agent
  if auth.uid() is null or auth.uid() <> p_agent_id then
    raise exception 'UNAUTHORIZED: cannot spend another agent''s wallet';
  end if;
  -- Resolve RFQ ID from quote if not passed
  if v_rfq_id is null and p_quote_id is not null then
    select rfq_id into v_rfq_id from public.quotes where id = p_quote_id;
  end if;

  -- Fetch DMC name
  select coalesce(company_name, contact_name, 'DMC Specialist') into v_dmc_name
  from public.profiles where id = p_dmc_id;

  -- 1. Check if an active connection already exists
  select id into v_conn_id
  from public.connections
  where agent_id = p_agent_id
    and dmc_id = p_dmc_id
    and (p_quote_id is null or quote_id = p_quote_id or quote_id is null)
  limit 1;

  if v_conn_id is not null then
    return jsonb_build_object(
      'success', true,
      'already_unlocked', true,
      'connection_id', v_conn_id,
      'message', 'Connection is already unlocked'
    );
  end if;

  -- 2. Lock & Check Agent Wallet Balance
  select id, balance into v_account_id, v_cur_balance
  from public.credit_accounts
  where profile_id = p_agent_id and account_type = 'agent_wallet'
  for update;

  if not found then
    -- Create wallet if missing (initial 0 credits)
    insert into public.credit_accounts (profile_id, account_type, name, balance)
    values (p_agent_id, 'agent_wallet', 'Agent Credits Wallet', 0)
    returning id, balance into v_account_id, v_cur_balance;
  end if;

  if v_cur_balance < v_cost then
    raise exception 'Insufficient credits: current wallet balance is %, cannot debit % credits', v_cur_balance, v_cost;
  end if;

  v_new_balance := v_cur_balance - v_cost;

  -- 3. Update Wallet Balance
  update public.credit_accounts
  set balance = v_new_balance,
      updated_at = now()
  where id = v_account_id;

  -- 4. Create Credit Transaction
  insert into public.credit_transactions (
    description,
    reference_type,
    reference_id,
    created_by
  ) values (
    'Unlocked ' || v_dmc_name || ' Connection',
    'rfq_connect',
    coalesce(p_quote_id::text, p_dmc_id::text),
    v_actor_id
  ) returning id into v_tx_id;

  -- 5. Insert Credit Ledger Entry
  insert into public.credit_ledger (
    transaction_id,
    account_id,
    profile_id,
    entry_type,
    amount,
    balance_after,
    reference_type,
    reference_id,
    description
  ) values (
    v_tx_id,
    v_account_id,
    p_agent_id,
    'debit',
    v_cost,
    v_new_balance,
    'rfq_connect',
    coalesce(p_quote_id::text, p_dmc_id::text),
    'Unlocked ' || v_dmc_name || ' Connection'
  );

  -- 6. Insert Connection Record
  insert into public.connections (
    rfq_id,
    quote_id,
    agent_id,
    dmc_id,
    credit_amount_deducted,
    unlocked_at,
    created_at
  ) values (
    v_rfq_id,
    p_quote_id,
    p_agent_id,
    p_dmc_id,
    v_cost,
    now(),
    now()
  ) returning id into v_conn_id;

  -- 7. Update Quote and RFQ status if applicable
  if p_quote_id is not null then
    update public.quotes set status = 'connected', updated_at = now() where id = p_quote_id;
  end if;

  if v_rfq_id is not null then
    update public.rfqs set status = 'connected', updated_at = now() where id = v_rfq_id;
  end if;

  -- 8. Immutable Audit Log Write
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
    'CONNECTION_UNLOCKED',
    'connections',
    v_conn_id::text,
    null,
    jsonb_build_object(
      'agent_id', p_agent_id,
      'dmc_id', p_dmc_id,
      'quote_id', p_quote_id,
      'rfq_id', v_rfq_id,
      'credits_debited', v_cost,
      'balance_after', v_new_balance
    ),
    now()
  );

  -- 9. Notification to DMC
  insert into public.notifications (
    recipient_id,
    title,
    body,
    type,
    link,
    created_at
  ) values (
    p_dmc_id,
    'Verified Agent Unlocked Connection',
    'An agent has used ' || v_cost || ' credits to unlock your contact for direct proposal collaboration.',
    'rfq_matched',
    '/feed#deals',
    now()
  );

  return jsonb_build_object(
    'success', true,
    'connection_id', v_conn_id,
    'new_balance', v_new_balance,
    'cost', v_cost
  );
end;
$$;

grant execute on function public.agent_unlock_connection to authenticated;

-- ============================================================
-- 4. SEC-16: agent_update_deal_status — caller must own the deal (agent side) or be admin
-- ============================================================
revoke execute on function public.agent_update_deal_status from public, anon;

CREATE OR REPLACE FUNCTION public.agent_update_deal_status(p_deal_id uuid, p_status text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
declare
  v_actor_id uuid := auth.uid();
  v_deal record;
  v_old_status text;
  v_rfq_title text := 'Custom Tour';
begin
  -- SEC-16 guard: caller must own the deal (agent side) or be admin
  if auth.uid() is null then
    raise exception 'UNAUTHORIZED';
  end if;
  if not exists (
    select 1 from public.deals dl
    where dl.id = p_deal_id
      and (dl.agent_id = auth.uid()
           or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin'))
  ) then
    raise exception 'UNAUTHORIZED: not your deal';
  end if;
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

grant execute on function public.agent_update_deal_status to authenticated;

-- ============================================================
-- 5. SEC-08: share_tokens — no anon listing; share pages verify by exact token via RPC
-- ============================================================
revoke select on public.share_tokens from anon;

create or replace function public.share_lookup(p_token text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select to_jsonb(t)
  from public.share_tokens t
  where t.token = p_token
    and (t.expires_at is null or t.expires_at > now())
  limit 1;
$$;

grant execute on function public.share_lookup to anon, authenticated;

-- ============================================================
-- 6. SEC-11: rfqs — direct INSERT impossible for clients (fee bypass); only via RPC
-- ============================================================
drop policy if exists rfqs_insert_agent on public.rfqs;
create policy rfqs_insert_agent on public.rfqs
  for insert to authenticated
  with check (false);

-- ============================================================
-- 7. SEC-13/SEC-12: quote + deal fns — no anon execution
-- ============================================================
revoke execute on function public.agent_accept_quote from public, anon;
grant execute on function public.agent_accept_quote to authenticated;
revoke execute on function public.dmc_submit_quote from public, anon;
grant execute on function public.dmc_submit_quote to authenticated;

-- ============================================================
-- 8. SEC-07: credit tables — no anon access at all
-- ============================================================
revoke all on public.credit_packs from anon;
revoke all on public.credit_accounts from anon;
revoke all on public.credit_ledger from anon;
revoke all on public.credit_transactions from anon;
revoke all on public.plans from anon;

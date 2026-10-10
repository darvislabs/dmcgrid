-- ═══════════════════════════════════════════════════════════
-- DMCGrid Platform Database Migration 00010
-- Wave 3: Agent Portal Depth, DMC Quoting, Traveler Share & RPCs
-- ═══════════════════════════════════════════════════════════

-- 1. Helper Functions (Fix security definer on role checks)
create or replace function public.is_agent()
returns boolean
language sql
stable
security definer
set search_path = public
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
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'dmc' and is_active = true
  );
$$;

revoke all on function public.is_agent() from public;
grant execute on function public.is_agent() to authenticated, anon, service_role;
revoke all on function public.is_dmc() from public;
grant execute on function public.is_dmc() to authenticated, anon, service_role;

-- 2. Schema Adjustments
-- Allow connection records to be created with optional rfq/quote binding
alter table public.connections alter column rfq_id drop not null;
alter table public.connections alter column quote_id drop not null;

-- Share tokens adjustments for direct quotes & options linkage
alter table public.share_tokens alter column proposal_id drop not null;
alter table public.share_tokens add column if not exists deal_id uuid references public.deals(id) on delete cascade;
alter table public.share_tokens add column if not exists quote_id uuid references public.quotes(id) on delete cascade;
alter table public.share_tokens add column if not exists rfq_id uuid references public.rfqs(id) on delete cascade;
alter table public.share_tokens add column if not exists selected_option_id uuid references public.quote_options(id) on delete set null;
alter table public.share_tokens add column if not exists traveler_name text;
alter table public.share_tokens add column if not exists traveler_notes text;

-- 3. Procedure: agent_unlock_connection(agent_id, dmc_id, quote_id, rfq_id)
-- Debits agent credit wallet + writes ledger + audit + unlocks connection in ONE transaction
create or replace function public.agent_unlock_connection(
  p_agent_id uuid,
  p_dmc_id uuid,
  p_quote_id uuid default null,
  p_rfq_id uuid default null,
  p_credit_cost integer default 5
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := coalesce(auth.uid(), p_agent_id);
  v_account_id uuid;
  v_cur_balance integer := 0;
  v_new_balance integer := 0;
  v_conn_id uuid;
  v_tx_id uuid;
  v_dmc_name text := 'Destination Specialist';
  v_rfq_id uuid := p_rfq_id;
  v_cost integer := coalesce(p_credit_cost, 5);
begin
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

-- 4. Procedure: dmc_submit_quote(rfq_id, options, dmc_id, notes, valid_days)
-- Validates brief, creates quote + 3 options + line items in ONE tx, updates RFQ status
create or replace function public.dmc_submit_quote(
  p_rfq_id uuid,
  p_options jsonb,
  p_dmc_id uuid default null,
  p_notes text default null,
  p_valid_days integer default 14
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dmc_id uuid := coalesce(auth.uid(), p_dmc_id);
  v_rfq_rec record;
  v_quote_id uuid;
  v_quote_num text;
  v_opt_elem jsonb;
  v_line_elem jsonb;
  v_opt_id uuid;
  v_total_net numeric(12, 2) := 0.00;
  v_opt_cost numeric(12, 2);
  v_opt_idx integer := 0;
begin
  -- Validate caller is DMC or admin
  if v_dmc_id is null then
    raise exception 'Unauthorized: DMC profile identity required to submit quote';
  end if;

  select * into v_rfq_rec from public.rfqs where id = p_rfq_id;
  if not found then
    raise exception 'RFQ % not found', p_rfq_id;
  end if;

  if v_rfq_rec.status in ('closed') then
    raise exception 'RFQ % is already closed', p_rfq_id;
  end if;

  if jsonb_array_length(p_options) = 0 then
    raise exception 'At least one quote option is required';
  end if;

  -- Compute initial total net cost from first option
  v_opt_cost := coalesce((p_options->0->>'net_cost')::numeric, 0.00);
  v_total_net := v_opt_cost;

  -- Generate unique quote number: QTE-2026-XXXX
  v_quote_num := 'QTE-' || to_char(now(), 'YYYY') || '-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0');

  -- Insert quote header
  insert into public.quotes (
    rfq_id,
    dmc_id,
    quote_number,
    status,
    valid_until,
    total_net_cost,
    currency,
    response_time_seconds,
    notes,
    created_at,
    updated_at
  ) values (
    p_rfq_id,
    v_dmc_id,
    v_quote_num,
    'submitted',
    now() + (coalesce(p_valid_days, 14) || ' days')::interval,
    v_total_net,
    coalesce(v_rfq_rec.currency, 'INR'),
    coalesce(extract(epoch from (now() - v_rfq_rec.created_at))::integer, 3600),
    trim(p_notes),
    now(),
    now()
  ) returning id into v_quote_id;

  -- Insert options & line items
  for v_opt_elem in select * from jsonb_array_elements(p_options)
  loop
    v_opt_idx := v_opt_idx + 1;
    v_opt_cost := coalesce((v_opt_elem->>'net_cost')::numeric, 0.00);

    -- If net_cost is 0 or null and line_items are provided, calculate sum
    if (v_opt_cost = 0.00) and (v_opt_elem ? 'line_items') and (jsonb_typeof(v_opt_elem->'line_items') = 'array') then
      select coalesce(sum((li->>'net_cost')::numeric), 0.00)
      into v_opt_cost
      from jsonb_array_elements(v_opt_elem->'line_items') li;
    end if;

    if v_opt_idx = 1 then
      v_total_net := v_opt_cost;
      update public.quotes set total_net_cost = v_total_net where id = v_quote_id;
    end if;

    insert into public.quote_options (
      quote_id,
      option_name,
      description,
      net_cost,
      currency,
      is_selected,
      order_index,
      day_count,
      created_at
    ) values (
      v_quote_id,
      coalesce(v_opt_elem->>'option_name', 'Option ' || v_opt_idx),
      v_opt_elem->>'description',
      v_opt_cost,
      coalesce(v_rfq_rec.currency, 'INR'),
      coalesce((v_opt_elem->>'is_selected')::boolean, false),
      v_opt_idx,
      coalesce((v_opt_elem->>'day_count')::integer, v_rfq_rec.duration_days, 1),
      now()
    ) returning id into v_opt_id;

    -- Insert line items if present
    if v_opt_elem ? 'line_items' and jsonb_typeof(v_opt_elem->'line_items') = 'array' then
      for v_line_elem in select * from jsonb_array_elements(v_opt_elem->'line_items')
      loop
        insert into public.quote_line_items (
          quote_option_id,
          day_number,
          time_window,
          title,
          description,
          cost_category,
          net_cost,
          created_at
        ) values (
          v_opt_id,
          coalesce((v_line_elem->>'day_number')::integer, 1),
          coalesce((v_line_elem->>'time_window')::time_window_type, 'morning'),
          coalesce(v_line_elem->>'title', 'Service Item'),
          v_line_elem->>'description',
          coalesce(v_line_elem->>'cost_category', 'activity'),
          coalesce((v_line_elem->>'net_cost')::numeric, 0.00),
          now()
        );
      end loop;
    end if;
  end loop;

  -- Advance RFQ status to quoted if published
  if v_rfq_rec.status = 'published' then
    update public.rfqs set status = 'quoted', updated_at = now() where id = p_rfq_id;
  end if;

  -- Update rfq_matches if matching record exists
  update public.rfq_matches
  set status = 'quoted'
  where rfq_id = p_rfq_id and dmc_id = v_dmc_id;

  -- Audit log entry
  insert into public.audit_log (
    actor_id,
    action,
    entity_type,
    entity_id,
    previous_state,
    new_state,
    created_at
  ) values (
    v_dmc_id,
    'QUOTE_SUBMITTED',
    'quotes',
    v_quote_id::text,
    null,
    jsonb_build_object(
      'quote_number', v_quote_num,
      'rfq_id', p_rfq_id,
      'dmc_id', v_dmc_id,
      'options_count', v_opt_idx,
      'total_net_cost', v_total_net
    ),
    now()
  );

  -- Realtime notification to Agent
  insert into public.notifications (
    recipient_id,
    title,
    body,
    type,
    link,
    created_at
  ) values (
    v_rfq_rec.agent_id,
    'New Quote Received (' || v_quote_num || ')',
    'A destination specialist submitted a tailored quote for RFQ: ' || v_rfq_rec.title,
    'quote_received',
    '/rfq/' || p_rfq_id,
    now()
  );

  return jsonb_build_object(
    'success', true,
    'quote_id', v_quote_id,
    'quote_number', v_quote_num,
    'rfq_id', p_rfq_id
  );
end;
$$;

-- 5. Procedure: record_traveler_choice(token, option_id, notes)
-- Publicly callable without auth: records traveler selection on shared proposal link
create or replace function public.record_traveler_choice(
  p_token text,
  p_option_id uuid,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token_rec record;
  v_opt_rec record;
  v_quote_rec record;
  v_deal_rec record;
begin
  -- 1. Validate Token
  select * into v_token_rec
  from public.share_tokens
  where token = trim(p_token);

  if not found then
    raise exception 'Invalid share token: %', p_token;
  end if;

  if v_token_rec.expires_at is not null and v_token_rec.expires_at < now() then
    raise exception 'Share link has expired';
  end if;

  -- 2. Validate Option
  select * into v_opt_rec
  from public.quote_options
  where id = p_option_id;

  if not found then
    raise exception 'Quote option % not found', p_option_id;
  end if;

  select * into v_quote_rec
  from public.quotes
  where id = v_opt_rec.quote_id;

  -- 3. Mark selected option
  update public.quote_options
  set is_selected = (id = p_option_id)
  where quote_id = v_opt_rec.quote_id;

  -- 4. Update share token record
  update public.share_tokens
  set selected_option_id = p_option_id,
      traveler_notes = coalesce(p_notes, traveler_notes),
      views_count = views_count + 1,
      last_viewed_at = now()
  where token = p_token;

  -- 5. If deal exists, update selected option (V62 trigger recalculates automatically)
  if v_token_rec.deal_id is not null then
    update public.deals
    set selected_quote_option_id = p_option_id,
        net_cost = v_opt_rec.net_cost,
        updated_at = now()
    where id = v_token_rec.deal_id;
  elsif v_token_rec.proposal_id is not null then
    update public.proposals
    set status = 'accepted',
        updated_at = now()
    where id = v_token_rec.proposal_id;
  end if;

  -- 6. Audit log
  insert into public.audit_log (
    actor_id,
    action,
    entity_type,
    entity_id,
    previous_state,
    new_state,
    created_at
  ) values (
    null,
    'TRAVELER_CHOICE_RECORDED',
    'quote_options',
    p_option_id::text,
    null,
    jsonb_build_object(
      'token', p_token,
      'option_id', p_option_id,
      'option_name', v_opt_rec.option_name,
      'net_cost', v_opt_rec.net_cost,
      'notes', p_notes
    ),
    now()
  );

  return jsonb_build_object(
    'success', true,
    'option_id', p_option_id,
    'option_name', v_opt_rec.option_name,
    'net_cost', v_opt_rec.net_cost,
    'message', 'Traveler selection recorded successfully'
  );
end;
$$;

-- 6. Procedure: agent_accept_quote(rfq_id, quote_id, option_id, agent_id, markup_pct)
-- Agent accepts quote option: creates deal + trigger runs V62 formula + generates proposal & share token
create or replace function public.agent_accept_quote(
  p_rfq_id uuid,
  p_quote_id uuid,
  p_option_id uuid,
  p_agent_id uuid default null,
  p_markup_percentage numeric default 12.00
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_agent_id uuid := coalesce(auth.uid(), p_agent_id);
  v_quote_rec record;
  v_opt_rec record;
  v_rfq_rec record;
  v_conn_id uuid;
  v_deal_id uuid;
  v_prop_id uuid;
  v_token text;
  v_calc v62_cost_breakdown;
begin
  select * into v_rfq_rec from public.rfqs where id = p_rfq_id;
  if not found then raise exception 'RFQ not found'; end if;

  select * into v_quote_rec from public.quotes where id = p_quote_id;
  if not found then raise exception 'Quote not found'; end if;

  select * into v_opt_rec from public.quote_options where id = p_option_id;
  if not found then raise exception 'Quote option not found'; end if;

  if v_agent_id is null then v_agent_id := v_rfq_rec.agent_id; end if;

  -- Ensure connection exists (auto-link connection record)
  select id into v_conn_id
  from public.connections
  where agent_id = v_agent_id and dmc_id = v_quote_rec.dmc_id
  limit 1;

  if v_conn_id is null then
    insert into public.connections (
      rfq_id, quote_id, agent_id, dmc_id, credit_amount_deducted
    ) values (
      p_rfq_id, p_quote_id, v_agent_id, v_quote_rec.dmc_id, 0
    ) returning id into v_conn_id;
  end if;

  -- Mark option selected
  update public.quote_options set is_selected = (id = p_option_id) where quote_id = p_quote_id;

  -- Compute V62 cost
  v_calc := public.calculate_v62_deal_cost(
    p_net := v_opt_rec.net_cost,
    p_markup_value := coalesce(p_markup_percentage, 12.00)
  );

  -- Create or update Deal
  select id into v_deal_id
  from public.deals
  where rfq_id = p_rfq_id and agent_id = v_agent_id and dmc_id = v_quote_rec.dmc_id
  limit 1;

  if v_deal_id is null then
    insert into public.deals (
      rfq_id,
      connection_id,
      agent_id,
      dmc_id,
      selected_quote_option_id,
      net_cost,
      markup_percentage,
      manager_approval_status
    ) values (
      p_rfq_id,
      v_conn_id,
      v_agent_id,
      v_quote_rec.dmc_id,
      p_option_id,
      v_opt_rec.net_cost,
      coalesce(p_markup_percentage, 12.00),
      'approved'
    ) returning id into v_deal_id;
  else
    update public.deals
    set selected_quote_option_id = p_option_id,
        net_cost = v_opt_rec.net_cost,
        markup_percentage = coalesce(p_markup_percentage, 12.00),
        updated_at = now()
    where id = v_deal_id;
  end if;

  -- Update Quote & RFQ status
  update public.quotes set status = 'connected', updated_at = now() where id = p_quote_id;
  update public.rfqs set status = 'connected', updated_at = now() where id = p_rfq_id;

  -- Create or update Proposal
  select id into v_prop_id from public.proposals where deal_id = v_deal_id limit 1;
  if v_prop_id is null then
    insert into public.proposals (
      deal_id,
      version,
      title,
      customer_name,
      total_price,
      currency,
      status
    ) values (
      v_deal_id,
      1,
      v_rfq_rec.title,
      'Distinguished Traveler',
      v_calc.customer_selling_price,
      'INR',
      'shared'
    ) returning id into v_prop_id;
  else
    update public.proposals
    set total_price = v_calc.customer_selling_price,
        updated_at = now()
    where id = v_prop_id;
  end if;

  -- Generate Share Token
  select token into v_token from public.share_tokens where deal_id = v_deal_id or proposal_id = v_prop_id limit 1;
  if v_token is null then
    v_token := 'prop_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12);
    insert into public.share_tokens (
      proposal_id,
      deal_id,
      quote_id,
      rfq_id,
      selected_option_id,
      token,
      expires_at
    ) values (
      v_prop_id,
      v_deal_id,
      p_quote_id,
      p_rfq_id,
      p_option_id,
      v_token,
      now() + interval '30 days'
    );
  end if;

  -- Audit log
  insert into public.audit_log (
    actor_id,
    action,
    entity_type,
    entity_id,
    previous_state,
    new_state,
    created_at
  ) values (
    v_agent_id,
    'QUOTE_ACCEPTED',
    'deals',
    v_deal_id::text,
    null,
    jsonb_build_object(
      'rfq_id', p_rfq_id,
      'quote_id', p_quote_id,
      'option_id', p_option_id,
      'customer_selling_price', v_calc.customer_selling_price,
      'token', v_token
    ),
    now()
  );

  return jsonb_build_object(
    'success', true,
    'deal_id', v_deal_id,
    'proposal_id', v_prop_id,
    'share_token', v_token,
    'customer_selling_price', v_calc.customer_selling_price
  );
end;
$$;

-- 7. Grant Permissions to Execution
grant execute on function public.agent_unlock_connection to authenticated, anon, service_role;
grant execute on function public.dmc_submit_quote to authenticated, anon, service_role;
grant execute on function public.record_traveler_choice to authenticated, anon, service_role;
grant execute on function public.agent_accept_quote to authenticated, anon, service_role;

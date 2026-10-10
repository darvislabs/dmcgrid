-- ============================================================================
-- DMCGrid Platform Migration: 00004_double_entry_ledger.sql
-- Double-Entry Credit Ledger Bookkeeping & Connect Flow
-- PRD Compliance:
-- R4: credits debited on quote unlock/connect, never on browse
-- R1: anonymity DMC identity hidden until agent spends credits to connect
-- ============================================================================

-- Function to record a strict double-entry credit journal transaction
create or replace function public.record_credit_transaction(
  p_source_account ledger_account_type,
  p_source_profile_id uuid,
  p_dest_account ledger_account_type,
  p_dest_profile_id uuid,
  p_amount integer,
  p_reference_type text,
  p_reference_id uuid,
  p_description text
)
returns uuid as $$
declare
  v_tx_id uuid := gen_random_uuid();
  v_source_balance integer;
  v_dest_balance integer;
begin
  if p_amount <= 0 then
    raise exception 'Transaction amount must be strictly greater than 0';
  end if;

  -- 1. Source Account Handling (DEBIT)
  if p_source_account = 'agent_wallet' then
    if p_source_profile_id is null then
      raise exception 'source_profile_id is required for agent_wallet account';
    end if;

    select credit_balance into v_source_balance
    from public.profiles
    where id = p_source_profile_id
    for update;

    if v_source_balance is null then
      raise exception 'Profile not found: %', p_source_profile_id;
    end if;

    if v_source_balance < p_amount then
      raise exception 'Insufficient credits: balance is %, required is %', v_source_balance, p_amount;
    end if;

    v_source_balance := v_source_balance - p_amount;

    update public.profiles
    set credit_balance = v_source_balance,
        updated_at = now()
    where id = p_source_profile_id;
  end if;

  insert into public.credit_ledger (
    transaction_id,
    profile_id,
    account_type,
    direction,
    amount,
    balance_after,
    reference_type,
    reference_id,
    description
  ) values (
    v_tx_id,
    p_source_profile_id,
    p_source_account,
    'DEBIT',
    p_amount,
    v_source_balance,
    p_reference_type,
    p_reference_id,
    p_description
  );

  -- 2. Destination Account Handling (CREDIT)
  if p_dest_account = 'agent_wallet' then
    if p_dest_profile_id is null then
      raise exception 'dest_profile_id is required for agent_wallet account';
    end if;

    select credit_balance into v_dest_balance
    from public.profiles
    where id = p_dest_profile_id
    for update;

    if v_dest_balance is null then
      raise exception 'Profile not found: %', p_dest_profile_id;
    end if;

    v_dest_balance := v_dest_balance + p_amount;

    update public.profiles
    set credit_balance = v_dest_balance,
        updated_at = now()
    where id = p_dest_profile_id;
  end if;

  insert into public.credit_ledger (
    transaction_id,
    profile_id,
    account_type,
    direction,
    amount,
    balance_after,
    reference_type,
    reference_id,
    description
  ) values (
    v_tx_id,
    p_dest_profile_id,
    p_dest_account,
    'CREDIT',
    p_amount,
    v_dest_balance,
    p_reference_type,
    p_reference_id,
    p_description
  );

  return v_tx_id;
end;
$$ language plpgsql security definer;

-- Procedure to unlock DMC connection via credit spend (R1 & R4 compliance)
create or replace function public.unlock_dmc_connection(
  p_rfq_id uuid,
  p_quote_id uuid,
  p_credits_fee integer default 5
)
returns uuid as $$
declare
  v_agent_id uuid := auth.uid();
  v_dmc_id uuid;
  v_rfq_agent_id uuid;
  v_conn_id uuid;
  v_tx_id uuid;
  v_connected_count integer;
begin
  -- Validate RFQ ownership
  select agent_id into v_rfq_agent_id
  from public.rfqs
  where id = p_rfq_id;

  if v_rfq_agent_id is null or v_rfq_agent_id != v_agent_id then
    raise exception 'Unauthorized: RFQ does not belong to the calling agent';
  end if;

  -- Validate Quote
  select dmc_id into v_dmc_id
  from public.quotes
  where id = p_quote_id and rfq_id = p_rfq_id;

  if v_dmc_id is null then
    raise exception 'Quote not found or does not belong to RFQ';
  end if;

  -- Rule: Maximum 2 distinct DMCs per RFQ
  select count(distinct dmc_id) into v_connected_count
  from public.connections
  where rfq_id = p_rfq_id and dmc_id != v_dmc_id;

  if v_connected_count >= 2 then
    raise exception 'Maximum 2 distinct DMCs permitted per RFQ';
  end if;

  -- Check if already connected
  select id into v_conn_id
  from public.connections
  where rfq_id = p_rfq_id and dmc_id = v_dmc_id;

  if v_conn_id is not null then
    return v_conn_id; -- Already connected
  end if;

  -- Create connection record
  insert into public.connections (
    rfq_id,
    agent_id,
    dmc_id,
    quote_id,
    credits_spent,
    status
  ) values (
    p_rfq_id,
    v_agent_id,
    v_dmc_id,
    p_quote_id,
    p_credits_fee,
    'active'
  ) returning id into v_conn_id;

  -- Debit agent wallet and credit platform revenue (Strict double-entry)
  v_tx_id := public.record_credit_transaction(
    'agent_wallet',
    v_agent_id,
    'platform_revenue',
    null,
    p_credits_fee,
    'connect_fee',
    v_conn_id,
    'Unlocked DMC identity connection for RFQ ' || p_rfq_id
  );

  -- Update quote status
  update public.quotes
  set status = 'connected',
      updated_at = now()
  where id = p_quote_id;

  -- Update RFQ status
  update public.rfqs
  set status = 'connected',
      updated_at = now()
  where id = p_rfq_id;

  -- Audit Log record (R2 compliance)
  insert into public.audit_log (
    actor_id,
    actor_role,
    action,
    target_type,
    target_id,
    new_state
  ) values (
    v_agent_id,
    'agent',
    'unlock_connection',
    'connections',
    v_conn_id,
    jsonb_build_object(
      'rfq_id', p_rfq_id,
      'quote_id', p_quote_id,
      'dmc_id', v_dmc_id,
      'credits_spent', p_credits_fee,
      'tx_id', v_tx_id
    )
  );

  -- Notifications to both parties
  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    payload
  ) values (
    v_dmc_id,
    'connected',
    'Connection Unlocked!',
    'An agent has unlocked your quote and connected directly with you.',
    jsonb_build_object('rfq_id', p_rfq_id, 'connection_id', v_conn_id)
  );

  return v_conn_id;
end;
$$ language plpgsql security definer;

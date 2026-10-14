-- Migration 00015: RFQ Publish Wizard RPC & Sequence
-- Wave 5: FinFly-style RFQ Wizard + Publish Fee

-- 1. Ensure rfq_number_seq sequence exists
create sequence if not exists public.rfq_number_seq start with 1;

-- 2. agent_create_rfq RPC function
create or replace function public.agent_create_rfq(
  p_title text,
  p_adults integer default 2,
  p_children integer default 0,
  p_infants integer default 0,
  p_start_date date default (current_date + 1),
  p_nights integer default 1,
  p_budget_min numeric default null,
  p_budget_max numeric default null,
  p_currency text default 'INR',
  p_notes text default null,
  p_extra jsonb default '{}'::jsonb,
  p_destinations jsonb default '[]'::jsonb,
  p_stays jsonb default null,
  p_experiences jsonb default '[]'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_account_id uuid;
  v_balance integer := 0;
  v_new_balance integer := 0;
  v_plat_account_id uuid;
  v_plat_balance integer := 0;
  v_plat_new_balance integer := 0;
  v_rfq_id uuid;
  v_rfq_number text;
  v_tx_id uuid;
  v_dest_names text[];
  v_matched_dmcs uuid[];
  v_match_score numeric(5,2);
  v_cost constant integer := 2;
begin
  -- a. auth.uid() must be agent + kyc_verified() else raise 'KYC verification required'
  if v_user_id is null then
    raise exception 'KYC verification required';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = v_user_id
      and role = 'agent'
      and is_active = true
      and kyc_status = 'verified'
  ) then
    raise exception 'KYC verification required';
  end if;

  -- b. wallet FOR UPDATE lock: select id, balance from credit_accounts where profile_id=auth.uid() and account_type='agent_wallet'; if missing create with 0.
  select id, balance into v_account_id, v_balance
  from public.credit_accounts
  where profile_id = v_user_id and account_type = 'agent_wallet'
  for update;

  if not found then
    insert into public.credit_accounts (profile_id, account_type, name, balance)
    values (v_user_id, 'agent_wallet', 'Agent Credits Wallet', 0)
    returning id, balance into v_account_id, v_balance;
  end if;

  -- c. cost = 2 credits. balance < 2 -> raise 'INSUFFICIENT_CREDITS' (catch this exact string in UI)
  if v_balance < v_cost then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  -- d. Generate RFQ Number and insert into rfqs
  v_rfq_number := 'RFQ-2026-' || lpad(nextval('public.rfq_number_seq')::text, 4, '0');

  insert into public.rfqs (
    agent_id,
    rfq_number,
    status,
    title,
    travelers_adults,
    travelers_children,
    travelers_infants,
    start_date,
    end_date,
    duration_days,
    duration_nights,
    budget_min,
    budget_max,
    currency,
    notes,
    ai_extracted_data,
    published_at,
    created_at,
    updated_at
  ) values (
    v_user_id,
    v_rfq_number,
    'published',
    coalesce(nullif(trim(p_title), ''), 'Bespoke Private Itinerary'),
    greatest(1, coalesce(p_adults, 1)),
    greatest(0, coalesce(p_children, 0)),
    greatest(0, coalesce(p_infants, 0)),
    p_start_date,
    p_start_date + coalesce(p_nights, 1),
    coalesce(p_nights, 1) + 1,
    coalesce(p_nights, 1),
    p_budget_min,
    p_budget_max,
    coalesce(p_currency, 'INR'),
    p_notes,
    coalesce(p_extra, '{}'::jsonb),
    now(),
    now(),
    now()
  ) returning id into v_rfq_id;

  -- e. insert rfq_destinations rows (order_index), rfq_stays row, rfq_experiences rows
  if p_destinations is not null and jsonb_typeof(p_destinations) = 'array' and jsonb_array_length(p_destinations) > 0 then
    insert into public.rfq_destinations (
      rfq_id,
      destination_name,
      country,
      nights,
      order_index
    )
    select
      v_rfq_id,
      coalesce(nullif(trim(d->>'destination_name'), ''), 'Custom Destination'),
      coalesce(d->>'country', ''),
      greatest(0, coalesce((d->>'nights')::int, 1)),
      coalesce((d->>'order_index')::int, (ord - 1)::int)
    from jsonb_array_elements(p_destinations) with ordinality as t(d, ord);
  end if;

  if p_stays is not null and jsonb_typeof(p_stays) = 'object' then
    insert into public.rfq_stays (
      rfq_id,
      star_rating,
      hotel_type,
      meal_plan,
      room_count,
      preferences
    ) values (
      v_rfq_id,
      coalesce(nullif(trim(p_stays->>'star_rating'), ''), '4_star'),
      coalesce(nullif(trim(p_stays->>'hotel_type'), ''), 'hotel'),
      coalesce(nullif(trim(p_stays->>'meal_plan'), ''), 'breakfast'),
      greatest(1, coalesce((p_stays->>'room_count')::int, 1)),
      nullif(trim(p_stays->>'preferences'), '')
    );
  end if;

  if p_experiences is not null and jsonb_typeof(p_experiences) = 'array' and jsonb_array_length(p_experiences) > 0 then
    insert into public.rfq_experiences (
      rfq_id,
      category,
      description,
      required
    )
    select
      v_rfq_id,
      coalesce(nullif(trim(e->>'category'), ''), 'experience'),
      trim(e->>'description'),
      coalesce((e->>'required')::boolean, true)
    from jsonb_array_elements(p_experiences) as e
    where coalesce(trim(e->>'description'), '') <> '';
  end if;

  -- f. auto-match: insert rfq_matches for each verified+active DMC whose operating_destinations && destination names (case-insensitive)
  --    if none overlap, match ALL verified DMCs (score 0.5) else matched score 0.9;
  --    insert notification per matched DMC.
  select coalesce(array_agg(lower(trim(d->>'destination_name'))), '{}'::text[])
  into v_dest_names
  from jsonb_array_elements(coalesce(p_destinations, '[]'::jsonb)) as d
  where coalesce(trim(d->>'destination_name'), '') <> '';

  select coalesce(array_agg(p.id), '{}'::uuid[])
  into v_matched_dmcs
  from public.profiles p
  where p.role = 'dmc'
    and p.is_active = true
    and p.kyc_status = 'verified'
    and exists (
      select 1
      from unnest(p.operating_destinations) as od
      where lower(trim(od)) = any(v_dest_names)
    );

  if array_length(v_matched_dmcs, 1) is not null and array_length(v_matched_dmcs, 1) > 0 then
    v_match_score := 0.90;
  else
    select coalesce(array_agg(p.id), '{}'::uuid[])
    into v_matched_dmcs
    from public.profiles p
    where p.role = 'dmc'
      and p.is_active = true
      and p.kyc_status = 'verified';

    v_match_score := 0.50;
  end if;

  if array_length(v_matched_dmcs, 1) is not null and array_length(v_matched_dmcs, 1) > 0 then
    insert into public.rfq_matches (
      rfq_id,
      dmc_id,
      match_score,
      match_reasons,
      status,
      notified_at,
      created_at
    )
    select
      v_rfq_id,
      m_id,
      v_match_score,
      jsonb_build_array(case when v_match_score = 0.90 then 'Destination coverage match' else 'Global verified DMC match' end),
      'notified',
      now(),
      now()
    from unnest(v_matched_dmcs) as m_id
    on conflict (rfq_id, dmc_id) do nothing;

    insert into public.notifications (
      recipient_id,
      title,
      body,
      type,
      link,
      created_at
    )
    select
      m_id,
      'New RFQ Match: ' || v_rfq_number,
      'A new verified RFQ for ' || coalesce(nullif(trim(p_title), ''), 'Custom Itinerary') || ' was published.',
      'rfq_matched',
      '/feed',
      now()
    from unnest(v_matched_dmcs) as m_id;
  end if;

  -- g. wallet debit: balance -2; credit_ledger double entry (agent_wallet debit 2, platform_revenue credit 2)
  v_new_balance := v_balance - v_cost;
  update public.credit_accounts
  set balance = v_new_balance,
      updated_at = now()
  where id = v_account_id;

  select id, balance into v_plat_account_id, v_plat_balance
  from public.credit_accounts
  where account_type = 'platform_revenue'
  for update
  limit 1;

  if not found then
    insert into public.credit_accounts (account_type, name, balance)
    values ('platform_revenue', 'DMCGrid Platform Revenue Pool', 0)
    returning id, balance into v_plat_account_id, v_plat_balance;
  end if;

  v_plat_new_balance := coalesce(v_plat_balance, 0) + v_cost;
  update public.credit_accounts
  set balance = v_plat_new_balance,
      updated_at = now()
  where id = v_plat_account_id;

  insert into public.credit_transactions (
    description,
    reference_type,
    reference_id,
    created_by
  ) values (
    'Published ' || v_rfq_number,
    'rfq_publish',
    v_rfq_id::text,
    v_user_id
  ) returning id into v_tx_id;

  -- Ledger entry 1: agent_wallet debit
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
    v_user_id,
    'debit',
    v_cost,
    v_new_balance,
    'rfq_publish',
    v_rfq_id::text,
    'Publish fee for ' || v_rfq_number
  );

  -- Ledger entry 2: platform_revenue credit
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
    v_plat_account_id,
    null,
    'credit',
    v_cost,
    v_plat_new_balance,
    'rfq_publish',
    v_rfq_id::text,
    'Publish fee revenue for ' || v_rfq_number
  );

  -- h. audit_log 'RFQ_PUBLISHED'. Return rfq id.
  insert into public.audit_log (
    actor_id,
    action,
    entity_type,
    entity_id,
    previous_state,
    new_state,
    created_at
  ) values (
    v_user_id,
    'RFQ_PUBLISHED',
    'rfqs',
    v_rfq_id::text,
    null,
    jsonb_build_object(
      'rfq_id', v_rfq_id,
      'rfq_number', v_rfq_number,
      'title', p_title,
      'credits_debited', v_cost,
      'balance_after', v_new_balance
    ),
    now()
  );

  return v_rfq_id;
end;
$$;

-- Grant execution to authenticated & service_role
grant execute on function public.agent_create_rfq to authenticated, service_role;

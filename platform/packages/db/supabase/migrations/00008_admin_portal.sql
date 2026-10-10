-- ═══════════════════════════════════════════════════════════
-- DMCGrid Platform Database Migration 00006
-- Wave 2: Admin Operations & Governance Functions (Security Definer)
-- ═══════════════════════════════════════════════════════════

-- 1. Admin KYC Review Procedure (Immutable Audit Log write)
create or replace function public.admin_review_kyc(
  p_kyc_record_id uuid,
  p_status kyc_status,
  p_reason text,
  p_reviewer_id uuid default auth.uid()
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_rec record;
  v_actor_id uuid := coalesce(auth.uid(), p_reviewer_id);
  v_profile_id uuid;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Unauthorized: only platform admins can review KYC records';
  end if;

  if p_status not in ('verified', 'rejected') then
    raise exception 'Invalid status: must be verified or rejected';
  end if;

  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Mandatory reason is required for KYC review';
  end if;

  select * into v_old_rec from public.kyc_records where id = p_kyc_record_id for update;
  if not found then
    raise exception 'KYC record % not found', p_kyc_record_id;
  end if;

  v_profile_id := v_old_rec.profile_id;

  update public.kyc_records
  set status = p_status,
      reviewer_id = v_actor_id,
      review_notes = trim(p_reason),
      reviewed_at = now(),
      updated_at = now()
  where id = p_kyc_record_id;

  update public.profiles
  set kyc_status = p_status,
      updated_at = now()
  where id = v_profile_id;

  -- Immutable audit log write
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
    case when p_status = 'verified' then 'KYC_APPROVED' else 'KYC_REJECTED' end,
    'kyc_records',
    p_kyc_record_id::text,
    to_jsonb(v_old_rec),
    jsonb_build_object(
      'status', p_status,
      'profile_id', v_profile_id,
      'reviewer_id', v_actor_id,
      'review_notes', trim(p_reason),
      'reviewed_at', now()
    ),
    now()
  );

  -- Realtime notification to user
  insert into public.notifications (
    recipient_id,
    title,
    body,
    type,
    link,
    created_at
  ) values (
    v_profile_id,
    case when p_status = 'verified' then 'KYC Verification Approved' else 'KYC Verification Rejected' end,
    case when p_status = 'verified'
      then 'Your business KYC has been verified. You now have full access to platform sourcing.'
      else 'Your KYC verification was rejected. Reason: ' || trim(p_reason)
    end,
    'kyc_update',
    '/settings#kyc',
    now()
  );

  return jsonb_build_object(
    'success', true,
    'status', p_status,
    'kyc_id', p_kyc_record_id,
    'profile_id', v_profile_id
  );
end;
$$;

-- 2. Admin User Toggle Active/Deactivate Procedure
create or replace function public.admin_toggle_user_active(
  p_user_id uuid,
  p_is_active boolean,
  p_reason text,
  p_admin_id uuid default auth.uid()
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_rec record;
  v_actor_id uuid := coalesce(auth.uid(), p_admin_id);
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Unauthorized: only platform admins can modify user status';
  end if;

  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Mandatory reason required for toggling user account status';
  end if;

  select * into v_old_rec from public.profiles where id = p_user_id for update;
  if not found then
    raise exception 'User profile % not found', p_user_id;
  end if;

  update public.profiles
  set is_active = p_is_active,
      updated_at = now()
  where id = p_user_id;

  -- Immutable audit log write
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
    case when p_is_active then 'USER_ACTIVATED' else 'USER_DEACTIVATED' end,
    'profiles',
    p_user_id::text,
    to_jsonb(v_old_rec),
    jsonb_build_object(
      'is_active', p_is_active,
      'reason', trim(p_reason),
      'admin_id', v_actor_id
    ),
    now()
  );

  return jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'is_active', p_is_active
  );
end;
$$;

-- 3. Admin Force Close RFQ Procedure
create or replace function public.admin_force_close_rfq(
  p_rfq_id uuid,
  p_reason text,
  p_admin_id uuid default auth.uid()
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_rec record;
  v_actor_id uuid := coalesce(auth.uid(), p_admin_id);
  v_agent_id uuid;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Unauthorized: only platform admins can force close RFQs';
  end if;

  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Mandatory reason required for force-closing an RFQ';
  end if;

  select * into v_old_rec from public.rfqs where id = p_rfq_id for update;
  if not found then
    raise exception 'RFQ % not found', p_rfq_id;
  end if;

  v_agent_id := v_old_rec.agent_id;

  update public.rfqs
  set status = 'closed',
      closed_at = now(),
      updated_at = now()
  where id = p_rfq_id;

  -- Immutable audit log write
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
    'RFQ_FORCE_CLOSED',
    'rfqs',
    p_rfq_id::text,
    to_jsonb(v_old_rec),
    jsonb_build_object(
      'status', 'closed',
      'reason', trim(p_reason),
      'admin_id', v_actor_id
    ),
    now()
  );

  -- Realtime notification to agent
  insert into public.notifications (
    recipient_id,
    title,
    body,
    type,
    link,
    created_at
  ) values (
    v_agent_id,
    'RFQ Force-Closed by Ops Administrator',
    'Your RFQ (' || v_old_rec.rfq_number || ') has been force-closed. Reason: ' || trim(p_reason),
    'rfq_update',
    '/#rfqs',
    now()
  );

  return jsonb_build_object(
    'success', true,
    'rfq_id', p_rfq_id,
    'status', 'closed'
  );
end;
$$;

-- 4. Admin Double-Entry Credit Adjustment Procedure
create or replace function public.admin_adjust_credits(
  p_profile_id uuid,
  p_entry_type ledger_entry_type,
  p_amount integer,
  p_reason text,
  p_admin_id uuid default auth.uid()
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := coalesce(auth.uid(), p_admin_id);
  v_account_id uuid;
  v_cur_balance integer := 0;
  v_new_balance integer := 0;
  v_tx_id uuid;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Unauthorized: only platform admins can adjust credits';
  end if;

  if p_amount <= 0 then
    raise exception 'Adjustment amount must be strictly greater than 0';
  end if;

  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Mandatory reason required for credit adjustment';
  end if;

  if not exists (select 1 from public.profiles where id = p_profile_id) then
    raise exception 'Profile % not found', p_profile_id;
  end if;

  -- Ensure agent_wallet account exists
  select id, balance into v_account_id, v_cur_balance
  from public.credit_accounts
  where profile_id = p_profile_id and account_type = 'agent_wallet'
  for update;

  if not found then
    insert into public.credit_accounts (profile_id, account_type, name, balance)
    values (p_profile_id, 'agent_wallet', 'Agent Credits Wallet', 0)
    returning id, balance into v_account_id, v_cur_balance;
  end if;

  if p_entry_type = 'debit' then
    if v_cur_balance < p_amount then
      raise exception 'Insufficient credits: current balance is %, cannot debit %', v_cur_balance, p_amount;
    end if;
    v_new_balance := v_cur_balance - p_amount;
  elsif p_entry_type = 'credit' then
    v_new_balance := v_cur_balance + p_amount;
  else
    raise exception 'Invalid entry type: must be credit or debit';
  end if;

  -- Update account balance
  update public.credit_accounts
  set balance = v_new_balance,
      updated_at = now()
  where id = v_account_id;

  -- Create credit transaction
  insert into public.credit_transactions (
    description,
    reference_type,
    reference_id,
    created_by
  ) values (
    trim(p_reason),
    'admin_adjustment',
    v_account_id::text,
    v_actor_id
  ) returning id into v_tx_id;

  -- Insert ledger entry
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
    p_profile_id,
    p_entry_type,
    p_amount,
    v_new_balance,
    'admin_adjustment',
    v_tx_id::text,
    trim(p_reason)
  );

  -- Immutable audit log write
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
    'CREDIT_ADJUSTMENT_' || upper(p_entry_type::text),
    'credit_accounts',
    v_account_id::text,
    jsonb_build_object('balance', v_cur_balance, 'profile_id', p_profile_id),
    jsonb_build_object(
      'entry_type', p_entry_type,
      'amount', p_amount,
      'balance', v_new_balance,
      'reason', trim(p_reason),
      'tx_id', v_tx_id
    ),
    now()
  );

  -- Notify user
  insert into public.notifications (
    recipient_id,
    title,
    body,
    type,
    link,
    created_at
  ) values (
    p_profile_id,
    'Wallet Adjustment Recorded',
    case when p_entry_type = 'credit'
      then 'Admin credited ' || p_amount || ' credits to your wallet. Note: ' || trim(p_reason)
      else 'Admin debited ' || p_amount || ' credits from your wallet. Note: ' || trim(p_reason)
    end,
    'credits_low',
    '/wallet',
    now()
  );

  return jsonb_build_object(
    'success', true,
    'account_id', v_account_id,
    'new_balance', v_new_balance,
    'tx_id', v_tx_id
  );
end;
$$;

-- 5. Admin Plans Management Procedure
create or replace function public.admin_save_plan(
  p_plan_id uuid default null,
  p_plan_code text default null,
  p_name text default null,
  p_monthly_leads integer default null,
  p_price_inr numeric default null,
  p_description text default null,
  p_features jsonb default '[]'::jsonb,
  p_is_active boolean default true,
  p_admin_id uuid default auth.uid()
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := coalesce(auth.uid(), p_admin_id);
  v_res_id uuid;
  v_old_rec record;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Unauthorized: only platform admins can manage subscription plans';
  end if;

  if p_plan_id is not null then
    select * into v_old_rec from public.plans where id = p_plan_id for update;
    if not found then
      raise exception 'Plan % not found', p_plan_id;
    end if;

    update public.plans
    set plan_code = coalesce(p_plan_code, plan_code),
        name = coalesce(p_name, name),
        monthly_leads_included = coalesce(p_monthly_leads, monthly_leads_included),
        price_inr = coalesce(p_price_inr, price_inr),
        description = coalesce(p_description, description),
        features = coalesce(p_features, features),
        is_active = coalesce(p_is_active, is_active)
    where id = p_plan_id
    returning id into v_res_id;

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
      'PLAN_UPDATED',
      'plans',
      v_res_id::text,
      to_jsonb(v_old_rec),
      jsonb_build_object(
        'plan_code', coalesce(p_plan_code, v_old_rec.plan_code),
        'name', coalesce(p_name, v_old_rec.name),
        'price_inr', coalesce(p_price_inr, v_old_rec.price_inr),
        'monthly_leads_included', coalesce(p_monthly_leads, v_old_rec.monthly_leads_included),
        'is_active', coalesce(p_is_active, v_old_rec.is_active)
      ),
      now()
    );
  else
    if p_plan_code is null or p_name is null or p_price_inr is null or p_monthly_leads is null then
      raise exception 'Plan code, name, price, and credits are required';
    end if;

    insert into public.plans (
      plan_code,
      name,
      monthly_leads_included,
      price_inr,
      description,
      features,
      is_active
    ) values (
      upper(trim(p_plan_code)),
      trim(p_name),
      p_monthly_leads,
      p_price_inr,
      p_description,
      p_features,
      p_is_active
    ) returning id into v_res_id;

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
      'PLAN_CREATED',
      'plans',
      v_res_id::text,
      null,
      jsonb_build_object(
        'plan_code', upper(trim(p_plan_code)),
        'name', trim(p_name),
        'price_inr', p_price_inr,
        'monthly_leads_included', p_monthly_leads,
        'is_active', p_is_active
      ),
      now()
    );
  end if;

  return jsonb_build_object('success', true, 'plan_id', v_res_id);
end;
$$;

-- 6. Analytics Aggregate Functions
create or replace function public.get_admin_analytics_summary()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_agents bigint;
  v_dmcs bigint;
  v_pending_kyc bigint;
  v_published_rfqs bigint;
  v_quotes_submitted bigint;
  v_connections bigint;
  v_avg_response_time numeric;
  v_revenue numeric;
begin
  select count(*) into v_agents from public.profiles where role = 'agent';
  select count(*) into v_dmcs from public.profiles where role = 'dmc';
  select count(*) into v_pending_kyc from public.kyc_records where status = 'pending';
  select count(*) into v_published_rfqs from public.rfqs where status in ('published', 'quoted', 'connected');
  select count(*) into v_quotes_submitted from public.quotes where status in ('submitted', 'shortlisted', 'connected');
  select count(*) into v_connections from public.connections;
  select coalesce(avg(response_time_seconds), 0) into v_avg_response_time from public.quotes where response_time_seconds is not null;

  -- Revenue estimation: sum of credit packs or purchases from ledger
  select coalesce(sum(p.price_inr), 0) into v_revenue
  from public.credit_ledger cl
  join public.plans p on cl.reference_id = p.id::text or cl.description like '%' || p.name || '%'
  where cl.entry_type = 'credit' and cl.reference_type in ('pack_purchase', 'plan_purchase', 'purchase');

  if v_revenue = 0 then
    -- Fallback: estimate from positive credit ledger transactions (₹199 per credit)
    select coalesce(sum(amount) * 199, 0) into v_revenue
    from public.credit_ledger
    where entry_type = 'credit' and reference_type != 'admin_adjustment';
  end if;

  return jsonb_build_object(
    'agents_count', v_agents,
    'dmcs_count', v_dmcs,
    'pending_kyc_count', v_pending_kyc,
    'published_rfqs_count', v_published_rfqs,
    'quotes_submitted_count', v_quotes_submitted,
    'connections_made_count', v_connections,
    'quote_avg_response_seconds', round(v_avg_response_time),
    'revenue_estimated_inr', round(v_revenue)
  );
end;
$$;

create or replace function public.get_admin_sparkline_14d()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  with days as (
    select generate_series(
      (current_date - interval '13 days')::date,
      current_date::date,
      '1 day'::interval
    )::date as day
  ),
  rfq_daily as (
    select created_at::date as day, count(*) as count
    from public.rfqs
    where created_at >= (current_date - interval '13 days')
    group by created_at::date
  ),
  quote_daily as (
    select created_at::date as day, count(*) as count
    from public.quotes
    where created_at >= (current_date - interval '13 days')
    group by created_at::date
  )
  select jsonb_agg(
    jsonb_build_object(
      'date', to_char(d.day, 'YYYY-MM-DD'),
      'label', to_char(d.day, 'DD Mon'),
      'rfqs', coalesce(r.count, 0),
      'quotes', coalesce(q.count, 0)
    ) order by d.day
  ) into v_result
  from days d
  left join rfq_daily r on r.day = d.day
  left join quote_daily q on q.day = d.day;

  return coalesce(v_result, '[]'::jsonb);
end;
$$;

-- Grant execution to authenticated, anon, service_role
grant execute on function public.admin_review_kyc to authenticated, anon, service_role;
grant execute on function public.admin_toggle_user_active to authenticated, anon, service_role;
grant execute on function public.admin_force_close_rfq to authenticated, anon, service_role;
grant execute on function public.admin_adjust_credits to authenticated, anon, service_role;
grant execute on function public.admin_save_plan to authenticated, anon, service_role;
grant execute on function public.get_admin_analytics_summary to authenticated, anon, service_role;
grant execute on function public.get_admin_sparkline_14d to authenticated, anon, service_role;

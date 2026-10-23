-- ============================================================================
-- DMCGrid Platform Migration: 00017_wallet_topup.sql
-- Wave 6D: Wallet Top-Up (Razorpay Test Mode / Demo) + Double-Entry Grant
-- ============================================================================

-- 1. Idempotency Unique Index on credit_transactions(reference_id) for gateway payments & demo top-ups
create unique index if not exists idx_credit_tx_pack_payment_ref
  on public.credit_transactions (reference_id)
  where reference_type = 'pack_purchase' and (reference_id like 'pay_%' or reference_id like 'DEMO-%');

-- 2. wallet_topup_credit RPC Function
create or replace function public.wallet_topup_credit(
  p_profile_id uuid,
  p_credits integer,
  p_amount_inr numeric,
  p_payment_ref text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_caller_id uuid := auth.uid();
  v_account_id uuid;
  v_balance integer := 0;
  v_new_balance integer := 0;
  v_plat_account_id uuid;
  v_plat_balance integer := 0;
  v_plat_new_balance integer := 0;
  v_tx_id uuid;
begin
  -- a. Caller authorization: caller must match target profile unless service_role/admin
  if v_caller_id is not null and v_caller_id <> p_profile_id and not is_admin() then
    raise exception 'Unauthorized: caller cannot credit another account';
  end if;

  -- b. Target profile must exist and be active
  if not exists (
    select 1 from public.profiles
    where id = p_profile_id and is_active = true
  ) then
    raise exception 'Profile not found or inactive';
  end if;

  -- c. Validate input parameters
  if p_credits <= 0 then
    raise exception 'Invalid credit amount: must be greater than 0';
  end if;

  if p_payment_ref is null or trim(p_payment_ref) = '' then
    raise exception 'Payment reference is required';
  end if;

  -- Validate against active credit_packs (accepting base price or rounded GST total)
  if not exists (
    select 1 from public.credit_packs
    where credits = p_credits
      and (
        price_inr = p_amount_inr
        or round(price_inr * (1 + (gst_rate / 100)), 2) = p_amount_inr
        or round(price_inr * (1 + (gst_rate / 100))) = p_amount_inr
      )
      and is_active = true
  ) then
    raise exception 'Invalid credit pack configuration';
  end if;

  -- d. Idempotency Check: if reference_id already processed, return current balance
  if exists (
    select 1 from public.credit_transactions
    where reference_type = 'pack_purchase' and reference_id = p_payment_ref
  ) then
    select balance into v_balance
    from public.credit_accounts
    where profile_id = p_profile_id and account_type = 'agent_wallet';

    return jsonb_build_object(
      'success', true,
      'already_processed', true,
      'new_balance', coalesce(v_balance, 0),
      'credits_added', 0
    );
  end if;

  -- e. Lock & Update Agent Wallet (credit)
  select id, balance into v_account_id, v_balance
  from public.credit_accounts
  where profile_id = p_profile_id and account_type = 'agent_wallet'
  for update;

  if not found then
    insert into public.credit_accounts (profile_id, account_type, name, balance)
    values (p_profile_id, 'agent_wallet', 'Agent Credits Wallet', 0)
    returning id, balance into v_account_id, v_balance;
  end if;

  v_new_balance := coalesce(v_balance, 0) + p_credits;

  update public.credit_accounts
  set balance = v_new_balance,
      updated_at = now()
  where id = v_account_id;

  -- f. Lock & Update Platform Revenue Pool (double-entry debit mirror of agent_create_rfq)
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

  v_plat_new_balance := coalesce(v_plat_balance, 0) - p_credits;

  update public.credit_accounts
  set balance = v_plat_new_balance,
      updated_at = now()
  where id = v_plat_account_id;

  -- g. Insert Credit Transaction
  insert into public.credit_transactions (
    description,
    reference_type,
    reference_id,
    created_by
  ) values (
    'Purchased ' || p_credits || ' Credits (Ref: ' || p_payment_ref || ')',
    'pack_purchase',
    p_payment_ref,
    p_profile_id
  ) returning id into v_tx_id;

  -- h. Double-Entry Credit Ledger Insert
  -- 1. Agent Wallet: CREDIT
  insert into public.credit_ledger (
    transaction_id,
    account_id,
    profile_id,
    entry_type,
    amount,
    balance_after,
    reference_type,
    reference_id,
    description,
    idempotency_key
  ) values (
    v_tx_id,
    v_account_id,
    p_profile_id,
    'credit',
    p_credits,
    v_new_balance,
    'pack_purchase',
    p_payment_ref,
    'Top-up of ' || p_credits || ' Credits (₹' || p_amount_inr || ')',
    p_payment_ref || ':agent_wallet'
  );

  -- 2. Platform Revenue: DEBIT
  insert into public.credit_ledger (
    transaction_id,
    account_id,
    profile_id,
    entry_type,
    amount,
    balance_after,
    reference_type,
    reference_id,
    description,
    idempotency_key
  ) values (
    v_tx_id,
    v_plat_account_id,
    null,
    'debit',
    p_credits,
    v_plat_new_balance,
    'pack_purchase',
    p_payment_ref,
    'Platform revenue debit for top-up ' || p_payment_ref,
    p_payment_ref || ':platform_revenue'
  );

  -- i. Immutable Audit Log Write
  insert into public.audit_log (
    actor_id,
    action,
    entity_type,
    entity_id,
    previous_state,
    new_state,
    created_at
  ) values (
    p_profile_id,
    'CREDIT_PACK_PURCHASED',
    'credit_accounts',
    v_account_id::text,
    jsonb_build_object('balance_before', v_balance),
    jsonb_build_object(
      'credits_added', p_credits,
      'amount_inr', p_amount_inr,
      'payment_ref', p_payment_ref,
      'balance_after', v_new_balance,
      'transaction_id', v_tx_id
    ),
    now()
  );

  return jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'credits_added', p_credits,
    'tx_id', v_tx_id
  );
end;
$$;

-- Secure function permissions: revoke from anon/public, grant to authenticated & service_role
revoke execute on function public.wallet_topup_credit from public, anon;
grant execute on function public.wallet_topup_credit to authenticated, service_role;

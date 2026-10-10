-- ═══════════════════════════════════════════════════════════
-- DMCGrid Platform Database Migration 00003
-- Double-Entry Credit Ledger Engine & Atomic Stored Procedures
-- Guarantees: sum(debits) = sum(credits), no orphaned balances
-- ═══════════════════════════════════════════════════════════

-- Ensure system master accounts exist
create or replace function public.ensure_system_credit_accounts()
returns void
language plpgsql
as $$
begin
    insert into public.credit_accounts (id, profile_id, account_type, name, balance)
    values
        ('00000000-0000-0000-0000-000000000001'::uuid, null, 'system_reserve', 'Platform Master Reserve', 10000000),
        ('00000000-0000-0000-0000-000000000002'::uuid, null, 'platform_revenue', 'Platform Revenue & Fee Account', 0)
    on conflict (id) do nothing;
end;
$$;

-- Initialize system accounts immediately
select public.ensure_system_credit_accounts();

-- Auto-provision Agent / DMC credit wallet upon profile creation
create or replace function public.fn_provision_profile_credit_account()
returns trigger
language plpgsql
security definer
as $$
begin
    if new.role = 'agent' then
        insert into public.credit_accounts (profile_id, account_type, name, balance)
        values (new.id, 'agent_wallet', concat(new.company_name, ' Wallet'), 0)
        on conflict (profile_id, account_type) do nothing;
    elsif new.role = 'dmc' then
        insert into public.credit_accounts (profile_id, account_type, name, balance)
        values (new.id, 'dmc_escrow', concat(new.company_name, ' Escrow'), 0)
        on conflict (profile_id, account_type) do nothing;
    end if;
    return new;
end;
$$;

create trigger trg_profile_provision_wallet
    after insert on public.profiles
    for each row execute function public.fn_provision_profile_credit_account();

-- Double-Entry Transaction Posting Stored Procedure
create or replace function public.post_double_entry_credit_transaction(
    p_source_account_id uuid,
    p_destination_account_id uuid,
    p_amount integer,
    p_reference_type text,
    p_reference_id text,
    p_description text,
    p_idempotency_key text default null,
    p_actor_id uuid default null
)
returns uuid
language plpgsql
security definer
as $$
declare
    v_transaction_id uuid;
    v_src_account public.credit_accounts%rowtype;
    v_dst_account public.credit_accounts%rowtype;
    v_src_new_balance integer;
    v_dst_new_balance integer;
begin
    -- 1. Validate inputs
    if p_amount <= 0 then
        raise exception 'Transaction amount must be strictly positive (> 0)';
    end if;

    if p_source_account_id = p_destination_account_id then
        raise exception 'Source and destination accounts must be distinct';
    end if;

    -- 2. Check Idempotency if key provided
    if p_idempotency_key is not null then
        select transaction_id into v_transaction_id
        from public.credit_ledger
        where idempotency_key = p_idempotency_key
        limit 1;

        if v_transaction_id is not null then
            return v_transaction_id;
        end if;
    end if;

    -- 3. Lock and retrieve source account
    select * into v_src_account
    from public.credit_accounts
    where id = p_source_account_id
    for update;

    if not found then
        raise exception 'Source credit account % not found', p_source_account_id;
    end if;

    -- Non-reserve accounts cannot go below zero balance
    if v_src_account.account_type != 'system_reserve' and v_src_account.balance < p_amount then
        raise exception 'Insufficient credit balance in account %. Available: %, Required: %',
            v_src_account.id, v_src_account.balance, p_amount;
    end if;

    -- 4. Lock and retrieve destination account
    select * into v_dst_account
    from public.credit_accounts
    where id = p_destination_account_id
    for update;

    if not found then
        raise exception 'Destination credit account % not found', p_destination_account_id;
    end if;

    -- 5. Calculate new balances
    v_src_new_balance := v_src_account.balance - p_amount;
    v_dst_new_balance := v_dst_account.balance + p_amount;

    -- 6. Insert transaction master record
    insert into public.credit_transactions (
        description,
        reference_type,
        reference_id,
        created_by
    ) values (
        p_description,
        p_reference_type,
        p_reference_id,
        p_actor_id
    ) returning id into v_transaction_id;

    -- 7. Insert DEBIT leg (Source account decreases)
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
        v_transaction_id,
        v_src_account.id,
        v_src_account.profile_id,
        'debit',
        p_amount,
        v_src_new_balance,
        p_reference_type,
        p_reference_id,
        concat('Debit: ', p_description),
        case when p_idempotency_key is not null then concat(p_idempotency_key, '-dr') else null end
    );

    -- 8. Insert CREDIT leg (Destination account increases)
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
        v_transaction_id,
        v_dst_account.id,
        v_dst_account.profile_id,
        'credit',
        p_amount,
        v_dst_new_balance,
        p_reference_type,
        p_reference_id,
        concat('Credit: ', p_description),
        case when p_idempotency_key is not null then concat(p_idempotency_key, '-cr') else null end
    );

    -- 9. Update account balances atomically
    update public.credit_accounts
    set balance = v_src_new_balance, updated_at = now()
    where id = v_src_account.id;

    update public.credit_accounts
    set balance = v_dst_new_balance, updated_at = now()
    where id = v_dst_account.id;

    return v_transaction_id;
end;
$$;

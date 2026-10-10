-- ==============================================================================
-- DMCGrid Database Migration: 00002_credit_ledger_double_entry.sql
-- True Double-Entry Bookkeeping Ledger for Platform Credits
-- ==============================================================================

-- 1. Credit Transactions (Transaction Header / Batch)
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_type TEXT NOT NULL CHECK (ref_type IN (
        'signup_bonus',
        'plan_grant',
        'pack_purchase',
        'connect_debit',
        'quote_debit',
        'refund',
        'admin_adjustment',
        'expiry'
    )),
    ref_id TEXT, -- Foreign identifier (e.g. connection_id, quote_id, razorpay_payment_id)
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_credit_txn_ref ON credit_transactions(ref_type, ref_id);

-- 2. Credit Ledger (Journal Entries: Always 2+ balancing entries per transaction)
CREATE TABLE credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES credit_transactions(id) ON DELETE RESTRICT,
    account_type TEXT NOT NULL CHECK (account_type IN (
        'user_wallet',        -- User's spendable credits
        'system_grant_pool',  -- Platform promo/free allocation pool
        'platform_revenue',   -- Consumed credits for connections & quotes
        'platform_reserve'    -- Escrow or prepaid credit reserve
    )),
    user_id UUID REFERENCES profiles(id) ON DELETE RESTRICT, -- NULL for system/platform accounts
    entry_type TEXT NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    balance_after INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_credit_ledger_user ON credit_ledger(user_id);
CREATE INDEX idx_credit_ledger_txn ON credit_ledger(transaction_id);
CREATE INDEX idx_credit_ledger_account ON credit_ledger(account_type);

-- 3. Invariant: Append-Only Trigger (No modifications or deletions allowed)
CREATE OR REPLACE FUNCTION prevent_credit_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Double-entry credit ledger is strictly immutable and append-only. Modification prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_credit_ledger_immutable
BEFORE UPDATE OR DELETE ON credit_ledger
FOR EACH ROW EXECUTE FUNCTION prevent_credit_ledger_modification();

CREATE TRIGGER trg_credit_transactions_immutable
BEFORE UPDATE OR DELETE ON credit_transactions
FOR EACH ROW EXECUTE FUNCTION prevent_credit_ledger_modification();

-- 4. Stored Procedure: Atomic Double-Entry Credit Transfer
-- Handles debiting one account and crediting another with balanced sums and updating user balance
CREATE OR REPLACE FUNCTION record_double_entry_transfer(
    p_from_account_type TEXT,
    p_from_user_id UUID,
    p_to_account_type TEXT,
    p_to_user_id UUID,
    p_amount INTEGER,
    p_ref_type TEXT,
    p_ref_id TEXT,
    p_description TEXT
) RETURNS UUID AS $$
DECLARE
    v_txn_id UUID;
    v_from_balance INTEGER := 0;
    v_to_balance INTEGER := 0;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Transfer amount must be strictly positive.';
    END IF;

    -- Validate balance if debiting a user wallet
    IF p_from_account_type = 'user_wallet' THEN
        SELECT credit_balance INTO v_from_balance FROM profiles WHERE id = p_from_user_id FOR UPDATE;
        IF v_from_balance IS NULL THEN
            RAISE EXCEPTION 'Debited user profile does not exist.';
        END IF;
        IF v_from_balance < p_amount THEN
            RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', p_amount, v_from_balance;
        END IF;
        v_from_balance := v_from_balance - p_amount;
    END IF;

    -- Calculate balance if crediting a user wallet
    IF p_to_account_type = 'user_wallet' THEN
        SELECT credit_balance INTO v_to_balance FROM profiles WHERE id = p_to_user_id FOR UPDATE;
        IF v_to_balance IS NULL THEN
            RAISE EXCEPTION 'Credited user profile does not exist.';
        END IF;
        v_to_balance := v_to_balance + p_amount;
    END IF;

    -- 1. Create transaction header
    INSERT INTO credit_transactions (ref_type, ref_id, description)
    VALUES (p_ref_type, p_ref_id, p_description)
    RETURNING id INTO v_txn_id;

    -- 2. Create DEBIT entry
    INSERT INTO credit_ledger (
        transaction_id, account_type, user_id, entry_type, amount, balance_after
    ) VALUES (
        v_txn_id, p_from_account_type, p_from_user_id, 'DEBIT', p_amount,
        CASE WHEN p_from_account_type = 'user_wallet' THEN v_from_balance ELSE NULL END
    );

    -- 3. Create CREDIT entry
    INSERT INTO credit_ledger (
        transaction_id, account_type, user_id, entry_type, amount, balance_after
    ) VALUES (
        v_txn_id, p_to_account_type, p_to_user_id, 'CREDIT', p_amount,
        CASE WHEN p_to_account_type = 'user_wallet' THEN v_to_balance ELSE NULL END
    );

    -- 4. Update cached user profiles balances atomically
    IF p_from_account_type = 'user_wallet' THEN
        UPDATE profiles SET credit_balance = v_from_balance, updated_at = now() WHERE id = p_from_user_id;
    END IF;

    IF p_to_account_type = 'user_wallet' THEN
        UPDATE profiles SET credit_balance = v_to_balance, updated_at = now() WHERE id = p_to_user_id;
    END IF;

    RETURN v_txn_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

# Wave 6D Summary: Wallet Top-Up (Razorpay Test Mode / Demo) + Real Credits Grant

**Execution Date:** October 23, 2026  
**Auditor / Scope:** Wave 6D Commerce & Top-Up Implementation  
**Status:** Complete & Verified Clean  
**Database Migration Applied:** `00017_wallet_topup.sql` on `supabase_db_db`  
**Git Commits:** None  

---

## 1. Executive Summary

Wave 6D establishes the production wallet top-up flow for DMCGrid. It replaces previous mock state on `/wallet` with active `credit_packs` from the PostgreSQL database (Starter 5 CR at ₹999, Growth 20 CR at ₹2,499, and Scale 50 CR at ₹4,999).

Top-up functions across two operational environments:
1. **Configured Gateway (Test / Live Mode):** Initiates a test-mode order via the Razorpay REST API (`https://api.razorpay.com/v1/orders`), launches Razorpay Checkout (`checkout.js`), and validates payment authenticity via server-side HMAC-SHA256 signature verification (`crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id)`).
2. **Unconfigured Gateway (Demo / Simulation Mode):** When Razorpay environment keys are unconfigured or set to placeholders, the UI degrades gracefully. Cards display a clear "Demo Top-Up" path alongside operations contact guidance (`ops@dmcgrid.com`). When clicked, it calls the authoritative `wallet_topup_credit` RPC with `payment_ref='DEMO-<uuid>'`.

Credits are granted strictly through a PostgreSQL `SECURITY DEFINER` function with atomic row locks, caller authorization, input verification against `credit_packs`, and double-entry ledger balancing (`agent_wallet` credit and `platform_revenue` debit).

---

## 2. Changes Implemented

### A. Database Migration: `00017_wallet_topup.sql`
- **Files Created:**
  - `platform/packages/db/supabase/migrations/00017_wallet_topup.sql`
  - `platform/packages/db/migrations/00017_wallet_topup.sql`
- **Applied to:** Docker container `supabase_db_db` (`psql -U postgres -d postgres`)
- **Key Schema & Stored Procedure Features:**
  - **Function Signature:** `wallet_topup_credit(p_profile_id uuid, p_credits int, p_amount_inr numeric, p_payment_ref text) RETURNS jsonb`
  - **Permissions:** Execution revoked from `public` and `anon`; granted exclusively to `authenticated` and `service_role`.
  - **Caller Authorization:** Authenticated callers can only top up their own `p_profile_id` (`auth.uid() = p_profile_id`), while admins and `service_role` retain administrative privileges.
  - **Idempotency Protection:**
    - Partial unique index: `idx_credit_tx_pack_payment_ref` on `credit_transactions(reference_id)` for payment references.
    - Stored procedure check-before-insert: If `reference_id = p_payment_ref` already exists, returns the existing balance without duplicate credit.
    - Unique constraint on `credit_ledger(idempotency_key)` using `${p_payment_ref}:agent_wallet` and `${p_payment_ref}:platform_revenue`.
  - **Strict Double-Entry Ledger Bookkeeping:**
    - Entry 1 (`agent_wallet`): `entry_type = 'credit'`, amount = `p_credits`, `balance_after` updated.
    - Entry 2 (`platform_revenue`): `entry_type = 'debit'`, amount = `p_credits`, `balance_after` updated.
  - **Audit Logging:** Inserts an immutable row into `public.audit_log` with action `'CREDIT_PACK_PURCHASED'`, previous balance, and new transaction details.

### B. Environment Configuration & Types
- **Files Modified:**
  - `platform/apps/web/.env.example`: Added `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID` to the template.
  - `platform/packages/db/src/types.ts`: Added TypeScript definitions for `wallet_topup_credit` under `Database['public']['Functions']`.

### C. Server Actions
- **File Modified:** `platform/apps/web/src/app/(agent)/actions.ts`
- **Actions Added / Refactored:**
  - `topUpCredits(packId: string)`:
    - Queries active pack from DB.
    - Inspects `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
    - If configured: creates Razorpay order via REST API with basic authentication (`amount = price_inr * 100`, `currency = 'INR'`). Returns `{ orderId, amount, currency, keyId, packId, credits }`.
    - If unconfigured: returns `{ isConfigured: false, packId, packName, credits, priceInr }`.
  - `verifyTopUp(params)`:
    - Computes HMAC-SHA256 signature using `crypto.createHmac('sha256', keySecret).update(order_id + '|' + payment_id).digest('hex')`.
    - Rejects invalid signatures.
    - Invokes `wallet_topup_credit` RPC.
    - Revalidates paths (`/wallet`, `/`, `/rfq`).
  - `demoTopUpCredits(params)`:
    - Generates `DEMO-<uuid>` payment reference.
    - Invokes `wallet_topup_credit` RPC.
    - Revalidates paths.
  - `buyCreditPackAction`: Preserved for backward compatibility, mapped to `demoTopUpCredits`.

### D. User Interface & Design Law Alignment
- **Files Modified:**
  - `platform/apps/web/src/app/(agent)/wallet/page.tsx`
  - `platform/apps/web/src/app/(agent)/wallet/wallet-view.tsx`
- **Design Law Enhancements:**
  - **Anti-slop / No Three-Equal-Cards:** Growth Pack (20 CR) is prominently differentiated as the featured tier with an accent gold border (`border-2 border-[#D4B483]`), subtle shadow, and a `MOST POPULAR` pill badge. Starter Pack and Scale Pack retain subtle luxury borders.
  - **Typography & Formatting:** Indian currency formatting (`₹999`, `₹2,499`, `₹4,999`) and tax invoice breakdown (`+18% GST (Total: ₹1,179)`). Zero em-dashes used.
  - **Buttons:** 44px min-height touch targets, WCAG AA compliant contrast, `active:scale-[0.97]`, and `160ms ease-out` transitions.
  - **Graceful Degradation:** When Razorpay keys are omitted, cards display `Demo Top-Up (<N> CR)` with clear simulation status indicators and a guidance notice directing invoice wire transfers to `ops@dmcgrid.com`.
  - **Balance Refresh:** `router.refresh()` executes upon transaction completion, updating the balance KPI cards and the double-entry transaction history table instantly.

---

## 3. Verification & Test Evidence

### A. TypeScript Compilation (`tsc --noEmit`)
- Workspace type check executed clean across all packages (`@dmcgrid/db`, `@dmcgrid/tokens`, `@dmcgrid/ui`, `@dmcgrid/web`):
  ```
  $ pnpm -r --filter "@dmcgrid/*" run type-check
  Scope: 4 of 5 workspace projects
  packages/db type-check$ tsc --noEmit (Done in 4.6s)
  packages/tokens type-check$ tsc --noEmit (Done in 5.3s)
  packages/ui type-check$ tsc --noEmit (Done in 4.7s)
  apps/web type-check$ tsc --noEmit (Done in 13.2s)
  Exit status: 0
  ```

### B. Production Build
- Standalone build executed with production environment configuration:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://dmcgrid.gomedicure.com NEXT_PUBLIC_DEMO_MODE=false NEXT_PUBLIC_DEV_LOGIN=false pnpm -C platform run build
  Exit status: 0
  Generated routes:
  └ ƒ /wallet (5.42 kB, First load 190 kB)
  ```
- Standalone artifacts synchronized to `/home/ubuntu/dmcgrid/deploy/` and `dmcgrid-platform` service restarted via systemd.

### C. Playwright E2E Production Run (`qa/e2e-wave6d.py`)
- **Target URL:** `https://dmcgrid.gomedicure.com`
- **Identity Tested:** Agent (`+91 98201 44829`, Zenith Luxury Journeys LLP)
- **Execution Log:**
  1. Signed in via `/portal-access-7k2m9` with phone OTP code `364791`.
  2. Navigated to `/wallet`. Verified initial balance was `10 CR`.
  3. Located Starter Pack card (5 Credits, ₹999).
  4. Clicked `Demo Top-Up (5 CR)`. Confirmation modal rendered price breakdown (Base: ₹999, GST 18%: +₹180, Total: ₹1,179).
  5. Clicked `Confirm Demo Top-Up (+5 CR)`.
  6. Verified success banner rendered in DOM.
  7. Verified new balance in DOM updated to `15 CR` (+5 delta verified).
  8. Verified ledger transaction row rendered in table.

### D. Direct Database Audit in `supabase_db_db`
- **Ledger Records Created:**
  ```sql
  SELECT entry_type, amount, balance_after, reference_type, reference_id, idempotency_key, created_at
  FROM credit_ledger
  WHERE reference_id = 'DEMO-c79d20c2-1356-40a1-bc1e-e0391a3f173c';
  ```
  Output:
  - `credit | 5 | 15 | pack_purchase | DEMO-c79d20c2-... | DEMO-c79d20c2-...:agent_wallet`
  - `debit  | 5 | 28527 | pack_purchase | DEMO-c79d20c2-... | DEMO-c79d20c2-...:platform_revenue`
- **Audit Log Entry Created:**
  - Action: `CREDIT_PACK_PURCHASED`
  - Actor: `a1111111-1111-1111-1111-111111111111`
  - Entity: `credit_accounts (c1000000-0000-0000-0000-000000000001)`
  - State: `{"amount_inr": 999, "balance_before": 10, "balance_after": 15, "credits_added": 5}`
- **Idempotency Test:**
  - Repeated call with `DEMO-c79d20c2-1356-40a1-bc1e-e0391a3f173c` returned:
    `{"success": true, "new_balance": 15, "credits_added": 0, "already_processed": true}` (0 duplicate credits granted).

### E. Artifacts Generated
- `docs/qa-wave6/screenshots/wave6d-wallet-before.png`: Agent wallet before purchase.
- `docs/qa-wave6/screenshots/wave6d-wallet-modal.png`: Purchase confirmation modal with GST breakdown.
- `docs/qa-wave6/screenshots/wave6d-wallet-after.png`: Agent wallet showing 15 CR and new credit ledger row.
- `qa/prod-agent-wallet.png`: Production wallet snapshot.
- `qa/e2e-wave6d.py`: Automated test script.

---

## 4. Compliance Checklist

| Requirement | Status | Evidence |
|---|---|---|
| RAZORPAY env variables added to example pattern | PASS | Added to `platform/apps/web/.env.example` |
| DB schema untouched beyond one migration | PASS | Single migration `00017_wallet_topup.sql` created and applied |
| Migration applied to local docker `supabase_db_db` | PASS | Applied via `psql -U postgres -d postgres` |
| `topUpCredits(packId)` server action | PASS | Created in `actions.ts` with REST API order creation |
| HMAC signature verification in `verifyTopUp` | PASS | Computes sha256 HMAC of `order_id\|payment_id` |
| SECURITY DEFINER `wallet_topup_credit` RPC | PASS | Defined in `00017_wallet_topup.sql` with double-entry ledger |
| Graceful degradation / Demo top-up path | PASS | Tested live; creates DEMO ref and executes RPC |
| Indian price format + GST 18% line | PASS | Rendered in cards and modal |
| UI balance refresh (`router.refresh()`) | PASS | Executed on purchase completion |
| Design Law compliance (no AI gradients, no three-equal-cards, 44px min touch target) | PASS | Differentiated featured Growth Pack; WCAG AA buttons |
| `tsc` and Next.js build clean | PASS | Both exit code 0 |
| Playwright E2E run against prod (+5 balance, ledger rows) | PASS | Verified live (balance 10 -> 15 CR; ledger verified in DB) |
| Do NOT git commit | PASS | Zero git commits created |

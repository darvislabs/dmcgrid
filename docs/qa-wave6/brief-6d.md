# WAVE 6D BRIEF — Wallet top-up (Razorpay TEST mode) + real credits grant. DO NOT touch DB schema
# beyond one migration if strictly needed; DO NOT commit.

Repo /home/ubuntu/dmcgrid/platform. tsc + build clean required.

TASKS:
1. Add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to the env example pattern (read deploy/.env if keys
   exist; if not, build against test placeholders and make the page degrade gracefully to
   'contact ops to top up' when unconfigured).
2. /wallet: replace any static state with a proper Top Up section: credit_packs from DB
   (Starter 5cr ₹999, Growth 20cr ₹2,499, Scale 50cr ₹4,999 — table already seeded), each as a
   card with a Buy button. Price display in Indian format + GST 18% line.
3. Server action topUpCredits(packId): if Razorpay configured -> create a test-mode order via
   Razorpay Node SDK (add dependency @razorpay/checkout just for types is NOT needed — use their
   REST API via fetch with basic auth key:id_secret, endpoint https://api.razorpay.com/v1/orders),
   amount = price_inr*100 (paise), currency INR. Return order id. Client opens Razorpay Checkout
   (https://checkout.razorpay.com/v1/checkout.js script) with test key; on success handler calls
   verifyTopUp(order_id, payment_id, signature) server action which VERIFIES the HMAC signature
   (crypto.createHmac('sha256', key_secret).update(order_id|payment_id)) and ONLY then credits the
   wallet via a new SECURITY DEFINER fn (migration 00017_wallet_topup.sql):
     wallet_topup_credit(p_profile_id uuid, p_credits int, p_amount_inr numeric, p_payment_ref text)
     — inserts credit_transactions + double-entry credit_ledger (agent_wallet credit, platform_revenue
     debit... check existing ledger conventions in agent_create_rfq and mirror them), audit_log,
     idempotent on p_payment_ref (unique index or check-before-insert).
   If Razorpay NOT configured: the Buy button shows a 'Demo top-up' path that calls the same RPC
   directly with payment_ref='DEMO-<uuid>' — clearly labeled demo (this keeps the flow testable
   now; production requires the keys).
4. UI: after successful top-up, refresh wallet balance (router.refresh()).
5. Keep design system: white cards, gold accents, Indian price format, rounded pills.

VERIFY: tsc clean; build clean (NEXT_PUBLIC_SUPABASE_URL=https://dmcgrid.gomedicure.com
NEXT_PUBLIC_DEMO_MODE=false NEXT_PUBLIC_DEV_LOGIN=false). If demo path: test end-to-end with a
playwright run against prod (login agent +91 98201 44829 -> wallet -> demo top-up Starter -> balance
+5 -> ledger rows exist). Write docs/qa-wave6/wave6d-summary.md.

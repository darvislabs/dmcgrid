import React from 'react';
import { redirect } from 'next/navigation';
import { StatCard, Badge } from '@dmcgrid/ui';
import { createClient } from '@/lib/supabase/server';
import { WalletView } from './wallet-view';
import { Wallet, Coins, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal-access-7k2m9');
  }

  const currentUserId = user.id;

  // 1. Fetch wallet balance
  let balance = 0;
  const { data: account } = await (supabase as any)
    .from('credit_accounts')
    .select('id, balance, name')
    .eq('profile_id', currentUserId)
    .eq('account_type', 'agent_wallet')
    .maybeSingle();

  if (account && typeof account.balance === 'number') {
    balance = account.balance;
  }

  // 2. Fetch ledger history
  const { data: ledgerData } = await (supabase as any)
    .from('credit_ledger')
    .select('*')
    .eq('profile_id', currentUserId)
    .order('created_at', { ascending: false });

  const ledger = ((ledgerData || []) as any[]).map((l: any) => ({
    id: l.id,
    entry_type: l.entry_type as 'credit' | 'debit',
    amount: l.amount,
    balance_after: l.balance_after,
    reference_type: l.reference_type,
    description: l.description,
    created_at: l.created_at,
  }));

  // 3. Fetch credit packs
  const { data: packsData } = await (supabase as any)
    .from('credit_packs')
    .select('*')
    .eq('is_active', true)
    .order('credits', { ascending: true });

  const packs = ((packsData || []) as any[]).map((p: any) => ({
    id: p.id,
    name: p.name,
    credits: p.credits,
    price_inr: Number(p.price_inr),
    gst_rate: Number(p.gst_rate || 18),
  }));

  // 4. Fetch subscription plans
  const { data: plansData } = await (supabase as any)
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('price_inr', { ascending: true });

  const plans = ((plansData || []) as any[]).map((p: any) => ({
    id: p.id,
    plan_code: p.plan_code,
    name: p.name,
    monthly_leads_included: p.monthly_leads_included,
    price_inr: Number(p.price_inr),
    description: p.description,
    features: p.features,
  }));

  // Compute lifetime metrics
  const totalDebited = ledger
    .filter((l) => l.entry_type === 'debit')
    .reduce((acc, l) => acc + l.amount, 0);

  const totalCredited = ledger
    .filter((l) => l.entry_type === 'credit')
    .reduce((acc, l) => acc + l.amount, 0);

  // 5. Gateway status & Profile info for prefill
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const isRazorpayConfigured = Boolean(
    keyId &&
    keySecret &&
    !keyId.includes('placeholder') &&
    !keySecret.includes('placeholder') &&
    keyId.trim() !== '' &&
    keySecret.trim() !== ''
  );

  const { data: userProfile } = await (supabase as any)
    .from('profiles')
    .select('contact_name, company_name, email, phone')
    .eq('id', currentUserId)
    .maybeSingle();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase font-bold">
              COMMERCE & LEDGER
            </span>
            <Badge variant="verified">
              <ShieldCheck className="w-3 h-3" />
              <span>DOUBLE-ENTRY VERIFIED</span>
            </Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Credits Wallet & Ledger
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Browse freely without friction. Credits are only debited when unlocking counterparty verified DMC credentials.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Available Credits Balance"
          value={`${balance} CR`}
          delta={{ value: "Audit compliant", isPositive: true }}
          subtext="Ready for DMC unlocks (5 CR / unlock)"
          icon={<Wallet className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Lifetime Credits Purchased"
          value={`${totalCredited} CR`}
          subtext="Total pack recharges"
          icon={<Coins className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Credits Spent on Unlocks"
          value={`${totalDebited} CR`}
          subtext="Direct supplier channels opened"
          icon={<ArrowUpRight className="w-4 h-4 text-[#0EA5A3]" />}
        />
      </div>

      {/* Main View */}
      <WalletView
        balance={balance}
        ledger={ledger}
        packs={packs}
        plans={plans}
        isRazorpayConfigured={isRazorpayConfigured}
        userProfile={userProfile || undefined}
        userId={currentUserId}
      />
    </div>
  );
}

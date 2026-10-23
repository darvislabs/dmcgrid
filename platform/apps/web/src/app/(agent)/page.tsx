import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, Button, Badge, StatCard, Money } from '@dmcgrid/ui';
import { createClient } from '@/lib/supabase/server';
import { FilePlus, Clock, ShieldCheck, Sparkles, Wallet, Users, ChevronRight, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AgentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal-access-7k2m9');
  }

  // 1. Fetch real credits wallet balance
  let creditsBalance = 0;
  try {
    const { data: account } = await (supabase as any)
      .from('credit_accounts')
      .select('balance')
      .eq('profile_id', user.id)
      .eq('account_type', 'agent_wallet')
      .maybeSingle();

    if (account && typeof account.balance === 'number') {
      creditsBalance = account.balance;
    }
  } catch {
    // fallback
  }

  // 2. Fetch real RFQs for current agent
  const { data: rfqsData } = await (supabase as any)
    .from('rfqs')
    .select(`
      id,
      rfq_number,
      title,
      status,
      start_date,
      end_date,
      duration_days,
      duration_nights,
      travelers_adults,
      travelers_children,
      budget_min,
      budget_max,
      currency,
      created_at,
      rfq_destinations (destination_name, country, nights),
      quotes (id, status)
    `)
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const realRfqs = (rfqsData || []) as any[];
  const activeRfqsCount = realRfqs.filter((r) => r.status !== 'closed' && r.status !== 'cancelled').length;
  const quotesReceivedCount = realRfqs.reduce((acc, r) => acc + (r.quotes?.length || 0), 0);
  const connectedDealsCount = realRfqs.filter((r) => r.status === 'connected').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Portal Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase">
              AGENT SOURCING PORTAL
            </span>
            <Badge variant="verified">
              <ShieldCheck className="w-3 h-3" />
              <span>KYC VERIFIED</span>
            </Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Demand Operations
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Publish structured RFQs, receive competitive DMC quotes anonymously, and unlock verified partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/rfq/new">
            <Button variant="primary" className="gap-2 font-semibold">
              <FilePlus className="w-4 h-4" />
              <span>+ New RFQ Brief</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards — Wired to authentic state */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active RFQ Briefs"
          value={activeRfqsCount}
          delta={{ value: 'Live on network', isPositive: true }}
          icon={<Clock className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Quotes Received"
          value={quotesReceivedCount}
          delta={{ value: 'From verified DMCs', isPositive: true }}
          icon={<Users className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Connected Deals"
          value={connectedDealsCount}
          icon={<ShieldCheck className="w-4 h-4 text-[#0EA5A3]" />}
        />
        <StatCard
          label="Credits Balance"
          value={`${creditsBalance} CR`}
          icon={<Wallet className="w-4 h-4 text-[#D4B483]" />}
        />
      </div>

      {/* DEFECT 06 & DEFECT 23: Theme-aware Sourcing Loop Banner with verified copy */}
      <Card className="border border-[#D4B483]/30 bg-[var(--bg-card)] p-6 relative overflow-hidden rounded-[12px]">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4B483]" />
              <span className="font-mono text-xs text-[#D4B483] uppercase tracking-wider">
                Live Sourcing Network Active
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
              AI-Assisted 8-Step RFQ Wizard
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-xl">
              Extract unstructured WhatsApp briefs into verified destinations, stays, and experiences with confidence scoring.
            </p>
          </div>
          <Link href="/rfq/new">
            <Button variant="secondary" size="sm" className="gap-1.5 shrink-0">
              <span>Launch Wizard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent RFQs Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Recent RFQ Briefs
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Live responses, anonymized quotes, and SLA clocks
            </p>
          </div>
          <Link href="/rfq" className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors">
            <span>View all ({realRfqs.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-card)] overflow-hidden">
          {realRfqs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-secondary)] font-mono uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">RFQ Code</th>
                    <th className="py-3 px-4">Destination & Pacing</th>
                    <th className="py-3 px-4">Travelers</th>
                    <th className="py-3 px-4 text-right">Budget</th>
                    <th className="py-3 px-4 text-center">Quotes</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                  {realRfqs.map((rfq) => {
                    const destNames = (rfq.rfq_destinations || [])
                      .map((d: any) => d.destination_name)
                      .filter(Boolean)
                      .join(' & ');
                    const travelers = `${rfq.travelers_adults || 2} Adults${
                      rfq.travelers_children ? `, ${rfq.travelers_children} Kids` : ''
                    }`;

                    return (
                      <tr
                        key={rfq.id}
                        className="hover:bg-[var(--bg-card-hover)] transition-colors duration-160"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-[#D4B483]">
                          {rfq.rfq_number}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{destNames || rfq.title}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {rfq.duration_nights ? `${rfq.duration_nights}N / ${rfq.duration_days}D` : rfq.title}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {travelers}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {rfq.budget_min ? (
                            <Money amount={rfq.budget_min} />
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--bg-surface)] font-bold text-[#D4B483] border border-[var(--border-line)]">
                            {rfq.quotes?.length || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={
                              rfq.status === 'connected'
                                ? 'verified'
                                : rfq.status === 'quoted'
                                ? 'gold'
                                : 'neutral'
                            }
                          >
                            {rfq.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/rfq/${rfq.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1">
                              <span>Inspect</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3">
              <p className="text-xs text-[var(--text-secondary)]">No sourcing briefs published yet.</p>
              <Link href="/rfq/new">
                <Button variant="secondary" size="sm">
                  + Create Your First RFQ
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* DEFECT 21 & DEFECT 25: Authentic Credits Wallet (fictitious static margin block removed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <Card className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] flex flex-col justify-between rounded-[12px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-[#D4B483]" />
              <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider font-semibold">
                Credits Wallet
              </span>
            </div>
            <h4 className="font-display font-semibold text-base text-[var(--text-primary)]">
              Double-Entry Ledger
            </h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              Credits are debited when publishing a brief (2 credits) and unlocking counterparty DMC identity (5 credits). Quote comparisons are always free.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[var(--text-muted)] block uppercase">Available Balance</span>
              <span className="text-xl font-bold font-mono text-[#D4B483]">{creditsBalance} CR</span>
            </div>
            <Link href="/wallet">
              <Button variant="primary" size="sm" className="font-semibold">
                Top Up Credits
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] flex flex-col justify-between rounded-[12px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#0EA5A3]" />
              <span className="font-mono text-[10px] text-[#0EA5A3] uppercase tracking-wider font-semibold">
                Sourcing Guarantee
              </span>
            </div>
            <h4 className="font-display font-semibold text-base text-[var(--text-primary)]">
              Verified Counterparties
            </h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              Every DMC on the network is KYC-vetted with verified trade licenses and destination operating records. Communication unlocks directly once you accept quotes.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--text-muted)]">Max 2 DMC connects per RFQ</span>
            <Link href="/rfq">
              <Button variant="outline" size="sm" className="text-xs">
                Browse My Briefs
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

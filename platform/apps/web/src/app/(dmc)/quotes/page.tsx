import React from 'react';
import Link from 'next/link';
import { Card, Button, Badge, StatCard, Money } from '@dmcgrid/ui';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
  Send,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import type { QuoteStatus } from '@dmcgrid/db';

export const dynamic = 'force-dynamic';

export default async function DmcQuotesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const currentDmcId = user?.id || 'd1111111-1111-1111-1111-111111111111';
  const adminClient = createAdminClient();

  // Query my submitted quotes with disambiguated RFQ agent embed
  const { data: quotesData } = await (adminClient as any)
    .from('quotes')
    .select(`
      id,
      quote_number,
      status,
      total_net_cost,
      valid_until,
      created_at,
      rfq_id,
      rfq:rfqs (
        id,
        rfq_number,
        title,
        duration_days,
        duration_nights,
        budget_min,
        budget_max,
        agent:profiles!rfqs_agent_id_fkey (
          company_name
        )
      ),
      quote_options (
        id,
        option_name,
        net_cost,
        is_selected,
        order_index
      )
    `)
    .eq('dmc_id', currentDmcId)
    .order('created_at', { ascending: false });

  const quotes: any[] = quotesData || [];

  const totalQuotes = quotes.length;
  const connectedQuotes = quotes.filter((q: any) => q.status === 'connected').length;
  const pendingQuotes = quotes.filter((q: any) => q.status === 'submitted').length;

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="neutral" dot={true}>Under Agent Review</Badge>;
      case 'shortlisted':
        return <Badge variant="gold" dot={true}>Shortlisted</Badge>;
      case 'connected':
        return <Badge variant="verified" dot={true}>Connected Deal Won</Badge>;
      case 'declined':
        return <Badge variant="error">Declined</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#0EA5A3] uppercase font-bold">
              FULFILLMENT PIPELINE
            </span>
            <Badge variant="verified">
              <ShieldCheck className="w-3 h-3" />
              <span>LICENSED SPECIALIST</span>
            </Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            My Submitted Quotes
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track anonymized quotation submissions, client responses, and won connection deals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/feed">
            <Button variant="primary" className="gap-2 font-semibold text-xs">
              <Send className="w-4 h-4" />
              <span>Browse New Briefs</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Quotes Submitted"
          value={totalQuotes}
          subtext="Active in marketplace"
          icon={<Send className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Connected Deals Won"
          value={connectedQuotes}
          subtext="Agents unlocked direct channel"
          icon={<CheckCircle2 className="w-4 h-4 text-[#0EA5A3]" />}
        />
        <StatCard
          label="Pending Review"
          value={pendingQuotes}
          subtext="Within active SLA clock"
          icon={<Clock className="w-4 h-4 text-[#F59E0B]" />}
        />
      </div>

      {/* Quotes Table */}
      <Card className="p-0 overflow-hidden bg-[var(--bg-card)] border border-[var(--border-line)]">
        <div className="p-5 border-b border-[var(--border-line)] flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              All Submitted Quotations
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Quotes remain strictly anonymized until an agent commits credits to unlock your agency identity.
            </p>
          </div>
          <Badge variant="gold" className="text-xs">
            {quotes.length} Quotes
          </Badge>
        </div>

        {quotes.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <p className="text-xs text-[var(--text-muted)]">No quotes submitted yet.</p>
            <Link href="/feed">
              <Button variant="primary" size="sm">
                View matching briefs feed
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-secondary)] font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Quote Code</th>
                  <th className="py-3.5 px-4">Brief Title</th>
                  <th className="py-3.5 px-4">Tiers Offered</th>
                  <th className="py-3.5 px-4 text-right">Net Range</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                {quotes.map((q: any) => {
                  const options = q.quote_options || [];
                  const minNet = options.length > 0 ? Math.min(...options.map((o: any) => o.net_cost)) : q.total_net_cost;
                  const maxNet = options.length > 0 ? Math.max(...options.map((o: any) => o.net_cost)) : q.total_net_cost;

                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors duration-160"
                    >
                      <td className="py-4 px-5 font-mono font-medium text-[#D4B483]">
                        {q.quote_number}
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          href={`/briefs/${q.rfq_id}`}
                          className="font-semibold text-[var(--text-primary)] hover:text-[#D4B483] transition-colors"
                        >
                          {q.rfq?.title || 'Traveler Brief'}
                        </Link>
                        <div className="text-[11px] font-mono text-[var(--text-secondary)] mt-0.5">
                          {q.rfq?.rfq_number} · {q.rfq?.duration_nights}N / {q.rfq?.duration_days}D
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {options.map((opt: any) => (
                            <span
                              key={opt.id}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                opt.is_selected
                                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 font-bold'
                                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-line)]'
                              }`}
                            >
                              {opt.option_name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-semibold">
                        {minNet === maxNet ? (
                          <Money amount={minNet} />
                        ) : (
                          <>
                            <Money amount={minNet} /> - <Money amount={maxNet} />
                          </>
                        )}
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                        {new Date(q.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(q.status as QuoteStatus)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link href={`/briefs/${q.rfq_id}`}>
                          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-mono">
                            <span>View Brief</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

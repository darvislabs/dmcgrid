import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, Button, Badge, StatCard, Money } from '@dmcgrid/ui';
import { createClient } from '@/lib/supabase/server';
import { FilePlus, Clock, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { RfqStatus } from '@dmcgrid/db';

export const dynamic = 'force-dynamic';

interface RfqListItem {
  id: string;
  rfq_number: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  duration_nights: number;
  travelers_adults: number;
  travelers_children: number;
  budget_min?: number | null;
  budget_max?: number | null;
  currency: string;
  created_at: string;
  rfq_destinations?: Array<{
    destination_name: string;
    country: string;
    nights: number;
  }>;
  quotes?: Array<{
    id: string;
    status: string;
    total_net_cost: number;
    created_at: string;
  }>;
}

export default async function RfqListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal-access-7k2m9');
  }

  const currentUserId = user.id;

  // Query my RFQs with child destinations & quotes
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
      rfq_destinations (
        destination_name,
        country,
        nights
      ),
      quotes (
        id,
        status,
        total_net_cost,
        created_at
      )
    `)
    .eq('agent_id', currentUserId)
    .order('created_at', { ascending: false });

  const rfqs: RfqListItem[] = (rfqsData || []) as RfqListItem[];

  const totalRfqs = rfqs.length;
  const quotedRfqs = rfqs.filter((r) => r.status === 'quoted').length;
  const connectedRfqs = rfqs.filter((r) => r.status === 'connected').length;
  const totalQuotesReceived = rfqs.reduce((acc, r) => acc + (r.quotes?.length || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="neutral" dot={true}>Published</Badge>;
      case 'quoted':
        return <Badge variant="gold" dot={true}>Quotes Received</Badge>;
      case 'connected':
        return <Badge variant="verified" dot={true}>Connected</Badge>;
      case 'closed':
        return <Badge variant="default">Closed</Badge>;
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
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase font-bold">
              AGENT DEMAND DESK
            </span>
            <span className="h-1 w-1 rounded-full bg-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-secondary)] font-mono">Real-Time Sourcing</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            My RFQ Briefs
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track published traveler briefs, review anonymous DMC bids, and unlock direct destination partnerships.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/rfq/new">
            <Button variant="primary" className="gap-2 font-semibold">
              <FilePlus className="w-4 h-4" />
              <span>Create New RFQ</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Briefs"
          value={totalRfqs}
          subtext="Created by your agency"
          icon={<Clock className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Quotes Received"
          value={totalQuotesReceived}
          subtext="From verified local DMCs"
          icon={<Users className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Under Review"
          value={quotedRfqs}
          subtext="Awaiting quote selection"
          icon={<Clock className="w-4 h-4 text-[#F59E0B]" />}
        />
        <StatCard
          label="Connected Deals"
          value={connectedRfqs}
          subtext="Direct channels established"
          icon={<CheckCircle2 className="w-4 h-4 text-[#0EA5A3]" />}
        />
      </div>

      {/* RFQ Directory Table */}
      <Card className="p-0 overflow-hidden bg-[var(--bg-card)] border border-[var(--border-line)]">
        <div className="p-5 border-b border-[var(--border-line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              All Sourcing Briefs
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select any RFQ to inspect day-wise supplier quotes and calculate deal margins.
            </p>
          </div>
          <Badge variant="gold" className="text-xs">
            {rfqs.length} Active Records
          </Badge>
        </div>

        {rfqs.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <p className="text-xs text-[var(--text-muted)]">No RFQs created yet.</p>
            <Link href="/rfq/new">
              <Button variant="primary" size="sm">
                Post your first RFQ brief
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-secondary)] font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">RFQ Ref</th>
                  <th className="py-3.5 px-4">Title & Pacing</th>
                  <th className="py-3.5 px-4">Destinations</th>
                  <th className="py-3.5 px-4">Travelers</th>
                  <th className="py-3.5 px-4 text-right">Target Budget</th>
                  <th className="py-3.5 px-4 text-center">Quotes</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                {rfqs.map((rfq) => {
                  const destinationsList = rfq.rfq_destinations && rfq.rfq_destinations.length > 0
                    ? rfq.rfq_destinations.map((d: any) => `${d.destination_name} (${d.nights}N)`).join(' + ')
                    : 'Flexible Destination';
                  const quotesCount = rfq.quotes ? rfq.quotes.length : 0;

                  return (
                    <tr
                      key={rfq.id}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors duration-160"
                    >
                      <td className="py-4 px-5 font-mono font-medium text-[#D4B483]">
                        {rfq.rfq_number}
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          href={`/rfq/${rfq.id}`}
                          className="font-semibold text-[var(--text-primary)] hover:text-[#D4B483] transition-colors"
                        >
                          {rfq.title}
                        </Link>
                        <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          {rfq.duration_nights} Nights / {rfq.duration_days} Days
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[var(--text-secondary)]">
                        {destinationsList}
                      </td>
                      <td className="py-4 px-4 text-[var(--text-secondary)]">
                        {rfq.travelers_adults} Adults{rfq.travelers_children > 0 ? `, ${rfq.travelers_children} Kids` : ''}
                      </td>
                      <td className="py-4 px-4 text-right font-mono">
                        {rfq.budget_min ? (
                          <Money amount={rfq.budget_min} />
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center font-mono">
                        <span
                          className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold ${
                            quotesCount > 0
                              ? 'bg-[#D4B483]/15 text-[#D4B483] border border-[#D4B483]/30'
                              : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-line)]'
                          }`}
                        >
                          {quotesCount}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(rfq.status as RfqStatus)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link href={`/rfq/${rfq.id}`}>
                          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-mono">
                            <span>Inspect</span>
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

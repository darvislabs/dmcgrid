'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, StatCard, Money } from '@dmcgrid/ui';
import {
  Briefcase,
  Trophy,
  Clock,
  Building2,
  ArrowRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export interface DealRecord {
  id: string;
  rfq_id: string;
  agent_id: string;
  dmc_id: string;
  net_cost: number;
  markup_percentage: number;
  markup_fixed: number;
  gross_margin: number;
  ancillary_cost: number;
  ancillary_charge: number;
  gst_percentage: number;
  gst_amount: number;
  tcs_percentage: number;
  tcs_amount: number;
  customer_selling_price: number;
  tds_paid: number;
  tds_payable: number;
  cash_profit: number;
  status: 'draft' | 'sent' | 'won' | 'lost' | 'pending';
  manager_approval_status: string;
  created_at: string;
  rfq?: {
    id: string;
    rfq_number: string;
    title: string;
    start_date?: string;
    end_date?: string;
    duration_days?: number;
    duration_nights?: number;
    travelers_adults?: number;
    travelers_children?: number;
  } | null;
  agent?: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone?: string | null;
  } | null;
  dmc?: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone?: string | null;
    operating_destinations?: string[] | null;
  } | null;
  quote_option?: {
    id: string;
    option_name: string;
    net_cost: number;
    quotes?: {
      quote_number: string;
    } | null;
  } | null;
  proposals?: Array<{
    id: string;
    title: string;
    customer_name: string;
    status: string;
    total_price: number;
  }> | null;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'won':
      return (
        <Badge variant="success" dot={true}>
          WON
        </Badge>
      );
    case 'lost':
      return (
        <Badge variant="error" dot={true}>
          LOST
        </Badge>
      );
    case 'sent':
      return (
        <Badge variant="warning" dot={true}>
          SENT TO CLIENT
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="warning" dot={true}>
          PENDING
        </Badge>
      );
    case 'draft':
    default:
      return (
        <Badge variant="neutral" dot={true}>
          DRAFT
        </Badge>
      );
  }
}

export function AgentDealsView({ deals }: { deals: DealRecord[] }) {
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'won' | 'lost'>('all');

  const filteredDeals = deals.filter((deal) => {
    if (filter === 'all') return true;
    return deal.status === filter;
  });

  const wonDeals = deals.filter((d) => d.status === 'won');
  const totalWonValue = wonDeals.reduce((acc, d) => acc + Number(d.customer_selling_price || 0), 0);
  const totalCashProfit = deals.reduce((acc, d) => acc + Number(d.cash_profit || 0), 0);
  const activePipelineValue = deals
    .filter((d) => d.status === 'draft' || d.status === 'sent' || d.status === 'pending')
    .reduce((acc, d) => acc + Number(d.customer_selling_price || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[var(--accent-gold)] uppercase font-bold">
              COMMERCE & PIPELINE
            </span>
            <Badge variant="verified">
              <ShieldCheck className="w-3 h-3" />
              <span>V62 BINDING ENGINE</span>
            </Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Deals & Conversions
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track confirmed bookings, manager approvals, customer selling prices, and final won/lost outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/proposals">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="w-3.5 h-3.5" />
              <span>View Customer Proposals</span>
            </Button>
          </Link>
          <Link href="/rfq/new">
            <Button variant="primary" size="sm" className="gap-2 font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              <span>+ Sourcing RFQ</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Deals"
          value={deals.length}
          delta={{ value: `${wonDeals.length} Won`, isPositive: true }}
          icon={<Briefcase className="w-4 h-4 text-[var(--accent-gold)]" />}
        />
        <StatCard
          label="Total Won Value"
          value={totalWonValue}
          isCurrency={true}
          subtext="Customer confirmed receipts"
          icon={<Trophy className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Active Pipeline"
          value={activePipelineValue}
          isCurrency={true}
          subtext="In negotiation / sent to traveler"
          icon={<Clock className="w-4 h-4 text-[#F59E0B]" />}
        />
        <StatCard
          label="Estimated Cash Profit"
          value={totalCashProfit}
          isCurrency={true}
          subtext="Net margin after TDS (V62)"
          icon={<Coins className="w-4 h-4 text-[#0EA5A3]" />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--border-subtle)]">
        {(['all', 'draft', 'sent', 'won', 'lost'] as const).map((statusKey) => {
          const count =
            statusKey === 'all' ? deals.length : deals.filter((d) => d.status === statusKey).length;
          const isActive = filter === statusKey;
          return (
            <button
              key={statusKey}
              onClick={() => setFilter(statusKey)}
              className={`px-3.5 py-1.5 rounded-[9px] text-xs font-medium transition-colors uppercase font-mono tracking-wider flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
                isActive
                  ? 'bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] border border-[var(--accent-gold-ring)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <span>{statusKey}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Deals Cards */}
      <div className="space-y-4">
        {filteredDeals.length === 0 ? (
          <Card className="p-12 text-center text-xs text-[var(--text-muted)]">
            <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-30 text-[var(--text-muted)]" />
            <p className="font-medium text-[var(--text-secondary)]">No deals in this category</p>
            <p className="mt-1">Accept quotes from verified DMCs to generate new deals.</p>
          </Card>
        ) : (
          filteredDeals.map((deal) => {
            const proposal = deal.proposals && deal.proposals.length > 0 ? deal.proposals[0] : null;

            return (
              <Card
                key={deal.id}
                className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] hover:border-[var(--accent-gold-ring)] transition-all space-y-5"
              >
                {/* Top Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[var(--accent-gold)]">
                        {deal.rfq?.rfq_number || 'RFQ-2026'}
                      </span>
                      {getStatusBadge(deal.status)}
                      <Badge variant="neutral" className="text-[10px]">
                        ID: {deal.id.slice(0, 8)}...
                      </Badge>
                    </div>

                    <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                      {deal.rfq?.title || 'Custom Luxury Itinerary'}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] font-mono flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span className="text-[var(--text-primary)] font-medium">
                          {deal.dmc?.company_name || 'Verified DMC Partner'}
                        </span>
                      </span>
                      {deal.quote_option && (
                        <span>· Tier: <b className="text-[var(--text-primary)]">{deal.quote_option.option_name}</b></span>
                      )}
                      {deal.rfq?.duration_nights && (
                        <span>· {deal.rfq.duration_nights}N / {deal.rfq.duration_days}D</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-left sm:text-right font-mono">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block">
                        Customer Selling Price
                      </span>
                      <span className="text-lg font-bold text-[var(--accent-gold)]">
                        <Money amount={Number(deal.customer_selling_price || 0)} />
                      </span>
                    </div>

                    <Link href={`/deals/${deal.id}`}>
                      <Button variant="primary" size="sm" className="gap-1.5 font-semibold">
                        <span>Inspect Deal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* V62 Cost Breakdown Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 rounded-[9px] bg-[var(--bg-elevated)]/50 border border-[var(--border-subtle)] text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase">DMC Net Cost</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      <Money amount={Number(deal.net_cost || 0)} />
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase">
                      Agent Markup ({deal.markup_percentage}%)
                    </span>
                    <span className="font-semibold text-[#10B981]">
                      +<Money amount={Number(deal.gross_margin || 0)} />
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase">Taxes (GST + TCS)</span>
                    <span className="font-semibold text-[var(--text-secondary)]">
                      +<Money amount={Number(deal.gst_amount || 0) + Number(deal.tcs_amount || 0)} />
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase">Estimated Cash Profit</span>
                    <span className="font-semibold text-[#0EA5A3]">
                      <Money amount={Number(deal.cash_profit || 0)} />
                    </span>
                  </div>
                </div>

                {/* Proposal Status Bar */}
                {proposal && (
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                      <span>
                        Customer Proposal: <b className="text-[var(--text-primary)]">{proposal.customer_name}</b> ({proposal.title})
                      </span>
                    </div>
                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="text-[var(--accent-gold)] hover:underline font-mono text-[11px] flex items-center gap-1"
                    >
                      <span>Preview Proposal Artifact →</span>
                    </Link>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export function DmcDealsView({ deals }: { deals: DealRecord[] }) {
  const [filter, setFilter] = useState<'all' | 'won' | 'lost' | 'pending'>('all');

  const filteredDeals = deals.filter((deal) => {
    if (filter === 'all') return true;
    if (filter === 'pending') {
      return deal.status === 'draft' || deal.status === 'sent' || deal.status === 'pending';
    }
    return deal.status === filter;
  });

  const wonDeals = deals.filter((d) => d.status === 'won');
  const lostDeals = deals.filter((d) => d.status === 'lost');
  const pendingDeals = deals.filter(
    (d) => d.status === 'draft' || d.status === 'sent' || d.status === 'pending'
  );

  const concludedCount = wonDeals.length + lostDeals.length;
  const winRate = concludedCount > 0 ? ((wonDeals.length / concludedCount) * 100).toFixed(1) : '0.0';

  const totalWonValue = wonDeals.reduce((acc, d) => acc + Number(d.net_cost || 0), 0);
  const totalPipelineNet = pendingDeals.reduce((acc, d) => acc + Number(d.net_cost || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#0EA5A3] uppercase font-bold">
              SUPPLY & FULFILLMENT NETWORK
            </span>
            <Badge variant="verified">
              <ShieldCheck className="w-3 h-3" />
              <span>CONNECTED DEALS</span>
            </Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            DMC Deals & Win Rate
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Supplier pipeline tracking: unlocked agent connections, traveler acceptance, and concluded itinerary contracts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/quotes">
            <Button variant="outline" size="sm" className="gap-2">
              <span>View All Quotes</span>
            </Button>
          </Link>
          <Link href="/feed">
            <Button variant="primary" size="sm" className="gap-2 font-semibold">
              <span>Browse Briefs Feed →</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Win Rate"
          value={`${winRate}%`}
          delta={{ value: `${wonDeals.length} won of ${concludedCount} closed`, isPositive: true }}
          icon={<TrendingUp className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Total Won Value"
          value={totalWonValue}
          isCurrency={true}
          subtext="Net DMC package contracted"
          icon={<Trophy className="w-4 h-4 text-[var(--accent-gold)]" />}
        />
        <StatCard
          label="Active Pipeline"
          value={totalPipelineNet}
          isCurrency={true}
          subtext="Pending traveler decision"
          icon={<Clock className="w-4 h-4 text-[#F59E0B]" />}
        />
        <StatCard
          label="Total Deals"
          value={deals.length}
          subtext={`${pendingDeals.length} pending decision`}
          icon={<Briefcase className="w-4 h-4 text-[#0EA5A3]" />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--border-subtle)]">
        {(['all', 'won', 'lost', 'pending'] as const).map((statusKey) => {
          let count = 0;
          if (statusKey === 'all') count = deals.length;
          else if (statusKey === 'won') count = wonDeals.length;
          else if (statusKey === 'lost') count = lostDeals.length;
          else count = pendingDeals.length;

          const isActive = filter === statusKey;
          return (
            <button
              key={statusKey}
              onClick={() => setFilter(statusKey)}
              className={`px-3.5 py-1.5 rounded-[9px] text-xs font-medium transition-colors uppercase font-mono tracking-wider flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
                isActive
                  ? 'bg-[#0EA5A3]/15 text-[#0EA5A3] border border-[#0EA5A3]/30 font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <span>{statusKey}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Deals List */}
      <div className="space-y-4">
        {filteredDeals.length === 0 ? (
          <Card className="p-12 text-center text-xs text-[var(--text-muted)]">
            <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-30 text-[var(--text-muted)]" />
            <p className="font-medium text-[var(--text-secondary)]">No deals in this category</p>
            <p className="mt-1">Submit quotes on incoming briefs to establish new booking pipelines.</p>
          </Card>
        ) : (
          filteredDeals.map((deal) => (
            <Card
              key={deal.id}
              className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] hover:border-[#0EA5A3]/30 transition-all space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[var(--accent-gold)]">
                      {deal.rfq?.rfq_number || 'RFQ-2026'}
                    </span>
                    {getStatusBadge(deal.status)}
                    <Badge variant="verified">
                      Agent: {deal.agent?.company_name || 'Verified Agency'}
                    </Badge>
                  </div>

                  <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                    {deal.rfq?.title || 'Destination Tour Package'}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] font-mono flex-wrap">
                    <span>Contact: <b className="text-[var(--text-primary)]">{deal.agent?.contact_name || 'Agent Contact'}</b></span>
                    <span>· Tier: <b className="text-[var(--text-primary)]">{deal.quote_option?.option_name || 'Default Tier'}</b></span>
                    {deal.rfq?.duration_nights && (
                      <span>· {deal.rfq.duration_nights} Nights / {deal.rfq.duration_days} Days</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="text-left sm:text-right font-mono">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">
                      DMC Package Net
                    </span>
                    <span className="text-lg font-bold text-[var(--text-primary)]">
                      <Money amount={Number(deal.net_cost || 0)} />
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      Customer Price: <Money amount={Number(deal.customer_selling_price || 0)} />
                    </span>
                  </div>

                  <Link href={`/deals/${deal.id}`}>
                    <Button variant="secondary" size="sm" className="gap-1.5">
                      <span>View Deal Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono">
                <span>Contract Created: {new Date(deal.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="text-[var(--text-muted)]">Quote: {deal.quote_option?.quotes?.quote_number || 'Standard Quote'}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

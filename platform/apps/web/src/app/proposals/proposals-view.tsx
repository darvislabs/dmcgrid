'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, StatCard, Money } from '@dmcgrid/ui';
import {
  FileText,
  Eye,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Briefcase,
} from 'lucide-react';

export interface ProposalRecord {
  id: string;
  deal_id: string;
  version: number;
  title: string;
  customer_name: string;
  customer_email?: string | null;
  total_price: number;
  currency: string;
  status: 'draft' | 'shared' | 'accepted' | 'declined' | 'expired';
  terms?: string | null;
  itinerary_json: any;
  created_at: string;
  deal?: {
    id: string;
    status: string;
    customer_selling_price: number;
    rfq?: {
      id: string;
      rfq_number: string;
      title: string;
      start_date?: string;
      end_date?: string;
      duration_days?: number;
      duration_nights?: number;
    } | null;
    dmc?: {
      company_name: string;
      contact_name: string;
    } | null;
  } | null;
  share_token?: {
    token: string;
    views_count?: number;
    last_viewed_at?: string | null;
  } | null;
}

export function ProposalsView({ proposals }: { proposals: ProposalRecord[] }) {
  const [filter, setFilter] = useState<'all' | 'shared' | 'accepted' | 'draft'>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const filteredProposals = proposals.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const totalAccepted = proposals.filter((p) => p.status === 'accepted').length;
  const totalShared = proposals.filter((p) => p.status === 'shared').length;
  const totalValue = proposals.reduce((acc, p) => acc + Number(p.total_price || 0), 0);

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[var(--accent-gold)] uppercase font-bold">
              CUSTOMER-FACING ARTIFACTS
            </span>
            <Badge variant="verified">
              <ShieldCheck className="w-3 h-3" />
              <span>BRANDED PRESENTATION</span>
            </Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Traveler Proposals
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Curated, client-ready itinerary documents with day-wise schedules, luxury accommodations, and interactive traveler share links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/deals">
            <Button variant="outline" size="sm" className="gap-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>View Deals Pipeline</span>
            </Button>
          </Link>
          <Link href="/rfq/new">
            <Button variant="primary" size="sm" className="gap-2 font-semibold">
              <span>+ New RFQ</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Proposals"
          value={proposals.length}
          subtext="Generated itineraries"
          icon={<FileText className="w-4 h-4 text-[var(--accent-gold)]" />}
        />
        <StatCard
          label="Accepted by Traveler"
          value={totalAccepted}
          delta={{ value: "Confirmed deals", isPositive: true }}
          icon={<CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Active Shared Links"
          value={totalShared}
          subtext="Under traveler review"
          icon={<Eye className="w-4 h-4 text-[#0EA5A3]" />}
        />
        <StatCard
          label="Total Pipeline Value"
          value={totalValue}
          isCurrency={true}
          subtext="Customer quoted value"
          icon={<Briefcase className="w-4 h-4 text-[var(--accent-gold)]" />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--border-subtle)]">
        {(['all', 'shared', 'accepted', 'draft'] as const).map((statusKey) => {
          const count =
            statusKey === 'all'
              ? proposals.length
              : proposals.filter((p) => p.status === statusKey).length;
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

      {/* Proposals Grid */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <Card className="p-12 text-center text-xs text-[var(--text-muted)]">
            <FileText className="w-8 h-8 mx-auto mb-3 opacity-30 text-[var(--text-muted)]" />
            <p className="font-medium text-[var(--text-secondary)]">No proposals in this status</p>
            <p className="mt-1">Accept quotes to generate traveler-facing proposal documents.</p>
          </Card>
        ) : (
          filteredProposals.map((prop) => {
            const daysCount = Array.isArray(prop.itinerary_json) ? prop.itinerary_json.length : 0;
            const token = prop.share_token?.token;

            return (
              <Card
                key={prop.id}
                className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] hover:border-[var(--accent-gold-ring)] transition-all space-y-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[var(--accent-gold)]">
                        {prop.deal?.rfq?.rfq_number || 'RFQ-2026'}
                      </span>
                      <Badge
                        variant={
                          prop.status === 'accepted'
                            ? 'success'
                            : prop.status === 'shared'
                            ? 'gold'
                            : 'neutral'
                        }
                        dot={true}
                      >
                        {prop.status.toUpperCase()}
                      </Badge>
                      <Badge variant="neutral" className="text-[10px]">
                        v{prop.version}
                      </Badge>
                    </div>

                    <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                      {prop.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] font-mono flex-wrap">
                      <span>Traveler: <b className="text-[var(--text-primary)]">{prop.customer_name}</b></span>
                      {prop.customer_email && (
                        <span>· {prop.customer_email}</span>
                      )}
                      <span>· {daysCount} Days Itinerary</span>
                      {prop.deal?.dmc && (
                        <span>· Operator: <b className="text-[var(--text-primary)]">{prop.deal.dmc.company_name}</b></span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-left sm:text-right font-mono">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block">
                        Customer Quoted Price
                      </span>
                      <span className="text-lg font-bold text-[var(--accent-gold)]">
                        <Money amount={Number(prop.total_price)} />
                      </span>
                    </div>

                    <Link href={`/proposals/${prop.id}`}>
                      <Button variant="primary" size="sm" className="gap-1.5 font-semibold">
                        <span>Preview Document</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Footer Controls & Share Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/deals/${prop.deal_id}`}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-mono text-[11px] flex items-center gap-1"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                      <span>View Commercial Deal Breakdown</span>
                    </Link>
                  </div>

                  {token && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        Views: {prop.share_token?.views_count || 0}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(token)}
                        className="h-7 px-2.5 text-[11px] gap-1"
                      >
                        {copiedToken === token ? (
                          <>
                            <Check className="w-3 h-3 text-[#10B981]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Traveler Link</span>
                          </>
                        )}
                      </Button>
                      <Link href={`/share/${token}`} target="_blank">
                        <Button variant="secondary" size="sm" className="h-7 px-2.5 text-[11px] gap-1">
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Portal</span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

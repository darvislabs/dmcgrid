'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, StatCard } from '@dmcgrid/ui';
import type { AdminAnalyticsSummary, SparklinePoint, AuditLogEntry } from '@dmcgrid/db';
import {
  Users,
  Building2,
  Clock,
  ShieldCheck,
  Coins,
  Send,
  Files,
  Activity,
  History,
  ChevronRight
} from 'lucide-react';

interface AnalyticsClientProps {
  summary: AdminAnalyticsSummary;
  sparkline: SparklinePoint[];
  auditLogs: AuditLogEntry[];
}

export function AnalyticsDashboardClient({ summary, sparkline, auditLogs }: AnalyticsClientProps) {
  const [hoveredPoint, setHoveredPoint] = useState<SparklinePoint | null>(null);

  // Format avg response time
  const formatSeconds = (sec: number) => {
    if (!sec || sec <= 0) return '0m';
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Sparkline maximum calculations for scaling
  const maxRfqs = Math.max(...sparkline.map((p) => p.rfqs), 1);
  const maxQuotes = Math.max(...sparkline.map((p) => p.quotes), 1);
  const maxOverall = Math.max(maxRfqs, maxQuotes, 4);

  return (
    <div className="space-y-8">
      {/* Primary KPI Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Est. Platform Revenue"
          value={summary.revenue_estimated_inr}
          isCurrency={true}
          delta={{ value: 'Ledger plans approximation', isPositive: true }}
          icon={<Coins className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Pending KYC Reviews"
          value={summary.pending_kyc_count}
          delta={{
            value: summary.pending_kyc_count > 0 ? 'Action required in queue' : 'Queue cleared',
            isPositive: summary.pending_kyc_count === 0,
          }}
          icon={<Clock className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Avg. Quote Turnaround"
          value={formatSeconds(summary.quote_avg_response_seconds)}
          delta={{ value: 'Within 24h SLA target', isPositive: true }}
          icon={<Activity className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Connections Unlocked"
          value={summary.connections_made_count}
          delta={{ value: 'Direct agent-DMC bridges', isPositive: true }}
          icon={<ShieldCheck className="w-4 h-4 text-[#10B981]" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Verified Travel Agents"
          value={summary.agents_count}
          icon={<Users className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Destination DMCs"
          value={summary.dmcs_count}
          icon={<Building2 className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Published Sourcing Briefs"
          value={summary.published_rfqs_count}
          icon={<Files className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Quotes Submitted"
          value={summary.quotes_submitted_count}
          icon={<Send className="w-4 h-4 text-[#10B981]" />}
        />
      </div>

      {/* 14-Day Activity Sparkline / Histogram */}
      <Card className="bg-[var(--bg-card)] border-[var(--border-line)] overflow-hidden">
        <CardHeader className="p-6 pb-2 border-b border-[var(--border-subtle)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4B483]">
                  14-DAY ACTIVITY ENGINE (SQL RPC)
                </span>
                <Badge variant="gold">REALTIME METRICS</Badge>
              </div>
              <CardTitle className="text-lg font-bold font-display text-[var(--text-primary)]">
                Brief Sourcing & DMC Quotation Velocity
              </CardTitle>
              <CardDescription className="text-xs text-[var(--text-secondary)] mt-0.5">
                Daily volume of new travel agent briefs published versus competitive destination quotes submitted.
              </CardDescription>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4B483]" />
                <span className="text-[var(--text-primary)]">RFQs Published</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="text-[var(--text-primary)]">Quotes Submitted</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Visual Chart Area */}
          <div className="relative pt-6 pb-2">
            {/* Hover Tooltip display */}
            <div className="h-6 mb-2 flex items-center justify-between font-mono text-xs">
              {hoveredPoint ? (
                <div className="text-[var(--text-primary)] flex items-center gap-3">
                  <span className="text-[#D4B483] font-bold">{hoveredPoint.label}:</span>
                  <span>{hoveredPoint.rfqs} RFQs</span>
                  <span>·</span>
                  <span className="text-[#10B981]">{hoveredPoint.quotes} Quotes</span>
                </div>
              ) : (
                <span className="text-[var(--text-muted)] text-[11px]">
                  Hover over bars to inspect daily sourcing throughput
                </span>
              )}
              <span className="text-[10px] text-[var(--text-muted)]">
                Max Scale: {maxOverall} events / day
              </span>
            </div>

            {/* Bars Container */}
            <div className="h-44 flex items-end justify-between gap-2 border-b border-[var(--border-line)] pb-2 px-1">
              {sparkline.map((point) => {
                const rfqHeight = Math.max(6, Math.round((point.rfqs / maxOverall) * 150));
                const quoteHeight = Math.max(6, Math.round((point.quotes / maxOverall) * 150));
                const isHovered = hoveredPoint?.date === point.date;

                return (
                  <div
                    key={point.date}
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="flex-1 flex flex-col items-center gap-1 h-full justify-end cursor-pointer group"
                  >
                    <div className="w-full flex items-end justify-center gap-1 max-w-[28px] h-full">
                      {/* RFQ Bar */}
                      <div
                        style={{ height: `${point.rfqs > 0 ? rfqHeight : 4}px` }}
                        className={`w-1/2 rounded-t-[3px] transition-all duration-200 ${
                          point.rfqs > 0
                            ? 'bg-[#D4B483] group-hover:bg-[#e4ca9d]'
                            : 'bg-[var(--border-subtle)]'
                        }`}
                      />
                      {/* Quote Bar */}
                      <div
                        style={{ height: `${point.quotes > 0 ? quoteHeight : 4}px` }}
                        className={`w-1/2 rounded-t-[3px] transition-all duration-200 ${
                          point.quotes > 0
                            ? 'bg-[#10B981] group-hover:bg-[#34d399]'
                            : 'bg-[var(--border-subtle)]'
                        }`}
                      />
                    </div>
                    {/* X-axis label */}
                    <span
                      className={`font-mono text-[9px] mt-1 truncate transition-colors ${
                        isHovered ? 'text-[#D4B483] font-bold' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {point.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Governance Quick Access Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/verification"
          className="p-5 rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-line)] hover:border-[#D4B483] transition-all group flex flex-col justify-between"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-[#D4B483]">KYC AUDIT GATE</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#D4B483]/20 text-[#D4B483] font-bold">
                {summary.pending_kyc_count} Pending
              </span>
            </div>
            <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
              Verification Queue
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Review company GSTIN, tax documentation, and approve/reject partner credentials with immutable audit logging.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-mono text-[#D4B483] group-hover:translate-x-1 transition-transform">
            <span>Open verification queue</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/ledger"
          className="p-5 rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-line)] hover:border-[#D4B483] transition-all group flex flex-col justify-between"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-[#D4B483]">BOOKKEEPING INVARIANTS</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-bold">
                Double-Entry
              </span>
            </div>
            <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
              Credit Ledger & Reserves
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Inspect agent wallet balances, perform admin adjustments with mandatory audit trail, and check system reserve conservation.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-mono text-[#D4B483] group-hover:translate-x-1 transition-transform">
            <span>Inspect double-entry journal</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/rfqs"
          className="p-5 rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-line)] hover:border-[#D4B483] transition-all group flex flex-col justify-between"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-[#D4B483]">DEMAND SOURCING</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[var(--bg-page)] text-[var(--text-muted)] font-mono border border-[var(--border-line)]">
                {summary.published_rfqs_count} Active
              </span>
            </div>
            <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
              RFQ Oversight & Force-Close
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Supervise briefs, examine itinerary pacing, star ratings, and execute ops force-closure with agent notification.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-mono text-[#D4B483] group-hover:translate-x-1 transition-transform">
            <span>Manage RFQ briefs</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Immutable Audit Log Trail (PRD Rule R2) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#D4B483]" />
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                Immutable Governance Audit Log (PRD Rule R2)
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Tamper-proof server audit log. Modifying or deleting audit_log records is rejected by PostgreSQL trigger.
            </p>
          </div>
          <Badge variant="verified">R2 COMPLIANT</Badge>
        </div>

        <Card className="bg-[var(--bg-card)] border-[var(--border-line)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-line)] bg-[var(--bg-page)]/50 text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Governance Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Recorded State Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)]">
                        {new Date(log.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}{' '}
                        <span className="text-[10px]">
                          {new Date(log.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            log.action.includes('APPROVED') || log.action.includes('ACTIVATED')
                              ? 'verified'
                              : log.action.includes('REJECTED') || log.action.includes('CLOSED')
                              ? 'gold'
                              : 'gold'
                          }
                          className="font-mono text-[9px] uppercase py-0.5 px-2"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-primary)]">
                        {log.entity_type}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-[var(--text-muted)] truncate max-w-[140px]">
                        {log.entity_id}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-[var(--text-secondary)] max-w-sm truncate">
                        {log.new_state ? JSON.stringify(log.new_state) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

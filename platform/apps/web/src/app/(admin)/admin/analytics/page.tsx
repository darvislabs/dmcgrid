import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AnalyticsDashboardClient } from './analytics-client';
import { Badge } from '@dmcgrid/ui';
import type { AdminAnalyticsSummary, SparklinePoint, AuditLogEntry } from '@dmcgrid/db';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal-access-7k2m9');
  }

  // 1. Fetch summary metrics
  const { data: summaryData, error: summaryError } = await (supabase as any).rpc('get_admin_analytics_summary');

  // 2. Fetch 14-day sparkline
  const { data: sparklineData, error: sparklineError } = await (supabase as any).rpc('get_admin_sparkline_14d');

  // 3. Fetch recent audit logs
  const { data: auditLogs, error: auditError } = await (supabase as any)
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (summaryError || sparklineError || auditError) {
    console.error('Error fetching analytics dashboard:', {
      summaryError,
      sparklineError,
      auditError,
    });
  }

  const defaultSummary: AdminAnalyticsSummary = {
    agents_count: 0,
    dmcs_count: 0,
    pending_kyc_count: 0,
    published_rfqs_count: 0,
    quotes_submitted_count: 0,
    connections_made_count: 0,
    quote_avg_response_seconds: 0,
    revenue_estimated_inr: 0,
  };

  const summary = (summaryData as unknown as AdminAnalyticsSummary) || defaultSummary;
  const sparkline = (sparklineData as unknown as SparklinePoint[]) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase">
              GOLDEN CIRCLE PLATFORM OPS
            </span>
            <Badge variant="gold">EXECUTIVE COMMAND DASHBOARD</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Network Operations & Sourcing Analytics
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Realtime marketplace health: active supply-demand ratios, 14-day quoting velocity, SLA turnaround times, and revenue estimations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="verified" className="py-1 px-3">
            ● ALL REPLICAS SYNCHRONIZED
          </Badge>
        </div>
      </div>

      <AnalyticsDashboardClient
        summary={summary}
        sparkline={sparkline}
        auditLogs={(auditLogs || []) as unknown as AuditLogEntry[]}
      />
    </div>
  );
}

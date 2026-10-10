'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@dmcgrid/ui';
import { Button, Badge, FormatMoney, StatCard } from '@dmcgrid/ui';
import { Plus, Clock, ArrowUpRight, Search, ShieldCheck } from 'lucide-react';

export default function AgentDashboardPage() {
  const activeBriefs = [
    {
      id: 'RFQ-1048',
      title: 'Thailand Luxury Escape',
      destination: 'Bangkok & Phuket',
      pacing: '5 Nights / 6 Days',
      travelers: '2 Adults, 2 Children',
      dates: 'Nov 14 to Nov 19, 2026',
      budget: 180000,
      quotesReceived: 3,
      slaRemaining: '08h 42m',
      status: 'active',
    },
    {
      id: 'RFQ-1049',
      title: 'Vietnam Heritage & Halong Bay',
      destination: 'Hanoi & Halong Bay',
      pacing: '6 Nights / 7 Days',
      travelers: '4 Adults',
      dates: 'Dec 02 to Dec 08, 2026',
      budget: 320000,
      quotesReceived: 2,
      slaRemaining: '14h 10m',
      status: 'connected_1',
    },
    {
      id: 'RFQ-1050',
      title: 'Swiss Alps Winter Retreat',
      destination: 'Zurich & Zermatt',
      pacing: '7 Nights / 8 Days',
      travelers: '2 Adults',
      dates: 'Jan 10 to Jan 17, 2027',
      budget: 540000,
      quotesReceived: 4,
      slaRemaining: '02h 15m',
      status: 'connected_2',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase font-bold">
              Demand Console
            </span>
            <span className="h-1 w-1 rounded-full bg-[var(--text-subtle)]" />
            <span className="text-xs text-[var(--text-muted)] font-mono">Verified Travel Partner</span>
          </div>
          <h1 className="text-3xl font-bold font-sans tracking-tight text-[var(--text)]">
            Sourcing Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xl">
            Broadcast verified travel briefs, compare anonymous DMC quotes, and generate white-label proposals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" className="gap-2 text-xs font-mono">
            <Search className="h-3.5 w-3.5" />
            <span>Search Quotes</span>
          </Button>
          <Button variant="primary" size="md" className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Post New RFQ</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Sourcing Briefs"
          value="4"
          delta="+2 this week"
          subtext="Under active DMC bidding"
        />
        <StatCard
          label="Quotes Received"
          value="11"
          subtext="Across 4 active destinations"
        />
        <StatCard
          label="Unlocked Connections"
          value="3"
          subtext="Max 2 DMCs per brief"
        />
        <StatCard
          label="Available Credits"
          value="14"
          subtext="1 credit per initial DMC connect"
        />
      </div>

      {/* Active RFQs Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)] font-sans">Active Sourcing Briefs</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Live RFQs dispatched to verified destination management companies.
            </p>
          </div>
          <Badge variant="gold" dot={true}>
            3 Live Broadcasts
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]/60 text-[11px] font-mono uppercase tracking-wider text-[var(--text-subtle)]">
                <th className="py-3 px-6">Brief Ref</th>
                <th className="py-3 px-4">Destination & Pacing</th>
                <th className="py-3 px-4">Travelers</th>
                <th className="py-3 px-4 text-right">Target Budget</th>
                <th className="py-3 px-4 text-center">Quotes</th>
                <th className="py-3 px-4">SLA Clock</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
              {activeBriefs.map((brief) => (
                <tr key={brief.id} className="hover:bg-[var(--surface-subtle)]/40 transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-[var(--text)]">
                    {brief.id}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-[var(--text)]">{brief.title}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {brief.destination} · {brief.pacing}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[var(--text-muted)]">{brief.travelers}</td>
                  <td className="py-4 px-4 text-right">
                    <FormatMoney amount={brief.budget} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-[#D4B483]/15 text-[#D4B483]">
                      {brief.quotesReceived}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#F59E0B]">
                      <Clock className="h-3 w-3" />
                      <span>{brief.slaRemaining}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      <span>Compare</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quote Comparison Preview (Anonymous Quote Matrix Teaser) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <CardTitle>Anonymous Quote Matrix</CardTitle>
              <span className="font-mono text-[10px] uppercase text-[#D4B483]">RFQ-1048 Preview</span>
            </div>
            <CardDescription>
              DMC identity remains strictly anonymous until you choose to connect. Compare deliverables side by side.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Anonymous Quote A */}
              <div className="p-4 rounded-[11px] border border-[var(--border)] bg-[var(--surface-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#D4B483]">Quote A (Option 1)</span>
                  <Badge variant="success" dot={true}>94% Match</Badge>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  4 Star Hotels, Private Van, Safari Tour + Breakfast
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-subtle)]">Net Cost</span>
                  <FormatMoney amount={142800} className="text-sm font-bold" />
                </div>
              </div>

              {/* Anonymous Quote B */}
              <div className="p-4 rounded-[11px] border border-[var(--border)] bg-[var(--surface-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#D4B483]">Quote B (Option 1)</span>
                  <Badge variant="gold" dot={true}>91% Match</Badge>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  5 Star Resorts, Luxury Transfers, Phi Phi Speedboat
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-subtle)]">Net Cost</span>
                  <FormatMoney amount={168500} className="text-sm font-bold" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status Card */}
        <Card className="flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#10B981]">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">KYC Verified</span>
            </div>
            <h3 className="font-bold text-sm text-[var(--text)]">Verified Travel Agency</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Your business credentials and GSTIN are verified. You have full access to broadcast RFQs and unlock direct DMC communication channels.
            </p>
          </div>
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <div className="text-[11px] font-mono text-[var(--text-subtle)]">
              Agency: Luxury Voyages Private Limited
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

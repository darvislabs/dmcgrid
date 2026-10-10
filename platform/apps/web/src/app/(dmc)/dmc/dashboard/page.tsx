'use client';

import * as React from 'react';
import { Card } from '@dmcgrid/ui';
import { Button, Badge, StatCard } from '@dmcgrid/ui';
import { Clock, Send, Eye, ShieldCheck, ArrowRight } from 'lucide-react';

export default function DmcDashboardPage() {
  const matchedBriefs = [
    {
      id: 'RFQ-1048',
      destination: 'Thailand · Bangkok & Phuket',
      pacing: '5N/6D · 2 Adults + 2 Children',
      dates: 'Nov 14 to Nov 19, 2026',
      budgetBand: '₹1.4L to ₹1.8L',
      preferredHotel: '4 Star preferred · Breakfast included',
      matchScore: 94,
      slaRemaining: '08h 42m',
      status: 'new',
    },
    {
      id: 'RFQ-1052',
      destination: 'Thailand · Koh Samui Villa Retreat',
      pacing: '4N/5D · 6 Adults (Corporate Retreat)',
      dates: 'Dec 05 to Dec 09, 2026',
      budgetBand: '₹4.0L to ₹5.5L',
      preferredHotel: 'Luxury Pool Villas · Private speedboat',
      matchScore: 91,
      slaRemaining: '19h 20m',
      status: 'new',
    },
    {
      id: 'RFQ-1055',
      destination: 'Thailand · Chiang Mai & Chiang Rai',
      pacing: '6N/7D · 2 Adults',
      dates: 'Dec 18 to Dec 24, 2026',
      budgetBand: '₹2.2L to ₹2.8L',
      preferredHotel: 'Boutique Heritage · Elephant Sanctuary',
      matchScore: 88,
      slaRemaining: '23h 05m',
      status: 'new',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase font-bold">
              Supply Terminal
            </span>
            <span className="h-1 w-1 rounded-full bg-[var(--text-subtle)]" />
            <span className="text-xs text-[var(--text-muted)] font-mono">Siam Destinations DMC</span>
          </div>
          <h1 className="text-3xl font-bold font-sans tracking-tight text-[var(--text)]">
            DMC Opportunities Feed
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xl">
            Real structured briefs matched to your destination licenses. Submit anonymous quotes with up to 3 package options.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" className="gap-2 text-xs font-mono">
            <Eye className="h-3.5 w-3.5" />
            <span>Past Quotations</span>
          </Button>
          <Button variant="primary" size="md" className="gap-2">
            <Send className="h-4 w-4" />
            <span>Open Builder</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="New Matched Briefs"
          value="7"
          delta="3 urgent"
          subtext="High-fit demand waiting"
        />
        <StatCard
          label="Quotes Submitted"
          value="18"
          subtext="This billing cycle"
        />
        <StatCard
          label="Selection Rate"
          value="38.5%"
          subtext="Agent connects closed"
        />
        <StatCard
          label="Quote Credits"
          value="28"
          subtext="1 credit consumed on first quote"
        />
      </div>

      {/* Matched Briefs Feed (from PRD line 27 & 33) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)] font-sans">Matched RFQ Opportunities</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Direct briefs from KYC-verified travel agents matching your Thailand inventory.
            </p>
          </div>
          <span className="font-mono text-xs text-[#D4B483] font-semibold">
            Realtime SLA Monitored
          </span>
        </div>

        <div className="space-y-3">
          {matchedBriefs.map((brief) => (
            <Card key={brief.id} className="p-5 hover:border-[#D4B483]/40 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-xs text-[var(--text)]">
                      {brief.id}
                    </span>
                    <Badge variant="gold" dot={true}>
                      Match {brief.matchScore}%
                    </Badge>
                    <div className="inline-flex items-center gap-1 font-mono text-[11px] text-[#F59E0B]">
                      <Clock className="h-3 w-3" />
                      <span>SLA: {brief.slaRemaining}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[var(--text)] font-sans">
                    {brief.destination}
                  </h3>

                  <div className="text-xs text-[var(--text-muted)] flex flex-wrap gap-x-4 gap-y-1">
                    <span>{brief.pacing}</span>
                    <span>·</span>
                    <span>{brief.dates}</span>
                    <span>·</span>
                    <span className="text-[var(--text)] font-medium">{brief.preferredHotel}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-[var(--border-subtle)]">
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-[var(--text-subtle)]">Agent Budget</div>
                    <div className="font-mono text-sm font-bold text-[var(--text)]">
                      {brief.budgetBand}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      Decline
                    </Button>
                    <Button variant="primary" size="sm" className="text-xs gap-1.5">
                      <span>Build Quote</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-[#10B981]">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Licensed Destination Partner
            </span>
          </div>
          <h4 className="font-bold text-sm text-[var(--text)]">Direct Sourcing Guarantee</h4>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Your quotations are presented anonymously to agents alongside standard matrices. When an agent connects, your company name and direct contact coordinates are unlocked.
          </p>
        </Card>

        <Card className="space-y-3">
          <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider font-semibold">
            Wallet Status
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-[var(--text)]">Quote Submission Balance</span>
            <span className="font-mono text-xl font-bold text-[var(--text)]">28 Credits</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Quote credits are consumed only once per brief upon initial submission. Up to 3 package options and itinerary revisions are included without extra charge.
          </p>
        </Card>
      </div>
    </div>
  );
}

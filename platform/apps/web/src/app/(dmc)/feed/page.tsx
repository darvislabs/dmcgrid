'use client';

import React from 'react';
import { Card, Button, Badge, StatCard } from '@dmcgrid/ui';
import { Inbox, Clock, Send, ShieldCheck, CheckCircle2, MapPin, AlertCircle } from 'lucide-react';

export default function DmcFeedPage() {
  const matchedBriefs = [
    {
      id: 'brief-th-01',
      reference: 'BRF-2026-9041',
      destination: 'Thailand · Phuket & Krabi',
      dates: 'Nov 18 - Nov 25, 2026 (7 Nights)',
      pax: '2 Adults · Honeymoon Luxury',
      hotelPref: '5-Star Beachfront Resort (CP)',
      experiences: ['Private Longtail to Phi Phi', 'Sunset Yacht Dinner', 'Private Airport Transfers'],
      budgetRange: '₹2,60,000 - ₹3,10,000',
      slaClock: '06h 12m',
      hasQuoted: false,
    },
    {
      id: 'brief-th-02',
      reference: 'BRF-2026-8819',
      destination: 'Thailand · Bangkok & Pattaya',
      dates: 'Dec 10 - Dec 16, 2026 (6 Nights)',
      pax: '6 Adults + 2 Kids · Family Reunion',
      hotelPref: '4-Star Premium Central (CP)',
      experiences: ['Safari World Private Van', 'Chao Phraya Dinner Cruise', 'Alcazar VIP'],
      budgetRange: '₹4,80,000 - ₹5,40,000',
      slaClock: '18h 40m',
      hasQuoted: true,
      quoteCode: 'Q-2026-TH-004',
      anonymousLabel: 'Quote B',
    },
    {
      id: 'brief-th-03',
      reference: 'BRF-2026-7910',
      destination: 'Thailand · Chiang Mai & Bangkok',
      dates: 'Jan 08 - Jan 15, 2027 (7 Nights)',
      pax: '4 Adults · Cultural & Culinary',
      hotelPref: 'Boutique Heritage / 5-Star',
      experiences: ['Elephant Sanctuary Visit', 'Thai Cooking Masterclass', 'Night Market Tour'],
      budgetRange: '₹3,50,000 - ₹4,00,000',
      slaClock: '22h 15m',
      hasQuoted: false,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Portal Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#0EA5A3] uppercase">
              DMC SUPPLY & FULFILLMENT NETWORK
            </span>
            <Badge variant="verified">
              <ShieldCheck className="w-3 h-3" />
              <span>VERIFIED DESTINATION SPECIALIST</span>
            </Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Demand Feed & Quote Builder
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Real structured traveler briefs matched to your destination licenses. Submit anonymous 3-tier quotes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="gold" className="py-1 px-3 text-xs">
            TERRITORY: THAILAND & INDOCHINA
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Matched Briefs Feed"
          value={3}
          delta={{ value: "All SLA compliant", isPositive: true }}
          icon={<Inbox className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Active Quotes"
          value={7}
          delta={{ value: "1 connected today", isPositive: true }}
          icon={<Send className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Connections Won"
          value={14}
          icon={<CheckCircle2 className="w-4 h-4 text-[#0EA5A3]" />}
        />
        <StatCard
          label="Response SLA Rate"
          value="98.4%"
          icon={<Clock className="w-4 h-4 text-[#D4B483]" />}
        />
      </div>

      {/* Anonymity Notice Banner (Compliance R1) */}
      <div className="p-4 rounded-[14px] border border-[#0EA5A3]/30 bg-[#0EA5A3]/5 flex items-start gap-3 text-xs">
        <AlertCircle className="w-4 h-4 text-[#0EA5A3] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-[var(--text-primary)]">
            Compliance Red Line R1: Absolute Quote Anonymity
          </span>
          <p className="text-[var(--text-secondary)]">
            Your quote is presented anonymously as &quot;Quote A&quot; or &quot;Quote B&quot; to agents alongside itemized day-wise build-ups. Your brand identity and direct contact are unlocked only when the agent commits credits to connect.
          </p>
        </div>
      </div>

      {/* Matched Briefs Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Incoming Traveler Briefs
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Structured agent requests awaiting your quote build-up
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            3 briefs matched
          </span>
        </div>

        <div className="space-y-4">
          {matchedBriefs.map((brief) => (
            <Card
              key={brief.id}
              className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] hover:border-[#D4B483]/30 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#D4B483]">
                      {brief.reference}
                    </span>
                    <Badge variant="neutral">
                      <MapPin className="w-3 h-3 text-[#0EA5A3]" />
                      <span>{brief.destination}</span>
                    </Badge>
                  </div>
                  <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                    {brief.pax}
                  </h3>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {brief.dates}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="text-left sm:text-right font-mono text-xs">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase">
                      Target Budget
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {brief.budgetRange}
                    </span>
                  </div>

                  <div className="text-left sm:text-right font-mono text-xs">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase">
                      Response Clock
                    </span>
                    <div className="flex items-center gap-1.5 text-[#F59E0B] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{brief.slaClock}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirement Chips */}
              <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase text-[var(--text-muted)]">
                    Stays & Key Experiences:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-line)] text-xs text-[var(--text-secondary)]">
                      {brief.hotelPref}
                    </span>
                    {brief.experiences.map((exp) => (
                      <span
                        key={exp}
                        className="px-2.5 py-1 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-line)] text-xs text-[var(--text-secondary)]"
                      >
                        ✓ {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0">
                  {brief.hasQuoted ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="gold">
                        ✓ QUOTE SUBMITTED ({brief.anonymousLabel})
                      </Badge>
                      <Button variant="secondary" size="sm">
                        Edit Quote
                      </Button>
                    </div>
                  ) : (
                    <Button variant="primary" size="sm" className="gap-1.5 font-semibold">
                      <Send className="w-3.5 h-3.5" />
                      <span>Build Quote (3 Options) →</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

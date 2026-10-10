'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, StatCard, Money } from '@dmcgrid/ui';
import { FilePlus, Clock, ShieldCheck, Sparkles, Wallet, Users, ChevronRight } from 'lucide-react';

export default function AgentDashboard() {
  const recentRfqs = [
    {
      code: 'RFQ-2026-7731',
      dest: 'Thailand (Phuket & Bangkok)',
      dates: 'Nov 12 - Nov 19, 2026 (7 Nights)',
      pax: '2 Adults · Couples',
      budget: 280000,
      quotesCount: 3,
      slaHours: '08h 45m',
      status: 'Quoted',
    },
    {
      code: 'RFQ-2026-6912',
      dest: 'Vietnam (Hanoi & Da Nang)',
      dates: 'Dec 04 - Dec 11, 2026 (7 Nights)',
      pax: '4 Adults · Family Group',
      budget: 450000,
      quotesCount: 2,
      slaHours: '16h 20m',
      status: 'Matching',
    },
    {
      code: 'RFQ-2026-5540',
      dest: 'Bali (Seminyak & Ubud)',
      dates: 'Jan 15 - Jan 22, 2027 (7 Nights)',
      pax: '2 Adults · Honeymoon',
      budget: 320000,
      quotesCount: 4,
      slaHours: '02h 10m',
      status: 'Connected',
    },
  ];

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active RFQ Briefs"
          value={4}
          delta={{ value: "2 published today", isPositive: true }}
          icon={<Clock className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Quotes Received"
          value={11}
          delta={{ value: "3 new quotes", isPositive: true }}
          icon={<Users className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Connected DMCs"
          value={2}
          icon={<ShieldCheck className="w-4 h-4 text-[#0EA5A3]" />}
        />
        <StatCard
          label="Credits Balance"
          value="20 CR"
          icon={<Wallet className="w-4 h-4 text-[#D4B483]" />}
        />
      </div>

      {/* Sourcing Loop Banner */}
      <Card className="border border-[#D4B483]/30 bg-gradient-to-r from-[#0B0F14] to-[#1F2937] p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4B483]" />
              <span className="font-mono text-xs text-[#D4B483] uppercase tracking-wider">
                Wave 1 Core Sourcing Loop Active
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
              AI-Assisted 6-Step RFQ Wizard
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
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Showing 3 active briefs
          </span>
        </div>

        <div className="rounded-[14px] border border-[var(--border-line)] bg-[var(--bg-card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-secondary)] font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">RFQ Code</th>
                  <th className="py-3 px-4">Destination & Pacing</th>
                  <th className="py-3 px-4">Travelers</th>
                  <th className="py-3 px-4 text-right">Budget</th>
                  <th className="py-3 px-4 text-center">Quotes</th>
                  <th className="py-3 px-4">SLA Clock</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                {recentRfqs.map((rfq) => (
                  <tr
                    key={rfq.code}
                    className="hover:bg-[var(--bg-card-hover)] transition-colors duration-160"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-[#D4B483]">
                      {rfq.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{rfq.dest}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{rfq.dates}</div>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {rfq.pax}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Money amount={rfq.budget} />
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--bg-surface)] font-bold text-[#D4B483] border border-[var(--border-line)]">
                        {rfq.quotesCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#F59E0B]" />
                        <span>{rfq.slaHours}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          rfq.status === 'Connected'
                            ? 'verified'
                            : rfq.status === 'Quoted'
                            ? 'gold'
                            : 'neutral'
                        }
                      >
                        {rfq.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" className="h-7 text-[11px]">
                        Compare →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* V62 Deal Formula Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <Card className="lg:col-span-2 p-6 border border-[var(--border-line)] bg-[var(--bg-card)]">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#D4B483] tracking-wider uppercase">
                BINDING COST ENGINE (RULE R8)
              </span>
              <Badge variant="neutral">V62 Formula</Badge>
            </div>
            <CardTitle className="text-base mt-1">
              Active Deal Margin Architecture
            </CardTitle>
            <CardDescription>
              selling = (net × markup) + ancillary; default 12% agent margin, statutory GST/TCS applied on subtotal.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-[var(--border-subtle)] font-mono text-xs">
              <div>
                <span className="text-[var(--text-muted)] block text-[10px]">DMC NET PACKAGE</span>
                <span className="font-semibold">₹1,80,000</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[10px]">AGENT MARGIN (12%)</span>
                <span className="font-semibold text-[#10B981]">+₹21,600</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[10px]">ANCILLARY CHARGE</span>
                <span className="font-semibold">+₹15,000</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[10px]">CUSTOMER SELLING</span>
                <span className="font-bold text-[#D4B483] text-sm">₹2,38,760</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Gross Deal Profit: <b className="text-[var(--text-primary)] font-mono">₹26,600</b></span>
              <span className="text-right">Cash Profit after TDS: <b className="text-[#10B981] font-mono">₹24,800</b></span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-[#D4B483]" />
              <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider">
                Credits Wallet
              </span>
            </div>
            <h4 className="font-display font-semibold text-base text-[var(--text-primary)]">
              Double-Entry Ledger
            </h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              Credits are only debited when unlocking counterparty DMC identity (5 credits per unlock). Browsing is always free.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[var(--text-muted)] block">AVAILABLE</span>
              <span className="text-lg font-bold font-mono text-[#D4B483]">20 CR</span>
            </div>
            <Button variant="primary" size="sm" className="font-semibold">
              Top Up Credits
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

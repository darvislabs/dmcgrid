'use client';

import React, { useState, useTransition } from 'react';
import { Card, Badge, Money, Button } from '@dmcgrid/ui';
import { ThemeToggle } from '@/components/theme-toggle';
import { DmcMark } from '@/components/brand-symbols';
import { calculateV62Deal } from '@dmcgrid/db';
import { recordTravelerChoiceAction } from '../actions';
import {
  Calendar,
  Check,
  Users,
  Phone,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface TravelerOption {
  id: string;
  option_name: string;
  description?: string | null;
  net_cost: number;
  is_selected: boolean;
  day_count: number;
  line_items?: Array<{
    id: string;
    day_number: number;
    time_window: string;
    title: string;
    description?: string | null;
    cost_category: string;
    net_cost: number;
  }>;
}

export function TravelerProposalView({
  token,
  proposalTitle,
  customerName,
  agencyName,
  startDate,
  endDate,
  durationDays,
  durationNights,
  travelersText,
  destinations,
  options,
  selectedOptionId,
  agentPhone,
  agentEmail,
  isConfirmed,
}: {
  token: string;
  proposalTitle: string;
  customerName: string;
  agencyName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  durationNights: number;
  travelersText: string;
  destinations: string[];
  options: TravelerOption[];
  selectedOptionId?: string | null;
  agentPhone?: string | null;
  agentEmail?: string | null;
  isConfirmed?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  // Selected option state: initially the confirmed option or the first one
  const initialOpt =
    options.find((o) => o.id === selectedOptionId) ||
    options.find((o) => o.is_selected) ||
    options[0];

  const [activeOptionId, setActiveOptionId] = useState<string>(initialOpt?.id || '');
  const [confirmedId, setConfirmedId] = useState<string | null>(
    selectedOptionId || (initialOpt?.is_selected ? initialOpt.id : null)
  );
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    isConfirmed ? { type: 'success', message: 'You have confirmed this itinerary selection.' } : null
  );

  const defaultOption: TravelerOption = {
    id: 'default',
    option_name: 'Curated Itinerary',
    description: 'Comprehensive luxury arrangement',
    net_cost: 0,
    is_selected: true,
    day_count: durationDays,
    line_items: [],
  };

  const activeOption = options.find((o) => o.id === activeOptionId) || options[0] || defaultOption;

  // Calculate V62 Customer Price for the active option
  const activePricing = activeOption
    ? calculateV62Deal({
        netCost: activeOption.net_cost,
        marginRate: 12,
        gstPct: 5,
        tcsPct: 5,
      })
    : null;

  const handleSelectOption = (optionId: string) => {
    startTransition(async () => {
      const res = await recordTravelerChoiceAction({
        token,
        optionId,
      });

      if (res.success) {
        setConfirmedId(optionId);
        setFeedback({
          type: 'success',
          message: `Package "${activeOption?.option_name}" selected and confirmed! Your luxury travel advisor at ${agencyName} has been notified.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to record your selection.',
        });
      }
    });
  };

  // Group line items by day for the active option
  const lineItems = activeOption?.line_items || [];
  const daysMap = new Map<number, typeof lineItems>();
  for (let d = 1; d <= durationDays; d++) {
    daysMap.set(d, []);
  }
  lineItems.forEach((item) => {
    const list = daysMap.get(item.day_number) || [];
    list.push(item);
    daysMap.set(item.day_number, list);
  });

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Traveler Header */}
      <header className="border-b border-[var(--border-line)] bg-[var(--bg-card)] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DmcMark className="w-5 h-6 text-[#D4B483]" />
            <div>
              <span className="font-display font-bold text-base tracking-tight text-[var(--text-primary)]">
                {agencyName.toUpperCase()}
              </span>
              <span className="font-mono text-[9px] text-[var(--text-secondary)] block uppercase tracking-widest">
                Curated Private Itinerary
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32">
              <ThemeToggle />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 hidden sm:inline-flex min-h-[36px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save PDF</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 px-6 max-w-5xl mx-auto border-b border-[var(--border-line)] space-y-6">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="gold">PREPARED FOR {customerName.toUpperCase()}</Badge>
            <Badge variant="verified">
              <ShieldCheck className="w-3 h-3" />
              <span>VERIFIED ITINERARY</span>
            </Badge>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
            {proposalTitle}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {destinations.length > 0
              ? `A bespoke journey through ${destinations.join(' and ')} designed with private transfers, curated boutique stays, and dedicated cultural guides.`
              : 'A curated journey tailored exclusively for your travel party.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-5 text-xs font-mono text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D4B483]" />
              <span>
                {startDate} - {endDate} ({durationNights} Nights / {durationDays} Days)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#D4B483]" />
              <span>{travelersText}</span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-[12px] border flex items-center justify-between text-xs ${
              feedback.type === 'success'
                ? 'border-[#10B981]/30 bg-[#10B981]/10 text-[var(--text-primary)]'
                : 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#EF4444]" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm px-1"
            >
              ×
            </button>
          </div>
        )}

        {/* Tier Selector Tabs */}
        {options.length > 1 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--text-muted)]">
                SELECT YOUR PREFERRED PACKAGE TIER:
              </span>
              <span className="font-mono text-xs text-[#D4B483]">
                {options.length} Tiers Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {options.map((opt) => {
                const optPricing = calculateV62Deal({
                  netCost: opt.net_cost,
                  marginRate: 12,
                  gstPct: 5,
                  tcsPct: 5,
                });
                const isSelected = activeOptionId === opt.id;
                const isThisConfirmed = confirmedId === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => setActiveOptionId(opt.id)}
                    className={`p-4 rounded-[12px] border text-left transition-all duration-160 cursor-pointer min-h-[44px] flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#D4B483] bg-[#D4B483]/10 shadow-[0_0_12px_rgba(212,180,131,0.1)]'
                        : 'border-[var(--border-line)] bg-[var(--bg-card)] hover:border-[var(--border-line)]/80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm text-[var(--text-primary)]">
                          {opt.option_name}
                        </span>
                        {isThisConfirmed && (
                          <Badge variant="gold" className="text-[10px]">
                            CONFIRMED
                          </Badge>
                        )}
                      </div>
                      {opt.description && (
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                          {opt.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[var(--border-subtle)] mt-2">
                      <span className="font-mono text-sm font-bold text-[#D4B483]">
                        <Money amount={optPricing.totalCustomerPrice} />
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                        Inclusive of all statutory taxes
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Package Spotlight & Confirmation CTA */}
        {activePricing && (
          <div className="p-6 rounded-[12px] border border-[#D4B483]/30 bg-gradient-to-r from-[var(--bg-surface)] to-[var(--bg-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  TOTAL COMPREHENSIVE PACKAGE ({activeOption.option_name})
                </span>
                {confirmedId === activeOption.id && (
                  <Badge variant="gold">SELECTED PACKAGE</Badge>
                )}
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-mono text-[#D4B483]">
                <Money amount={activePricing.totalCustomerPrice} />
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] block">
                Includes all 5-Star accommodations, luxury private transfers, entrance fees, GST 5% & TCS 5%.
              </span>
            </div>

            <Button
              variant={confirmedId === activeOption.id ? 'secondary' : 'primary'}
              size="lg"
              disabled={isPending || confirmedId === activeOption.id}
              onClick={() => handleSelectOption(activeOption.id)}
              className="font-bold min-h-[48px] px-6 gap-2 w-full sm:w-auto"
            >
              {confirmedId === activeOption.id ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Selection Confirmed</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm & Accept Itinerary</span>
                </>
              )}
            </Button>
          </div>
        )}
      </section>

      {/* Day by Day Journey */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div>
          <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase block mb-1">
            ITINERARY PACING · {activeOption.option_name.toUpperCase()}
          </span>
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Your Day-by-Day Journey
          </h2>
          {activeOption.description && (
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Accommodation Standard: {activeOption.description}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {Array.from(daysMap.entries()).map(([dayNum, items]) => {
            return (
              <Card
                key={dayNum}
                className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] space-y-3"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-sm font-bold text-[#D4B483] px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-line)]">
                    DAY {dayNum}
                  </span>
                  <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                    {items[0]?.title || `Day ${dayNum} Leisure & Exploration`}
                  </h3>
                </div>

                {items.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                    {items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-start justify-between gap-4 text-xs"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] uppercase text-[#D4B483] w-16 shrink-0">
                            {item.time_window}
                          </span>
                          <span className="text-[var(--text-primary)]">{item.title}</span>
                        </div>
                        <Badge variant="neutral" className="text-[10px] font-mono shrink-0">
                          {item.cost_category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Dedicated leisure pacing to enjoy resort facilities, local exploration, and private dining at your leisure.
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        {/* Journey Inclusions & Concierge Contact */}
        <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-[var(--bg-card)] border border-[var(--border-line)] space-y-4">
            <h4 className="font-display font-semibold text-sm text-[var(--text-primary)]">
              Included In Your Journey
            </h4>
            <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>All private air-conditioned airport & city transfers</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>{durationNights} Nights verified accommodation with daily breakfast</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>Certified local English-speaking cultural concierge guides</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>All monument entry permits, speedboats, and government taxes</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-[var(--bg-card)] border border-[var(--border-line)] flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="font-display font-semibold text-sm text-[var(--text-primary)]">
                Your Dedicated Travel Advisor
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Have questions or need adjustments to dates or hotel categories? Contact your advisor at {agencyName} directly.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div className="font-mono text-xs">
                <span className="text-[10px] text-[var(--text-muted)] block">AGENCY PARTNER</span>
                <span className="text-[var(--text-primary)] font-semibold">{agencyName}</span>
              </div>
              {agentPhone ? (
                <a href={`tel:${agentPhone}`}>
                  <Button variant="secondary" size="sm" className="gap-1.5 font-mono text-xs">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Advisor</span>
                  </Button>
                </a>
              ) : agentEmail ? (
                <a href={`mailto:${agentEmail}`}>
                  <Button variant="secondary" size="sm" className="gap-1.5 font-mono text-xs">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Email Advisor</span>
                  </Button>
                </a>
              ) : null}
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-line)] py-8 text-center text-xs text-[var(--text-muted)] font-mono">
        Secured by DMCGrid Infrastructure · Proposal Reference: {token}
      </footer>
    </div>
  );
}

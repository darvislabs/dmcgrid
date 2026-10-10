'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Money } from '@dmcgrid/ui';
import { DmcMark } from '@/components/brand-symbols';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Printer,
  MapPin,
  Sparkles,
  Utensils,
  Hotel,
} from 'lucide-react';

export interface ProposalDocumentClientProps {
  proposal: {
    id: string;
    deal_id: string;
    version: number;
    title: string;
    customer_name: string;
    customer_email?: string | null;
    total_price: number;
    currency: string;
    status: string;
    terms?: string | null;
    itinerary_json: any;
    created_at: string;
  };
  agentProfile: {
    company_name: string;
    contact_name: string;
    email: string;
    phone?: string | null;
  };
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
    destinations?: string[];
  } | null;
  shareToken?: string | null;
}

export function ProposalDocumentClient({
  proposal,
  agentProfile,
  rfq,
  shareToken,
}: ProposalDocumentClientProps) {
  const [copied, setCopied] = useState(false);

  const itinerary: any[] = Array.isArray(proposal.itinerary_json)
    ? proposal.itinerary_json
    : [];

  const handleCopyShareLink = () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Utility Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)] print:hidden">
        <Link
          href="/proposals"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[36px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Proposals</span>
        </Link>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge
            variant={
              proposal.status === 'accepted'
                ? 'success'
                : proposal.status === 'shared'
                ? 'gold'
                : 'neutral'
            }
            dot={true}
          >
            {proposal.status.toUpperCase()}
          </Badge>

          {shareToken && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyShareLink}
              className="gap-1.5 text-xs h-9"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Traveler Link</span>
                </>
              )}
            </Button>
          )}

          {shareToken && (
            <Link href={`/share/${shareToken}`} target="_blank">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs h-9">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Traveler Portal View</span>
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs h-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </Button>
        </div>
      </div>

      {/* Branded Document Artifact Container */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 sm:p-12 border border-[var(--border-line)] bg-[var(--bg-card)] shadow-xl space-y-10 rounded-[14px]">
          {/* Document Masthead */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-[var(--border-line)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <DmcMark className="w-5 h-6 text-[var(--accent-gold)]" />
                <span className="font-mono text-[10px] tracking-widest text-[var(--accent-gold)] uppercase font-bold">
                  CONFIDENTIAL BESPOKE ITINERARY
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {agentProfile.company_name}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                Curated Private Travel & Luxury Expeditions
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-[var(--text-secondary)] space-y-1 shrink-0">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block uppercase">Document Reference</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  PROP-{proposal.id.slice(0, 8).toUpperCase()}-V{proposal.version}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block uppercase">Date Issued</span>
                <span>{new Date(proposal.created_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Hero Cover Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-gold-soft)] border border-[var(--accent-gold-ring)] text-xs text-[var(--accent-gold)] font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailored Luxury Itinerary</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
              {proposal.title}
            </h1>

            <div className="pt-2 pb-4">
              <div className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Prepared Exclusively For:
              </div>
              <div className="text-lg sm:text-xl font-display font-semibold text-[var(--text-primary)]">
                {proposal.customer_name}
              </div>
              {proposal.customer_email && (
                <div className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                  {proposal.customer_email}
                </div>
              )}
            </div>

            {/* Trip Parameters Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 px-5 rounded-[12px] bg-[var(--bg-elevated)]/60 border border-[var(--border-subtle)] text-xs font-mono">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block uppercase">Duration</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {rfq?.duration_nights ? `${rfq.duration_nights} Nights / ${rfq.duration_days} Days` : `${itinerary.length} Days`}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block uppercase">Travelers</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {rfq?.travelers_adults ? `${rfq.travelers_adults} Adults${rfq.travelers_children ? `, ${rfq.travelers_children} Kids` : ''}` : 'Private Party'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block uppercase">Dates</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {rfq?.start_date ? new Date(rfq.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Flexible'}
                  {rfq?.end_date ? ` - ${new Date(rfq.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block uppercase">Status</span>
                <span className="font-semibold text-[var(--accent-gold)] uppercase">
                  {proposal.status}
                </span>
              </div>
            </div>
          </div>

          {/* Executive Overview Note */}
          <div className="p-5 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
            <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">
              Welcome to Your Curated Journey
            </h3>
            <p>
              It is our privilege to present this custom-crafted itinerary tailored specifically to your preferences. Every transfer, accommodation, and private encounter has been meticulously selected to provide seamless comfort, authentic regional access, and complete privacy throughout your travels.
            </p>
          </div>

          {/* Day-by-Day Comprehensive Itinerary */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                Bespoke Day-by-Day Journey Schedule
              </h2>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                {itinerary.length} Days Itinerary
              </span>
            </div>

            <div className="space-y-6">
              {itinerary.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                  Detailed day-by-day activities are currently being finalized with local destination hosts.
                </div>
              ) : (
                itinerary.map((dayItem: any, index: number) => {
                  const dayNum = dayItem.day || index + 1;
                  const activities: any[] = Array.isArray(dayItem.activities) ? dayItem.activities : [];
                  const meals: string[] = Array.isArray(dayItem.meals) ? dayItem.meals : [];

                  return (
                    <div
                      key={dayNum}
                      className="p-6 rounded-[14px] border border-[var(--border-line)] bg-[var(--bg-surface)] space-y-4 hover:border-[var(--accent-gold-ring)] transition-colors"
                    >
                      {/* Day Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[var(--accent-gold)] px-2 py-0.5 rounded bg-[var(--accent-gold-soft)]">
                              DAY {String(dayNum).padStart(2, '0')}
                            </span>
                            {dayItem.location && (
                              <span className="text-xs text-[var(--text-secondary)] font-mono flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[var(--accent-gold)]" />
                                <span>{dayItem.location}</span>
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                            {dayItem.title}
                          </h3>
                        </div>

                        {dayItem.accommodation && (
                          <div className="text-left sm:text-right shrink-0">
                            <div className="flex items-center sm:justify-end gap-1 text-[11px] font-mono text-[var(--text-muted)] uppercase">
                              <Hotel className="w-3 h-3 text-[var(--accent-gold)]" />
                              <span>Accommodation</span>
                            </div>
                            <span className="text-xs font-medium text-[var(--text-primary)]">
                              {dayItem.accommodation}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Day Description */}
                      {dayItem.description && (
                        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                          {dayItem.description}
                        </p>
                      )}

                      {/* Meals Tags */}
                      {meals.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] flex items-center gap-1">
                            <Utensils className="w-3 h-3" />
                            <span>Included Dining:</span>
                          </span>
                          {meals.map((meal, mIdx) => (
                            <span
                              key={mIdx}
                              className="px-2 py-0.5 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-primary)] font-mono"
                            >
                              {meal}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Activity Timetable */}
                      {activities.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">
                            Curated Itinerary Schedule:
                          </div>
                          <div className="space-y-2.5">
                            {activities.map((act: any, actIdx: number) => (
                              <div
                                key={actIdx}
                                className="flex items-start gap-3 p-3 rounded-[9px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs"
                              >
                                {act.time && (
                                  <span className="font-mono text-xs font-semibold text-[var(--accent-gold)] shrink-0 mt-0.5">
                                    {act.time}
                                  </span>
                                )}
                                <div className="space-y-0.5">
                                  <span className="font-medium text-[var(--text-primary)] block">
                                    {act.title}
                                  </span>
                                  {act.description && (
                                    <span className="text-[11px] text-[var(--text-secondary)] block leading-relaxed">
                                      {act.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Commercial Investment & Terms */}
          <div className="p-6 rounded-[14px] border border-[var(--border-line)] bg-[var(--bg-surface)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent-gold)] font-bold">
                  ALL-INCLUSIVE PROPOSAL INVESTMENT
                </span>
                <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                  Total Journey Commercials
                </h3>
              </div>

              <div className="text-left sm:text-right font-mono">
                <span className="text-[10px] text-[var(--text-muted)] uppercase block">
                  All Taxes & Private Charters Included
                </span>
                <span className="text-2xl font-bold text-[var(--accent-gold)]">
                  <Money amount={Number(proposal.total_price)} />
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">
                  Currency: {proposal.currency}
                </span>
              </div>
            </div>

            {/* Inclusions / Terms */}
            {proposal.terms && (
              <div className="space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                <span className="font-mono text-[10px] uppercase text-[var(--text-muted)] tracking-wider font-semibold block">
                  Terms of Inclusions & Guarantee:
                </span>
                <p>{proposal.terms}</p>
              </div>
            )}
          </div>

          {/* Signature & Concierge Block */}
          <div className="pt-6 border-t border-[var(--border-line)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-xs text-[var(--text-secondary)]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block">
                Issued By Private Concierge
              </span>
              <span className="font-semibold text-sm text-[var(--text-primary)] block">
                {agentProfile.contact_name}
              </span>
              <span className="font-medium text-[var(--text-secondary)] block">
                {agentProfile.company_name}
              </span>
            </div>

            <div className="space-y-1 text-left sm:text-right font-mono text-xs">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] uppercase block">Direct Sourcing Assistance</span>
                <span className="text-[var(--text-primary)]">{agentProfile.email}</span>
              </div>
              {agentProfile.phone && (
                <div>
                  <span className="text-[var(--text-secondary)]">{agentProfile.phone}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

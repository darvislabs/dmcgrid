import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, Badge, Money } from '@dmcgrid/ui';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { DmcQuoteBuilder } from './quote-builder';
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Hotel,
  Compass,
  AlertCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface DmcBriefDetail {
  id: string;
  rfq_number: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  duration_nights: number;
  travelers_adults: number;
  travelers_children: number;
  budget_min?: number | null;
  budget_max?: number | null;
  currency: string;
  notes?: string | null;
  created_at: string;
  rfq_destinations?: Array<{
    id: string;
    destination_name: string;
    country: string;
    nights: number;
    order_index: number;
  }>;
  rfq_stays?: Array<{
    id: string;
    star_rating: string;
    hotel_type: string;
    meal_plan: string;
    room_count: number;
    preferences?: string | null;
  }>;
  rfq_experiences?: Array<{
    id: string;
    category: string;
    description: string;
    required: boolean;
  }>;
}

export default async function DmcBriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = await params;
  const rfqId = unwrappedParams.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const currentDmcId = user?.id || 'd1111111-1111-1111-1111-111111111111';
  const adminClient = createAdminClient();

  // 1. Fetch RFQ details + children
  const { data: rfqRaw, error: rfqError } = await (adminClient as any)
    .from('rfqs')
    .select(`
      id,
      rfq_number,
      title,
      status,
      start_date,
      end_date,
      duration_days,
      duration_nights,
      travelers_adults,
      travelers_children,
      budget_min,
      budget_max,
      currency,
      notes,
      created_at,
      rfq_destinations (
        id,
        destination_name,
        country,
        nights,
        order_index
      ),
      rfq_stays (
        id,
        star_rating,
        hotel_type,
        meal_plan,
        room_count,
        preferences
      ),
      rfq_experiences (
        id,
        category,
        description,
        required
      )
    `)
    .eq('id', rfqId)
    .single();

  if (rfqError || !rfqRaw) {
    notFound();
  }

  const rfq: DmcBriefDetail = rfqRaw as DmcBriefDetail;

  // 2. Check if this DMC has already submitted a quote
  const { data: existingQuote } = await (adminClient as any)
    .from('quotes')
    .select(`
      id,
      quote_number,
      status,
      total_net_cost,
      created_at,
      quote_options (
        id,
        option_name,
        net_cost
      )
    `)
    .eq('rfq_id', rfqId)
    .eq('dmc_id', currentDmcId)
    .maybeSingle();

  const sortedDestinations = (rfq.rfq_destinations || []).sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-line)]">
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[36px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Briefs Feed</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="gold" className="text-xs">
            {rfq.rfq_number}
          </Badge>
          <Badge variant="neutral">
            {rfq.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[#0EA5A3]">
            <span className="uppercase tracking-widest font-bold">MATCHED TRAVELER BRIEF</span>
            <span className="h-1 w-1 rounded-full bg-[var(--text-muted)]" />
            <span>Matched to Your Operating License</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {rfq.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-secondary)] pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D4B483]" />
              <span>
                {new Date(rfq.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} -{' '}
                {new Date(rfq.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} ({rfq.duration_nights}N / {rfq.duration_days}D)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#D4B483]" />
              <span>
                {rfq.travelers_adults} Adults{rfq.travelers_children > 0 ? `, ${rfq.travelers_children} Kids` : ''}
              </span>
            </div>
            {rfq.budget_min && (
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--text-muted)]">Target Budget:</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  <Money amount={rfq.budget_min} /> {rfq.budget_max ? <>- <Money amount={rfq.budget_max} /></> : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="p-4 rounded-[14px] border border-[#0EA5A3]/30 bg-[#0EA5A3]/5 flex items-start gap-3 text-xs">
        <AlertCircle className="w-4 h-4 text-[#0EA5A3] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-[var(--text-primary)]">
            Rule R1 Absolute Anonymity Guarantee
          </span>
          <p className="text-[var(--text-secondary)]">
            This quote will be presented anonymously to the client agency as Quote A/B. Your brand credentials and direct communication channels unlock only when the agent connects using 5 platform credits.
          </p>
        </div>
      </div>

      {/* Brief Specifications Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Destinations */}
        <Card className="p-6 bg-[var(--bg-card)] border border-[var(--border-line)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0EA5A3]" />
              <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">
                Destinations & Pacing
              </h3>
            </div>
          </div>
          <div className="space-y-2">
            {sortedDestinations.map((d, idx) => (
              <div
                key={d.id || idx}
                className="flex items-center justify-between p-2.5 rounded-[9px] bg-[var(--bg-surface)] text-xs font-mono"
              >
                <span className="font-sans font-medium text-[var(--text-primary)]">
                  {d.destination_name} ({d.country})
                </span>
                <Badge variant="neutral" className="text-[11px]">
                  {d.nights} Nights
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Accommodation Requirements */}
        <Card className="p-6 bg-[var(--bg-card)] border border-[var(--border-line)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Hotel className="w-4 h-4 text-[#D4B483]" />
              <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">
                Stays & Hotel Preferences
              </h3>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            {rfq.rfq_stays && rfq.rfq_stays.length > 0 ? (
              rfq.rfq_stays.map((stay, idx) => (
                <div key={stay.id || idx} className="p-3 rounded-[9px] bg-[var(--bg-surface)] space-y-1.5 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Rating:</span>
                    <span className="font-bold uppercase text-[var(--text-primary)]">{stay.star_rating?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Meal Plan:</span>
                    <span className="uppercase text-[var(--text-primary)]">{stay.meal_plan}</span>
                  </div>
                  {stay.preferences && (
                    <p className="text-[11px] text-[var(--text-muted)] italic pt-1 border-t border-[var(--border-subtle)] font-sans">
                      &quot;{stay.preferences}&quot;
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No specific stay preferences.</p>
            )}
          </div>
        </Card>

        {/* Experiences */}
        <Card className="p-6 bg-[var(--bg-card)] border border-[var(--border-line)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#10B981]" />
              <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">
                Requested Activities
              </h3>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            {rfq.rfq_experiences && rfq.rfq_experiences.length > 0 ? (
              rfq.rfq_experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="p-2 rounded bg-[var(--bg-surface)] flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">✓</span>
                  <div>
                    <span className="font-medium text-[var(--text-primary)]">{exp.description}</span>
                    <span className="text-[10px] text-[var(--text-muted)] block font-mono">{exp.category}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--text-muted)]">Standard destination curation.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quote Builder Interactive Component */}
      <DmcQuoteBuilder
        rfqId={rfq.id}
        rfqNumber={rfq.rfq_number}
        durationDays={rfq.duration_days}
        existingQuote={existingQuote}
      />
    </div>
  );
}

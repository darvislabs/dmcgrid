import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, Button, Badge, Money } from '@dmcgrid/ui';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { RfqQuoteMatrix } from './rfq-quote-matrix';
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Hotel,
  Compass,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface RfqDetail {
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
  travelers_infants: number;
  budget_min?: number | null;
  budget_max?: number | null;
  currency: string;
  notes?: string | null;
  created_at: string;
  agent_id: string;
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

export default async function RfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = await params;
  const rfqId = unwrappedParams.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const currentUserId = user?.id || 'a1111111-1111-1111-1111-111111111111';
  const adminClient = createAdminClient();

  // 1. Fetch RFQ details + destinations + stays + experiences
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
      travelers_infants,
      budget_min,
      budget_max,
      currency,
      notes,
      created_at,
      agent_id,
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

  const rfq: RfqDetail = rfqRaw as RfqDetail;

  // 2. Fetch quotes with disambiguated FK embed: profiles!quotes_dmc_id_fkey
  const { data: quotesData } = await (adminClient as any)
    .from('quotes')
    .select(`
      id,
      quote_number,
      status,
      total_net_cost,
      currency,
      valid_until,
      notes,
      created_at,
      dmc_id,
      dmc:profiles!quotes_dmc_id_fkey (
        id,
        company_name,
        contact_name,
        email,
        phone,
        operating_destinations
      ),
      quote_options (
        id,
        option_name,
        description,
        net_cost,
        currency,
        is_selected,
        day_count,
        order_index,
        quote_line_items (
          id,
          day_number,
          time_window,
          title,
          description,
          cost_category,
          net_cost
        )
      )
    `)
    .eq('rfq_id', rfqId)
    .order('created_at', { ascending: false });

  // 3. Fetch active agent connections
  const { data: connectionsData } = await (adminClient as any)
    .from('connections')
    .select('id, dmc_id, quote_id')
    .eq('agent_id', currentUserId);

  const connectedDmcIds = new Set((connectionsData || []).map((c: any) => c.dmc_id));

  // 4. Fetch existing deal & proposal & share token
  const { data: existingDeal } = await (adminClient as any)
    .from('deals')
    .select('*')
    .eq('rfq_id', rfqId)
    .maybeSingle();

  let shareToken = null;
  if (existingDeal) {
    const { data: tokenRecord } = await (adminClient as any)
      .from('share_tokens')
      .select('token')
      .eq('deal_id', existingDeal.id)
      .maybeSingle();
    shareToken = tokenRecord?.token || null;
  }

  // 5. Fetch agent wallet credits
  let agentCredits = 20;
  const { data: creditAcc } = await (adminClient as any)
    .from('credit_accounts')
    .select('balance')
    .eq('profile_id', currentUserId)
    .eq('account_type', 'agent_wallet')
    .maybeSingle();
  if (creditAcc && typeof creditAcc.balance === 'number') {
    agentCredits = creditAcc.balance;
  }

  // Format quotes with connection flag
  const formattedQuotes = ((quotesData || []) as any[]).map((q: any) => ({
    ...q,
    is_connected: connectedDmcIds.has(q.dmc_id),
    quote_options: (q.quote_options || []).sort(
      (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
    ),
  }));

  const sortedDestinations = (rfq.rfq_destinations || []).sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-line)]">
        <Link
          href="/rfq"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[36px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All RFQs</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="gold" className="text-xs">
            {rfq.rfq_number}
          </Badge>
          <Badge variant={rfq.status === 'connected' ? 'verified' : 'neutral'}>
            {rfq.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[#D4B483]">
            <span className="uppercase tracking-widest font-bold">STRUCTURED TRAVEL BRIEF</span>
            <span className="h-1 w-1 rounded-full bg-[var(--text-muted)]" />
            <span>Created {new Date(rfq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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
                <span className="text-[var(--text-muted)]">Budget:</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  <Money amount={rfq.budget_min} /> {rfq.budget_max ? <>- <Money amount={rfq.budget_max} /></> : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link href="/rfq/new">
            <Button variant="secondary" size="sm" className="font-mono text-xs">
              + Clone as New RFQ
            </Button>
          </Link>
        </div>
      </div>

      {/* Brief Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Destinations Pacing */}
        <Card className="p-6 bg-[var(--bg-card)] border border-[var(--border-line)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0EA5A3]" />
              <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">
                Destination Pacing
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
              {rfq.duration_nights} Total Nights
            </span>
          </div>

          <div className="space-y-3">
            {sortedDestinations.map((dest, index) => (
              <div
                key={dest.id || index}
                className="flex items-center justify-between p-2.5 rounded-[9px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#D4B483] font-bold">0{index + 1}</span>
                  <span className="text-[var(--text-primary)] font-medium font-sans">
                    {dest.destination_name}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">({dest.country})</span>
                </div>
                <Badge variant="neutral" className="text-[11px] font-mono">
                  {dest.nights} Nights
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Accommodation Specs */}
        <Card className="p-6 bg-[var(--bg-card)] border border-[var(--border-line)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Hotel className="w-4 h-4 text-[#D4B483]" />
              <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">
                Stays & Rooms
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
              Specifications
            </span>
          </div>

          {rfq.rfq_stays && rfq.rfq_stays.length > 0 ? (
            <div className="space-y-2 text-xs">
              {rfq.rfq_stays.map((stay, idx) => (
                <div key={stay.id || idx} className="space-y-2 p-3 rounded-[9px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[var(--text-secondary)]">Category:</span>
                    <span className="font-bold text-[var(--text-primary)] uppercase">{stay.star_rating?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[var(--text-secondary)]">Meal Plan:</span>
                    <span className="font-medium text-[var(--text-primary)] uppercase">{stay.meal_plan}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[var(--text-secondary)]">Rooms:</span>
                    <span className="font-medium text-[var(--text-primary)]">{stay.room_count} Room(s)</span>
                  </div>
                  {stay.preferences && (
                    <p className="text-[11px] text-[var(--text-muted)] pt-1 italic border-t border-[var(--border-subtle)]">
                      &quot;{stay.preferences}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">No specific hotel constraints specified.</p>
          )}
        </Card>

        {/* Experiences & Notes */}
        <Card className="p-6 bg-[var(--bg-card)] border border-[var(--border-line)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#10B981]" />
              <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">
                Key Experiences
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
              Curations
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {rfq.rfq_experiences && rfq.rfq_experiences.length > 0 ? (
              rfq.rfq_experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="flex items-start gap-2 p-2 rounded bg-[var(--bg-surface)]">
                  <span className="text-[#10B981] font-bold">✓</span>
                  <div>
                    <span className="font-medium text-[var(--text-primary)]">{exp.description}</span>
                    <span className="text-[10px] text-[var(--text-muted)] block font-mono">{exp.category}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--text-muted)]">Standard destination highlights requested.</p>
            )}

            {rfq.notes && (
              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block mb-1">
                  Agent Notes:
                </span>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
                  {rfq.notes}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quote Matrix Section */}
      <RfqQuoteMatrix
        rfqId={rfq.id}
        rfqTitle={rfq.title}
        quotes={formattedQuotes}
        userCredits={agentCredits}
        existingDeal={existingDeal}
        existingShareToken={shareToken}
      />
    </div>
  );
}

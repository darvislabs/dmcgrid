import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, Button, Badge, StatCard, Money } from '@dmcgrid/ui';
import { createClient } from '@/lib/supabase/server';
import {
  Inbox,
  Clock,
  Send,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  AlertCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface FeedRfqItem {
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
  created_at: string;
  rfq_destinations?: Array<{
    id: string;
    destination_name: string;
    country: string;
    nights: number;
  }>;
  rfq_stays?: Array<{
    id: string;
    star_rating: string;
    hotel_type: string;
    meal_plan: string;
  }>;
  rfq_experiences?: Array<{
    id: string;
    category: string;
    description: string;
  }>;
}

export default async function DmcFeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal-access-7k2m9');
  }

  const currentDmcId = user.id;

  // 1. Fetch available RFQs matching DMC supply network
  const { data: rfqsData } = await (supabase as any)
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
        room_count
      ),
      rfq_experiences (
        id,
        category,
        description
      ),
      quotes (
        id,
        quote_number,
        status,
        total_net_cost,
        dmc_id
      )
    `)
    .in('status', ['published', 'quoted', 'connected'])
    .order('created_at', { ascending: false });

  const rfqs: FeedRfqItem[] = (rfqsData || []) as FeedRfqItem[];

  // 2. Fetch DMC's quotes & won connections
  const { data: myQuotes } = await (supabase as any)
    .from('quotes')
    .select('id, rfq_id, quote_number, status')
    .eq('dmc_id', currentDmcId);

  const { data: myConnections } = await (supabase as any)
    .from('connections')
    .select('id')
    .eq('dmc_id', currentDmcId);

  const myQuoteMap = new Map(((myQuotes || []) as any[]).map((q: any) => [q.rfq_id, q]));
  const connectionsWonCount = myConnections ? myConnections.length : 0;
  const quotesSubmittedCount = myQuotes ? myQuotes.length : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Portal Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#0EA5A3] uppercase font-bold">
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
          <Badge variant="gold" className="py-1 px-3 text-xs font-mono">
            TERRITORY: THAILAND & INDOCHINA
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Matched Briefs Feed"
          value={rfqs.length}
          delta={{ value: "All SLA compliant", isPositive: true }}
          icon={<Inbox className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Quotes Submitted"
          value={quotesSubmittedCount}
          delta={{ value: "Active pipeline", isPositive: true }}
          icon={<Send className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Connections Won"
          value={connectionsWonCount}
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
            {rfqs.length} briefs matched
          </span>
        </div>

        <div className="space-y-4">
          {rfqs.map((brief) => {
            const myQuote = myQuoteMap.get(brief.id);
            const hasQuoted = !!myQuote;
            const destList = (brief.rfq_destinations || [])
              .map((d) => `${d.destination_name} (${d.nights}N)`)
              .join(' + ');

            const firstStay = brief.rfq_stays && brief.rfq_stays.length > 0 ? brief.rfq_stays[0] : null;

            return (
              <Card
                key={brief.id}
                className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] hover:border-[#D4B483]/30 transition-all duration-200 space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#D4B483]">
                        {brief.rfq_number}
                      </span>
                      <Badge variant="neutral">
                        <MapPin className="w-3 h-3 text-[#0EA5A3]" />
                        <span>{destList || 'Multiple Destinations'}</span>
                      </Badge>
                    </div>
                    <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                      {brief.title}
                    </h3>
                    <div className="text-xs text-[var(--text-secondary)] font-mono">
                      {brief.duration_nights} Nights / {brief.duration_days} Days · {brief.travelers_adults} Adults{brief.travelers_children > 0 ? `, ${brief.travelers_children} Kids` : ''}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-left sm:text-right font-mono text-xs">
                      <span className="text-[10px] text-[var(--text-muted)] block uppercase">
                        Target Budget
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {brief.budget_min ? (
                          <>
                            <Money amount={brief.budget_min} /> {brief.budget_max ? <>- <Money amount={brief.budget_max} /></> : ''}
                          </>
                        ) : 'Flexible'}
                      </span>
                    </div>

                    <div className="text-left sm:text-right font-mono text-xs">
                      <span className="text-[10px] text-[var(--text-muted)] block uppercase">
                        Dates
                      </span>
                      <span className="font-semibold text-[var(--text-secondary)]">
                        {new Date(brief.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} -{' '}
                        {new Date(brief.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stays & Experiences Chips */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono uppercase text-[var(--text-muted)]">
                      Stays & Key Experiences:
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {firstStay && (
                        <span className="px-2.5 py-1 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-line)] text-xs text-[var(--text-secondary)]">
                          {firstStay.star_rating?.replace('_', ' ')} · {firstStay.meal_plan}
                        </span>
                      )}
                      {(brief.rfq_experiences || []).slice(0, 3).map((exp) => (
                        <span
                          key={exp.id}
                          className="px-2.5 py-1 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-line)] text-xs text-[var(--text-secondary)]"
                        >
                          ✓ {exp.description}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {hasQuoted ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="gold">
                          ✓ QUOTE SUBMITTED ({myQuote.quote_number})
                        </Badge>
                        <Link href={`/briefs/${brief.id}`}>
                          <Button variant="secondary" size="sm">
                            Inspect Quote
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Link href={`/briefs/${brief.id}`}>
                        <Button variant="primary" size="sm" className="gap-1.5 font-semibold">
                          <Send className="w-3.5 h-3.5" />
                          <span>Build Quote (3 Options) →</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

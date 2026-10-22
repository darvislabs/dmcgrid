import React from 'react';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { TravelerProposalView } from './traveler-view';

export const dynamic = 'force-dynamic';

interface ShareTokenRecord {
  id: string;
  token: string;
  proposal_id?: string | null;
  deal_id?: string | null;
  quote_id?: string | null;
  rfq_id?: string | null;
  selected_option_id?: string | null;
  expires_at?: string | null;
  views_count?: number;
  last_viewed_at?: string | null;
}

export default async function TravelerSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const unwrappedParams = await params;
  const token = unwrappedParams.token;

  const adminClient = createAdminClient();

  // 1. Fetch token record via public.share_lookup RPC
  const { data: tokenRecordData, error: tokenError } = await (adminClient as any).rpc('share_lookup', {
    p_token: token.trim(),
  });

  const tokenRecord = tokenRecordData as ShareTokenRecord | null;

  if (tokenError || !tokenRecord) {
    notFound();
  }

  // Check expiration
  if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < new Date()) {
    notFound();
  }

  // Increment views count in background
  try {
    await (adminClient as any)
      .from('share_tokens')
      .update({
        views_count: (tokenRecord.views_count || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', tokenRecord.id);
  } catch {
    // Non-blocking
  }

  // 2. Resolve Proposal & Deal
  let proposal: any = null;
  if (tokenRecord.proposal_id) {
    const { data: prop } = await (adminClient as any)
      .from('proposals')
      .select('*')
      .eq('id', tokenRecord.proposal_id)
      .maybeSingle();
    proposal = prop;
  }

  let dealId = tokenRecord.deal_id || proposal?.deal_id;
  let deal: any = null;
  if (dealId) {
    const { data: dl } = await (adminClient as any)
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .maybeSingle();
    deal = dl;
  }

  // 3. Resolve RFQ
  let rfqId = tokenRecord.rfq_id || deal?.rfq_id;
  if (!rfqId && tokenRecord.quote_id) {
    const { data: q } = await (adminClient as any)
      .from('quotes')
      .select('rfq_id')
      .eq('id', tokenRecord.quote_id)
      .maybeSingle();
    rfqId = q?.rfq_id;
  }

  // Fallback to first RFQ if missing in test token
  if (!rfqId) {
    const { data: firstRfq } = await (adminClient as any)
      .from('rfqs')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    rfqId = firstRfq?.id;
  }

  const { data: rfqData } = await (adminClient as any)
    .from('rfqs')
    .select(`
      id,
      rfq_number,
      title,
      start_date,
      end_date,
      duration_days,
      duration_nights,
      travelers_adults,
      travelers_children,
      agent_id,
      rfq_destinations (
        destination_name,
        country,
        nights,
        order_index
      ),
      rfq_stays (
        star_rating,
        hotel_type,
        meal_plan
      )
    `)
    .eq('id', rfqId)
    .single();

  const rfq: any = rfqData;
  if (!rfq) {
    notFound();
  }

  // 4. Resolve Agent Profile
  const { data: agentProfileData } = await (adminClient as any)
    .from('profiles')
    .select('company_name, contact_name, email, phone')
    .eq('id', rfq.agent_id)
    .maybeSingle();
  const agentProfile: any = agentProfileData;

  // 5. Resolve Quote Options & Line Items
  let quoteId = tokenRecord.quote_id;
  if (!quoteId && deal) {
    const { data: opt } = await (adminClient as any)
      .from('quote_options')
      .select('quote_id')
      .eq('id', deal.selected_quote_option_id)
      .maybeSingle();
    quoteId = opt?.quote_id;
  }

  if (!quoteId) {
    // Pick first quote on this RFQ
    const { data: qRec } = await (adminClient as any)
      .from('quotes')
      .select('id')
      .eq('rfq_id', rfqId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    quoteId = qRec?.id;
  }

  let optionsData: any[] = [];
  if (quoteId) {
    const { data: opts } = await (adminClient as any)
      .from('quote_options')
      .select(`
        id,
        option_name,
        description,
        net_cost,
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
      `)
      .eq('quote_id', quoteId)
      .order('order_index', { ascending: true });
    optionsData = opts || [];
  }

  // Format destinations list
  const destinations = (rfq.rfq_destinations || [])
    .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
    .map((d: any) => `${d.destination_name} (${d.nights}N)`);

  const startDateFormatted = new Date(rfq.start_date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });
  const endDateFormatted = new Date(rfq.end_date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const travelersText = `${rfq.travelers_adults} Adults${
    rfq.travelers_children > 0 ? `, ${rfq.travelers_children} Children` : ''
  }`;

  return (
    <TravelerProposalView
      token={token}
      proposalTitle={proposal?.title || rfq.title}
      customerName={proposal?.customer_name || 'Distinguished Travelers'}
      agencyName={agentProfile?.company_name || 'Zenith Luxury Journeys'}
      startDate={startDateFormatted}
      endDate={endDateFormatted}
      durationDays={rfq.duration_days}
      durationNights={rfq.duration_nights}
      travelersText={travelersText}
      destinations={destinations}
      options={optionsData}
      selectedOptionId={tokenRecord.selected_option_id || deal?.selected_quote_option_id}
      agentPhone={agentProfile?.phone}
      agentEmail={agentProfile?.email}
      isConfirmed={proposal?.status === 'accepted'}
    />
  );
}

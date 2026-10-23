import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { createClient } from '@/lib/supabase/server';
import { ProposalDocumentClient } from './proposal-document-client';
import type { UserRole } from '@dmcgrid/db';

export const dynamic = 'force-dynamic';

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = await params;
  const proposalId = unwrappedParams.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal-access-7k2m9');
  }

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role: UserRole = (profile?.role as UserRole) ?? 'agent';
  const targetUserId = user.id;

  // Fetch agent credits
  let credits = 0;
  const { data: account } = await (supabase as any)
    .from('credit_accounts')
    .select('balance')
    .eq('profile_id', targetUserId)
    .eq('account_type', 'agent_wallet')
    .maybeSingle();

  if (account && typeof account.balance === 'number') {
    credits = account.balance;
  }

  // Fetch proposal with deal and disambiguated FKs
  const { data: proposalData, error } = await (supabase as any)
    .from('proposals')
    .select(`
      id,
      deal_id,
      version,
      title,
      customer_name,
      customer_email,
      total_price,
      currency,
      status,
      terms,
      itinerary_json,
      created_at,
      deal:deals (
        id,
        status,
        customer_selling_price,
        rfq:rfqs (
          id,
          rfq_number,
          title,
          start_date,
          end_date,
          duration_days,
          duration_nights,
          travelers_adults,
          travelers_children,
          rfq_destinations (
            destination_name,
            country,
            nights
          )
        ),
        agent:profiles!deals_agent_id_fkey (
          id,
          company_name,
          contact_name,
          email,
          phone
        ),
        dmc:profiles!deals_dmc_id_fkey (
          id,
          company_name,
          contact_name,
          email,
          phone
        )
      )
    `)
    .eq('id', proposalId)
    .maybeSingle();

  if (error || !proposalData) {
    notFound();
  }

  // Ownership check: agent_id or dmc side depending on role (or admin)
  const isOwner =
    proposalData.deal?.agent_id === user.id ||
    proposalData.deal?.dmc_id === user.id ||
    role === 'admin';

  if (!isOwner) {
    notFound();
  }

  // Fetch share token
  const { data: tokenData } = await (supabase as any)
    .from('share_tokens')
    .select('token, views_count, last_viewed_at, expires_at')
    .or(`proposal_id.eq.${proposalId},deal_id.eq.${proposalData.deal_id}`)
    .maybeSingle();

  const destinations = (proposalData.deal?.rfq?.rfq_destinations || []).map(
    (d: any) => `${d.destination_name} (${d.nights}N)`
  );

  const agentProfile = proposalData.deal?.agent || {
    company_name: 'Apex Journeys LLP',
    contact_name: 'Riya Sharma',
    email: 'zenith@luxurytravel.in',
    phone: '+91 98200 12345',
  };

  const rfqData = proposalData.deal?.rfq
    ? {
        ...proposalData.deal.rfq,
        destinations,
      }
    : null;

  return (
    <AppShell role={role} credits={credits}>
      <ProposalDocumentClient
        proposal={proposalData}
        agentProfile={agentProfile}
        rfq={rfqData}
        shareToken={tokenData?.token || null}
      />
    </AppShell>
  );
}

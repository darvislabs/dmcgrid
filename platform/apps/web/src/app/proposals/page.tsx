import React from 'react';
import { cookies } from 'next/headers';
import { AppShell } from '@/components/app-shell';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { ProposalsView, type ProposalRecord } from './proposals-view';
import type { UserRole } from '@dmcgrid/db';

export const dynamic = 'force-dynamic';

export default async function ProposalsPage() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get('dmc_role')?.value as UserRole | undefined;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const role: UserRole = roleCookie || 'agent';
  const targetUserId =
    user?.id ||
    (role === 'dmc'
      ? 'd1111111-1111-1111-1111-111111111111'
      : 'a1111111-1111-1111-1111-111111111111');

  const adminClient = createAdminClient();

  // Fetch agent credits
  let credits = 20;
  const { data: account } = await (adminClient as any)
    .from('credit_accounts')
    .select('balance')
    .eq('profile_id', targetUserId)
    .eq('account_type', 'agent_wallet')
    .maybeSingle();

  if (account && typeof account.balance === 'number') {
    credits = account.balance;
  }

  // Fetch proposals joined with deals, RFQs, and DMCs
  const { data: proposalsData } = await (adminClient as any)
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
        agent_id,
        rfq:rfqs (
          id,
          rfq_number,
          title,
          start_date,
          end_date,
          duration_days,
          duration_nights
        ),
        dmc:profiles!deals_dmc_id_fkey (
          company_name,
          contact_name
        )
      )
    `)
    .order('created_at', { ascending: false });

  // Fetch all share tokens
  const { data: tokensData } = await (adminClient as any)
    .from('share_tokens')
    .select('proposal_id, deal_id, token, views_count, last_viewed_at');

  const tokenMap = new Map();
  ((tokensData || []) as any[]).forEach((t: any) => {
    if (t.proposal_id) tokenMap.set(t.proposal_id, t);
    if (t.deal_id) tokenMap.set(t.deal_id, t);
  });

  const proposals: ProposalRecord[] = ((proposalsData || []) as any[])
    .filter((p: any) => {
      // In multi-tenant / live mode, show proposals owned by current agent (or allow if deal is not restricted)
      if (p.deal?.agent_id && targetUserId) {
        return p.deal.agent_id === targetUserId || role === 'admin';
      }
      return true;
    })
    .map((p: any) => ({
      ...p,
      share_token: tokenMap.get(p.id) || tokenMap.get(p.deal_id) || null,
    }));

  return (
    <AppShell role="agent" credits={credits}>
      <ProposalsView proposals={proposals} />
    </AppShell>
  );
}

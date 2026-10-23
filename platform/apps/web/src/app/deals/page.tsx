import React from 'react';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { createClient } from '@/lib/supabase/server';
import { AgentDealsView, DmcDealsView, type DealRecord } from './deals-view';
import type { UserRole } from '@dmcgrid/db';

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
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

  // Fetch agent credits if agent
  let credits = 0;
  if (role === 'agent') {
    const { data: account } = await (supabase as any)
      .from('credit_accounts')
      .select('balance')
      .eq('profile_id', targetUserId)
      .eq('account_type', 'agent_wallet')
      .maybeSingle();

    if (account && typeof account.balance === 'number') {
      credits = account.balance;
    }
  }

  // Fetch deals with PostgREST disambiguated FK embeds
  let query = (supabase as any)
    .from('deals')
    .select(`
      id,
      rfq_id,
      connection_id,
      agent_id,
      dmc_id,
      selected_quote_option_id,
      net_cost,
      markup_percentage,
      markup_fixed,
      ancillary_cost,
      ancillary_charge,
      gross_margin,
      gst_percentage,
      gst_amount,
      tcs_percentage,
      tcs_amount,
      customer_selling_price,
      tds_paid,
      tds_payable,
      cash_profit,
      status,
      manager_approval_status,
      created_at,
      rfq:rfqs (
        id,
        rfq_number,
        title,
        start_date,
        end_date,
        duration_days,
        duration_nights,
        travelers_adults,
        travelers_children
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
        phone,
        operating_destinations
      ),
      quote_option:quote_options (
        id,
        option_name,
        net_cost,
        quotes (
          id,
          quote_number
        )
      ),
      proposals (
        id,
        title,
        customer_name,
        status,
        total_price
      )
    `)
    .order('created_at', { ascending: false });

  if (role === 'dmc') {
    query = query.eq('dmc_id', targetUserId);
  } else {
    query = query.eq('agent_id', targetUserId);
  }

  const { data: dealsData } = await query;
  const deals: DealRecord[] = (dealsData || []) as DealRecord[];

  return (
    <AppShell role={role} credits={credits}>
      {role === 'dmc' ? (
        <DmcDealsView deals={deals} />
      ) : (
        <AgentDealsView deals={deals} />
      )}
    </AppShell>
  );
}

import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { createClient } from '@/lib/supabase/server';
import { DealDetailClient } from './deal-detail-client';
import type { UserRole } from '@dmcgrid/db';

export const dynamic = 'force-dynamic';

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = await params;
  const dealId = unwrappedParams.id;

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

  // Fetch deal with all disambiguated relations
  const { data: dealData, error } = await (supabase as any)
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
      manager_approved_at,
      created_at,
      updated_at,
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
      approver:profiles!deals_manager_approved_by_fkey (
        id,
        company_name,
        contact_name
      ),
      quote_option:quote_options (
        id,
        option_name,
        description,
        net_cost,
        day_count,
        quotes (
          id,
          quote_number,
          valid_until
        )
      ),
      proposals (
        id,
        version,
        title,
        customer_name,
        customer_email,
        total_price,
        currency,
        status,
        terms,
        itinerary_json,
        created_at
      )
    `)
    .eq('id', dealId)
    .maybeSingle();

  if (error || !dealData) {
    notFound();
  }

  // Ownership check: agent_id or dmc side depending on role (or admin)
  const isOwner =
    dealData.agent_id === user.id ||
    dealData.dmc_id === user.id ||
    role === 'admin';

  if (!isOwner) {
    notFound();
  }

  // Fetch share token if available
  const { data: tokenData } = await (supabase as any)
    .from('share_tokens')
    .select('token, views_count, last_viewed_at, expires_at')
    .or(`deal_id.eq.${dealId},proposal_id.eq.${dealData.proposals?.[0]?.id || '00000000-0000-0000-0000-000000000000'}`)
    .maybeSingle();

  const dealWithToken = {
    ...dealData,
    share_token: tokenData || null,
  };

  return (
    <AppShell role={role} credits={credits}>
      <DealDetailClient deal={dealWithToken} currentUserRole={role} />
    </AppShell>
  );
}

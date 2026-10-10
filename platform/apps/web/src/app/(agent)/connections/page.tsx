import React from 'react';
import { StatCard, Badge } from '@dmcgrid/ui';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { ConnectionsView } from './connections-view';
import { Users, ShieldCheck, Globe, Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const currentUserId = user?.id || 'a1111111-1111-1111-1111-111111111111';
  const adminClient = createAdminClient();

  // 1. Fetch unlocked connections with disambiguated profile FK embed: profiles!connections_dmc_id_fkey
  const { data: connectionsData } = await (adminClient as any)
    .from('connections')
    .select(`
      id,
      unlocked_at,
      credit_amount_deducted,
      dmc_id,
      rfq:rfqs (
        id,
        rfq_number,
        title
      ),
      quote:quotes (
        id,
        quote_number,
        total_net_cost
      ),
      dmc:profiles!connections_dmc_id_fkey (
        id,
        company_name,
        contact_name,
        email,
        phone,
        bio,
        operating_destinations,
        kyc_status
      )
    `)
    .eq('agent_id', currentUserId)
    .order('unlocked_at', { ascending: false });

  const connections = ((connectionsData || []) as any[]).map((c: any) => ({
    id: c.id,
    unlocked_at: c.unlocked_at,
    credit_amount_deducted: c.credit_amount_deducted,
    rfq: c.rfq,
    quote: c.quote,
    dmc: c.dmc,
  }));

  const unlockedDmcIds = new Set(connections.map((c: any) => c.dmc?.id).filter(Boolean));

  // 2. Fetch all verified DMCs in network
  const { data: allDmcs } = await (adminClient as any)
    .from('profiles')
    .select('id, company_name, operating_destinations, bio, kyc_status')
    .eq('role', 'dmc')
    .eq('is_active', true);

  const availableDmcs = ((allDmcs || []) as any[]).filter((d: any) => !unlockedDmcIds.has(d.id));

  // 3. Fetch agent credits
  let credits = 20;
  const { data: account } = await (adminClient as any)
    .from('credit_accounts')
    .select('balance')
    .eq('profile_id', currentUserId)
    .eq('account_type', 'agent_wallet')
    .maybeSingle();

  if (account && typeof account.balance === 'number') {
    credits = account.balance;
  }

  // Count destinations covered across unlocked partners
  const destinationSet = new Set<string>();
  connections.forEach((c: any) => {
    (c.dmc?.operating_destinations || []).forEach((dest: string) => destinationSet.add(dest));
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase font-bold">
              SUPPLY DIRECTORY
            </span>
            <Badge variant="verified">
              <ShieldCheck className="w-3 h-3" />
              <span>LICENSED OPERATORS</span>
            </Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            DMC Partnerships & Channels
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Access verified contact information, direct WhatsApp phone numbers, and destination management licenses.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Unlocked DMC Channels"
          value={connections.length}
          subtext="Direct off-grid communication open"
          icon={<Building2 className="w-4 h-4 text-[#0EA5A3]" />}
        />
        <StatCard
          label="Destinations Covered"
          value={destinationSet.size}
          subtext="Active regional licenses"
          icon={<Globe className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Available Credits"
          value={`${credits} CR`}
          subtext="Ready for new partner unlocks (5 CR)"
          icon={<Users className="w-4 h-4 text-[#10B981]" />}
        />
      </div>

      {/* Main View */}
      <ConnectionsView
        connections={connections}
        availableDmcs={availableDmcs}
        userCredits={credits}
      />
    </div>
  );
}

import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RfqsClient, type RfqWithDetails } from './rfqs-client';
import { Badge } from '@dmcgrid/ui';

export const dynamic = 'force-dynamic';

export default async function AdminRfqsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal-access-7k2m9');
  }

  const { data: rfqs, error } = await supabase
    .from('rfqs')
    .select(`
      *,
      profiles!rfqs_agent_id_fkey (
        id,
        role,
        company_name,
        contact_name,
        email,
        phone
      ),
      rfq_destinations (*),
      rfq_stays (*),
      rfq_experiences (*),
      quotes (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching RFQs oversight:', error);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase">
              DEMAND SOURCING OVERSIGHT
            </span>
            <Badge variant="gold">PRD WAVE 1 & 2 MONITORING</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            RFQ Briefs Oversight
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Supervise all active briefs, matched destination quotes, and pacing breakdowns. Ops force-closing notifies the agent and writes to the audit log.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="verified" className="py-1 px-3">
            ● SLA RESPONSE TRACKER LIVE
          </Badge>
        </div>
      </div>

      <RfqsClient rfqs={(rfqs || []) as unknown as RfqWithDetails[]} />
    </div>
  );
}

import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { VerificationClient, type KycRecordWithProfile } from './verification-client';
import { Badge } from '@dmcgrid/ui';

export const dynamic = 'force-dynamic';

export default async function AdminVerificationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal-access-7k2m9');
  }

  const { data: rawRecords, error } = await supabase
    .from('kyc_records')
    .select(`
      *,
      profiles!kyc_records_profile_id_fkey (
        id,
        role,
        company_name,
        contact_name,
        email,
        phone,
        avatar_url,
        kyc_status,
        bio,
        operating_destinations,
        is_active,
        created_at,
        updated_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching KYC queue:', error);
  }

  // Sort with 'pending' first, then 'draft', then 'verified', then 'rejected'
  const statusPriority: Record<string, number> = {
    pending: 1,
    draft: 2,
    rejected: 3,
    verified: 4,
  };

  const records = ((rawRecords || []) as unknown as KycRecordWithProfile[]).sort((a, b) => {
    const pA = statusPriority[a.status] || 99;
    const pB = statusPriority[b.status] || 99;
    if (pA !== pB) return pA - pB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase">
              COMPLIANCE AUDIT QUEUE
            </span>
            <Badge variant="gold">PRD RULE R5 GATE</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            KYC Verification Governance
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Mandatory business verification before first brief publication or quote submission. All reviewer actions are immutably logged.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="verified" className="py-1 px-3">
            ● REALTIME R2 AUDIT ACTIVE
          </Badge>
        </div>
      </div>

      {/* Verification Client Queue */}
      <VerificationClient records={records} />
    </div>
  );
}

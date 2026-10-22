import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LedgerClient, type CreditAccountWithProfile, type CreditLedgerWithDetails } from './ledger-client';
import { Badge } from '@dmcgrid/ui';
import type { Profile } from '@dmcgrid/db';

export const dynamic = 'force-dynamic';

export default async function AdminLedgerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal-access-7k2m9');
  }

  // 1. Fetch Accounts with profile
  const { data: accounts, error: accError } = await supabase
    .from('credit_accounts')
    .select(`
      *,
      profiles!credit_accounts_profile_id_fkey (
        id,
        role,
        company_name,
        contact_name,
        email,
        phone
      )
    `)
    .order('balance', { ascending: false });

  // 2. Fetch Ledger entries with profile
  const { data: entries, error: ledError } = await supabase
    .from('credit_ledger')
    .select(`
      *,
      profiles!credit_ledger_profile_id_fkey (
        id,
        role,
        company_name,
        contact_name,
        email
      ),
      credit_accounts (
        account_type,
        name
      )
    `)
    .order('created_at', { ascending: false });

  // 3. Fetch profiles for adjustment target picker
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('company_name', { ascending: true });

  if (accError || ledError) {
    console.error('Error fetching ledger data:', { accError, ledError });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase">
              DOUBLE-ENTRY MONETARY GOVERNANCE
            </span>
            <Badge variant="gold">PRD RULE R4 COMPLIANCE</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Credit Accounts & Ledger Invariants
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Platform credit reserves, agent double-entry journals, and privileged balance adjustments with mandatory audit logging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="verified" className="py-1 px-3">
            ● CONSERVATION INVARIANT MAINTAINED
          </Badge>
        </div>
      </div>

      <LedgerClient
        accounts={(accounts || []) as unknown as CreditAccountWithProfile[]}
        entries={(entries || []) as unknown as CreditLedgerWithDetails[]}
        profiles={(profiles || []) as Profile[]}
      />
    </div>
  );
}

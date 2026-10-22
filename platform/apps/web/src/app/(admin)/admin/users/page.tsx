import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UsersClient } from './users-client';
import { Badge } from '@dmcgrid/ui';
import type { Profile } from '@dmcgrid/db';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal-access-7k2m9');
  }

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles directory:', error);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase">
              PLATFORM NETWORK DIRECTORY
            </span>
            <Badge variant="gold">ACCESS CONTROL</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Users & Organization Directory
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Search and inspect verified agents, destination DMCs, and administrators. Manage platform access with immutable audit logging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="verified" className="py-1 px-3">
            ● GOVERNANCE ACTIVE
          </Badge>
        </div>
      </div>

      <UsersClient users={(users || []) as Profile[]} />
    </div>
  );
}

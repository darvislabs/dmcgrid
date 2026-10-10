import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import { PlansClient } from './plans-client';
import { Badge } from '@dmcgrid/ui';
import type { Plan } from '@dmcgrid/db';

export const dynamic = 'force-dynamic';

export default async function AdminPlansPage() {
  const supabase = createAdminClient();

  const { data: plans, error } = await supabase
    .from('plans')
    .select('*')
    .order('price_inr', { ascending: true });

  if (error) {
    console.error('Error fetching platform plans:', error);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase">
              SUBSCRIPTION COMMERCE ENGINE
            </span>
            <Badge variant="gold">CREDIT PRICING TIERS</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Subscription Plans Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Maintain platform lead generation packages, connection credits allocation, and feature inclusions with automatic audit trail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="verified" className="py-1 px-3">
            ● COMMERCE API SYNCED
          </Badge>
        </div>
      </div>

      <PlansClient plans={(plans || []) as Plan[]} />
    </div>
  );
}

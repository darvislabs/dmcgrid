import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { createClient } from '@/lib/supabase/server';

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal-access-7k2m9');
  }

  // Session-derived role: admins may inspect the agent portal in oversight mode.
  let role = 'agent';
  let credits = 0;

  try {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.role) role = profile.role;
  } catch {
    // keep default role
  }

  try {
    const { data: account } = await (supabase as any)
      .from('credit_accounts')
      .select('balance')
      .eq('profile_id', user.id)
      .eq('account_type', 'agent_wallet')
      .maybeSingle();

    if (account && typeof account.balance === 'number') {
      credits = account.balance;
    }
  } catch {
    // fallback default balance
  }

  return (
    <div className="relative">
      {role === 'admin' && (
        <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-[#0B0F14] text-white text-xs font-mono">
          <span>
            ADMIN OVERSIGHT — viewing the Agent portal as <b>{user.email}</b>
          </span>
          <Link
            href="/admin"
            className="px-3 py-1 rounded-full bg-[#D4B483] text-[#0B0F14] font-semibold hover:opacity-90 transition-opacity"
          >
            ← Back to Admin
          </Link>
        </div>
      )}
      <AppShell role="agent" credits={credits}>
        {children}
      </AppShell>
    </div>
  );
}

import React from 'react';
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

  let credits = 0;

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
    <AppShell role="agent" credits={credits}>
      {children}
    </AppShell>
  );
}

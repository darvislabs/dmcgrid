import React from 'react';
import { AppShell } from '@/components/app-shell';
import { createClient } from '@/lib/supabase/server';

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let credits = 45;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const targetUserId = user?.id || 'a1111111-1111-1111-1111-111111111111';

    const { data: account } = await (supabase as any)
      .from('credit_accounts')
      .select('balance')
      .eq('profile_id', targetUserId)
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

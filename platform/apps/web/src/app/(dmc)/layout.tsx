import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { createClient } from '@/lib/supabase/server';

export default async function DmcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role = 'dmc';
  try {
    if (user) {
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (profile?.role) role = profile.role;
    }
  } catch {
    // keep default role
  }

  return (
    <div className="relative">
      {role === 'admin' && user && (
        <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-[#0B0F14] text-white text-xs font-mono">
          <span>
            ADMIN OVERSIGHT — viewing the DMC portal as <b>{user.email}</b>
          </span>
          <Link
            href="/admin"
            className="px-3 py-1 rounded-full bg-[#D4B483] text-[#0B0F14] font-semibold hover:opacity-90 transition-opacity"
          >
            ← Back to Admin
          </Link>
        </div>
      )}
      <AppShell role="dmc">
        {children}
      </AppShell>
    </div>
  );
}

import React from 'react';
import { AppShell } from '@/components/app-shell';

export default function DmcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell role="dmc">
      {children}
    </AppShell>
  );
}

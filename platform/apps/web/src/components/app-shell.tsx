'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { BrandSymbols, DmcMark } from './brand-symbols';
import { Menu, X } from 'lucide-react';
import type { UserRole } from '@dmcgrid/db';

export interface AppShellProps {
  children: React.ReactNode;
  role?: UserRole;
  credits?: number;
}

export function AppShell({ children, role = 'agent', credits = 20 }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-page)] text-[var(--text-primary)]">
      <BrandSymbols />

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar role={role} credits={credits} />
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border-line)] bg-[var(--bg-sidebar)] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <DmcMark className="w-5 h-6 text-[var(--text-primary)]" />
          <span className="font-display font-bold text-base tracking-tight text-[var(--text-primary)]">
            DMC<span className="text-[#D4B483] font-normal">Grid</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-[6px] border border-[var(--border-line)] text-[var(--text-primary)] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[260px] bg-[var(--bg-sidebar)] h-full z-10 shadow-2xl">
            <Sidebar role={role} credits={credits} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="md:ml-[216px] min-h-[100dvh] p-6 lg:p-8 max-w-[1400px]">
        {children}
      </main>
    </div>
  );
}

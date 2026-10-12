'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DmcMark } from './brand-symbols';
import { ThemeToggle } from './theme-toggle';
import { Badge } from '@dmcgrid/ui';
import type { UserRole } from '@dmcgrid/db';
import {
  Compass,
  FilePlus,
  Files,
  Wallet,
  Settings,
  ShieldCheck,
  Building2,
  Inbox,
  Send,
  Coins,
  LogOut,
  Users,
  Briefcase,
  FileText,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar({
  role = 'agent',
  credits = 20,
}: {
  role: UserRole;
  credits?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Navigation configuration per role
  const sections: NavSection[] = React.useMemo(() => {
    if (role === 'admin') {
      return [
        {
          title: 'GOVERNANCE',
          items: [
            { id: '01', label: 'Analytics & Ops', href: '/admin/analytics', icon: <Compass className="w-3.5 h-3.5" /> },
            { id: '02', label: 'KYC Verification', href: '/admin/verification', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: '03', label: 'User Directory', href: '/admin/users', icon: <Users className="w-3.5 h-3.5" /> },
          ],
        },
        {
          title: 'OPERATIONS',
          items: [
            { id: '04', label: 'RFQ Oversight', href: '/admin/rfqs', icon: <Files className="w-3.5 h-3.5" /> },
            { id: '05', label: 'Credit Ledger', href: '/admin/ledger', icon: <Coins className="w-3.5 h-3.5" /> },
            { id: '06', label: 'Plans & Pricing', href: '/admin/plans', icon: <Wallet className="w-3.5 h-3.5" /> },
          ],
        },
      ];
    }

    if (role === 'dmc') {
      return [
        {
          title: 'SUPPLY NETWORK',
          items: [
            { id: '01', label: 'Briefs Feed', href: '/feed', icon: <Inbox className="w-3.5 h-3.5" /> },
            { id: '02', label: 'Quotes Submitted', href: '/quotes', icon: <Send className="w-3.5 h-3.5" /> },
            { id: '03', label: 'Connected Deals', href: '/deals', icon: <Briefcase className="w-3.5 h-3.5" /> },
          ],
        },
        {
          title: 'ORGANIZATION',
          items: [
            { id: '04', label: 'KYC Compliance', href: '/feed#kyc', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: '05', label: 'Destinations', href: '/feed#coverage', icon: <Building2 className="w-3.5 h-3.5" /> },
          ],
        },
      ];
    }

    // Default: Agent
    return [
      {
        title: 'SOURCING',
        items: [
          { id: '01', label: 'Dashboard', href: '/', icon: <Compass className="w-3.5 h-3.5" /> },
          { id: '02', label: 'New RFQ Wizard', href: '/rfq/new', icon: <FilePlus className="w-3.5 h-3.5" /> },
          { id: '03', label: 'My RFQs', href: '/rfq', icon: <Files className="w-3.5 h-3.5" /> },
        ],
      },
      {
        title: 'COMMERCE',
        items: [
          { id: '04', label: 'Deals & Pipeline', href: '/deals', icon: <Briefcase className="w-3.5 h-3.5" /> },
          { id: '05', label: 'Proposals', href: '/proposals', icon: <FileText className="w-3.5 h-3.5" /> },
          { id: '06', label: 'DMC Connections', href: '/connections', icon: <Users className="w-3.5 h-3.5" /> },
          { id: '07', label: 'Wallet & Credits', href: '/wallet', icon: <Wallet className="w-3.5 h-3.5" /> },
        ],
      },
      {
        title: 'ACCOUNT',
        items: [
          { id: '08', label: 'Agency Profile', href: '/#settings', icon: <Settings className="w-3.5 h-3.5" /> },
          { id: '09', label: 'KYC Status', href: '/#kyc', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
        ],
      },
    ];
  }, [role]);

  const switchRole = (newRole: UserRole) => {
    document.cookie = `dmc_role=${newRole}; path=/; max-age=86400`;
    if (newRole === 'admin') router.push('/admin');
    else if (newRole === 'dmc') router.push('/feed');
    else router.push('/');
  };

  const handleSignOut = async () => {
    // 1. kill the supabase session server-side AND clear the browser cookies
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // even if the network call fails, clear local state below
    }
    // 2. role cookie
    document.cookie = 'dmc_role=; path=/; max-age=0';
    // 3. nuke any residual sb- session cookies (belt & braces for stale chunks)
    document.cookie.split(';').forEach((c) => {
      const name = (c.split('=')[0] ?? '').trim();
      if (name.startsWith('sb-')) {
        document.cookie = `${name}=; path=/; max-age=0`;
        document.cookie = `${name}=; path=/; domain=.dmcgrid.gomedicure.com; max-age=0`;
      }
    });
    // 4. land on the hidden access gate, replacing history so back-button doesn't resurrect
    window.location.replace('/portal-access-7k2m9');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-[216px] bg-[var(--bg-sidebar)] border-r border-[var(--border-line)] z-30 flex flex-col select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <DmcMark className="w-5 h-6 text-[var(--text-primary)] shrink-0" />
          <div className="flex flex-col">
            <span className="font-display font-bold text-base leading-none tracking-tight text-[var(--text-primary)]">
              DMC<span className="text-[#D4B483] font-normal">Grid</span>
            </span>
            <span className="font-mono text-[9px] tracking-widest text-[var(--text-secondary)] uppercase mt-1">
              {role.toUpperCase()} PORTAL
            </span>
          </div>
        </div>

        {/* Live Wallet Chip (Agents) or Verified Badge (DMC/Admin) */}
        <div className="mt-3 flex items-center justify-between">
          {role === 'agent' ? (
            <Badge variant="gold" className="w-full justify-between py-1 px-2.5">
              <span>BALANCE</span>
              <span className="font-bold">{credits} CR</span>
            </Badge>
          ) : role === 'dmc' ? (
            <Badge variant="verified" className="w-full justify-center py-1">
              ✓ VERIFIED DMC
            </Badge>
          ) : (
            <Badge variant="gold" className="w-full justify-center py-1">
              PLATFORM ADMIN
            </Badge>
          )}
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            <div className="px-4 py-1.5 font-mono text-[9px] tracking-widest uppercase text-[var(--text-muted)]">
              {section.title}
            </div>
            <nav className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs transition-colors duration-160 ease-out min-h-[36px] ${
                      isActive
                        ? 'border-l-2 border-[#D4B483] bg-[#D4B483]/10 text-[var(--text-primary)] font-medium'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    <span className="font-mono text-[9px] text-[var(--text-muted)] w-4 shrink-0">
                      {item.id}
                    </span>
                    <span className="shrink-0 text-[var(--text-muted)]">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Dev / Demo Role Switcher */}
        <div className="mx-3 mt-2 p-2.5 rounded-[9px] border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <div className="font-mono text-[9px] tracking-wider uppercase text-[var(--text-muted)] mb-1.5">
            Portal Switcher
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => switchRole('agent')}
              className={`py-1 text-[10px] font-mono rounded ${
                role === 'agent' ? 'bg-[#D4B483] text-[#0B0F14] font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              AGT
            </button>
            <button
              onClick={() => switchRole('dmc')}
              className={`py-1 text-[10px] font-mono rounded ${
                role === 'dmc' ? 'bg-[#D4B483] text-[#0B0F14] font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              DMC
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`py-1 text-[10px] font-mono rounded ${
                role === 'admin' ? 'bg-[#D4B483] text-[#0B0F14] font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              ADM
            </button>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
        <ThemeToggle />
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[#EF4444] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
        <div className="text-center font-mono text-[9px] text-[var(--text-muted)] pt-1">
          DMCGrid v1.0 · Oct 2026
        </div>
      </div>
    </aside>
  );
}

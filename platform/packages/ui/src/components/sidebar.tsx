'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { LogOut, Menu, X } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  active?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface SidebarProps {
  portalTitle: string;
  roleBadge: string;
  userEmail?: string;
  creditBalance?: number;
  groups: NavGroup[];
  currentPath?: string;
  onSignOut?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  portalTitle,
  roleBadge,
  userEmail,
  creditBalance,
  groups,
  currentPath,
  onSignOut,
  className,
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--bg)] border-r border-[var(--border)] text-[var(--text)] select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <a href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Logo size="sm" showWordmark={true} />
        </a>
        <div className="flex items-center justify-between mt-2.5">
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#D4B483] font-semibold">
            {portalTitle}
          </span>
          <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-muted)] uppercase">
            {roleBadge}
          </span>
        </div>
      </div>

      {/* Credit Wallet Pill (if credit balance provided) */}
      {creditBalance !== undefined && (
        <div className="px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] text-[11px] font-medium">Credits</span>
            <span className="font-mono font-bold text-[#D4B483] tabular-nums">
              {creditBalance} <span className="text-[10px] text-[var(--text-muted)] font-normal">avail</span>
            </span>
          </div>
        </div>
      )}

      {/* Grouped Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-5 py-1 text-[9px] font-mono tracking-widest uppercase text-[var(--text-subtle)] font-semibold">
              {group.label}
            </div>
            {group.items.map((item, iIdx) => {
              const isActive = item.active || (currentPath ? currentPath === item.href : false);
              return (
                <a
                  key={iIdx}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-5 py-2 text-xs font-sans transition-all duration-[160ms] ease-out min-h-[38px]',
                    isActive
                      ? 'border-l-2 border-[#D4B483] bg-[#D4B483]/10 text-[var(--text)] font-semibold'
                      : 'border-l-2 border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.icon && (
                      <span className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#D4B483]' : 'text-[var(--text-subtle)]')}>
                        {item.icon}
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-subtle)] border border-[var(--border)] text-[#D4B483]">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User / Theme / Logout Footer */}
      <div className="p-3 border-t border-[var(--border)] space-y-2 bg-[var(--surface-subtle)]/30">
        <div className="flex items-center justify-between px-2">
          <div className="min-w-0 flex-1 mr-2">
            <div className="text-[11px] font-medium text-[var(--text)] truncate">
              {userEmail || 'operator@dmcgrid.com'}
            </div>
          </div>
          <ThemeToggle />
        </div>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-[6px] transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: 216px fixed */}
      <aside className={cn('hidden lg:block fixed inset-y-0 left-0 w-[216px] z-30', className)}>
        {sidebarContent}
      </aside>

      {/* Mobile Topbar */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--border)] z-40 px-4 flex items-center justify-between">
        <Logo size="sm" showWordmark={true} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-[9px] border border-[var(--border)] text-[var(--text)] hover:border-[#D4B483] min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[260px] max-w-[85vw] h-full shadow-2xl z-10">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] z-20"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

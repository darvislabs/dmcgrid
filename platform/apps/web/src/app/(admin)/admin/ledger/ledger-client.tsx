'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, Button, Badge, StatCard } from '@dmcgrid/ui';
import { adjustCreditsAction } from '../actions';
import type { CreditAccount, CreditLedgerEntry, Profile, LedgerEntryType } from '@dmcgrid/db';
import {
  Coins,
  Wallet,
  Search,
  PlusCircle,
  MinusCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Scale
} from 'lucide-react';

export interface CreditAccountWithProfile extends CreditAccount {
  profiles: Profile | null;
}

export interface CreditLedgerWithDetails extends CreditLedgerEntry {
  profiles: Profile | null;
  credit_accounts?: CreditAccount | null;
}

interface LedgerClientProps {
  accounts: CreditAccountWithProfile[];
  entries: CreditLedgerWithDetails[];
  profiles: Profile[];
}

export function LedgerClient({ accounts: initialAccounts, entries: initialEntries, profiles }: LedgerClientProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [entries, setEntries] = useState(initialEntries);

  // Filters for ledger entries
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Adjustment Modal State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [targetProfileId, setTargetProfileId] = useState<string>('');
  const [adjustType, setAdjustType] = useState<LedgerEntryType>('credit');
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setAccounts(initialAccounts);
    setEntries(initialEntries);
  }, [initialAccounts, initialEntries]);

  // Derived metrics
  const totalAgentCredits = accounts
    .filter((a) => a.account_type === 'agent_wallet')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const platformRevenue = accounts.find((a) => a.account_type === 'platform_revenue')?.balance || 0;
  const systemReserve = accounts.find((a) => a.account_type === 'system_reserve')?.balance || 0;

  // Filtered Ledger entries
  const filteredEntries = entries.filter((e) => {
    if (typeFilter !== 'all' && e.entry_type !== typeFilter) return false;
    if (userFilter !== 'all' && e.profile_id !== userFilter) return false;

    if (dateFilter !== 'all') {
      const entryTime = new Date(e.created_at).getTime();
      const now = Date.now();
      const daysDiff = (now - entryTime) / (1000 * 3600 * 24);
      if (dateFilter === 'today' && daysDiff > 1) return false;
      if (dateFilter === '7d' && daysDiff > 7) return false;
      if (dateFilter === '30d' && daysDiff > 30) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const company = e.profiles?.company_name?.toLowerCase() || '';
    const desc = e.description?.toLowerCase() || '';
    const ref = e.reference_type?.toLowerCase() || '';
    return company.includes(q) || desc.includes(q) || ref.includes(q);
  });

  // Calculate Daily Totals for visible filtered entries
  const totalDebits = filteredEntries
    .filter((e) => e.entry_type === 'debit')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCredits = filteredEntries
    .filter((e) => e.entry_type === 'credit')
    .reduce((sum, e) => sum + e.amount, 0);

  const netJournalMovement = totalCredits - totalDebits;

  const handleAdjustSubmit = () => {
    if (!targetProfileId) {
      setActionError('Please select a target user profile.');
      return;
    }
    if (adjustAmount <= 0) {
      setActionError('Adjustment amount must be greater than zero.');
      return;
    }
    if (!adjustReason.trim()) {
      setActionError('A mandatory explanation is required for this adjustment.');
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await adjustCreditsAction({
        profileId: targetProfileId,
        entryType: adjustType,
        amount: adjustAmount,
        reason: adjustReason.trim(),
      });

      if (!res.success) {
        setActionError(res.error || 'Failed to execute credit adjustment.');
      } else {
        setActionSuccess(`Adjustment recorded! Balance updated and written to immutable audit log.`);
        setTimeout(() => {
          setIsAdjustOpen(false);
          setAdjustReason('');
          setActionSuccess(null);
        }, 1200);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Agent Wallets Outstanding"
          value={`${totalAgentCredits} CR`}
          icon={<Wallet className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Platform Revenue Pool"
          value={platformRevenue}
          isCurrency={true}
          icon={<Coins className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="System Reserve Pool"
          value={`${systemReserve} CR`}
          icon={<Scale className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Journal Records Logged"
          value={entries.length}
          icon={<Clock className="w-4 h-4 text-[#D4B483]" />}
        />
      </div>

      {/* Section 1: Balances Table & Quick Adjustment */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Credit Accounts & Reserves
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Realtime double-entry balances across agent wallets, DMC escrow, and platform pools.
            </p>
          </div>
          <button
            onClick={() => {
              setIsAdjustOpen(true);
              setTargetProfileId(profiles[0]?.id || '');
              setActionError(null);
              setActionSuccess(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D4B483] text-[#0B0F14] rounded-[9px] text-xs font-semibold hover:bg-[#c3a16f] transition-all min-h-[44px] cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            <span>New Credit Adjustment</span>
          </button>
        </div>

        <Card className="bg-[var(--bg-card)] border-[var(--border-line)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-line)] bg-[var(--bg-page)]/50 text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4">Owner Profile</th>
                  <th className="py-3 px-4">Current Balance</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                      {acc.name}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="gold" className="font-mono text-[9px] uppercase py-0.5 px-2">
                        {acc.account_type.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {acc.profiles ? (
                        <div>
                          <div className="text-[var(--text-primary)] font-medium">
                            {acc.profiles.company_name}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] font-mono">
                            {acc.profiles.contact_name}
                          </div>
                        </div>
                      ) : (
                        <span className="font-mono text-[10px] text-[var(--text-muted)]">SYSTEM POOL</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-sm text-[var(--text-primary)] tabular-nums">
                        {acc.account_type === 'platform_revenue' ? `₹${acc.balance}` : `${acc.balance} CR`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)]">
                      {new Date(acc.updated_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {acc.profiles ? (
                        <button
                          onClick={() => {
                            setIsAdjustOpen(true);
                            setTargetProfileId(acc.profiles!.id);
                            setActionError(null);
                            setActionSuccess(null);
                          }}
                          className="px-2.5 py-1.5 text-xs font-mono rounded-[6px] border border-[var(--border-line)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#D4B483] min-h-[38px] transition-colors cursor-pointer"
                        >
                          Adjust Balance
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Section 2: Credit Ledger Journal Entries */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Double-Entry Credit Ledger Journal
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Immutable journal records conforming to PRD Rule R4. Filter by movement type, date, or user.
            </p>
          </div>
        </div>

        {/* Ledger Filter Bar */}
        <Card className="bg-[var(--bg-card)] border-[var(--border-line)]">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search descriptions, references..."
                className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] pl-9 pr-4 py-2 min-h-[44px] focus:outline-none focus:border-[#D4B483] transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] px-3 py-2 min-h-[44px] font-mono focus:outline-none focus:border-[#D4B483] cursor-pointer"
              >
                <option value="all">Type: All Entries</option>
                <option value="credit">Type: Credits (+)</option>
                <option value="debit">Type: Debits (-)</option>
              </select>

              {/* User Filter */}
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] px-3 py-2 min-h-[44px] font-mono focus:outline-none focus:border-[#D4B483] cursor-pointer max-w-[200px]"
              >
                <option value="all">User: All Accounts</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company_name}
                  </option>
                ))}
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] px-3 py-2 min-h-[44px] font-mono focus:outline-none focus:border-[#D4B483] cursor-pointer"
              >
                <option value="all">Date: All Time</option>
                <option value="today">Date: Today</option>
                <option value="7d">Date: Last 7 Days</option>
                <option value="30d">Date: Last 30 Days</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Ledger Entries Table */}
        <Card className="bg-[var(--bg-card)] border-[var(--border-line)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-line)] bg-[var(--bg-page)]/50 text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Account / Entity</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Audit Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--text-muted)]">
                      No credit ledger entries match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((e) => {
                    const isCredit = e.entry_type === 'credit';
                    return (
                      <tr key={e.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)]">
                          {new Date(e.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}{' '}
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {new Date(e.created_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[var(--text-primary)]">
                            {e.profiles?.company_name || 'System Account'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {isCredit ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                              <ArrowDownLeft className="w-3 h-3" />
                              CREDIT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded">
                              <ArrowUpRight className="w-3 h-3" />
                              DEBIT
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-mono font-bold tabular-nums text-xs ${
                              isCredit ? 'text-[#10B981]' : 'text-[#EF4444]'
                            }`}
                          >
                            {isCredit ? `+${e.amount} CR` : `-${e.amount} CR`}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-primary)] tabular-nums">
                          {e.balance_after} CR
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="gold" className="font-mono text-[9px] uppercase py-0.5 px-1.5">
                            {e.reference_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)] max-w-xs truncate">
                          {e.description}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Daily Totals Row (PRD Requirement 4) */}
              {filteredEntries.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-[var(--border-line)] bg-[var(--bg-page)] font-mono text-xs font-semibold">
                    <td colSpan={3} className="py-3.5 px-4 text-[var(--text-primary)] uppercase tracking-wider">
                      Visible Period Totals Row ({filteredEntries.length} Entries)
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <div className="space-y-0.5">
                        <div className="text-[#10B981]">Total Credits: +{totalCredits} CR</div>
                        <div className="text-[#EF4444]">Total Debits: -{totalDebits} CR</div>
                      </div>
                    </td>
                    <td colSpan={3} className="py-3.5 px-4 text-right">
                      <span className="text-[var(--text-muted)] mr-2">Net Period Movement:</span>
                      <span
                        className={`font-bold tabular-nums text-sm ${
                          netJournalMovement >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                        }`}
                      >
                        {netJournalMovement >= 0 ? `+${netJournalMovement} CR` : `${netJournalMovement} CR`}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
      </div>

      {/* Debit / Credit Adjustment Modal */}
      {isAdjustOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-line)] rounded-[14px] shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[var(--border-line)]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4B483]">
                  ADMIN PRIVILEGED ACTION
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  Wallet Credit / Debit Adjustment
                </h3>
              </div>
              <button
                onClick={() => setIsAdjustOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer rounded-[6px]"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-[9px] text-[#EF4444] text-xs">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-[9px] text-[#10B981] text-xs">
                {actionSuccess}
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Select Target Profile */}
              <div className="space-y-1.5">
                <label className="block font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Target User / Agency <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={targetProfileId}
                  onChange={(e) => setTargetProfileId(e.target.value)}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] p-2.5 min-h-[44px] font-mono focus:outline-none focus:border-[#D4B483] cursor-pointer"
                  disabled={isPending}
                >
                  <option value="">Select profile...</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.company_name} ({p.email}) - {p.role.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Direction: Credit or Debit */}
              <div className="space-y-1.5">
                <label className="block font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Adjustment Direction <span className="text-[#EF4444]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('credit')}
                    className={`py-2 px-3 rounded-[9px] border font-mono text-xs flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer transition-all ${
                      adjustType === 'credit'
                        ? 'border-[#10B981] bg-[#10B981]/15 text-[#10B981] font-bold'
                        : 'border-[var(--border-line)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Credit (+ Add)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('debit')}
                    className={`py-2 px-3 rounded-[9px] border font-mono text-xs flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer transition-all ${
                      adjustType === 'debit'
                        ? 'border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444] font-bold'
                        : 'border-[var(--border-line)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>Debit (- Deduct)</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="block font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Credits Amount <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] font-mono rounded-[9px] p-2.5 min-h-[44px] focus:outline-none focus:border-[#D4B483]"
                  disabled={isPending}
                />
              </div>

              {/* Mandatory Reason */}
              <div className="space-y-1.5">
                <label className="block font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Mandatory Audit Reason <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="State specific ops justification (e.g. 'Bonus credits for pilot feedback', 'Manual correction of failed gateway order')..."
                  rows={3}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] p-2.5 focus:outline-none focus:border-[#D4B483]"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-line)]">
              <Button
                variant="ghost"
                onClick={() => setIsAdjustOpen(false)}
                disabled={isPending}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={handleAdjustSubmit}
                disabled={isPending}
                className="min-h-[44px]"
              >
                {isPending ? 'Logging Double-Entry...' : 'Execute Adjustment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

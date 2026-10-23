'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, Button, Badge, StatCard } from '@dmcgrid/ui';
import { toggleUserActiveAction } from '../actions';
import type { Profile } from '@dmcgrid/db';
import {
  Users,
  Search,
  Building2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface UsersClientProps {
  users: Profile[];
}

export function UsersClient({ users: initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [actionUser, setActionUser] = useState<Profile | null>(null);
  const [toggleReason, setToggleReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Derived counts
  const totalUsers = users.length;
  const agentsCount = users.filter((u) => u.role === 'agent').length;
  const dmcsCount = users.filter((u) => u.role === 'dmc').length;
  const activeCount = users.filter((u) => u.is_active).length;

  // Filtered list
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (kycFilter !== 'all' && u.kyc_status !== kycFilter) return false;
    if (activeFilter === 'active' && !u.is_active) return false;
    if (activeFilter === 'inactive' && u.is_active) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const company = u.company_name?.toLowerCase() || '';
    const contact = u.contact_name?.toLowerCase() || '';
    const email = u.email?.toLowerCase() || '';
    const phone = u.phone?.toLowerCase() || '';
    return company.includes(q) || contact.includes(q) || email.includes(q) || phone.includes(q);
  });

  const handleToggleActive = () => {
    if (!actionUser) return;
    if (!toggleReason.trim()) {
      setActionError('A mandatory reason is required to modify account status.');
      return;
    }

    const nextState = !actionUser.is_active;
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await toggleUserActiveAction({
        userId: actionUser.id,
        isActive: nextState,
        reason: toggleReason.trim(),
      });

      if (!res.success) {
        setActionError(res.error || 'Failed to update user status.');
      } else {
        setActionSuccess(`User account ${nextState ? 'ACTIVATED' : 'DEACTIVATED'} and recorded in audit log.`);
        setUsers((prev) =>
          prev.map((u) => (u.id === actionUser.id ? { ...u, is_active: nextState } : u))
        );
        setTimeout(() => {
          setActionUser(null);
          setToggleReason('');
          setActionSuccess(null);
          if (selectedUser?.id === actionUser.id) {
            setSelectedUser((prev) => (prev ? { ...prev, is_active: nextState } : null));
          }
        }, 1200);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Registered Users"
          value={totalUsers}
          icon={<Users className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Verified Travel Agents"
          value={agentsCount}
          icon={<Building2 className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Destination DMCs"
          value={dmcsCount}
          icon={<ShieldCheck className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Active Accounts"
          value={activeCount}
          icon={<UserCheck className="w-4 h-4 text-[#10B981]" />}
        />
      </div>

      {/* Search and Filters Card */}
      <Card className="bg-[var(--bg-card)] border-[var(--border-line)]">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by company, contact name, email, or phone..."
              className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] pl-9 pr-4 py-2.5 min-h-[44px] focus:outline-none focus:border-[#D4B483] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] px-3 py-2 min-h-[44px] font-mono focus:outline-none focus:border-[#D4B483] cursor-pointer"
            >
              <option value="all">Role: All Roles</option>
              <option value="agent">Role: Agents Only</option>
              <option value="dmc">Role: DMCs Only</option>
              <option value="admin">Role: Admins Only</option>
            </select>

            {/* KYC Filter */}
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] px-3 py-2 min-h-[44px] font-mono focus:outline-none focus:border-[#D4B483] cursor-pointer"
            >
              <option value="all">KYC: All Statuses</option>
              <option value="verified">KYC: Verified</option>
              <option value="pending">KYC: Pending Review</option>
              <option value="rejected">KYC: Rejected</option>
              <option value="draft">KYC: Draft</option>
            </select>

            {/* Active Status */}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] px-3 py-2 min-h-[44px] font-mono focus:outline-none focus:border-[#D4B483] cursor-pointer"
            >
              <option value="all">Account: All</option>
              <option value="active">Account: Active Only</option>
              <option value="inactive">Account: Deactivated</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* User Directory Table */}
      <Card className="bg-[var(--bg-card)] border-[var(--border-line)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-line)] bg-[var(--bg-page)]/50 text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Entity & Company</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">KYC Gate</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-[var(--text-muted)] opacity-50" />
                      <p className="font-display text-sm font-semibold text-[var(--text-primary)]">
                        No users found
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                        No user profiles matched your current search and filter selections.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isVerified = u.kyc_status === 'verified';
                  const isPendingRec = u.kyc_status === 'pending';
                  const isRejected = u.kyc_status === 'rejected';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors group"
                    >
                      {/* Company Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)] flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-[#D4B483]" />
                          </div>
                          <div>
                            <div className="font-medium text-[var(--text-primary)] font-display text-xs">
                              {u.company_name || 'Unnamed Company'}
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)]">
                              Contact: {u.contact_name || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={u.role === 'admin' ? 'gold' : u.role === 'dmc' ? 'verified' : 'gold'}
                          className="font-mono text-[9px] uppercase py-0.5 px-2"
                        >
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-[var(--text-primary)] truncate max-w-[200px]">
                          {u.email}
                        </div>
                        {u.phone && (
                          <div className="font-mono text-[10px] text-[var(--text-muted)]">
                            {u.phone}
                          </div>
                        )}
                      </td>

                      {/* KYC Status */}
                      <td className="py-3 px-4">
                        {isVerified && (
                          <Badge variant="verified" className="uppercase font-mono text-[9px] py-0.5 px-2">
                            ✓ VERIFIED
                          </Badge>
                        )}
                        {isPendingRec && (
                          <Badge variant="gold" className="uppercase font-mono text-[9px] py-0.5 px-2">
                            ● PENDING
                          </Badge>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[9px] font-mono uppercase bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                            ✕ REJECTED
                          </span>
                        )}
                        {u.kyc_status === 'draft' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[9px] font-mono uppercase bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-line)]">
                            DRAFT
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-3 px-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#10B981]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#EF4444]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                            DEACTIVATED
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)]">
                        {new Date(u.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1.5 text-xs font-mono rounded-[6px] border border-[var(--border-line)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#D4B483] min-h-[38px] transition-colors cursor-pointer"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => {
                              setActionUser(u);
                              setToggleReason('');
                              setActionError(null);
                              setActionSuccess(null);
                            }}
                            className={`px-2.5 py-1.5 text-xs font-mono rounded-[6px] border min-h-[38px] transition-colors cursor-pointer ${
                              u.is_active
                                ? 'border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10'
                                : 'border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Profile Detail Slide-Over / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-line)] rounded-[12px] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[var(--border-line)]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4B483]">
                  USER DIRECTORY DETAIL
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  {selectedUser.company_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer rounded-[6px]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)]">
                <span className="text-[var(--text-muted)]">Platform Role</span>
                <Badge variant="gold" className="font-mono uppercase text-[9px]">
                  {selectedUser.role}
                </Badge>
              </div>

              <div className="p-3 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)] space-y-2">
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  Contact Information
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Contact Name:</span>
                  <span className="font-medium text-[var(--text-primary)]">{selectedUser.contact_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Email:</span>
                  <span className="font-mono text-[var(--text-primary)]">{selectedUser.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Phone:</span>
                  <span className="font-mono text-[var(--text-primary)]">{selectedUser.phone || '—'}</span>
                </div>
              </div>

              {selectedUser.bio && (
                <div className="p-3 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)] space-y-1">
                  <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                    Agency Bio
                  </div>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{selectedUser.bio}</p>
                </div>
              )}

              {selectedUser.operating_destinations && selectedUser.operating_destinations.length > 0 && (
                <div className="p-3 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)] space-y-1.5">
                  <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                    Destinations of Coverage
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedUser.operating_destinations.map((d, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-[6px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-primary)]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)] space-y-1">
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  Governance Timestamps
                </div>
                <div className="text-[11px] font-mono text-[var(--text-muted)]">
                  Registered: {new Date(selectedUser.created_at).toLocaleString()}
                </div>
                <div className="text-[11px] font-mono text-[var(--text-muted)]">
                  Last Updated: {new Date(selectedUser.updated_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-line)]">
              <Button
                variant="ghost"
                onClick={() => setSelectedUser(null)}
                className="min-h-[44px]"
              >
                Close
              </Button>
              <button
                type="button"
                onClick={() => {
                  setActionUser(selectedUser);
                  setToggleReason('');
                }}
                className={`px-4 py-2 text-xs font-mono rounded-[9px] border min-h-[44px] cursor-pointer ${
                  selectedUser.is_active
                    ? 'border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10'
                    : 'border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/10'
                }`}
              >
                {selectedUser.is_active ? 'Deactivate Account' : 'Activate Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal with Mandatory Reason for Activate/Deactivate */}
      {actionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-line)] rounded-[12px] shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[var(--border-line)]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#EF4444]">
                  GOVERNANCE ACCESS CONTROL
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  {actionUser.is_active ? 'Deactivate Account' : 'Reactivate Account'}
                </h3>
              </div>
              <button
                onClick={() => setActionUser(null)}
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

            <p className="text-xs text-[var(--text-secondary)]">
              You are about to {actionUser.is_active ? 'deactivate' : 'activate'} access for{' '}
              <strong className="text-[var(--text-primary)]">{actionUser.company_name}</strong> ({actionUser.email}).
              Every admin action is recorded in the immutable audit log.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-primary)]">
                Mandatory Reason / Audit Rationale <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                value={toggleReason}
                onChange={(e) => setToggleReason(e.target.value)}
                placeholder="Explain why this account status is being modified..."
                rows={3}
                className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] p-3 focus:outline-none focus:border-[#D4B483] transition-colors"
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-line)]">
              <Button
                variant="ghost"
                onClick={() => setActionUser(null)}
                disabled={isPending}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={isPending}
                className={`px-4 py-2 text-xs font-semibold rounded-[9px] transition-all min-h-[44px] cursor-pointer disabled:opacity-50 ${
                  actionUser.is_active
                    ? 'bg-[#EF4444] text-white hover:bg-[#EF4444]/90'
                    : 'bg-[#10B981] text-white hover:bg-[#10B981]/90'
                }`}
              >
                {isPending
                  ? 'Recording Audit...'
                  : actionUser.is_active
                  ? 'Confirm Deactivation'
                  : 'Confirm Activation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, Button, Badge, StatCard } from '@dmcgrid/ui';
import { reviewKycAction } from '../actions';
import type { KycRecord, Profile, KycStatus } from '@dmcgrid/db';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  ExternalLink,
  AlertCircle,
  Building2,
  ArrowRight
} from 'lucide-react';

export interface KycRecordWithProfile extends KycRecord {
  profiles: Profile | null;
}

interface VerificationClientProps {
  records: KycRecordWithProfile[];
}

export function VerificationClient({ records: initialRecords }: VerificationClientProps) {
  const [records, setRecords] = useState(initialRecords);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<KycRecordWithProfile | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Sync state if initialRecords changes from server revalidation
  React.useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  // Derived metrics
  const pendingCount = records.filter((r) => r.status === 'pending').length;
  const verifiedCount = records.filter((r) => r.status === 'verified').length;
  const rejectedCount = records.filter((r) => r.status === 'rejected').length;

  // Filtered records
  const filteredRecords = records.filter((rec) => {
    if (filterStatus !== 'all' && rec.status !== filterStatus) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const company = rec.profiles?.company_name?.toLowerCase() || '';
    const contact = rec.profiles?.contact_name?.toLowerCase() || '';
    const email = rec.profiles?.email?.toLowerCase() || '';
    const regNum = rec.business_reg_number?.toLowerCase() || '';
    const pan = rec.tax_id_pan?.toLowerCase() || '';
    const gst = rec.gst_number?.toLowerCase() || '';
    return (
      company.includes(q) ||
      contact.includes(q) ||
      email.includes(q) ||
      regNum.includes(q) ||
      pan.includes(q) ||
      gst.includes(q)
    );
  });

  const handleReview = (status: KycStatus) => {
    if (!selectedRecord) return;
    if (!reviewReason.trim()) {
      setActionError('Mandatory reason / audit explanation is required.');
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await reviewKycAction({
        kycRecordId: selectedRecord.id,
        status,
        reason: reviewReason.trim(),
      });

      if (!res.success) {
        setActionError(res.error || 'Failed to update verification status.');
      } else {
        setActionSuccess(`KYC marked as ${status.toUpperCase()} and written to immutable audit log.`);
        // Update local state
        setRecords((prev) =>
          prev.map((r) =>
            r.id === selectedRecord.id
              ? {
                  ...r,
                  status,
                  review_notes: reviewReason.trim(),
                  reviewed_at: new Date().toISOString(),
                }
              : r
          )
        );
        setTimeout(() => {
          setSelectedRecord(null);
          setReviewReason('');
          setActionSuccess(null);
        }, 1200);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Queue"
          value={pendingCount}
          icon={<Clock className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Verified Partners"
          value={verifiedCount}
          icon={<CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Rejected Submissions"
          value={rejectedCount}
          icon={<XCircle className="w-4 h-4 text-[#EF4444]" />}
        />
        <StatCard
          label="Total KYC Records"
          value={records.length}
          icon={<ShieldCheck className="w-4 h-4 text-[#D4B483]" />}
        />
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <Card className="bg-[var(--bg-card)] border-[var(--border-line)]">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, PAN, GSTIN, contact or reg ID..."
              className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] pl-9 pr-4 py-2.5 min-h-[44px] focus:outline-none focus:border-[#D4B483] transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-page)] rounded-[9px] border border-[var(--border-line)]">
            {(['all', 'pending', 'verified', 'rejected'] as const).map((tab) => {
              const count =
                tab === 'all'
                  ? records.length
                  : records.filter((r) => r.status === tab).length;
              const isActive = filterStatus === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-[6px] transition-all min-h-[36px] flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--text-primary)] text-[var(--bg-page)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[var(--bg-page)]/20 text-[var(--bg-page)]' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* KYC Records Queue Table */}
      <Card className="bg-[var(--bg-card)] border-[var(--border-line)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-line)] bg-[var(--bg-page)]/50 text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Entity & Role</th>
                <th className="py-3 px-4">Tax & Business ID</th>
                <th className="py-3 px-4">Key Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Governance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldCheck className="w-8 h-8 text-[var(--text-muted)] opacity-50" />
                      <p className="font-display text-sm font-semibold text-[var(--text-primary)]">
                        No KYC records found
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                        {searchQuery
                          ? 'No verification records match your current search query. Try clearing the filter.'
                          : 'The verification queue is currently empty for the selected status.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const profile = rec.profiles;
                  const isPendingRec = rec.status === 'pending';
                  const isVerified = rec.status === 'verified';
                  const isRejected = rec.status === 'rejected';

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors group"
                    >
                      {/* Entity & Role */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)] flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-[#D4B483]" />
                          </div>
                          <div>
                            <div className="font-medium text-[var(--text-primary)] font-display text-xs">
                              {profile?.company_name || 'Unnamed Agency'}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                                {profile?.role?.toUpperCase()}
                              </span>
                              {profile?.operating_destinations && profile.operating_destinations.length > 0 && (
                                <span className="text-[10px] text-[var(--text-secondary)]">
                                  · {profile.operating_destinations.slice(0, 2).join(', ')}
                                  {profile.operating_destinations.length > 2 && ' +more'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tax & Business ID */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-mono text-[11px] text-[var(--text-primary)]">
                            PAN: <span className="text-[#D4B483]">{rec.tax_id_pan}</span>
                          </div>
                          <div className="font-mono text-[10px] text-[var(--text-muted)]">
                            REG: {rec.business_reg_number}
                          </div>
                          {rec.gst_number && (
                            <div className="font-mono text-[10px] text-[var(--text-secondary)]">
                              GST: {rec.gst_number}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Contact Person */}
                      <td className="py-3 px-4">
                        <div className="text-[var(--text-primary)] font-medium">
                          {profile?.contact_name || '—'}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono">
                          {profile?.email || '—'}
                        </div>
                        {profile?.phone && (
                          <div className="text-[10px] text-[var(--text-muted)] font-mono">
                            {profile.phone}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isPendingRec && (
                          <Badge variant="gold" className="uppercase font-mono text-[9px] py-1 px-2">
                            ● PENDING REVIEW
                          </Badge>
                        )}
                        {isVerified && (
                          <Badge variant="verified" className="uppercase font-mono text-[9px] py-1 px-2">
                            ✓ VERIFIED
                          </Badge>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[9px] font-mono uppercase bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                            ✕ REJECTED
                          </span>
                        )}
                        {rec.status === 'draft' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[9px] font-mono uppercase bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-line)]">
                            DRAFT
                          </span>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)]">
                        {rec.submitted_at
                          ? new Date(rec.submitted_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : new Date(rec.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedRecord(rec);
                            setReviewReason(rec.review_notes || '');
                            setActionError(null);
                            setActionSuccess(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-[9px] border border-[var(--border-line)] text-[var(--text-primary)] hover:border-[#D4B483] hover:bg-[#D4B483]/10 min-h-[44px] transition-all cursor-pointer"
                        >
                          <span>Audit & Review</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#D4B483]" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Detailed Review & Audit Dialog */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-line)] rounded-[12px] shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[var(--border-line)]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4B483]">
                    KYC COMPLIANCE AUDIT GATE
                  </span>
                  <Badge variant={selectedRecord.status === 'verified' ? 'verified' : 'gold'}>
                    {selectedRecord.status.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">
                  {selectedRecord.profiles?.company_name || 'Business Verification'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Platform Rule R2: Approvals and rejections are immutable and logged to audit_log with actor and timestamp.
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer rounded-[6px]"
              >
                ✕
              </button>
            </div>

            {/* Error / Success Feedback */}
            {actionError && (
              <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-[9px] text-[#EF4444] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}
            {actionSuccess && (
              <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-[9px] text-[#10B981] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Entity Verification Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)] space-y-2">
                <div className="font-mono text-[10px] uppercase text-[var(--text-muted)] tracking-wider">
                  Entity Profile
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Contact Person: </span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {selectedRecord.profiles?.contact_name || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Official Email: </span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {selectedRecord.profiles?.email || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Phone Contact: </span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {selectedRecord.profiles?.phone || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Platform Role: </span>
                  <span className="font-mono text-[#D4B483] font-bold uppercase">
                    {selectedRecord.profiles?.role}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)] space-y-2">
                <div className="font-mono text-[10px] uppercase text-[var(--text-muted)] tracking-wider">
                  Legal & Tax Registrations
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Business Reg: </span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {selectedRecord.business_reg_number}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Income Tax PAN: </span>
                  <span className="font-mono text-[#D4B483] font-bold">
                    {selectedRecord.tax_id_pan}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">GSTIN: </span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {selectedRecord.gst_number || 'N/A (Exempt / Foreign Entity)'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Coverage: </span>
                  <span className="text-[var(--text-primary)]">
                    {selectedRecord.profiles?.operating_destinations?.join(', ') || 'Global'}
                  </span>
                </div>
              </div>
            </div>

            {/* Documents URLs */}
            <div className="p-3.5 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)] space-y-2">
              <div className="font-mono text-[10px] uppercase text-[var(--text-muted)] tracking-wider flex items-center justify-between">
                <span>Uploaded Regulatory Documents</span>
                <FileText className="w-3.5 h-3.5 text-[#D4B483]" />
              </div>
              {Array.isArray(selectedRecord.documents_urls) && selectedRecord.documents_urls.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {(selectedRecord.documents_urls as string[]).map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-[6px] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#D4B483] text-xs text-[var(--text-primary)] transition-colors min-h-[44px]"
                    >
                      <span className="font-mono text-[11px] truncate max-w-[400px]">
                        Document #{idx + 1}: {url.split('/').pop() || 'Verification Certificate'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#D4B483] shrink-0" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">
                  No document attachments stored for this record.
                </p>
              )}
            </div>

            {/* Mandatory Reason Form Field */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-primary)]">
                Mandatory Review Reason / Audit Trail Explanation <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                placeholder="State specific audit rationale (e.g. 'Verified GSTIN and MCA certificate against official registry' or 'Missing authorized signatory stamp')..."
                rows={3}
                className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] p-3 focus:outline-none focus:border-[#D4B483] transition-colors"
                disabled={isPending}
              />
              <p className="text-[11px] text-[var(--text-muted)]">
                This rationale will be recorded immutably in the public audit_log and dispatched to the user as an official notice.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[var(--border-line)]">
              <Button
                variant="ghost"
                onClick={() => setSelectedRecord(null)}
                disabled={isPending}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={() => handleReview('rejected')}
                disabled={isPending}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-[9px] bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/20 transition-all min-h-[44px] cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Processing...' : 'Reject KYC'}
              </button>
              <Button
                variant="accent"
                onClick={() => handleReview('verified')}
                disabled={isPending}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {isPending ? 'Writing Audit Log...' : 'Approve & Verify KYC'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

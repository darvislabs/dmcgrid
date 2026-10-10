'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, Button, Badge, StatCard, Money } from '@dmcgrid/ui';
import { forceCloseRfqAction } from '../actions';
import type { Rfq, Profile, RfqDestination, RfqStay, RfqExperience, Quote } from '@dmcgrid/db';
import {
  Files,
  Search,
  CheckCircle2,
  XCircle,
  Compass,
  MapPin,
  Sparkles
} from 'lucide-react';

export interface RfqWithDetails extends Rfq {
  profiles: Profile | null;
  rfq_destinations?: RfqDestination[];
  rfq_stays?: RfqStay[];
  rfq_experiences?: RfqExperience[];
  quotes?: Quote[];
}

interface RfqsClientProps {
  rfqs: RfqWithDetails[];
}

export function RfqsClient({ rfqs: initialRfqs }: RfqsClientProps) {
  const [rfqs, setRfqs] = useState(initialRfqs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const [selectedRfq, setSelectedRfq] = useState<RfqWithDetails | null>(null);
  const [closeTargetRfq, setCloseTargetRfq] = useState<RfqWithDetails | null>(null);
  const [closeReason, setCloseReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setRfqs(initialRfqs);
  }, [initialRfqs]);

  // Derived counts
  const totalCount = rfqs.length;
  const activeSourcingCount = rfqs.filter((r) => ['published', 'quoted'].includes(r.status)).length;
  const connectedCount = rfqs.filter((r) => r.status === 'connected').length;
  const closedCount = rfqs.filter((r) => r.status === 'closed').length;

  // Filtered RFQs
  const filteredRfqs = rfqs.filter((rfq) => {
    if (statusFilter !== 'all' && rfq.status !== statusFilter) return false;

    if (dateFilter !== 'all') {
      const createdDate = new Date(rfq.created_at).getTime();
      const now = Date.now();
      const daysDiff = (now - createdDate) / (1000 * 3600 * 24);
      if (dateFilter === '7d' && daysDiff > 7) return false;
      if (dateFilter === '30d' && daysDiff > 30) return false;
      if (dateFilter === '90d' && daysDiff > 90) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = rfq.title?.toLowerCase() || '';
    const code = rfq.rfq_number?.toLowerCase() || '';
    const agent = rfq.profiles?.company_name?.toLowerCase() || '';
    const destinations = (rfq.rfq_destinations || []).map((d) => d.destination_name.toLowerCase()).join(' ');
    return title.includes(q) || code.includes(q) || agent.includes(q) || destinations.includes(q);
  });

  const handleForceClose = () => {
    if (!closeTargetRfq) return;
    if (!closeReason.trim()) {
      setActionError('A mandatory reason is required to force close an RFQ.');
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await forceCloseRfqAction({
        rfqId: closeTargetRfq.id,
        reason: closeReason.trim(),
      });

      if (!res.success) {
        setActionError(res.error || 'Failed to force-close RFQ.');
      } else {
        setActionSuccess(`RFQ ${closeTargetRfq.rfq_number} force-closed. Agent notified and audit logged.`);
        setRfqs((prev) =>
          prev.map((r) => (r.id === closeTargetRfq.id ? { ...r, status: 'closed', closed_at: new Date().toISOString() } : r))
        );
        setTimeout(() => {
          setCloseTargetRfq(null);
          setCloseReason('');
          setActionSuccess(null);
          if (selectedRfq?.id === closeTargetRfq.id) {
            setSelectedRfq((prev) => (prev ? { ...prev, status: 'closed', closed_at: new Date().toISOString() } : null));
          }
        }, 1200);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Briefs Oversight"
          value={totalCount}
          icon={<Files className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Active Sourcing / Quoting"
          value={activeSourcingCount}
          icon={<Compass className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Unlocked Connections"
          value={connectedCount}
          icon={<CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Closed / Terminated"
          value={closedCount}
          icon={<XCircle className="w-4 h-4 text-[var(--text-muted)]" />}
        />
      </div>

      {/* Controls Bar: Search & Status / Date Filters */}
      <Card className="bg-[var(--bg-card)] border-[var(--border-line)]">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search RFQs by code, title, agent, or destination..."
              className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] pl-9 pr-4 py-2.5 min-h-[44px] focus:outline-none focus:border-[#D4B483] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] px-3 py-2 min-h-[44px] font-mono focus:outline-none focus:border-[#D4B483] cursor-pointer"
            >
              <option value="all">Status: All Statuses</option>
              <option value="published">Status: Published</option>
              <option value="quoted">Status: Quoted</option>
              <option value="connected">Status: Connected</option>
              <option value="draft">Status: Draft</option>
              <option value="closed">Status: Closed</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] px-3 py-2 min-h-[44px] font-mono focus:outline-none focus:border-[#D4B483] cursor-pointer"
            >
              <option value="all">Date: All Time</option>
              <option value="7d">Date: Last 7 Days</option>
              <option value="30d">Date: Last 30 Days</option>
              <option value="90d">Date: Last 90 Days</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* RFQ Oversight Table */}
      <Card className="bg-[var(--bg-card)] border-[var(--border-line)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-line)] bg-[var(--bg-page)]/50 text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Brief Title & Ref</th>
                <th className="py-3 px-4">Agency</th>
                <th className="py-3 px-4">Destinations & Pacing</th>
                <th className="py-3 px-4">Travelers</th>
                <th className="py-3 px-4">Budget Range</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredRfqs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Files className="w-8 h-8 text-[var(--text-muted)] opacity-50" />
                      <p className="font-display text-sm font-semibold text-[var(--text-primary)]">
                        No RFQs found
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                        No brief records matched your current query or date selection.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRfqs.map((rfq) => {
                  const destinations = (rfq.rfq_destinations || [])
                    .map((d) => d.destination_name)
                    .join(', ');

                  return (
                    <tr
                      key={rfq.id}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors group"
                    >
                      {/* Title & Ref */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-[var(--text-primary)] font-display text-xs">
                          {rfq.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px] text-[var(--text-muted)]">
                          <span className="text-[#D4B483] font-semibold">{rfq.rfq_number}</span>
                          <span>·</span>
                          <span>
                            {new Date(rfq.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Agency */}
                      <td className="py-3 px-4">
                        <div className="text-[var(--text-primary)] font-medium">
                          {rfq.profiles?.company_name || 'Agent User'}
                        </div>
                        <div className="font-mono text-[10px] text-[var(--text-muted)]">
                          {rfq.profiles?.contact_name || '—'}
                        </div>
                      </td>

                      {/* Destinations */}
                      <td className="py-3 px-4">
                        <div className="text-[var(--text-primary)] truncate max-w-[160px]">
                          {destinations || 'Unassigned'}
                        </div>
                        <div className="font-mono text-[10px] text-[var(--text-muted)]">
                          {rfq.duration_nights}N / {rfq.duration_days}D
                        </div>
                      </td>

                      {/* Travelers */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-primary)]">
                        {rfq.travelers_adults} Adults
                        {rfq.travelers_children > 0 && ` · ${rfq.travelers_children} Ch`}
                        {rfq.travelers_infants > 0 && ` · ${rfq.travelers_infants} Inf`}
                      </td>

                      {/* Budget */}
                      <td className="py-3 px-4">
                        {rfq.budget_min && rfq.budget_max ? (
                          <div className="space-y-0.5">
                            <div className="font-mono text-[11px] text-[var(--text-primary)] tabular-nums">
                              <Money amount={Number(rfq.budget_min)} />
                              <span className="text-[var(--text-muted)]"> - </span>
                              <Money amount={Number(rfq.budget_max)} />
                            </div>
                          </div>
                        ) : (
                          <span className="font-mono text-[10px] text-[var(--text-muted)]">Open Budget</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {rfq.status === 'published' && (
                          <Badge variant="gold" className="font-mono uppercase text-[9px] py-0.5 px-2">
                            PUBLISHED
                          </Badge>
                        )}
                        {rfq.status === 'quoted' && (
                          <Badge variant="gold" className="font-mono uppercase text-[9px] py-0.5 px-2">
                            QUOTED ({rfq.quotes?.length || 1})
                          </Badge>
                        )}
                        {rfq.status === 'connected' && (
                          <Badge variant="verified" className="font-mono uppercase text-[9px] py-0.5 px-2">
                            ✓ CONNECTED
                          </Badge>
                        )}
                        {rfq.status === 'closed' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[9px] font-mono uppercase bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-line)]">
                            CLOSED
                          </span>
                        )}
                        {rfq.status === 'draft' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[9px] font-mono uppercase bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-line)]">
                            DRAFT
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRfq(rfq)}
                            className="px-2.5 py-1.5 text-xs font-mono rounded-[6px] border border-[var(--border-line)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#D4B483] min-h-[38px] transition-colors cursor-pointer"
                          >
                            Brief Detail
                          </button>
                          {rfq.status !== 'closed' && (
                            <button
                              onClick={() => {
                                setCloseTargetRfq(rfq);
                                setCloseReason('');
                                setActionError(null);
                                setActionSuccess(null);
                              }}
                              className="px-2.5 py-1.5 text-xs font-mono rounded-[6px] border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 min-h-[38px] transition-colors cursor-pointer"
                            >
                              Force Close
                            </button>
                          )}
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

      {/* Brief Detail Modal */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-line)] rounded-[14px] shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[var(--border-line)]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4B483]">
                    SOURCING BRIEF SPECIFICATION
                  </span>
                  <Badge variant={selectedRfq.status === 'connected' ? 'verified' : 'gold'}>
                    {selectedRfq.status.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">
                  {selectedRfq.title}
                </h3>
                <div className="font-mono text-xs text-[var(--text-muted)] mt-0.5">
                  Ref Code: <span className="text-[#D4B483]">{selectedRfq.rfq_number}</span> · Agent: {selectedRfq.profiles?.company_name}
                </div>
              </div>
              <button
                onClick={() => setSelectedRfq(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer rounded-[6px]"
              >
                ✕
              </button>
            </div>

            {/* Travel Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)]">
                <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase block mb-1">Duration</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {selectedRfq.duration_nights}N / {selectedRfq.duration_days}D
                </span>
              </div>
              <div className="p-3 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)]">
                <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase block mb-1">Dates</span>
                <span className="font-mono text-[var(--text-primary)] text-[11px]">
                  {selectedRfq.start_date} → {selectedRfq.end_date}
                </span>
              </div>
              <div className="p-3 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)]">
                <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase block mb-1">Travelers</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {selectedRfq.travelers_adults} Adults
                  {selectedRfq.travelers_children > 0 && ` + ${selectedRfq.travelers_children}C`}
                </span>
              </div>
              <div className="p-3 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)]">
                <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase block mb-1">Budget</span>
                <span className="font-mono font-bold text-[#D4B483] text-[11px]">
                  {selectedRfq.budget_min ? <Money amount={Number(selectedRfq.budget_min)} /> : 'Open'}
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedRfq.notes && (
              <div className="p-3.5 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)] text-xs space-y-1">
                <span className="font-mono text-[10px] uppercase text-[var(--text-muted)] tracking-wider">
                  Agent Brief Notes & Special Requests
                </span>
                <p className="text-[var(--text-primary)] leading-relaxed">{selectedRfq.notes}</p>
              </div>
            )}

            {/* Destinations & Pacing */}
            {selectedRfq.rfq_destinations && selectedRfq.rfq_destinations.length > 0 && (
              <div className="space-y-2 text-xs">
                <span className="font-mono text-[10px] uppercase text-[var(--text-muted)] tracking-wider block">
                  Itinerary Pacing & Destinations
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRfq.rfq_destinations.map((dest, i) => (
                    <div
                      key={dest.id || i}
                      className="p-3 rounded-[8px] bg-[var(--bg-page)] border border-[var(--border-line)] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#D4B483]" />
                        <span className="font-medium text-[var(--text-primary)]">
                          {dest.destination_name}, {dest.country}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        {dest.nights} Nights
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stays & Accommodations */}
            {selectedRfq.rfq_stays && selectedRfq.rfq_stays.length > 0 && (
              <div className="space-y-2 text-xs">
                <span className="font-mono text-[10px] uppercase text-[var(--text-muted)] tracking-wider block">
                  Accommodation Standards
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRfq.rfq_stays.map((stay, i) => (
                    <div
                      key={stay.id || i}
                      className="p-3 rounded-[8px] bg-[var(--bg-page)] border border-[var(--border-line)] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono uppercase text-[#D4B483] font-bold text-[10px]">
                          {stay.star_rating.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--text-muted)]">
                          {stay.room_count} Room(s)
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        Meal Plan: {stay.meal_plan} · {stay.hotel_type}
                      </div>
                      {stay.preferences && (
                        <div className="text-[10px] text-[var(--text-muted)] italic">
                          "{stay.preferences}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Extracted Parameters */}
            {selectedRfq.ai_extracted_data && (
              <div className="p-3 rounded-[9px] bg-[var(--bg-page)] border border-[var(--border-line)] text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4B483]" />
                  <span className="text-[var(--text-secondary)]">AI Copilot Extraction Payload</span>
                </div>
                <span className="font-mono text-[10px] text-[#10B981]">Confidence: 94% Verified</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-line)]">
              <Button
                variant="ghost"
                onClick={() => setSelectedRfq(null)}
                className="min-h-[44px]"
              >
                Close
              </Button>
              {selectedRfq.status !== 'closed' && (
                <button
                  type="button"
                  onClick={() => {
                    setCloseTargetRfq(selectedRfq);
                    setCloseReason('');
                  }}
                  className="px-4 py-2 text-xs font-mono rounded-[9px] bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/20 transition-all min-h-[44px] cursor-pointer"
                >
                  Force Close RFQ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Force Close Confirmation Modal */}
      {closeTargetRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-line)] rounded-[14px] shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[var(--border-line)]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#EF4444]">
                  OPS INTERVENTION
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  Force-Close Sourcing RFQ
                </h3>
              </div>
              <button
                onClick={() => setCloseTargetRfq(null)}
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
              You are about to force-close brief <strong className="text-[var(--text-primary)]">{closeTargetRfq.rfq_number}</strong> ({closeTargetRfq.title}).
              This will notify the agent <strong className="text-[var(--text-primary)]">{closeTargetRfq.profiles?.company_name}</strong> and write an immutable audit log record.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-primary)]">
                Mandatory Close Reason / Notice to Agent <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                placeholder="State why this brief is being terminated early (e.g. 'Duplicate posting', 'Non-compliant budget parameters', 'Agent requested ops cancellation')..."
                rows={3}
                className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] p-3 focus:outline-none focus:border-[#D4B483] transition-colors"
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-line)]">
              <Button
                variant="ghost"
                onClick={() => setCloseTargetRfq(null)}
                disabled={isPending}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleForceClose}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold rounded-[9px] bg-[#EF4444] text-white hover:bg-[#EF4444]/90 transition-all min-h-[44px] cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Notifying Agent & Logging...' : 'Confirm Force Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

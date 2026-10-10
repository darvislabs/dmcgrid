'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, StatCard, Money, Modal } from '@dmcgrid/ui';
import { updateDealStatusAction } from '@/app/(agent)/actions';
import {
  Briefcase,
  Trophy,
  XCircle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  FileText,
  AlertCircle,
  ArrowLeft,
  Coins,
} from 'lucide-react';

export interface DealDetailProps {
  deal: {
    id: string;
    rfq_id: string;
    connection_id: string;
    agent_id: string;
    dmc_id: string;
    selected_quote_option_id: string;
    net_cost: number;
    markup_percentage: number;
    markup_fixed: number;
    ancillary_cost: number;
    ancillary_charge: number;
    gross_margin: number;
    gst_percentage: number;
    gst_amount: number;
    tcs_percentage: number;
    tcs_amount: number;
    customer_selling_price: number;
    tds_paid: number;
    tds_payable: number;
    cash_profit: number;
    status: 'draft' | 'sent' | 'won' | 'lost' | 'pending';
    manager_approval_status: string;
    manager_approved_at?: string | null;
    created_at: string;
    updated_at: string;
    rfq?: {
      id: string;
      rfq_number: string;
      title: string;
      start_date?: string;
      end_date?: string;
      duration_days?: number;
      duration_nights?: number;
      travelers_adults?: number;
      travelers_children?: number;
    } | null;
    agent?: {
      id: string;
      company_name: string;
      contact_name: string;
      email: string;
      phone?: string | null;
    } | null;
    dmc?: {
      id: string;
      company_name: string;
      contact_name: string;
      email: string;
      phone?: string | null;
      operating_destinations?: string[] | null;
    } | null;
    approver?: {
      id: string;
      company_name: string;
      contact_name: string;
    } | null;
    quote_option?: {
      id: string;
      option_name: string;
      description?: string | null;
      net_cost: number;
      day_count?: number;
      quotes?: {
        id: string;
        quote_number: string;
        valid_until?: string;
      } | null;
    } | null;
    proposals?: Array<{
      id: string;
      version: number;
      title: string;
      customer_name: string;
      customer_email?: string | null;
      total_price: number;
      currency: string;
      status: string;
      terms?: string | null;
      itinerary_json?: any;
      created_at: string;
    }> | null;
    share_token?: {
      token: string;
      views_count?: number;
      last_viewed_at?: string | null;
      expires_at?: string | null;
    } | null;
  };
  currentUserRole?: string;
}

export function DealDetailClient({ deal, currentUserRole = 'agent' }: DealDetailProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(deal.status);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<'won' | 'lost' | null>(null);

  const proposal = deal.proposals && deal.proposals.length > 0 ? deal.proposals[0] : null;
  const shareToken = deal.share_token?.token;

  const handleUpdateStatus = (newStatus: 'won' | 'lost' | 'sent' | 'draft') => {
    setShowConfirmModal(null);
    startTransition(async () => {
      const res = await updateDealStatusAction({
        dealId: deal.id,
        status: newStatus,
      });

      if (res.success) {
        setCurrentStatus(newStatus);
        setFeedback({
          type: 'success',
          message: `Deal status updated to "${newStatus.toUpperCase()}". Audit log recorded and counterparty notified.`,
        });
        router.refresh();
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to update deal status',
        });
      }
    });
  };

  const handleCopyShareLink = () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAgent = currentUserRole === 'agent' || currentUserRole === 'admin';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <Link
          href="/deals"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[36px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Deals</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="font-mono text-[10px]">
            DEAL: {deal.id.slice(0, 8)}...
          </Badge>
          {deal.manager_approval_status === 'approved' && (
            <Badge variant="verified">
              <ShieldCheck className="w-3 h-3" />
              <span>MANAGER APPROVED</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--border-line)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-[var(--accent-gold)]">
              {deal.rfq?.rfq_number || 'RFQ-2026'}
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            {currentStatus === 'won' ? (
              <Badge variant="success" dot={true}>
                DEAL WON
              </Badge>
            ) : currentStatus === 'lost' ? (
              <Badge variant="error" dot={true}>
                DEAL CLOSED (LOST)
              </Badge>
            ) : currentStatus === 'sent' ? (
              <Badge variant="warning" dot={true}>
                SENT TO TRAVELER
              </Badge>
            ) : (
              <Badge variant="neutral" dot={true}>
                DRAFT / IN REVIEW
              </Badge>
            )}
            <span className="font-mono text-xs text-[var(--text-secondary)]">
              Created {new Date(deal.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {deal.rfq?.title || 'Custom Luxury Tour Package'}
          </h1>

          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] font-mono flex-wrap">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>DMC Partner: <b className="text-[var(--text-primary)]">{deal.dmc?.company_name || 'Verified DMC'}</b></span>
            </span>
            <span>· Tier: <b className="text-[var(--text-primary)]">{deal.quote_option?.option_name || 'Standard Tier'}</b></span>
            {deal.rfq?.duration_nights && (
              <span>· {deal.rfq.duration_nights} Nights / {deal.rfq.duration_days} Days</span>
            )}
          </div>
        </div>

        {/* Action Controls for Agent */}
        {isAgent && (
          <div className="flex flex-wrap items-center gap-3">
            {currentStatus !== 'won' && (
              <Button
                variant="primary"
                size="md"
                isLoading={isPending}
                onClick={() => setShowConfirmModal('won')}
                className="gap-2 font-semibold shadow-sm"
              >
                <Trophy className="w-4 h-4 text-[#10B981]" />
                <span>Mark as Won</span>
              </Button>
            )}

            {currentStatus !== 'lost' && (
              <Button
                variant="outline"
                size="md"
                isLoading={isPending}
                onClick={() => setShowConfirmModal('lost')}
                className="gap-2 text-[var(--text-secondary)] hover:text-[#EF4444]"
              >
                <XCircle className="w-4 h-4" />
                <span>Mark as Lost</span>
              </Button>
            )}

            {currentStatus !== 'sent' && currentStatus !== 'won' && (
              <Button
                variant="secondary"
                size="md"
                isLoading={isPending}
                onClick={() => handleUpdateStatus('sent')}
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Mark as Sent</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-[14px] border flex items-center justify-between text-xs animate-in fade-in duration-160 ${
            feedback.type === 'success'
              ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
              : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="DMC Net Cost"
          value={Number(deal.net_cost || 0)}
          isCurrency={true}
          subtext="Base contracted package"
          icon={<Coins className="w-4 h-4 text-[var(--text-muted)]" />}
        />
        <StatCard
          label="Agent Markup"
          value={`+${deal.markup_percentage}%`}
          delta={{ value: `₹${Number(deal.gross_margin || 0).toLocaleString('en-IN')}`, isPositive: true }}
          subtext="Agency gross commission"
          icon={<Briefcase className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Customer Selling Price"
          value={Number(deal.customer_selling_price || 0)}
          isCurrency={true}
          subtext="Statutory GST & TCS applied"
          icon={<Trophy className="w-4 h-4 text-[var(--accent-gold)]" />}
        />
        <StatCard
          label="Estimated Cash Profit"
          value={Number(deal.cash_profit || 0)}
          isCurrency={true}
          subtext="Net retained after TDS"
          icon={<ShieldCheck className="w-4 h-4 text-[#0EA5A3]" />}
        />
      </div>

      {/* Grid: Left Column (V62 Cost Architecture & Timeline) + Right Column (Linked Proposal & Counterparty) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* V62 Deal Formula Card */}
          <Card className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)]">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[var(--accent-gold)] tracking-wider uppercase font-bold">
                  BINDING COST ENGINE (RULE R8)
                </span>
                <Badge variant="neutral">V62 Compliance</Badge>
              </div>
              <CardTitle className="text-base mt-1">
                Deal Margin & Statutory Tax Architecture
              </CardTitle>
              <CardDescription>
                selling = (net × markup) + ancillary; default statutory 5% GST & 5% TCS calculated on taxable subtotal.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              <div className="rounded-[9px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 divide-y divide-[var(--border-subtle)] font-mono text-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">1. DMC Net Package Cost</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    <Money amount={Number(deal.net_cost || 0)} />
                  </span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[var(--text-secondary)]">2. Agent Margin Markup</span>
                    <span className="block text-[10px] text-[var(--text-muted)]">Rate: {deal.markup_percentage}% on Net</span>
                  </div>
                  <span className="font-semibold text-[#10B981]">
                    +<Money amount={Number(deal.gross_margin || 0)} />
                  </span>
                </div>
                {Number(deal.ancillary_charge || 0) > 0 && (
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">3. Ancillary Charge</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      +<Money amount={Number(deal.ancillary_charge || 0)} />
                    </span>
                  </div>
                )}
                <div className="p-3.5 flex items-center justify-between bg-[var(--bg-card)]/50">
                  <span className="text-[var(--text-secondary)] font-medium">Subtotal before statutory taxes</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    <Money
                      amount={
                        Number(deal.net_cost || 0) +
                        Number(deal.gross_margin || 0) +
                        Number(deal.ancillary_charge || 0)
                      }
                    />
                  </span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[var(--text-secondary)]">4. Statutory GST (5.00%)</span>
                    <span className="block text-[10px] text-[var(--text-muted)]">Tour operator GST applicable</span>
                  </div>
                  <span className="font-semibold text-[var(--text-secondary)]">
                    +<Money amount={Number(deal.gst_amount || 0)} />
                  </span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[var(--text-secondary)]">5. Statutory TCS (5.00%)</span>
                    <span className="block text-[10px] text-[var(--text-muted)]">Tax Collected at Source on foreign tours</span>
                  </div>
                  <span className="font-semibold text-[var(--text-secondary)]">
                    +<Money amount={Number(deal.tcs_amount || 0)} />
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between bg-[var(--accent-gold-soft)] rounded-b-[9px]">
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    Total Customer Selling Price
                  </span>
                  <span className="font-bold text-base text-[var(--accent-gold)]">
                    <Money amount={Number(deal.customer_selling_price || 0)} />
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-[9px] border border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase font-mono">
                    Statutory TDS Compliance
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    TDS Paid: <b className="text-[var(--text-primary)] font-mono"><Money amount={Number(deal.tds_paid || 0)} /></b> · TDS Payable: <b className="text-[var(--text-primary)] font-mono"><Money amount={Number(deal.tds_payable || 0)} /></b>
                  </span>
                </div>
                <div className="text-left sm:text-right font-mono">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block">Net Retained Cash Profit</span>
                  <span className="text-sm font-bold text-[#10B981]">
                    <Money amount={Number(deal.cash_profit || 0)} />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deal Lifecycle Timeline */}
          <Card className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] space-y-4">
            <CardHeader className="p-0 pb-3">
              <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider uppercase">
                AUDIT LOG & MILESTONES
              </span>
              <CardTitle className="text-base mt-1">
                Deal Lifecycle Timeline
              </CardTitle>
            </CardHeader>

            <div className="space-y-6 pt-2">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      1. RFQ Published & Matched
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">Completed</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Sourcing brief matched to verified licensed DMC operators.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      2. Quote Unlocked & Accepted
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">Completed</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Agent committed credits to unlock {deal.dmc?.company_name} coordinates and accepted tier option {deal.quote_option?.option_name}.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      3. Manager Approval Status
                    </span>
                    <span className="font-mono text-[10px] text-[#10B981] font-semibold uppercase">
                      {deal.manager_approval_status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {deal.manager_approved_at
                      ? `Margin verified and signed off on ${new Date(deal.manager_approved_at).toLocaleDateString('en-IN')}`
                      : 'Commercial margins validated by operations manager.'}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    proposal
                      ? 'bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]'
                      : 'bg-[var(--bg-elevated)] border border-[var(--border-line)] text-[var(--text-muted)]'
                  }`}
                >
                  {proposal ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      4. Customer Proposal Generated
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      {proposal ? 'Generated' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {proposal
                      ? `Branded proposal document "${proposal.title}" ready for customer sharing.`
                      : 'Generate proposal artifact to share with traveler.'}
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    currentStatus === 'won'
                      ? 'bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]'
                      : currentStatus === 'lost'
                      ? 'bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444]'
                      : currentStatus === 'sent'
                      ? 'bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B]'
                      : 'bg-[var(--bg-elevated)] border border-[var(--border-line)] text-[var(--text-muted)]'
                  }`}
                >
                  {currentStatus === 'won' ? (
                    <Trophy className="w-3.5 h-3.5" />
                  ) : currentStatus === 'lost' ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      5. Booking Outcome
                    </span>
                    <span className="font-mono text-[10px] uppercase font-semibold text-[var(--text-primary)]">
                      {currentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {currentStatus === 'won'
                      ? 'Traveler confirmed and accepted itinerary. Contract confirmed.'
                      : currentStatus === 'lost'
                      ? 'Traveler declined itinerary.'
                      : 'Awaiting customer response to proposal.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (1 span) */}
        <div className="space-y-6">
          {/* Proposal Preview Card */}
          {proposal ? (
            <Card className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[var(--accent-gold)] tracking-wider uppercase font-bold">
                  CUSTOMER ARTIFACT
                </span>
                <Badge variant={proposal.status === 'accepted' ? 'success' : 'gold'}>
                  {proposal.status.toUpperCase()}
                </Badge>
              </div>

              <div>
                <h3 className="font-display font-semibold text-base text-[var(--text-primary)]">
                  {proposal.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Prepared for: <b className="text-[var(--text-primary)]">{proposal.customer_name}</b>
                </p>
                {proposal.customer_email && (
                  <p className="text-[11px] font-mono text-[var(--text-muted)]">
                    {proposal.customer_email}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-[9px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 font-mono text-xs flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Total Proposal Price</span>
                <span className="font-bold text-[var(--accent-gold)] text-sm">
                  <Money amount={Number(proposal.total_price)} />
                </span>
              </div>

              {/* Share Token Link */}
              {shareToken && (
                <div className="p-3 rounded-[9px] border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[var(--text-muted)]">Secure Share Link</span>
                    <span className="text-[var(--text-muted)]">
                      {deal.share_token?.views_count || 0} views
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareToken}`}
                      className="w-full text-xs font-mono py-1 px-2.5 rounded bg-[var(--bg-surface)] border border-[var(--border-line)] text-[var(--text-secondary)] select-all truncate"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyShareLink}
                      className="h-8 px-2.5 shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <Link href={`/proposals/${proposal.id}`} className="block">
                  <Button variant="primary" size="sm" className="w-full gap-2 font-semibold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Branded Proposal Preview</span>
                  </Button>
                </Link>

                {shareToken && (
                  <Link href={`/share/${shareToken}`} target="_blank" className="block">
                    <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Traveler Portal View</span>
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] space-y-3">
              <span className="font-mono text-[10px] text-[var(--accent-gold)] tracking-wider uppercase font-bold">
                CUSTOMER ARTIFACT
              </span>
              <h3 className="font-display font-semibold text-base text-[var(--text-primary)]">
                Proposal Not Yet Created
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Create a proposal to generate a traveler-facing interactive itinerary and shareable link.
              </p>
              <Link href="/proposals">
                <Button variant="secondary" size="sm" className="w-full">
                  Browse Proposals
                </Button>
              </Link>
            </Card>
          )}

          {/* Supplier Partner Coordinates Card */}
          <Card className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[var(--accent-gold)] tracking-wider uppercase font-bold">
                DESTINATION OPERATOR
              </span>
              <Badge variant="verified">✓ VERIFIED DMC</Badge>
            </div>

            <div>
              <h3 className="font-display font-semibold text-base text-[var(--text-primary)]">
                {deal.dmc?.company_name || 'Destination Management Partner'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Contact: <b className="text-[var(--text-primary)]">{deal.dmc?.contact_name}</b>
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono pt-2 border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block uppercase">Email</span>
                <span className="text-[var(--text-primary)]">{deal.dmc?.email}</span>
              </div>
              {deal.dmc?.phone && (
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase">Phone</span>
                  <span className="text-[var(--text-primary)]">{deal.dmc?.phone}</span>
                </div>
              )}
              {deal.quote_option?.quotes?.quote_number && (
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase">Quote Code</span>
                  <span className="text-[var(--accent-gold)]">{deal.quote_option.quotes.quote_number}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal !== null}
        onClose={() => setShowConfirmModal(null)}
        title={showConfirmModal === 'won' ? 'Confirm Deal as WON' : 'Confirm Deal as LOST'}
        description={
          showConfirmModal === 'won'
            ? 'This action will update the deal status to WON, record an immutable audit log entry, and send a notification to the destination DMC partner.'
            : 'This action will mark the deal as LOST and record the outcome in the platform audit log.'
        }
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant={showConfirmModal === 'won' ? 'primary' : 'destructive'}
              size="sm"
              isLoading={isPending}
              onClick={() => handleUpdateStatus(showConfirmModal!)}
            >
              {showConfirmModal === 'won' ? 'Confirm Mark as Won' : 'Confirm Mark as Lost'}
            </Button>
          </>
        }
      >
        <div className="text-xs space-y-2 text-[var(--text-secondary)]">
          <p>
            Deal Reference: <b className="text-[var(--text-primary)]">{deal.rfq?.title}</b>
          </p>
          <p>
            Customer Selling Price: <b className="text-[var(--accent-gold)] font-mono"><Money amount={Number(deal.customer_selling_price || 0)} /></b>
          </p>
          <p className="text-[var(--text-muted)] pt-1 text-[11px]">
            Executed securely via PostgreSQL SECURITY DEFINER function <code className="font-mono text-[var(--text-primary)]">agent_update_deal_status()</code>.
          </p>
        </div>
      </Modal>
    </div>
  );
}

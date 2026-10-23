'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Money, Modal } from '@dmcgrid/ui';
import { calculateV62Deal } from '@dmcgrid/db';
import { unlockConnectionAction, acceptQuoteAction, rejectQuoteAction } from '../../actions';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Share2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface QuoteLineItem {
  id: string;
  day_number: number;
  time_window: string;
  title: string;
  description?: string | null;
  cost_category: string;
  net_cost: number;
}

interface QuoteOption {
  id: string;
  option_name: string;
  description?: string | null;
  net_cost: number;
  currency: string;
  is_selected: boolean;
  day_count: number;
  quote_line_items?: QuoteLineItem[];
}

interface QuoteItem {
  id: string;
  quote_number: string;
  status: string;
  total_net_cost: number;
  currency: string;
  notes?: string | null;
  valid_until: string;
  created_at: string;
  dmc_id: string;
  dmc?: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone?: string | null;
    operating_destinations?: string[] | null;
  } | null;
  is_connected: boolean;
  quote_options: QuoteOption[];
}

export function RfqQuoteMatrix({
  rfqId,
  rfqTitle,
  quotes,
  userCredits = 20,
  existingDeal,
  existingShareToken,
}: {
  rfqId: string;
  rfqTitle: string;
  quotes: QuoteItem[];
  userCredits?: number;
  existingDeal?: any | null;
  existingShareToken?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<QuoteItem | null>(null);
  const [acceptTarget, setAcceptTarget] = useState<{ quote: QuoteItem; option: QuoteOption } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; shareToken?: string } | null>(null);

  const handleUnlockConnection = (quote: QuoteItem) => {
    setUnlockTarget(quote);
  };

  const confirmUnlock = () => {
    if (!unlockTarget) return;

    startTransition(async () => {
      const res = await unlockConnectionAction({
        dmcId: unlockTarget.dmc_id,
        quoteId: unlockTarget.id,
        rfqId,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'DMC identity unlocked successfully. 5 credits debited from your wallet.',
        });
        setUnlockTarget(null);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to unlock DMC connection',
        });
      }
    });
  };

  const confirmAccept = () => {
    if (!acceptTarget) return;

    startTransition(async () => {
      const res = await acceptQuoteAction({
        rfqId,
        quoteId: acceptTarget.quote.id,
        optionId: acceptTarget.option.id,
        markupPercentage: 12.00,
      });

      if (res.success && res.data) {
        setFeedback({
          type: 'success',
          message: `Quote option accepted for "${rfqTitle}"! Binding V62 deal created and traveler share proposal generated.`,
          shareToken: res.data.share_token,
        });
        setAcceptTarget(null);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to accept quote',
        });
      }
    });
  };

  const handleRejectQuote = (quoteId: string) => {
    if (!confirm('Are you sure you want to decline this quote?')) return;
    startTransition(async () => {
      const res = await rejectQuoteAction({ rfqId, quoteId });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Quote declined.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to decline quote',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Existing Deal Alert if already accepted */}
      {existingDeal && (
        <div className="p-4 rounded-[12px] border border-[#10B981]/30 bg-[#10B981]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
            <div>
              <span className="font-semibold text-xs text-[var(--text-primary)]">
                Active Deal Connected & Sealed (V62 Margin Compliant)
              </span>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Selling price: ₹{existingDeal.customer_selling_price?.toLocaleString('en-IN')} (Gross profit: ₹{existingDeal.gross_margin?.toLocaleString('en-IN')})
              </p>
            </div>
          </div>
          {existingShareToken && (
            <Link href={`/share/${existingShareToken}`} target="_blank">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-mono">
                <Share2 className="w-3.5 h-3.5 text-[#D4B483]" />
                <span>Open Traveler Share Page</span>
                <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-4 rounded-[12px] border flex items-start justify-between gap-3 text-xs ${
            feedback.type === 'success'
              ? 'border-[#10B981]/30 bg-[#10B981]/10 text-[var(--text-primary)]'
              : 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#EF4444]" />
              )}
              <span>{feedback.message}</span>
            </div>
            {feedback.shareToken && (
              <div className="pt-2 flex items-center gap-3">
                <Link href={`/share/${feedback.shareToken}`} target="_blank">
                  <Button variant="primary" size="sm" className="h-7 text-xs gap-1.5">
                    <Share2 className="w-3 h-3" />
                    <span>View Client Proposal Link</span>
                  </Button>
                </Link>
                <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                  Token: {feedback.shareToken}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm px-1.5"
          >
            ×
          </button>
        </div>
      )}

      {/* Quotes Count & Red Line Notice */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
            Quotes Received ({quotes.length})
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            DMC identities are strictly anonymized until unlocked. All customer pricing calculated via V62 formula.
          </p>
        </div>
      </div>

      {quotes.length === 0 ? (
        <Card className="py-12 text-center space-y-3 bg-[var(--bg-card)]">
          <Clock className="w-8 h-8 text-[#D4B483] mx-auto opacity-70" />
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">Awaiting DMC Submissions</h4>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Your brief is dispatched to licensed destination specialists. Responses typically arrive within 4-12 hours.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {quotes.map((quote, idx) => {
            const quoteLabel = `Quote ${String.fromCharCode(65 + idx)}`;
            const isUnlocked = quote.is_connected;
            const isDeclined = quote.status === 'declined';

            return (
              <Card
                key={quote.id}
                className={`p-6 border transition-all duration-200 bg-[var(--bg-card)] ${
                  isDeclined
                    ? 'opacity-60 border-[var(--border-subtle)]'
                    : 'border-[var(--border-line)] hover:border-[#D4B483]/40'
                }`}
              >
                {/* Quote Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#D4B483]">
                        {quote.quote_number}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-[var(--border-line)]" />
                      <span className="font-mono text-xs text-[var(--text-secondary)]">
                        {quoteLabel}
                      </span>
                      {isUnlocked ? (
                        <Badge variant="verified">
                          <ShieldCheck className="w-3 h-3" />
                          <span>UNLOCKED PARTNER</span>
                        </Badge>
                      ) : (
                        <Badge variant="neutral">
                          <Lock className="w-3 h-3 text-[#D4B483]" />
                          <span>ANONYMOUS SPECIALIST</span>
                        </Badge>
                      )}
                      {quote.status === 'connected' && (
                        <Badge variant="gold">CONNECTED DEAL</Badge>
                      )}
                      {isDeclined && <Badge variant="error">DECLINED</Badge>}
                    </div>

                    {/* Unlocked Profile Details */}
                    {isUnlocked && quote.dmc ? (
                      <div className="pt-1 flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                          <Building2 className="w-3.5 h-3.5 text-[#0EA5A3]" />
                          <span>{quote.dmc.company_name}</span>
                        </div>
                        <span className="text-[var(--text-muted)] font-mono">
                          {quote.dmc.contact_name} · {quote.dmc.email} {quote.dmc.phone ? `· ${quote.dmc.phone}` : ''}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-secondary)]">
                        Verified destination license holder. Unlock to access direct phone, email, and company identity.
                      </p>
                    )}
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-3">
                    {!isUnlocked && !isDeclined && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUnlockConnection(quote)}
                        className="gap-1.5 font-mono text-xs"
                      >
                        <Unlock className="w-3.5 h-3.5 text-[#D4B483]" />
                        <span>Unlock Partner (5 CR)</span>
                      </Button>
                    )}
                    {!isDeclined && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRejectQuote(quote.id)}
                        className="text-xs text-[#EF4444] hover:bg-[#EF4444]/10"
                      >
                        Decline
                      </Button>
                    )}
                  </div>
                </div>

                {quote.notes && (
                  <div className="mt-3 p-3 rounded-[9px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] italic">
                    &quot;{quote.notes}&quot;
                  </div>
                )}

                {/* Quote Options & V62 Cost Architecture */}
                <div className="mt-5 space-y-4">
                  <div className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-muted)] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#D4B483]" />
                    <span>Tiered Itinerary Packages & V62 Margin Architecture</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quote.quote_options.map((opt) => {
                      // Apply V62 Cost Formula
                      const v62 = calculateV62Deal({
                        netCost: opt.net_cost,
                        marginRate: 12,
                        gstPct: 5,
                        tcsPct: 5,
                      });

                      const isExpanded = expandedOptionId === opt.id;
                      const hasLineItems = opt.quote_line_items && opt.quote_line_items.length > 0;

                      return (
                        <div
                          key={opt.id}
                          className={`p-4 rounded-[12px] border transition-colors flex flex-col justify-between gap-4 ${
                            opt.is_selected
                              ? 'border-[#D4B483] bg-[#D4B483]/5'
                              : 'border-[var(--border-line)] bg-[var(--bg-surface)] hover:border-[var(--border-line)]'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-display font-bold text-sm text-[var(--text-primary)]">
                                {opt.option_name}
                              </span>
                              {opt.is_selected && (
                                <Badge variant="gold" className="text-[10px]">
                                  SELECTED
                                </Badge>
                              )}
                            </div>

                            {opt.description && (
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                {opt.description}
                              </p>
                            )}

                            {/* V62 Pricing Breakdown */}
                            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5 font-mono text-xs">
                              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                                <span>Supplier Net:</span>
                                <span className="font-semibold text-[var(--text-primary)]">
                                  <Money amount={opt.net_cost} />
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[#10B981]">
                                <span>+ Agent Margin (12%):</span>
                                <span className="font-semibold">
                                  +<Money amount={v62.marginAmount} />
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[var(--text-muted)] text-[11px]">
                                <span>GST (5%) + TCS (5%):</span>
                                <span>
                                  +<Money amount={v62.gstAmount + v62.tcsAmount} />
                                </span>
                              </div>
                              <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-[#D4B483]">
                                  Customer Selling:
                                </span>
                                <span className="text-sm font-bold text-[#D4B483]">
                                  <Money amount={v62.totalCustomerPrice} />
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action & Line Items Toggle */}
                          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                            {!isDeclined && (
                              <Button
                                variant={opt.is_selected ? 'secondary' : 'primary'}
                                size="sm"
                                disabled={isPending || opt.is_selected}
                                onClick={() => setAcceptTarget({ quote, option: opt })}
                                className="w-full text-xs font-semibold gap-1.5"
                              >
                                {opt.is_selected ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                                    <span>Option Confirmed</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Accept Option & Lock Deal</span>
                                  </>
                                )}
                              </Button>
                            )}

                            {hasLineItems && (
                              <button
                                onClick={() => setExpandedOptionId(isExpanded ? null : opt.id)}
                                className="w-full flex items-center justify-center gap-1 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] pt-1 transition-colors"
                              >
                                <span>{isExpanded ? 'Hide' : 'View'} Day-Wise Build ({opt.quote_line_items?.length} items)</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            )}
                          </div>

                          {/* Expandable Line Items */}
                          {isExpanded && hasLineItems && (
                            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2 text-[11px]">
                              {opt.quote_line_items?.map((item) => (
                                <div
                                  key={item.id}
                                  className="p-2 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-0.5 font-mono"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-[var(--text-primary)]">
                                      Day {item.day_number} · {item.time_window.toUpperCase()}
                                    </span>
                                    <span className="text-[#D4B483]">
                                      <Money amount={item.net_cost} />
                                    </span>
                                  </div>
                                  <div className="text-[var(--text-secondary)] font-sans">{item.title}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Unlock Connection Modal */}
      <Modal
        isOpen={!!unlockTarget}
        onClose={() => setUnlockTarget(null)}
        title="Unlock Verified DMC Identity"
        description="Establish direct supplier channels and reveal counterparty business credentials."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setUnlockTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isPending}
              onClick={confirmUnlock}
              className="gap-1.5 font-semibold"
            >
              <Unlock className="w-3.5 h-3.5 text-[#D4B483]" />
              <span>Confirm Unlock (Debit 5 Credits)</span>
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-[9px] bg-[var(--bg-surface)] border border-[var(--border-line)] space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[var(--text-secondary)]">Available Credit Balance:</span>
              <span className="font-bold text-[#D4B483]">{userCredits} Credits</span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[var(--text-secondary)]">Unlock Transaction Cost:</span>
              <span className="font-bold text-[#EF4444]">-5 Credits</span>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between font-mono text-xs font-semibold">
              <span className="text-[var(--text-primary)]">Balance After Unlock:</span>
              <span className="text-[#10B981]">{Math.max(0, userCredits - 5)} Credits</span>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            By unlocking, you receive immediate access to direct WhatsApp, email, and phone contact for the licensed DMC specialist who prepared this quote.
          </p>
        </div>
      </Modal>

      {/* Accept Quote Modal */}
      <Modal
        isOpen={!!acceptTarget}
        onClose={() => setAcceptTarget(null)}
        title="Accept Quote & Generate Client Proposal"
        description="Enforces V62 binding deal cost and produces an unauthenticated traveler link."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setAcceptTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isPending}
              onClick={confirmAccept}
              className="gap-1.5 font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Confirm & Lock Deal</span>
            </Button>
          </>
        }
      >
        {acceptTarget && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 rounded-[9px] bg-[var(--bg-surface)] border border-[var(--border-line)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Option Selected:</span>
                <span className="font-bold text-[var(--text-primary)] font-sans">
                  {acceptTarget.option.option_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Supplier Net:</span>
                <span className="font-bold">
                  <Money amount={acceptTarget.option.net_cost} />
                </span>
              </div>
              <div className="flex items-center justify-between text-[#10B981]">
                <span>12% Agent Margin:</span>
                <span>
                  +<Money amount={Math.round(acceptTarget.option.net_cost * 0.12)} />
                </span>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-sm font-bold text-[#D4B483]">
                <span>Customer Selling:</span>
                <span>
                  <Money amount={calculateV62Deal({ netCost: acceptTarget.option.net_cost }).totalCustomerPrice} />
                </span>
              </div>
            </div>

            <p className="text-xs font-sans text-[var(--text-secondary)] leading-relaxed">
              Accepting this quote automatically creates the binding deal sheet, registers the 12% agent margin, and issues an unauthenticated share link for the traveler.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

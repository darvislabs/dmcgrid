'use client';

import React, { useState, useTransition } from 'react';
import { Card, Button, Badge, Modal, Money } from '@dmcgrid/ui';
import { buyCreditPackAction } from '../actions';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface LedgerItem {
  id: string;
  entry_type: 'credit' | 'debit';
  amount: number;
  balance_after: number;
  reference_type: string;
  description: string;
  created_at: string;
}

interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price_inr: number;
  gst_rate: number;
}

interface PlanItem {
  id: string;
  plan_code: string;
  name: string;
  monthly_leads_included: number;
  price_inr: number;
  description?: string | null;
  features?: any;
}

export function WalletView({
  balance,
  ledger,
  packs,
  plans,
}: {
  balance: number;
  ledger: LedgerItem[];
  packs: CreditPack[];
  plans: PlanItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePurchase = (pack: CreditPack) => {
    setSelectedPack(pack);
  };

  const confirmPurchase = () => {
    if (!selectedPack) return;

    startTransition(async () => {
      const res = await buyCreditPackAction({
        packId: selectedPack.id,
        credits: selectedPack.credits,
        packName: selectedPack.name,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Successfully added ${selectedPack.credits} credits to your wallet. New balance: ${res.newBalance} CR`,
        });
        setSelectedPack(null);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to complete credit purchase',
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-[12px] border flex items-center justify-between text-xs ${
            feedback.type === 'success'
              ? 'border-[#10B981]/30 bg-[#10B981]/10 text-[var(--text-primary)]'
              : 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#EF4444]" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm px-1.5"
          >
            ×
          </button>
        </div>
      )}

      {/* Available Credit Packs Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Credit Packs (Instant Top-Up)
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Current balance: <strong className="text-[#D4B483] font-mono">{balance} CR</strong>. 5 credits required per unlocked verified DMC connection.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packs.map((pack) => {
            const gstAmount = Math.round((pack.price_inr * (pack.gst_rate || 18)) / 100);
            const totalInr = pack.price_inr + gstAmount;

            return (
              <Card
                key={pack.id}
                className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] flex flex-col justify-between gap-6 hover:border-[#D4B483]/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4B483] font-bold">
                      {pack.name}
                    </span>
                    <Badge variant="gold" className="text-xs font-mono font-bold">
                      {pack.credits} CREDITS
                    </Badge>
                  </div>

                  <div>
                    <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                      <Money amount={pack.price_inr} />
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono block">
                      +18% GST (Total: <Money amount={totalInr} />)
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Unlocks {Math.floor(pack.credits / 5)} direct DMC connections with full company credentials.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handlePurchase(pack)}
                  className="w-full gap-2 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Buy {pack.credits} Credits</span>
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Ledger History & Platform Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Credit Ledger Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                Credit Ledger History
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Immutable double-entry transaction record
              </p>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {ledger.length} Transactions
            </span>
          </div>

          <Card className="p-0 overflow-hidden bg-[var(--bg-card)] border border-[var(--border-line)]">
            {ledger.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                No transactions recorded in ledger yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-secondary)] font-mono uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-center">Type</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                    {ledger.map((entry) => {
                      const isCredit = entry.entry_type === 'credit';
                      return (
                        <tr
                          key={entry.id}
                          className="hover:bg-[var(--bg-card-hover)] transition-colors duration-160 font-mono"
                        >
                          <td className="py-3 px-4 text-[var(--text-secondary)] text-[11px] whitespace-nowrap">
                            {new Date(entry.created_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4 font-sans text-xs">
                            <span className="font-medium text-[var(--text-primary)]">{entry.description}</span>
                            <span className="block text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                              Ref: {entry.reference_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={isCredit ? 'success' : 'neutral'} className="text-[10px]">
                              {isCredit ? (
                                <ArrowDownLeft className="w-3 h-3 text-[#10B981]" />
                              ) : (
                                <ArrowUpRight className="w-3 h-3 text-[#EF4444]" />
                              )}
                              <span>{entry.entry_type.toUpperCase()}</span>
                            </Badge>
                          </td>
                          <td className={`py-3 px-4 text-right font-bold ${isCredit ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {isCredit ? '+' : '-'}{entry.amount} CR
                          </td>
                          <td className="py-3 px-4 text-right text-[var(--text-primary)] font-bold">
                            {entry.balance_after} CR
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Platform Subscription Plans (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                Agency Plans
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Monthly tiered subscription benefits
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {plans.map((plan) => {
              const features = Array.isArray(plan.features) ? plan.features : [];

              return (
                <Card
                  key={plan.id}
                  className="p-5 border border-[var(--border-line)] bg-[var(--bg-card)] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#D4B483]">
                      {plan.name}
                    </span>
                    <Badge variant="neutral" className="font-mono text-[10px]">
                      {plan.monthly_leads_included} LEADS/MO
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-xl font-bold text-[var(--text-primary)]">
                      <Money amount={plan.price_inr} />
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">/month</span>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-[var(--text-secondary)]">
                      {plan.description}
                    </p>
                  )}

                  <ul className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
                    {features.map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Buy Pack Confirmation Modal */}
      <Modal
        isOpen={!!selectedPack}
        onClose={() => setSelectedPack(null)}
        title={`Purchase ${selectedPack?.name}`}
        description="Instant credit pack recharge with automated tax invoice generation."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setSelectedPack(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isPending}
              onClick={confirmPurchase}
              className="gap-1.5 font-semibold"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm & Recharge Instant</span>
            </Button>
          </>
        }
      >
        {selectedPack && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3.5 rounded-[9px] bg-[var(--bg-surface)] border border-[var(--border-line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Credits Included:</span>
                <span className="font-bold text-[#D4B483]">+{selectedPack.credits} CR</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Base Price:</span>
                <span><Money amount={selectedPack.price_inr} /></span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>GST (18%):</span>
                <span>+<Money amount={Math.round((selectedPack.price_inr * 18) / 100)} /></span>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-sm font-bold text-[var(--text-primary)]">
                <span>Total Invoice:</span>
                <span className="text-[#D4B483]">
                  <Money amount={selectedPack.price_inr + Math.round((selectedPack.price_inr * 18) / 100)} />
                </span>
              </div>
            </div>

            <p className="text-xs font-sans text-[var(--text-secondary)] leading-relaxed">
              Credits will be credited immediately to your double-entry ledger account and can be applied toward unlocking verified destination specialists.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

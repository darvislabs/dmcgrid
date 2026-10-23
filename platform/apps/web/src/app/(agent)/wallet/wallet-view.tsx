'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Modal, Money } from '@dmcgrid/ui';
import { topUpCredits, verifyTopUp, demoTopUpCredits } from '../actions';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
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

interface UserProfile {
  contact_name?: string | null;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export function WalletView({
  balance,
  ledger,
  packs,
  plans,
  isRazorpayConfigured = false,
  userProfile,
  userId,
}: {
  balance: number;
  ledger: LedgerItem[];
  packs: CreditPack[];
  plans: PlanItem[];
  isRazorpayConfigured?: boolean;
  userProfile?: UserProfile;
  userId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchaseClick = (pack: CreditPack) => {
    setSelectedPack(pack);
  };

  const confirmPurchase = () => {
    if (!selectedPack) return;
    const pack = selectedPack;

    startTransition(async () => {
      try {
        if (isRazorpayConfigured) {
          // 1. Razorpay Live/Test Gateway Flow
          const orderRes = await topUpCredits(pack.id);
          if (!orderRes.success) {
            setFeedback({
              type: 'error',
              message: orderRes.error || 'Failed to create payment order with gateway.',
            });
            return;
          }

          if (orderRes.isConfigured && orderRes.orderId) {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
              setFeedback({
                type: 'error',
                message: 'Unable to load payment checkout script. Please disable ad-blockers and try again.',
              });
              return;
            }

            const options = {
              key: orderRes.keyId,
              amount: orderRes.amount,
              currency: orderRes.currency,
              name: 'DMCGrid B2B',
              description: `${orderRes.packName} (${orderRes.credits} Credits)`,
              order_id: orderRes.orderId,
              handler: async function (response: {
                razorpay_order_id: string;
                razorpay_payment_id: string;
                razorpay_signature: string;
              }) {
                const verifyRes = await verifyTopUp({
                  order_id: response.razorpay_order_id,
                  payment_id: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  packId: pack.id,
                });

                if (verifyRes.success) {
                  setFeedback({
                    type: 'success',
                    message: `Payment successful. Added ${orderRes.credits} credits to your wallet. Balance: ${verifyRes.newBalance} CR`,
                  });
                  setSelectedPack(null);
                  router.refresh();
                } else {
                  setFeedback({
                    type: 'error',
                    message: verifyRes.error || 'Payment signature verification failed.',
                  });
                }
              },
              prefill: {
                name: userProfile?.contact_name || userProfile?.company_name || 'Travel Partner',
                email: userProfile?.email || '',
                contact: userProfile?.phone || '',
              },
              theme: {
                color: '#0B0F14',
              },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (err: any) {
              setFeedback({
                type: 'error',
                message: err.error?.description || 'Payment was declined or cancelled.',
              });
            });
            rzp.open();
            return;
          }
        }

        // 2. Demo Top-Up Flow (Graceful degradation when Razorpay unconfigured)
        const paymentRef = `DEMO-${typeof window !== 'undefined' && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 12)}`;
        
        // Execute server action which invokes SECURITY DEFINER wallet_topup_credit RPC
        const res = await demoTopUpCredits({
          packId: pack.id,
          paymentRef,
        });

        if (res.success) {
          setFeedback({
            type: 'success',
            message: `Demo top-up successful. Added ${pack.credits} credits to your wallet. New balance: ${res.newBalance} CR`,
          });
          setSelectedPack(null);
          router.refresh();
        } else {
          // Direct fallback attempt via client supabase RPC if server action encountered issues
          if (userId) {
            const supabase = createClient();
            const { data: rpcData, error: rpcError } = await (supabase as any).rpc('wallet_topup_credit', {
              p_profile_id: userId,
              p_credits: pack.credits,
              p_amount_inr: pack.price_inr,
              p_payment_ref: paymentRef,
            });

            if (!rpcError && rpcData?.success) {
              setFeedback({
                type: 'success',
                message: `Demo top-up successful. Added ${pack.credits} credits to your wallet. New balance: ${rpcData.new_balance} CR`,
              });
              setSelectedPack(null);
              router.refresh();
              return;
            }
          }

          setFeedback({
            type: 'error',
            message: res.error || 'Failed to complete credit purchase.',
          });
        }
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err.message || 'An unexpected error occurred during top-up.',
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-[12px] border flex items-center justify-between text-xs transition-all duration-200 ${
            feedback.type === 'success'
              ? 'border-[#10B981]/30 bg-[#10B981]/10 text-[var(--text-primary)]'
              : 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm px-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Dismiss alert"
          >
            ×
          </button>
        </div>
      )}

      {/* Available Credit Packs Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Credit Packs (Instant Top-Up)
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Current balance: <strong className="text-[#D4B483] font-mono">{balance} CR</strong>. 5 credits required per unlocked verified DMC connection.
            </p>
          </div>

          {!isRazorpayConfigured && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-line)] text-[11px] text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[#D4B483] shrink-0" />
              <span>Demo simulation mode active. Wire transfer: contact ops to top up.</span>
            </div>
          )}
        </div>

        {/* Pricing Cards: Shape consistency with differentiated highlighted tier */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {packs.map((pack) => {
            const gstAmount = Math.round((pack.price_inr * (pack.gst_rate || 18)) / 100);
            const totalInr = pack.price_inr + gstAmount;
            const isFeatured = pack.credits === 20; // Growth Pack highlighted
            const isHighTier = pack.credits === 50; // Scale Pack

            return (
              <Card
                key={pack.id}
                className={`p-6 bg-[var(--bg-card)] rounded-[12px] flex flex-col justify-between gap-6 transition-all duration-160 relative ${
                  isFeatured
                    ? 'border-2 border-[#D4B483] shadow-md'
                    : 'border border-[var(--border-line)] hover:border-[#D4B483]/40'
                }`}
              >
                {/* Highlight ribbon for non-equal card visual hierarchy */}
                {isFeatured && (
                  <div className="absolute -top-3 left-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#D4B483] text-[#0B0F14] shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                      {pack.name}
                    </span>
                    <Badge variant={isFeatured ? 'gold' : isHighTier ? 'verified' : 'neutral'} className="text-xs font-mono font-bold">
                      {pack.credits} CREDITS
                    </Badge>
                  </div>

                  <div>
                    <div className="text-3xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                      <Money amount={pack.price_inr} />
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)] font-mono block mt-1">
                      +18% GST (Total: <Money amount={totalInr} />)
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3">
                    Unlocks {Math.floor(pack.credits / 5)} direct verified DMC connections with company credentials and deal workflows.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    variant={isFeatured ? 'primary' : 'outline'}
                    size="md"
                    onClick={() => handlePurchaseClick(pack)}
                    className="w-full gap-2 font-semibold min-h-[44px]"
                  >
                    {isRazorpayConfigured ? (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Buy {pack.credits} Credits</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#D4B483]" />
                        <span>Demo Top-Up ({pack.credits} CR)</span>
                      </>
                    )}
                  </Button>
                </div>
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

          <Card className="p-0 overflow-hidden bg-[var(--bg-card)] border border-[var(--border-line)] rounded-[12px]">
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
                  className="p-5 border border-[var(--border-line)] bg-[var(--bg-card)] rounded-[12px] space-y-3"
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
        title={isRazorpayConfigured ? `Purchase ${selectedPack?.name}` : `Demo Top-Up: ${selectedPack?.name}`}
        description={
          isRazorpayConfigured
            ? 'Instant credit pack recharge with automated tax invoice generation.'
            : 'Simulated top-up path. Grants real double-entry credits immediately for testing.'
        }
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => setSelectedPack(null)}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isPending}
              onClick={confirmPurchase}
              className="gap-1.5 font-semibold min-h-[44px]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>
                {isRazorpayConfigured
                  ? 'Proceed to Checkout'
                  : `Confirm Demo Top-Up (+${selectedPack?.credits} CR)`}
              </span>
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
                <span>+<Money amount={Math.round((selectedPack.price_inr * (selectedPack.gst_rate || 18)) / 100)} /></span>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-sm font-bold text-[var(--text-primary)]">
                <span>Total Invoice:</span>
                <span className="text-[#D4B483]">
                  <Money amount={selectedPack.price_inr + Math.round((selectedPack.price_inr * (selectedPack.gst_rate || 18)) / 100)} />
                </span>
              </div>
            </div>

            <div className="p-3 rounded-[9px] bg-[var(--bg-card)] border border-[var(--border-line)] text-xs font-sans text-[var(--text-secondary)] space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Double-Entry Bookkeeping Assurance</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Credits are issued instantly to your dedicated agent wallet with double-entry platform revenue balancing and tamper-proof ledger auditing.
              </p>
              {!isRazorpayConfigured && (
                <p className="leading-relaxed text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
                  Live payment gateway unconfigured. Operating in test mode. For direct invoice or wire recharge, contact ops at <span className="font-mono text-[var(--text-primary)]">ops@dmcgrid.com</span>.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

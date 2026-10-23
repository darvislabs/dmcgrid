'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Modal } from '@dmcgrid/ui';
import { unlockConnectionAction } from '../actions';
import {
  Users,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Unlock,
  ExternalLink,
  FilePlus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ConnectionItem {
  id: string;
  unlocked_at: string;
  credit_amount_deducted: number;
  rfq?: {
    id: string;
    rfq_number: string;
    title: string;
  } | null;
  quote?: {
    id: string;
    quote_number: string;
    total_net_cost: number;
  } | null;
  dmc: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone?: string | null;
    bio?: string | null;
    operating_destinations?: string[] | null;
    kyc_status: string;
  };
}

interface AvailableDmc {
  id: string;
  company_name: string;
  operating_destinations?: string[] | null;
  bio?: string | null;
  kyc_status: string;
}

export function ConnectionsView({
  connections,
  availableDmcs,
  userCredits = 20,
}: {
  connections: ConnectionItem[];
  availableDmcs: AvailableDmc[];
  userCredits?: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [unlockTarget, setUnlockTarget] = useState<AvailableDmc | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const confirmUnlock = () => {
    if (!unlockTarget) return;

    startTransition(async () => {
      const res = await unlockConnectionAction({
        dmcId: unlockTarget.id,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Direct channel unlocked with ${unlockTarget.company_name}! 5 credits debited from your wallet.`,
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

  return (
    <div className="space-y-8">
      {/* Feedback Toast */}
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

      {/* Unlocked Partners Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Direct DMC Partnerships ({connections.length})
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Unlocked suppliers with direct contact details for off-grid negotiation.
            </p>
          </div>
        </div>

        {connections.length === 0 ? (
          <Card className="py-12 text-center space-y-3 bg-[var(--bg-card)]">
            <Users className="w-8 h-8 text-[#D4B483] mx-auto opacity-70" />
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">No Connections Unlocked Yet</h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              When you receive competitive quotes on your RFQ briefs, unlock the DMC identity for 5 credits to establish permanent direct communication.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {connections.map((conn) => (
              <Card
                key={conn.id}
                className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)] hover:border-[#D4B483]/40 transition-colors flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  {/* Partner Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#0EA5A3]" />
                        <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                          {conn.dmc.company_name}
                        </h3>
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] font-medium">
                        Primary Specialist: {conn.dmc.contact_name}
                      </span>
                    </div>

                    <Badge variant="verified">
                      <ShieldCheck className="w-3 h-3" />
                      <span>KYC VERIFIED</span>
                    </Badge>
                  </div>

                  {/* Bio */}
                  {conn.dmc.bio && (
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {conn.dmc.bio}
                    </p>
                  )}

                  {/* Contact Channels */}
                  <div className="p-3 rounded-[9px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-[var(--text-primary)]">
                      <Mail className="w-3.5 h-3.5 text-[#D4B483]" />
                      <a
                        href={`mailto:${conn.dmc.email}`}
                        className="hover:underline truncate"
                      >
                        {conn.dmc.email}
                      </a>
                    </div>
                    {conn.dmc.phone && (
                      <div className="flex items-center gap-2 text-[var(--text-primary)]">
                        <Phone className="w-3.5 h-3.5 text-[#10B981]" />
                        <a
                          href={`tel:${conn.dmc.phone}`}
                          className="hover:underline"
                        >
                          {conn.dmc.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Operating Coverage */}
                  {conn.dmc.operating_destinations && conn.dmc.operating_destinations.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">
                        Destinations Covered:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {conn.dmc.operating_destinations.map((d) => (
                          <span
                            key={d}
                            className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-line)] text-[11px] text-[var(--text-secondary)] font-mono"
                          >
                            <MapPin className="w-2.5 h-2.5 inline mr-1 text-[#0EA5A3]" />
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Associated RFQ / Quote */}
                  {conn.rfq && (
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                      <span className="text-[var(--text-muted)] text-[11px]">Origin Brief:</span>
                      <Link
                        href={`/rfq/${conn.rfq.id}`}
                        className="text-[#D4B483] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>{conn.rfq.rfq_number}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Unlocked {new Date(conn.unlocked_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link href="/rfq/new">
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                        <FilePlus className="w-3.5 h-3.5" />
                        <span>Send New RFQ</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Available DMC Network to Unlock */}
      {availableDmcs.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[var(--border-line)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                Network Specialists (Available to Unlock)
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Verified destination management companies holding regional commercial licenses.
              </p>
            </div>
            <span className="font-mono text-xs text-[#D4B483]">
              Cost: 5 Credits / Unlock
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDmcs.map((dmc) => (
              <Card
                key={dmc.id}
                className="p-5 border border-[var(--border-line)] bg-[var(--bg-card)] flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-[var(--text-primary)]">
                      {dmc.company_name}
                    </span>
                    <Badge variant="verified" className="text-[10px]">
                      VERIFIED DMC
                    </Badge>
                  </div>
                  {dmc.bio && (
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {dmc.bio}
                    </p>
                  )}
                  {dmc.operating_destinations && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {dmc.operating_destinations.map((d) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[10px] font-mono text-[var(--text-secondary)]"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="font-mono text-xs text-[var(--text-muted)]">
                    Unlock: 5 Credits
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setUnlockTarget(dmc)}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlock Channel</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!unlockTarget}
        onClose={() => setUnlockTarget(null)}
        title="Unlock Verified DMC Channel"
        description="Debits credits from your wallet via atomic single-transaction ledger entry."
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
              <Unlock className="w-3.5 h-3.5" />
              <span>Confirm Unlock (5 Credits)</span>
            </Button>
          </>
        }
      >
        {unlockTarget && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3.5 rounded-[9px] bg-[var(--bg-surface)] border border-[var(--border-line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Partner:</span>
                <span className="font-bold text-[var(--text-primary)] font-sans">{unlockTarget.company_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Available Balance:</span>
                <span className="font-bold text-[#D4B483]">{userCredits} Credits</span>
              </div>
              <div className="flex items-center justify-between text-[#EF4444]">
                <span>Transaction Debit:</span>
                <span>-5 Credits</span>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[var(--text-primary)] font-bold">
                <span>Remaining Balance:</span>
                <span className="text-[#10B981]">{Math.max(0, userCredits - 5)} Credits</span>
              </div>
            </div>

            <p className="text-xs font-sans text-[var(--text-secondary)] leading-relaxed">
              Unlocking reveals full verified business registration details, direct phone numbers, and messaging channels in compliance with DMCGrid platform rules.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

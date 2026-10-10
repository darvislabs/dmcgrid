'use client';

import React from 'react';
import { Card, Button, Badge, StatCard } from '@dmcgrid/ui';
import { ShieldCheck, Coins, Users, CheckCircle, XCircle, Scale } from 'lucide-react';

export default function AdminPage() {
  const pendingKyc = [
    {
      id: 'kyc-01',
      company: 'Zenith Luxury Journeys LLP',
      type: 'Travel Agent',
      regId: 'GSTIN: 27AABCT3419K1ZV',
      contact: 'Rajesh Mehta (Mumbai)',
      submitted: '2 hours ago',
    },
    {
      id: 'kyc-02',
      company: 'Siam Horizon D.M.C. Ltd',
      type: 'Foreign DMC (Thailand)',
      regId: 'DBD: 0105562098412',
      contact: 'Somchai Prasert (Bangkok)',
      submitted: '5 hours ago',
    },
    {
      id: 'kyc-03',
      company: 'Vedic Trails Private Limited',
      type: 'Travel Agent',
      regId: 'GSTIN: 07AAACV4981L1Z9',
      contact: 'Pooja Sharma (Delhi)',
      submitted: 'Yesterday',
    },
  ];

  const auditEvents = [
    {
      id: 'aud-01',
      actor: 'system_cron',
      role: 'system',
      action: 'sla_timer_check',
      target: 'rfq_matches',
      time: '10 mins ago',
      details: 'Evaluated 28 active RFQs · 0 expired',
    },
    {
      id: 'aud-02',
      actor: 'agent_user_882',
      role: 'agent',
      action: 'unlock_connection',
      target: 'conn_7741',
      time: '34 mins ago',
      details: 'Debited 5 CR · Minted connection to Siam Horizon',
    },
    {
      id: 'aud-03',
      actor: 'admin_ops_01',
      role: 'admin',
      action: 'approve_kyc',
      target: 'profile_9912',
      time: '1 hour ago',
      details: 'Verified GSTIN and PAN document audit',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Portal Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase">
              GOLDEN CIRCLE PLATFORM OPS
            </span>
            <Badge variant="gold">ADMIN GOVERNANCE</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Platform Master Operations
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Realtime compliance monitoring, KYC verification gate, double-entry ledger invariant checks, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" className="py-1 px-3">
            ● ALL SYSTEMS OPERATIONAL
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Platform Sourcing GMV"
          value={18420000}
          isCurrency={true}
          delta={{ value: "+22% this week", isPositive: true }}
          icon={<Coins className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Pending KYC Queue"
          value={3}
          delta={{ value: "SLA < 12 hrs", isPositive: true }}
          icon={<ShieldCheck className="w-4 h-4 text-[#F59E0B]" />}
        />
        <StatCard
          label="Active Connected Deals"
          value={38}
          icon={<Users className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Credit Reserve Pool"
          value="1,420 CR"
          icon={<Scale className="w-4 h-4 text-[#0EA5A3]" />}
        />
      </div>

      {/* Double-Entry Ledger Invariant Status */}
      <Card className="p-6 border border-[#10B981]/30 bg-[#10B981]/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-[var(--text-primary)]">
                Double-Entry Accounting Invariant: Balanced (100.00%)
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Total Debits (12,850 CR) = Total Credits (12,850 CR) across system_reserve, agent_wallet, and platform_revenue.
              </p>
            </div>
          </div>
          <Badge variant="success">INVARIANT VERIFIED</Badge>
        </div>
      </Card>

      {/* KYC Verification Queue (PRD Compliance R5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Pending KYC Verification Gate
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              PRD Rule R5: Every brief is verified. Review government registration and tax documents before first RFQ.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            3 Pending
          </span>
        </div>

        <div className="rounded-[14px] border border-[var(--border-line)] bg-[var(--bg-card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-secondary)] font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reg / Tax ID</th>
                  <th className="py-3 px-4">Primary Contact</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                {pendingKyc.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      {item.company}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral">{item.type}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">
                      {item.regId}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {item.contact}
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                      {item.submitted}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button variant="primary" size="sm" className="h-7 text-[11px] gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Approve</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-[11px] text-[#EF4444]">
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Table (PRD Compliance R2) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Server-Side Audit Stream (Rule R2)
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Strictly immutable log of actor actions, approvals, and financial ledger transitions
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Live Stream
          </span>
        </div>

        <div className="rounded-[14px] border border-[var(--border-line)] bg-[var(--bg-card)] overflow-hidden font-mono text-xs">
          <div className="divide-y divide-[var(--border-subtle)]">
            {auditEvents.map((evt) => (
              <div key={evt.id} className="p-3.5 flex items-center justify-between hover:bg-[var(--bg-card-hover)] transition-colors">
                <div className="flex items-center gap-3">
                  <Badge variant={evt.role === 'admin' ? 'gold' : evt.role === 'system' ? 'neutral' : 'verified'}>
                    {evt.actor}
                  </Badge>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {evt.action}
                  </span>
                  <span className="text-[var(--text-muted)] text-[11px]">
                    → {evt.details}
                  </span>
                </div>
                <div className="text-[var(--text-muted)] text-[11px] shrink-0">
                  {evt.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

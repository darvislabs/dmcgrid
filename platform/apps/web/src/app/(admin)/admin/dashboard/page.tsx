'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, StatCard } from '@dmcgrid/ui';
import { ShieldCheck, Check, X, FileText, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const pendingKyc = [
    {
      id: 'KYC-8821',
      entityName: 'Apex Journeys India Pvt Ltd',
      role: 'agent',
      docType: 'GSTIN + IATA Certificate',
      regNo: '27AABCA1234F1Z8',
      submittedAt: 'Today, 09:15 AM',
    },
    {
      id: 'KYC-8822',
      entityName: 'Bali Serenity DMC',
      role: 'dmc',
      docType: 'Ministry of Tourism License',
      regNo: 'ID-BALI-9921',
      submittedAt: 'Today, 10:40 AM',
    },
    {
      id: 'KYC-8823',
      entityName: 'Alps Escapes Gmbh',
      role: 'dmc',
      docType: 'Swiss Commercial Register',
      regNo: 'CHE-112.443.992',
      submittedAt: 'Yesterday',
    },
  ];

  const recentAuditEvents = [
    {
      id: 'AUD-901',
      actor: 'ops_admin@dmcgrid.com',
      action: 'KYC_APPROVED',
      entity: 'profiles / user_9931',
      timestamp: '14 mins ago',
    },
    {
      id: 'AUD-902',
      actor: 'system_engine',
      action: 'DOUBLE_ENTRY_TRANSFER',
      entity: 'credit_ledger / txn_8832',
      timestamp: '28 mins ago',
    },
    {
      id: 'AUD-903',
      actor: 'agent_482@luxuryvoyages.in',
      action: 'CONNECT_UNLOCK',
      entity: 'connections / rfq_1048',
      timestamp: '1 hour ago',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase font-bold">
              Golden Circle Ops
            </span>
            <span className="h-1 w-1 rounded-full bg-[var(--text-subtle)]" />
            <span className="text-xs text-[var(--text-muted)] font-mono">Platform Governance Console</span>
          </div>
          <h1 className="text-3xl font-bold font-sans tracking-tight text-[var(--text)]">
            Platform Administration
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xl">
            Monitor verified counterparties, audit double-entry ledger transactions, and govern market compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" className="gap-2 text-xs font-mono">
            <Activity className="h-3.5 w-3.5" />
            <span>Health Metrics</span>
          </Button>
          <Button variant="primary" size="md" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Process Approvals</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Verified Agencies"
          value="142"
          delta="+8 this mo"
          subtext="Active demand network"
        />
        <StatCard
          label="Licensed DMCs"
          value="68"
          delta="+4 this mo"
          subtext="Across 26 destinations"
        />
        <StatCard
          label="Gross Deal Volume"
          value="₹2.84 Cr"
          subtext="Processed past 30 days"
        />
        <StatCard
          label="Pending KYC Queue"
          value="3"
          subtext="Awaiting admin approval"
        />
      </div>

      {/* KYC Review Queue */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)] font-sans">KYC Verification Review</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Rule R5: Every partner must complete KYC verification prior to publishing or receiving quotes.
            </p>
          </div>
          <Badge variant="warning" dot={true}>
            3 In Review
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]/60 text-[11px] font-mono uppercase tracking-wider text-[var(--text-subtle)]">
                <th className="py-3 px-6">Queue Ref</th>
                <th className="py-3 px-4">Entity Legal Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Registration ID</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
              {pendingKyc.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-subtle)]/40 transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-[var(--text)]">
                    {item.id}
                  </td>
                  <td className="py-4 px-4 font-bold text-[var(--text)]">
                    {item.entityName}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={item.role === 'agent' ? 'gold' : 'default'}>
                      {item.role}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-[var(--text-muted)] flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-[#D4B483]" />
                    <span>{item.docType}</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-[var(--text)]">
                    {item.regNo}
                  </td>
                  <td className="py-4 px-4 font-mono text-[11px] text-[var(--text-subtle)]">
                    {item.submittedAt}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="primary" size="sm" className="h-8 px-3 text-xs gap-1">
                        <Check className="h-3.5 w-3.5" />
                        <span>Verify</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Log Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <CardTitle>System Audit Log</CardTitle>
              <span className="font-mono text-[10px] uppercase text-[#D4B483]">Immutable Trail</span>
            </div>
            <CardDescription>
              Rule R2: All administrative changes, KYC validations, and ledger adjustments are recorded permanently with actor stamps.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="divide-y divide-[var(--border-subtle)]">
              {recentAuditEvents.map((ev) => (
                <div key={ev.id} className="py-3 flex items-center justify-between text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[#D4B483] font-bold">{ev.action}</span>
                      <span className="text-[var(--text-subtle)]">·</span>
                      <span className="text-[var(--text)]">{ev.entity}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-subtle)]">
                      By {ev.actor}
                    </div>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {ev.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ledger Balance Card */}
        <Card className="flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider font-semibold">
              Double-Entry Reserve
            </span>
            <h3 className="font-bold text-base text-[var(--text)] font-sans">
              System Credit Ledger
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Every platform credit grant or burn is stored with balanced balancing entries (User Wallet vs Platform Reserve).
            </p>
          </div>

          <div className="p-3.5 rounded-[9px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-subtle)]">Active Circulating:</span>
              <span className="font-bold text-[var(--text)]">4,820 cr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-subtle)]">Platform Revenue:</span>
              <span className="font-bold text-[#10B981]">1,140 cr</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

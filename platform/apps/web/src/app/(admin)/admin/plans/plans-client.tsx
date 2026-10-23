'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, StatCard, Money } from '@dmcgrid/ui';
import { savePlanAction } from '../actions';
import type { Plan } from '@dmcgrid/db';
import {
  Wallet,
  Plus,
  Edit2,
  Check,
  Sparkles,
  Coins,
  Trash2
} from 'lucide-react';

interface PlansClientProps {
  plans: Plan[];
}

export function PlansClient({ plans: initialPlans }: PlansClientProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form Fields
  const [planCode, setPlanCode] = useState('');
  const [name, setName] = useState('');
  const [monthlyLeads, setMonthlyLeads] = useState<number>(20);
  const [priceInr, setPriceInr] = useState<number>(2499);
  const [description, setDescription] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  const openCreateModal = () => {
    setEditingPlan(null);
    setPlanCode('');
    setName('');
    setMonthlyLeads(20);
    setPriceInr(2499);
    setDescription('');
    setFeaturesList([
      'Verified DMC connections per month',
      'AI brief copilot extraction',
      'Traveler proposal share links',
      'SLA response timer guarantees',
    ]);
    setIsActive(true);
    setActionError(null);
    setActionSuccess(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Plan) => {
    setEditingPlan(p);
    setPlanCode(p.plan_code);
    setName(p.name);
    setMonthlyLeads(p.monthly_leads_included);
    setPriceInr(Number(p.price_inr));
    setDescription(p.description || '');
    let feats: string[] = [];
    if (Array.isArray(p.features)) {
      feats = p.features as string[];
    } else if (typeof p.features === 'string') {
      try {
        feats = JSON.parse(p.features);
      } catch {
        feats = [];
      }
    }
    setFeaturesList(feats);
    setIsActive(p.is_active);
    setActionError(null);
    setActionSuccess(null);
    setIsModalOpen(true);
  };

  const handleToggleActive = (p: Plan) => {
    const nextState = !p.is_active;
    startTransition(async () => {
      const res = await savePlanAction({
        planId: p.id,
        isActive: nextState,
      });

      if (!res.success) {
        alert(res.error || 'Failed to toggle plan status');
      } else {
        setPlans((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, is_active: nextState } : item))
        );
      }
    });
  };

  const handleSavePlan = () => {
    if (!planCode.trim() || !name.trim()) {
      setActionError('Plan code and plan name are required.');
      return;
    }
    if (priceInr < 0 || monthlyLeads <= 0) {
      setActionError('Price must be non-negative and credits must be at least 1.');
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await savePlanAction({
        planId: editingPlan ? editingPlan.id : null,
        planCode: planCode.trim().toUpperCase(),
        name: name.trim(),
        monthlyLeads,
        priceInr,
        description: description.trim(),
        features: featuresList,
        isActive,
      });

      if (!res.success) {
        setActionError(res.error || 'Failed to save plan.');
      } else {
        setActionSuccess(editingPlan ? 'Plan successfully updated!' : 'New plan tier created!');
        setTimeout(() => {
          setIsModalOpen(false);
          setActionSuccess(null);
        }, 1000);
      }
    });
  };

  const addFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeaturesList([...featuresList, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const removeFeature = (idx: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Subscription Tiers"
          value={plans.filter((p) => p.is_active).length}
          icon={<Wallet className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Starter Tier Price"
          value={999}
          isCurrency={true}
          icon={<Coins className="w-4 h-4 text-[#D4B483]" />}
        />
        <StatCard
          label="Growth Tier Price"
          value={2499}
          isCurrency={true}
          icon={<Coins className="w-4 h-4 text-[#10B981]" />}
        />
        <StatCard
          label="Scale Enterprise Price"
          value={9999}
          isCurrency={true}
          icon={<Sparkles className="w-4 h-4 text-[#D4B483]" />}
        />
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            Subscription Tier Configurations
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Configure platform plans, included monthly connection credits, pricing, and feature matrices.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-page)] rounded-[9px] text-xs font-semibold hover:opacity-90 active:scale-[0.97] transition-all min-h-[44px] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-w-0">
        {plans.map((plan) => {
          let feats: string[] = [];
          if (Array.isArray(plan.features)) {
            feats = plan.features as string[];
          } else if (typeof plan.features === 'string') {
            try {
              feats = JSON.parse(plan.features);
            } catch {
              feats = [];
            }
          }

          return (
            <Card
              key={plan.id}
              className={`bg-[var(--bg-card)] border transition-all flex flex-col justify-between min-w-0 rounded-[12px] ${
                plan.is_active
                  ? 'border-[var(--border-line)] hover:border-[#D4B483]/60'
                  : 'border-[var(--border-subtle)] opacity-60'
              }`}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] tracking-wider text-[#D4B483] uppercase">
                    CODE: {plan.plan_code}
                  </span>
                  <Badge variant={plan.is_active ? 'verified' : 'gold'}>
                    {plan.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold font-display text-[var(--text-primary)]">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-xs text-[var(--text-secondary)] min-h-[32px] line-clamp-2">
                  {plan.description || 'Tier subscription plan.'}
                </CardDescription>

                {/* Price Display */}
                <div className="pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                      <Money amount={Number(plan.price_inr)} />
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">/ MONTH</span>
                  </div>
                  <div className="font-mono text-xs text-[#D4B483] font-semibold mt-1">
                    {plan.monthly_leads_included} Credits Included / mo
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between space-y-4">
                {/* Features List */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="font-mono text-[10px] uppercase text-[var(--text-muted)] tracking-wider">
                    Plan Features:
                  </div>
                  <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                    {feats.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Controls */}
                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(plan)}
                    disabled={isPending}
                    className={`px-3 py-2 text-xs font-mono rounded-[6px] border min-h-[40px] transition-colors cursor-pointer ${
                      plan.is_active
                        ? 'border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10'
                        : 'border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10'
                    }`}
                  >
                    {plan.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEditModal(plan)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-[6px] border border-[var(--border-line)] text-[var(--text-primary)] hover:border-[#D4B483] hover:bg-[#D4B483]/10 min-h-[40px] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-[#D4B483]" />
                    <span>Edit Tier</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create / Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-line)] rounded-[12px] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[var(--border-line)]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4B483]">
                  SUBSCRIPTION PLAN BUILDER
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  {editingPlan ? `Edit ${editingPlan.name}` : 'Create Subscription Plan'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Plan Code <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value.toUpperCase())}
                    placeholder="e.g. GROWTH_PLUS"
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] font-mono rounded-[9px] p-2.5 min-h-[44px] focus:outline-none focus:border-[#D4B483]"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Plan Display Name <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Growth Plus Plan"
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] p-2.5 min-h-[44px] focus:outline-none focus:border-[#D4B483]"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Monthly Credits Included <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={monthlyLeads}
                    onChange={(e) => setMonthlyLeads(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] font-mono rounded-[9px] p-2.5 min-h-[44px] focus:outline-none focus:border-[#D4B483]"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Price in INR (₹) <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={priceInr}
                    onChange={(e) => setPriceInr(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] font-mono rounded-[9px] p-2.5 min-h-[44px] focus:outline-none focus:border-[#D4B483]"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of who this plan is tailored for..."
                  rows={2}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] p-2.5 focus:outline-none focus:border-[#D4B483]"
                  disabled={isPending}
                />
              </div>

              {/* Features Array JSON / List */}
              <div className="space-y-2">
                <label className="block font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Plan Features Matrix
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    placeholder="Add feature bullet (e.g. '24/7 priority sourcing desk')..."
                    className="flex-1 bg-[var(--bg-page)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] rounded-[9px] p-2 min-h-[40px] focus:outline-none focus:border-[#D4B483]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3 py-2 bg-[var(--bg-page)] border border-[var(--border-line)] hover:border-[#D4B483] text-[var(--text-primary)] text-xs font-mono rounded-[9px] min-h-[40px] cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {featuresList.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs"
                    >
                      <span className="text-[var(--text-primary)] truncate max-w-[360px]">{f}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-[var(--text-muted)] hover:text-[#EF4444] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="plan-active-check"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-[var(--border-line)] text-[#D4B483] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="plan-active-check" className="font-mono text-xs text-[var(--text-primary)] cursor-pointer">
                  Active (available for purchase by verified travel agents)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-line)]">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={isPending}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={handleSavePlan}
                disabled={isPending}
                className="min-h-[44px]"
              >
                {isPending ? 'Saving Plan...' : editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

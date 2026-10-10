'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Select, Badge } from '@dmcgrid/ui';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function NewRfqWizardPage() {
  const [step, setStep] = useState(1);
  const [aiPasted, setAiPasted] = useState(
    'Need a 7-night Thailand trip for a young couple. Want 3 nights Bangkok 5-star riverside and 4 nights Phuket beachfront villa with private pool. Must include Phi Phi island private tour and airport transfers. Travel dates mid November. Budget roughly 2.8 to 3.2 Lakhs.'
  );

  // Form states
  const [formData, setFormData] = useState({
    pax: '2 Adults (Couple)',
    destinations: 'Bangkok (3N) + Phuket (4N)',
    startDate: '2026-11-12',
    nights: 7,
    pacing: 'Moderate',
    hotelCategory: '5-Star Luxury & Pool Villa',
    mealPlan: 'CP (Bed & Breakfast)',
    experiences: 'Private Phi Phi Speedboat, Bangkok Temples, Airport Transfers',
    budgetMin: '280000',
    budgetMax: '320000',
  });

  const steps = [
    { num: 1, name: 'Travelers' },
    { num: 2, name: 'Destination' },
    { num: 3, name: 'Dates & Pacing' },
    { num: 4, name: 'Stays' },
    { num: 5, name: 'Experiences' },
    { num: 6, name: 'Budget & Review' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Wizard Header */}
      <div className="pb-6 border-b border-[var(--border-line)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase">
              WAVE 1 RFQ BUILDER
            </span>
            <Badge variant="gold">6-STEP WIZARD</Badge>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Create Verified RFQ Brief
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Structured RFQs receive competitive quotes 4x faster from licensed local DMCs.
          </p>
        </div>

        <Link href="/">
          <Button variant="ghost" size="sm">
            Cancel
          </Button>
        </Link>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-6 gap-2">
        {steps.map((s) => (
          <div key={s.num} className="space-y-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s.num <= step ? 'bg-[#D4B483]' : 'bg-[var(--border-line)]'
              }`}
            />
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span className={s.num === step ? 'text-[#D4B483] font-bold' : 'text-[var(--text-muted)]'}>
                0{s.num}
              </span>
              <span className="hidden sm:inline text-[var(--text-secondary)] truncate">
                {s.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Extraction Banner (PRD Line 26) */}
      <Card className="p-4 border border-[#D4B483]/30 bg-[#D4B483]/5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-[#D4B483]/20 shrink-0">
            <Sparkles className="w-4 h-4 text-[#D4B483]" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-display font-semibold text-xs text-[var(--text-primary)]">
                AI Brief Extraction Active (Confidence Score: 0.94)
              </span>
              <Badge variant="verified">FIELDS PRE-FILLED</Badge>
            </div>
            <textarea
              value={aiPasted}
              onChange={(e) => setAiPasted(e.target.value)}
              className="w-full text-xs font-mono p-2 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-line)] text-[var(--text-secondary)] resize-none h-16 focus:outline-none focus:border-[#D4B483]"
              placeholder="Paste raw WhatsApp text, email, or client notes..."
            />
            <p className="text-[11px] text-[var(--text-muted)]">
              All parsed fields are editable below. Adjust values before publishing to matched DMCs.
            </p>
          </div>
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)]">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
              Step 1: Traveler Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="TRAVELER COUNT & COMPOSITION"
                value={formData.pax}
                onChange={(e) => setFormData({ ...formData, pax: e.target.value })}
              />
              <Select label="TRIP TYPE">
                <option>Couples / Honeymoon</option>
                <option>Family with Children</option>
                <option>Friends Group</option>
                <option>Solo Traveler</option>
                <option>Corporate MICE</option>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
              Step 2: Destination & Route
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="DESTINATIONS & CITIES"
                value={formData.destinations}
                onChange={(e) => setFormData({ ...formData, destinations: e.target.value })}
              />
              <Select label="PRIMARY COUNTRY">
                <option>Thailand</option>
                <option>Vietnam</option>
                <option>Indonesia (Bali)</option>
                <option>Singapore & Malaysia</option>
                <option>Dubai & UAE</option>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
              Step 3: Dates & Travel Pacing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="date"
                label="START DATE"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <Input
                type="number"
                label="DURATION (NIGHTS)"
                value={formData.nights}
                onChange={(e) => setFormData({ ...formData, nights: Number(e.target.value) })}
              />
              <Select label="TRAVEL PACING">
                <option>Moderate (Balanced)</option>
                <option>Relaxed (Leisure first)</option>
                <option>Packed (Max sightseeing)</option>
              </Select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
              Step 4: Stays & Hotel Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="HOTEL PREFERENCE"
                value={formData.hotelCategory}
                onChange={(e) => setFormData({ ...formData, hotelCategory: e.target.value })}
              />
              <Select label="MEAL PLAN">
                <option>CP (Room & Breakfast)</option>
                <option>MAP (Breakfast & Dinner)</option>
                <option>AP (All Meals Included)</option>
                <option>EP (Room Only)</option>
              </Select>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
              Step 5: Curated Experiences
            </h3>
            <div>
              <Input
                label="EXPERIENCE HIGHLIGHTS (COMMAS SEPARATED)"
                value={formData.experiences}
                onChange={(e) => setFormData({ ...formData, experiences: e.target.value })}
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5 font-mono">
                DMCs will match private local activities against these confirmed highlights.
              </p>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
              Step 6: Target Budget & Brief Review
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="TARGET MIN BUDGET (₹ INR)"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
              />
              <Input
                label="TARGET MAX BUDGET (₹ INR)"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
              />
            </div>

            <div className="p-4 rounded-[9px] bg-[var(--bg-surface)] border border-[var(--border-line)] text-xs space-y-2">
              <div className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider">
                Summary of Published Brief
              </div>
              <div className="grid grid-cols-2 gap-2 text-[var(--text-secondary)]">
                <div>Route: <b className="text-[var(--text-primary)]">{formData.destinations}</b></div>
                <div>Dates: <b className="text-[var(--text-primary)]">{formData.startDate} ({formData.nights}N)</b></div>
                <div>Travelers: <b className="text-[var(--text-primary)]">{formData.pax}</b></div>
                <div>Budget: <b className="text-[#D4B483] font-mono">₹2,80,000 - ₹3,20,000</b></div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </Button>

          {step < 6 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStep(step + 1)}
              className="gap-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Link href="/">
              <Button variant="primary" size="sm" className="gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish RFQ & Notify DMCs</span>
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}

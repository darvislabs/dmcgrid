'use client';

import React from 'react';
import { Card, Badge, Money, Button } from '@dmcgrid/ui';
import { ThemeToggle } from '@/components/theme-toggle';
import { DmcMark } from '@/components/brand-symbols';
import { Calendar, MapPin, Check, Users, Phone, Download } from 'lucide-react';

export default function TravelerSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const unwrappedParams = React.use(params);
  const token = unwrappedParams.token;

  const itineraryDays = [
    {
      day: 1,
      title: 'Arrival in Bangkok & Private Transfer',
      desc: 'Warm arrival at Suvarnabhumi Airport. Private luxury transfer to Bangkok Riverside 5-Star Hotel. Evening leisure along the Chao Phraya riverfront.',
      stay: 'The Peninsula Bangkok · Deluxe River View',
    },
    {
      day: 2,
      title: 'Grand Palace, Wat Pho & Private Longtail Canal Tour',
      desc: 'Private guided morning exploration of the Grand Palace and the Temple of the Reclining Buddha. Afternoon private teakwood boat through Thonburi canals.',
      stay: 'The Peninsula Bangkok · Deluxe River View',
    },
    {
      day: 3,
      title: 'Transfer to Phuket & Island Sunset',
      desc: 'Private airport transfer and domestic flight to Phuket. Private check-in at beachfront resort in Kata Rocks. Sunset cocktails overlooking the Andaman Sea.',
      stay: 'Kata Rocks Phuket · Ocean Pool Villa',
    },
    {
      day: 4,
      title: 'Private Phi Phi Island Yacht Experience',
      desc: 'Exclusive private catamaran charter to Maya Bay, Pileh Lagoon, and Bamboo Island. Crystal snorkeling, gourmet lunch on board, and secluded cove swim.',
      stay: 'Kata Rocks Phuket · Ocean Pool Villa',
    },
    {
      day: 5,
      title: 'Leisure Day & Traditional Thai Spa',
      desc: 'A relaxed day at your own pace with a complimentary 90-minute signature herbal compress massage at the sanctuary spa.',
      stay: 'Kata Rocks Phuket · Ocean Pool Villa',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Traveler Header */}
      <header className="border-b border-[var(--border-line)] bg-[var(--bg-card)] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DmcMark className="w-5 h-6 text-[#D4B483]" />
            <div>
              <span className="font-display font-bold text-base tracking-tight text-[var(--text-primary)]">
                ZENITH TRAVEL
              </span>
              <span className="font-mono text-[9px] text-[var(--text-secondary)] block uppercase tracking-widest">
                Curated Proposal · Pattern D
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32">
              <ThemeToggle />
            </div>
            <Button variant="secondary" size="sm" onClick={() => window.print()} className="gap-1.5 hidden sm:inline-flex">
              <Download className="w-3.5 h-3.5" />
              <span>Save PDF</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Cover */}
      <section className="relative py-16 px-6 max-w-5xl mx-auto border-b border-[var(--border-line)]">
        <div className="max-w-2xl space-y-3">
          <Badge variant="gold">PRIVATE CUSTOM ITINERARY</Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
            Thailand: Kingdoms & Islands of Siam
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Prepared exclusively for you. 5 days of bespoke cultural immersion and private yacht discovery across Bangkok and Phuket.
          </p>
          <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D4B483]" />
              <span>Nov 18 - Nov 23, 2026 (5 Days / 4 Nights)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#D4B483]" />
              <span>2 Travelers · Luxury Experience</span>
            </div>
          </div>
        </div>

        {/* Price Card */}
        <div className="mt-8 p-6 rounded-[14px] border border-[#D4B483]/30 bg-gradient-to-r from-[var(--bg-surface)] to-[var(--bg-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">
              TOTAL COMPREHENSIVE PACKAGE
            </span>
            <div className="text-3xl font-bold font-mono text-[#D4B483]">
              <Money amount={238760} />
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Includes all private transfers, 5-Star luxury stays, charters, and all taxes.
            </span>
          </div>
          <Button variant="primary" size="lg" className="font-bold">
            Accept & Confirm Itinerary
          </Button>
        </div>
      </section>

      {/* Day by Day Journey */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div>
          <span className="font-mono text-[10px] tracking-widest text-[#D4B483] uppercase block mb-1">
            DAY-BY-DAY CURATION
          </span>
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Your Bespoke Travel Experience
          </h2>
        </div>

        <div className="space-y-6">
          {itineraryDays.map((day) => (
            <Card key={day.day} className="p-6 border border-[var(--border-line)] bg-[var(--bg-card)]">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-mono text-sm font-bold text-[#D4B483]">
                  DAY {day.day}
                </span>
                <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                  {day.title}
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                {day.desc}
              </p>
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                <MapPin className="w-3.5 h-3.5 text-[#0EA5A3]" />
                <span>Stay: <strong className="text-[var(--text-primary)] font-sans">{day.stay}</strong></span>
              </div>
            </Card>
          ))}
        </div>

        {/* Inclusions */}
        <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-3">
              Included In Your Journey
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" />
                <span>All private airport & inter-city luxury transfers</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" />
                <span>4 Nights luxury accommodations with daily breakfast</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" />
                <span>Private catamaran day charter with snorkeling gear & lunch</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" />
                <span>Private English-speaking certified cultural guide</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div>
              <h4 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-2">
                Your Dedicated Travel Concierge
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Have special requests or flight adjustments? We are on standby 24/7 to personalize every moment.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div className="font-mono text-xs">
                <span className="text-[10px] text-[var(--text-muted)] block">VERIFIED TOKEN</span>
                <span className="text-[#D4B483]">{token}</span>
              </div>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>Contact Agent</span>
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-line)] py-8 text-center text-xs text-[var(--text-muted)] font-mono">
        Secured by DMCGrid Infrastructure · White-Label Client Proposal
      </footer>
    </div>
  );
}

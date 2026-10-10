'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, Button, Input, Badge, Money } from '@dmcgrid/ui';
import { submitQuoteAction } from '../../actions';
import {
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
} from 'lucide-react';

interface LineItemDraft {
  day_number: number;
  time_window: 'morning' | 'afternoon' | 'evening' | 'night';
  title: string;
  cost_category: string;
  net_cost: number;
}

interface OptionDraft {
  option_name: string;
  hotel_category: string;
  day_count: number;
  line_items: LineItemDraft[];
}

export function DmcQuoteBuilder({
  rfqId,
  rfqNumber,
  durationDays = 7,
  existingQuote,
}: {
  rfqId: string;
  rfqNumber: string;
  durationDays?: number;
  existingQuote?: any | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState(0);
  const [notes, setNotes] = useState('All rates are inclusive of private AC transport, English-speaking certified guide, and 24/7 on-ground emergency dispatch.');
  const [validDays, setValidDays] = useState(14);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; quoteNumber?: string } | null>(null);

  // Initial options structure matching DMC standards
  const [options, setOptions] = useState<OptionDraft[]>([
    {
      option_name: 'Comfort (4-Star Premium)',
      hotel_category: '4-Star Central & Beachfront Resorts (Bed & Breakfast)',
      day_count: durationDays,
      line_items: [
        {
          day_number: 1,
          time_window: 'morning',
          title: 'Airport VIP Meet & Greet + Private Luxury Transfer',
          cost_category: 'transfer',
          net_cost: 6500,
        },
        {
          day_number: 1,
          time_window: 'afternoon',
          title: 'Hotel Check-in & Riverside Welcome Amenities',
          cost_category: 'stay',
          net_cost: 28000,
        },
        {
          day_number: 2,
          time_window: 'morning',
          title: 'Grand Palace, Wat Pho & Private Longtail Boat Canal Tour',
          cost_category: 'activity',
          net_cost: 14500,
        },
        {
          day_number: 3,
          time_window: 'evening',
          title: 'Chao Phraya Luxury Dinner Cruise with Private Table',
          cost_category: 'meal',
          net_cost: 9800,
        },
        {
          day_number: 4,
          time_window: 'morning',
          title: 'Domestic Inter-city Flight Transfer & Beachfront Resort Check-in',
          cost_category: 'stay',
          net_cost: 45000,
        },
        {
          day_number: 5,
          time_window: 'morning',
          title: 'Full Day Phi Phi Islands Speedboat Charter with Lunch',
          cost_category: 'activity',
          net_cost: 22000,
        },
        {
          day_number: durationDays,
          time_window: 'afternoon',
          title: 'Private Departure Transfer to International Airport',
          cost_category: 'transfer',
          net_cost: 7200,
        },
      ],
    },
    {
      option_name: 'Luxury (5-Star Pool Villa)',
      hotel_category: '5-Star Luxury Suites & Private Pool Villas (Half Board)',
      day_count: durationDays,
      line_items: [
        {
          day_number: 1,
          time_window: 'morning',
          title: 'Tarmac Fast-Track Immigrations & Mercedes S-Class Transfer',
          cost_category: 'transfer',
          net_cost: 12000,
        },
        {
          day_number: 1,
          time_window: 'afternoon',
          title: 'The Peninsula / Four Seasons Suite Check-in & Spa Session',
          cost_category: 'stay',
          net_cost: 58000,
        },
        {
          day_number: 2,
          time_window: 'morning',
          title: 'Exclusive After-Hours Palace Access & Private Teakwood Yacht',
          cost_category: 'activity',
          net_cost: 26000,
        },
        {
          day_number: 3,
          time_window: 'evening',
          title: 'Michelin Star Chef Tasting Dinner with Riverfront Terrace',
          cost_category: 'meal',
          net_cost: 18000,
        },
        {
          day_number: 4,
          time_window: 'morning',
          title: 'Helicopter Transfer to Phuket & Kata Rocks Ocean Villa',
          cost_category: 'stay',
          net_cost: 95000,
        },
        {
          day_number: 5,
          time_window: 'morning',
          title: 'Private Catamaran Charter to Maya Bay with Scuba Diving',
          cost_category: 'activity',
          net_cost: 48000,
        },
        {
          day_number: durationDays,
          time_window: 'afternoon',
          title: 'Private Chauffeur Departure to VIP Terminal Lounge',
          cost_category: 'transfer',
          net_cost: 11000,
        },
      ],
    },
  ]);

  const calculateOptionTotal = (opt: OptionDraft) => {
    return opt.line_items.reduce((acc, item) => acc + (Number(item.net_cost) || 0), 0);
  };

  const handleAddOption = () => {
    if (options.length >= 3) return;
    setOptions([
      ...options,
      {
        option_name: `Option ${options.length + 1} (Custom Tier)`,
        hotel_category: 'Selected Accommodation Category',
        day_count: durationDays,
        line_items: [
          {
            day_number: 1,
            time_window: 'morning',
            title: 'Arrival & Welcome Transfer',
            cost_category: 'transfer',
            net_cost: 8000,
          },
          {
            day_number: 1,
            time_window: 'afternoon',
            title: 'Accommodation Package',
            cost_category: 'stay',
            net_cost: 35000,
          },
        ],
      },
    ]);
    setActiveTab(options.length);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setActiveTab(Math.max(0, index - 1));
  };

  const handleAddLineItem = (optIndex: number) => {
    const updated = [...options];
    const targetOpt = updated[optIndex];
    if (!targetOpt) return;
    targetOpt.line_items.push({
      day_number: Math.min(targetOpt.line_items.length + 1, durationDays),
      time_window: 'morning',
      title: 'New Service Item',
      cost_category: 'activity',
      net_cost: 5000,
    });
    setOptions(updated);
  };

  const handleRemoveLineItem = (optIndex: number, itemIndex: number) => {
    const updated = [...options];
    const targetOpt = updated[optIndex];
    if (!targetOpt) return;
    targetOpt.line_items = targetOpt.line_items.filter((_, i) => i !== itemIndex);
    setOptions(updated);
  };

  const handleUpdateLineItem = (
    optIndex: number,
    itemIndex: number,
    field: keyof LineItemDraft,
    value: any
  ) => {
    const updated = [...options];
    const targetOpt = updated[optIndex];
    if (!targetOpt) return;
    const targetItem = targetOpt.line_items[itemIndex];
    if (!targetItem) return;
    (targetItem as any)[field] = value;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      // Prepare payload: server applies V62 via DB formula, computes zero client side
      const payloadOptions = options.map((opt) => ({
        option_name: opt.option_name,
        description: opt.hotel_category,
        net_cost: calculateOptionTotal(opt),
        day_count: opt.day_count,
        line_items: opt.line_items.map((li) => ({
          day_number: li.day_number,
          time_window: li.time_window,
          title: li.title,
          cost_category: li.cost_category,
          net_cost: Number(li.net_cost),
        })),
      }));

      const res = await submitQuoteAction({
        rfqId,
        options: payloadOptions,
        notes,
        validDays,
      });

      if (res.success && res.data) {
        setFeedback({
          type: 'success',
          message: 'Quote submitted anonymously to requesting agent. V62 customer pricing applied on server.',
          quoteNumber: res.data.quote_number,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to submit quote.',
        });
      }
    });
  };

  return (
    <Card className="p-6 bg-[var(--bg-card)] border border-[var(--border-line)] space-y-6">
      {/* Builder Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[var(--border-line)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#0EA5A3] font-bold">
              MULTI-TIER QUOTE BUILDER · {rfqNumber}
            </span>
            <Badge variant="neutral">
              <Lock className="w-3 h-3 text-[#D4B483]" />
              <span>STRICT ANONYMITY</span>
            </Badge>
          </div>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mt-1">
            Build Anonymous 3-Tier Supplier Quote
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Input net supplier costs. DMCGrid server engine automatically computes statutory V62 agent margins & customer selling price.
          </p>
          {existingQuote && (
            <div className="mt-2 text-xs font-mono text-[#D4B483] bg-[#D4B483]/10 px-3 py-1.5 rounded-lg">
              You already submitted quote #{existingQuote.quote_number} for this brief. Submitting again will record an updated quote.
            </div>
          )}
        </div>

        {options.length < 3 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddOption}
            className="gap-1.5 font-mono text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Option Tier ({options.length}/3)</span>
          </Button>
        )}
      </div>

      {/* Success Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-[14px] border flex items-start justify-between gap-3 text-xs ${
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
            {feedback.quoteNumber && (
              <div className="pt-2 flex items-center gap-3">
                <Link href="/quotes">
                  <Button variant="primary" size="sm" className="h-7 text-xs gap-1.5 font-semibold">
                    <span>View In Submitted Quotes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <span className="font-mono text-[11px] text-[#D4B483]">
                  Reference: {feedback.quoteNumber}
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

      {/* Option Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] overflow-x-auto pb-1">
        {options.map((opt, idx) => {
          const total = calculateOptionTotal(opt);
          const isActive = activeTab === idx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2.5 rounded-t-[9px] text-xs font-mono transition-colors whitespace-nowrap min-h-[44px] flex items-center gap-2 border-b-2 cursor-pointer ${
                isActive
                  ? 'border-[#D4B483] bg-[#D4B483]/10 text-[var(--text-primary)] font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <span>{opt.option_name || `Tier ${idx + 1}`}</span>
              <span className="text-[#D4B483] font-bold">₹{total.toLocaleString('en-IN')}</span>
            </button>
          );
        })}
      </div>

      {/* Active Option Form Content */}
      {(() => {
        const currentOpt = options[activeTab];
        if (!currentOpt) return null;
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tier Package Name"
                value={currentOpt.option_name}
                onChange={(e) => {
                  const updated = [...options];
                  const opt = updated[activeTab];
                  if (opt) {
                    opt.option_name = e.target.value;
                    setOptions(updated);
                  }
                }}
                placeholder="e.g. Comfort (4-Star Central)"
                required
              />
              <Input
                label="Hotel Category / Room Specification"
                value={currentOpt.hotel_category}
                onChange={(e) => {
                  const updated = [...options];
                  const opt = updated[activeTab];
                  if (opt) {
                    opt.hotel_category = e.target.value;
                    setOptions(updated);
                  }
                }}
                placeholder="e.g. 5-Star Beachfront Suite with daily breakfast"
                required
              />
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Day-Wise Deliverables ({currentOpt.line_items.length} items)
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddLineItem(activeTab)}
                  className="gap-1.5 text-xs font-mono h-8"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Item</span>
                </Button>
              </div>

              <div className="rounded-[11px] border border-[var(--border-line)] overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-secondary)] font-mono uppercase text-[10px]">
                      <th className="py-2.5 px-3 w-16">Day</th>
                      <th className="py-2.5 px-3 w-28">Window</th>
                      <th className="py-2.5 px-3">Service Deliverable Title</th>
                      <th className="py-2.5 px-3 w-28">Category</th>
                      <th className="py-2.5 px-3 text-right w-36">Net Cost (₹)</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)] font-mono">
                    {currentOpt.line_items.map((item, itemIdx) => (
                      <tr key={itemIdx} className="hover:bg-[var(--bg-card-hover)]">
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min={1}
                            max={durationDays}
                            value={item.day_number}
                            onChange={(e) =>
                              handleUpdateLineItem(
                                activeTab,
                                itemIdx,
                                'day_number',
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-12 h-8 px-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-line)] text-center text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={item.time_window}
                            onChange={(e) =>
                              handleUpdateLineItem(activeTab, itemIdx, 'time_window', e.target.value)
                            }
                            className="w-full h-8 px-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-line)] text-xs font-mono text-[var(--text-primary)]"
                          >
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                            <option value="evening">Evening</option>
                            <option value="night">Night</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              handleUpdateLineItem(activeTab, itemIdx, 'title', e.target.value)
                            }
                            className="w-full h-8 px-2.5 rounded bg-[var(--bg-surface)] border border-[var(--border-line)] text-xs text-[var(--text-primary)]"
                            placeholder="e.g. Longtail Boat to Phi Phi Lagoon"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={item.cost_category}
                            onChange={(e) =>
                              handleUpdateLineItem(activeTab, itemIdx, 'cost_category', e.target.value)
                            }
                            className="w-full h-8 px-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-line)] text-xs font-mono text-[var(--text-primary)]"
                          >
                            <option value="activity">Activity</option>
                            <option value="stay">Stay</option>
                            <option value="transfer">Transfer</option>
                            <option value="meal">Meal</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min={0}
                            step={100}
                            value={item.net_cost}
                            onChange={(e) =>
                              handleUpdateLineItem(
                                activeTab,
                                itemIdx,
                                'net_cost',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-28 h-8 px-2 rounded bg-[var(--bg-surface)] border border-[var(--border-line)] text-right text-xs font-bold font-mono text-[#D4B483]"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(activeTab, itemIdx)}
                            className="text-[var(--text-muted)] hover:text-[#EF4444] transition-colors p-1"
                            title="Delete line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Net Summary Card */}
              <div className="p-4 rounded-[11px] bg-[var(--bg-surface)] border border-[var(--border-line)] flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] uppercase text-[var(--text-muted)] block">
                    Total Supplier Net Cost ({currentOpt.option_name})
                  </span>
                  <span className="text-xl font-bold text-[#D4B483]">
                    <Money amount={calculateOptionTotal(currentOpt)} />
                  </span>
                </div>
                <div className="text-right text-[11px] text-[var(--text-secondary)]">
                  <span>Server applies Rule R8 V62 formula:</span>
                  <div className="font-semibold text-[var(--text-primary)]">
                    Customer Selling ~ ₹{Math.round(calculateOptionTotal(currentOpt) * 1.12 * 1.05 * 1.05).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">
                  Special Inclusions & Ground Operational Terms
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-[9px] bg-[var(--bg-surface)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">
                  Quote Validity Period
                </label>
                <select
                  value={validDays}
                  onChange={(e) => setValidDays(parseInt(e.target.value))}
                  className="w-full h-[44px] px-3 rounded-[9px] bg-[var(--bg-surface)] border border-[var(--border-line)] text-xs text-[var(--text-primary)]"
                >
                  <option value={7}>7 Days from submission</option>
                  <option value={14}>14 Days from submission</option>
                  <option value={30}>30 Days from submission</option>
                </select>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              {options.length > 1 ? (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(activeTab)}
                  className="text-xs text-[#EF4444] hover:underline"
                >
                  Remove This Option Tier
                </button>
              ) : <span />}

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isPending}
                  className="gap-2 font-semibold"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit {options.length}-Tier Quote (Anonymous)</span>
                </Button>
              </div>
            </div>
          </form>
        );
      })()}
    </Card>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Input, Badge } from '@dmcgrid/ui';
import { createClient } from '@/lib/supabase/client';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Minus,
  X,
  AlertCircle,
  CreditCard,
  Check,
} from 'lucide-react';

// Static mapping of 40 popular destinations to countries
const POPULAR_DESTINATIONS: Record<string, string> = {
  Bangkok: 'Thailand',
  Phuket: 'Thailand',
  Krabi: 'Thailand',
  Pattaya: 'Thailand',
  'Chiang Mai': 'Thailand',
  'Koh Samui': 'Thailand',
  Bali: 'Indonesia',
  Ubud: 'Indonesia',
  Lombok: 'Indonesia',
  Komodo: 'Indonesia',
  Jakarta: 'Indonesia',
  Singapore: 'Singapore',
  'Kuala Lumpur': 'Malaysia',
  Penang: 'Malaysia',
  Langkawi: 'Malaysia',
  Dubai: 'United Arab Emirates',
  'Abu Dhabi': 'United Arab Emirates',
  Maldives: 'Maldives',
  Colombo: 'Sri Lanka',
  Kandy: 'Sri Lanka',
  Bentota: 'Sri Lanka',
  Hanoi: 'Vietnam',
  'Da Nang': 'Vietnam',
  'Ho Chi Minh City': 'Vietnam',
  'Phu Quoc': 'Vietnam',
  'Siem Reap': 'Cambodia',
  Tokyo: 'Japan',
  Kyoto: 'Japan',
  Osaka: 'Japan',
  Seoul: 'South Korea',
  Paris: 'France',
  Nice: 'France',
  Rome: 'Italy',
  Florence: 'Italy',
  Venice: 'Italy',
  Zurich: 'Switzerland',
  Lucerne: 'Switzerland',
  Interlaken: 'Switzerland',
  Zermatt: 'Switzerland',
  London: 'United Kingdom',
};

const TRIP_TYPES = [
  { id: 'couples', label: 'Couples & Honeymoon', emoji: '💑' },
  { id: 'family', label: 'Family with Kids', emoji: '👨‍👩‍👧' },
  { id: 'friends', label: 'Friends Group', emoji: '🎉' },
  { id: 'solo', label: 'Solo', emoji: '🎒' },
  { id: 'corporate', label: 'Corporate MICE', emoji: '🏢' },
  { id: 'pilgrimage', label: 'Pilgrimage', emoji: '🕉' },
];

const PACING_OPTIONS = [
  { id: 'relaxed', label: 'Relaxed', sub: 'Leisure first', emoji: '😌' },
  { id: 'balanced', label: 'Balanced', sub: 'Paced highlights', emoji: '⚖️' },
  { id: 'packed', label: 'Packed', sub: 'Max sightseeing', emoji: '⚡' },
];

const HOTEL_CATEGORIES = [
  { id: '3_star', label: '3★ Comfortable', emoji: '🏨' },
  { id: '4_star', label: '4★ Premium', emoji: '🌟' },
  { id: '5_star', label: '5★ Luxury', emoji: '💎' },
  { id: 'pool_villa', label: 'Pool Villa', emoji: '🏖' },
];

const HOTEL_TYPES = [
  { id: 'hotel', label: 'Hotel' },
  { id: 'resort', label: 'Resort' },
  { id: 'villa', label: 'Villa' },
  { id: 'mix', label: 'Mix' },
];

const MEAL_PLANS = [
  { id: 'room_only', label: 'EP Room only' },
  { id: 'breakfast', label: 'CP +Breakfast' },
  { id: 'half_board', label: 'MAP +Dinner' },
  { id: 'full_board', label: 'AP All meals' },
];

const EXPERIENCE_CHIPS = [
  'Private Transfers',
  'Island Hopping',
  'Temple & Heritage Tours',
  'Food Walk',
  'Adventure/Water Sports',
  'Spa & Wellness',
  'Shopping',
  'Nightlife',
];

interface DestinationRow {
  destination_name: string;
  country: string;
  nights: number;
}

interface PlanItem {
  id: string;
  plan_code: string;
  name: string;
  monthly_leads_included: number;
  price_inr: number;
}

export default function FinFlyRfqWizardPage() {
  const router = useRouter();

  // Wizard step (0 to 7)
  const [step, setStep] = useState(0);

  // AI Brief
  const [aiText, setAiText] = useState(
    'Need a 7-night Thailand trip for a young couple. Want 3 nights Bangkok 5-star riverside and 4 nights Phuket beachfront villa with private pool. Must include Phi Phi island private tour and airport transfers. Travel dates mid November. Budget roughly 2.8 to 3.2 Lakhs.'
  );
  const [preFilled, setPreFilled] = useState(false);

  // Form states
  const [tripType, setTripType] = useState('couples');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [specialReq, setSpecialReq] = useState('');

  // Route (Destinations)
  const [destinations, setDestinations] = useState<DestinationRow[]>([
    { destination_name: 'Bangkok', country: 'Thailand', nights: 3 },
    { destination_name: 'Phuket', country: 'Thailand', nights: 4 },
  ]);

  // Dates & Pace
  const [startDate, setStartDate] = useState('2026-11-12');
  const [pacing, setPacing] = useState('balanced');

  // Stays
  const [hotelCategory, setHotelCategory] = useState('5_star');
  const [hotelType, setHotelType] = useState('villa');
  const [mealPlan, setMealPlan] = useState('breakfast');
  const [roomCount, setRoomCount] = useState(1);
  const [stayPreferences, setStayPreferences] = useState('');

  // Experiences
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([
    'Private Transfers',
    'Island Hopping',
    'Temple & Heritage Tours',
  ]);
  const [customExperience, setCustomExperience] = useState('');

  // Budget
  const [budgetMin, setBudgetMin] = useState('280000');
  const [budgetMax, setBudgetMax] = useState('320000');
  const [selectedBudgetPreset, setSelectedBudgetPreset] = useState<string>('custom');

  // UI status
  const [balance, setBalance] = useState<number>(36);
  const [plans, setPlans] = useState<PlanItem[]>([
    {
      id: '20000000-0000-0000-0000-000000000001',
      plan_code: 'STARTER',
      name: 'Starter Plan',
      monthly_leads_included: 5,
      price_inr: 999,
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      plan_code: 'GROWTH',
      name: 'Growth Plan',
      monthly_leads_included: 20,
      price_inr: 2499,
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      plan_code: 'SCALE',
      name: 'Scale Enterprise',
      monthly_leads_included: 100,
      price_inr: 9999,
    },
  ]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [upsellActive, setUpsellActive] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const autoAdvanceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch live balance and plans on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/portal-access-7k2m9');
          return;
        }

        const profileId = user.id;

        const { data: acct } = await (supabase as any)
          .from('credit_accounts')
          .select('balance')
          .eq('profile_id', profileId)
          .eq('account_type', 'agent_wallet')
          .maybeSingle();

        if (acct && typeof acct.balance === 'number') {
          setBalance(acct.balance);
        }

        const { data: plansData } = await (supabase as any)
          .from('plans')
          .select('id, plan_code, name, monthly_leads_included, price_inr')
          .eq('is_active', true)
          .order('price_inr', { ascending: true });

        if (plansData && plansData.length > 0) {
          setPlans(plansData as PlanItem[]);
        }
      } catch {
        // Fallback state retained
      }
    }
    loadInitialData();

    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, []);

  // Compute total nights and days
  const totalNights = destinations.reduce((sum, d) => sum + (Number(d.nights) || 0), 0);
  const totalDays = totalNights + 1;

  // Trigger shake on invalid step validation
  const triggerShake = (msg: string) => {
    setStepError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  // Naive AI extraction
  const handleExtractAI = () => {
    const text = aiText.toLowerCase();

    // 1. Detect travelers
    if (text.includes('couple') || text.includes('honeymoon')) {
      setTripType('couples');
      setAdults(2);
      setChildren(0);
      setInfants(0);
    } else if (text.includes('family')) {
      setTripType('family');
      setAdults(2);
      setChildren(1);
    } else if (text.includes('friends')) {
      setTripType('friends');
      setAdults(4);
    } else if (text.includes('solo')) {
      setTripType('solo');
      setAdults(1);
      setChildren(0);
      setInfants(0);
    } else if (text.includes('mice') || text.includes('corporate')) {
      setTripType('corporate');
      setAdults(10);
    }

    // 2. Detect cities and nights
    const extractedDestinations: DestinationRow[] = [];
    Object.keys(POPULAR_DESTINATIONS).forEach((city) => {
      const cityLower = city.toLowerCase();
      if (text.includes(cityLower)) {
        const pattern = new RegExp(
          `(?:(\\d+)\\s*(?:nights?|n)\\s+${cityLower}|${cityLower}\\s*(?:\\((\\d+)n\\)|(?:for\\s+)?(\\d+)\\s*(?:nights?|n)))`,
          'i'
        );
        const match = aiText.match(pattern);
        let n = 3;
        if (match) {
          const val = match[1] || match[2] || match[3];
          if (val) n = parseInt(val, 10);
        }
        extractedDestinations.push({
          destination_name: city,
          country: POPULAR_DESTINATIONS[city] || 'International',
          nights: n,
        });
      }
    });

    if (extractedDestinations.length > 0) {
      setDestinations(extractedDestinations);
    }

    // 3. Detect dates
    if (text.includes('mid nov') || text.includes('mid-nov') || text.includes('november')) {
      setStartDate('2026-11-12');
    }

    // 4. Detect pacing
    if (text.includes('relax') || text.includes('leisure')) {
      setPacing('relaxed');
    } else if (text.includes('packed') || text.includes('sightseeing')) {
      setPacing('packed');
    } else {
      setPacing('balanced');
    }

    // 5. Detect Stays
    if (text.includes('5-star') || text.includes('5 star') || text.includes('luxury')) {
      setHotelCategory('5_star');
    } else if (text.includes('villa')) {
      setHotelCategory('pool_villa');
    }

    if (text.includes('villa')) {
      setHotelType('villa');
    } else if (text.includes('resort')) {
      setHotelType('resort');
    }

    if (text.includes('breakfast') || text.includes('cp')) {
      setMealPlan('breakfast');
    }

    // 6. Detect experiences
    const matchedExps: string[] = [];
    if (text.includes('transfer') || text.includes('airport')) {
      matchedExps.push('Private Transfers');
    }
    if (text.includes('phi phi') || text.includes('island')) {
      matchedExps.push('Island Hopping');
    }
    if (text.includes('temple') || text.includes('heritage')) {
      matchedExps.push('Temple & Heritage Tours');
    }
    if (text.includes('food')) {
      matchedExps.push('Food Walk');
    }
    if (text.includes('water sport') || text.includes('adventure')) {
      matchedExps.push('Adventure/Water Sports');
    }
    if (text.includes('spa') || text.includes('wellness')) {
      matchedExps.push('Spa & Wellness');
    }
    if (matchedExps.length > 0) {
      setSelectedExperiences(matchedExps);
    }

    // 7. Detect budget
    const budgetMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(?:lakh|l\b|lac)/i);
    if (budgetMatch && budgetMatch[1] && budgetMatch[2]) {
      const minLakh = parseFloat(budgetMatch[1]);
      const maxLakh = parseFloat(budgetMatch[2]);
      setBudgetMin(Math.round(minLakh * 100000).toString());
      setBudgetMax(Math.round(maxLakh * 100000).toString());
    }

    setPreFilled(true);
    setToastMessage('Brief parsed successfully. Review or customize fields.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Step 1 auto-advance handler
  const handleSelectTripType = (id: string) => {
    setTripType(id);
    setStepError(null);
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      setStep(2);
    }, 250);
  };

  // Step 3 destination mutations
  const handleAddCity = () => {
    setDestinations([...destinations, { destination_name: '', country: '', nights: 2 }]);
  };

  const handleUpdateCityName = (idx: number, name: string) => {
    setDestinations((prev) => {
      const updated = [...prev];
      const row = updated[idx];
      if (row) {
        row.destination_name = name;
        const foundCountry = POPULAR_DESTINATIONS[name.trim()];
        if (foundCountry) {
          row.country = foundCountry;
        }
      }
      return updated;
    });
  };

  const handleUpdateCityCountry = (idx: number, country: string) => {
    setDestinations((prev) => {
      const updated = [...prev];
      const row = updated[idx];
      if (row) {
        row.country = country;
      }
      return updated;
    });
  };

  const handleUpdateCityNights = (idx: number, delta: number) => {
    setDestinations((prev) => {
      const updated = [...prev];
      const row = updated[idx];
      if (row) {
        const cur = row.nights || 1;
        row.nights = Math.max(1, cur + delta);
      }
      return updated;
    });
  };

  const handleRemoveCity = (idx: number) => {
    if (destinations.length <= 1) return;
    setDestinations(destinations.filter((_, i) => i !== idx));
  };

  // Step 7 budget preset handler
  const handleBudgetPreset = (preset: string) => {
    setSelectedBudgetPreset(preset);
    if (preset === 'under_1_5') {
      setBudgetMin('100000');
      setBudgetMax('150000');
    } else if (preset === '1_5_to_2_5') {
      setBudgetMin('150000');
      setBudgetMax('250000');
    } else if (preset === '2_5_to_4') {
      setBudgetMin('250000');
      setBudgetMax('400000');
    } else if (preset === '4_plus') {
      setBudgetMin('400000');
      setBudgetMax('600000');
    }
  };

  // Step validation
  const validateStep = (s: number): boolean => {
    setStepError(null);
    if (s === 1) {
      if (!tripType) {
        triggerShake('Please select a trip type');
        return false;
      }
    } else if (s === 2) {
      if (adults < 1) {
        triggerShake('At least 1 adult traveler is required');
        return false;
      }
    } else if (s === 3) {
      if (destinations.length === 0) {
        triggerShake('Please add at least one destination city');
        return false;
      }
      for (const d of destinations) {
        if (!d.destination_name.trim()) {
          triggerShake('Please enter all destination city names');
          return false;
        }
      }
    } else if (s === 4) {
      if (!startDate) {
        triggerShake('Please select a valid departure date');
        return false;
      }
    } else if (s === 7) {
      const min = Number(budgetMin);
      const max = Number(budgetMax);
      if (isNaN(min) || isNaN(max) || min <= 0 || max < min) {
        triggerShake('Please enter a valid budget range where maximum exceeds minimum');
        return false;
      }
    }
    return true;
  };

  const handleContinue = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(7, prev + 1));
    }
  };

  const handleBack = () => {
    setStepError(null);
    setStep((prev) => Math.max(0, prev - 1));
  };

  // Publish handler
  const handlePublish = async () => {
    if (!validateStep(7)) return;

    setIsPublishing(true);
    setStepError(null);

    const title =
      destinations.length > 0
        ? `${destinations.map((d) => d.destination_name).join(' & ')} Curated Journey`
        : 'Bespoke Travel Inquiry';

    const staysPayload = {
      star_rating: hotelCategory,
      hotel_type: hotelType,
      meal_plan: mealPlan,
      room_count: roomCount,
      preferences: stayPreferences || null,
    };

    const experiencesPayload = [
      ...selectedExperiences.map((desc) => ({
        category: 'experience',
        description: desc,
        required: true,
      })),
      ...(customExperience.trim()
        ? [
            {
              category: 'experience',
              description: customExperience.trim(),
              required: true,
            },
          ]
        : []),
    ];

    const destinationsPayload = destinations.map((d, idx) => ({
      destination_name: d.destination_name.trim(),
      country: d.country.trim() || POPULAR_DESTINATIONS[d.destination_name.trim()] || 'International',
      nights: d.nights || 1,
      order_index: idx,
    }));

    try {
      const supabase = createClient();

      const { data: rfqId, error } = await (supabase as any).rpc('agent_create_rfq', {
        p_title: title,
        p_adults: adults,
        p_children: children,
        p_infants: infants,
        p_start_date: startDate,
        p_nights: totalNights || 1,
        p_budget_min: Number(budgetMin),
        p_budget_max: Number(budgetMax),
        p_currency: 'INR',
        p_notes: specialReq || null,
        p_extra: {
          trip_type: tripType,
          pacing,
          custom_notes: specialReq,
        },
        p_destinations: destinationsPayload,
        p_stays: staysPayload,
        p_experiences: experiencesPayload,
      });

      if (error) {
        if (error.message && error.message.includes('INSUFFICIENT_CREDITS')) {
          setUpsellActive(true);
          setIsPublishing(false);
          return;
        }
        triggerShake(error.message || 'Failed to publish RFQ brief');
        setIsPublishing(false);
        return;
      }

      setToastMessage('RFQ published to matched DMCs! Redirecting…');
      setTimeout(() => {
        router.push(`/rfq/${rfqId}`);
      }, 700);
    } catch (err: any) {
      if (err.message && err.message.includes('INSUFFICIENT_CREDITS')) {
        setUpsellActive(true);
      } else {
        triggerShake(err.message || 'An unexpected error occurred while publishing');
      }
      setIsPublishing(false);
    }
  };

  // Format date helper for review card
  const formatDateDisplay = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return isoStr;
    }
  };

  // Helper for budget format
  const formatLakhDisplay = (numStr: string) => {
    const val = Number(numStr);
    if (isNaN(val)) return numStr;
    if (val >= 100000) {
      const lakhs = (val / 100000).toFixed(1).replace(/\.0$/, '');
      return `₹${lakhs}L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getTripTypeLabel = (id: string) =>
    TRIP_TYPES.find((t) => t.id === id)?.label || 'Custom Journey';

  const getPacingLabel = (id: string) =>
    PACING_OPTIONS.find((p) => p.id === id)?.label || 'Balanced';

  const getHotelCategoryLabel = (id: string) =>
    HOTEL_CATEGORIES.find((h) => h.id === id)?.label || 'Luxury';

  const getMealPlanLabel = (id: string) =>
    MEAL_PLANS.find((m) => m.id === id)?.label || 'CP';

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1F2937] text-white px-5 py-2.5 rounded-full shadow-lg border border-[#D4B483]/40 flex items-center gap-2 font-mono text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#D4B483]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Center Container: max-w-xl mx-auto */}
      <div className="max-w-xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-28 md:pb-8">
        {/* Wizard Header */}
        <div>
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <Link
                href="/rfq"
                className="w-9 h-9 rounded-full border border-[var(--border-line)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] active:scale-[0.97] transition-all"
                aria-label="Back to RFQs"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="font-display font-bold text-lg tracking-tight text-[var(--text-primary)]">
                DMC<span className="text-[#D4B483] font-normal">Grid</span>
              </div>
            </div>

            <div className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
              Step {step + 1} of 8
            </div>
          </div>

          {/* 8-segment Progress Bar */}
          <div className="grid grid-cols-8 gap-1.5 mt-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((sIndex) => (
              <div
                key={sIndex}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  sIndex <= step ? 'bg-[#D4B483]' : 'bg-[var(--border-line)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Step Content with Shake Animation on Error */}
        <div className={`transition-all duration-200 ${isShaking ? 'animate-shake' : ''}`}>
          {/* STEP 0: AI BRIEF */}
          {step === 0 && (
            <Card className="p-5 sm:p-6 rounded-xl border border-[var(--border-line)] bg-[var(--bg-card)] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#D4B483]/15 flex items-center justify-center text-[#D4B483] shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-lg sm:text-xl text-[var(--text-primary)]">
                      AI Brief Extraction
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Paste WhatsApp text, email, or client notes to auto-fill the questionnaire.
                    </p>
                  </div>
                </div>

                {preFilled && (
                  <Badge variant="gold" className="text-[10px] tracking-wider shrink-0">
                    FIELDS PRE-FILLED
                  </Badge>
                )}
              </div>

              <div>
                <textarea
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Paste WhatsApp text, email, or client notes…"
                  rows={4}
                  className="w-full text-xs font-mono p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-line)] text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none focus:border-[#D4B483] transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExtractAI}
                  className="px-4 py-2.5 rounded-full bg-[#1F2937] text-white hover:bg-black font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all border border-[#D4B483]/30 min-h-[44px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4B483]" />
                  <span>Extract with AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-[var(--text-secondary)] hover:text-[#D4B483] text-center cursor-pointer transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Start from scratch →
                </button>
              </div>
            </Card>
          )}

          {/* STEP 1: TRIP TYPE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h1 className="font-display font-semibold text-xl sm:text-2xl text-[var(--text-primary)]">
                  What kind of trip is this?
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Select the primary traveler persona to optimize destination recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {TRIP_TYPES.map((t) => {
                  const isSelected = tripType === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTripType(t.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 active:scale-[0.97] min-h-[44px] flex flex-col justify-center ${
                        isSelected
                          ? 'border-[#D4B483] bg-[#D4B483]/10 shadow-sm ring-1 ring-[#D4B483]'
                          : 'border-[var(--border-line)] bg-[var(--bg-card)] hover:border-[#D4B483]/50'
                      }`}
                    >
                      <span className="text-2xl mb-1.5 block">{t.emoji}</span>
                      <span className="font-medium text-sm text-[var(--text-primary)] block">
                        {t.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: TRAVELERS */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display font-semibold text-xl sm:text-2xl text-[var(--text-primary)]">
                  Who is traveling?
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Specify group size for private rooming and transport allocation.
                </p>
              </div>

              <Card className="p-5 rounded-xl border border-[var(--border-line)] bg-[var(--bg-card)] divide-y divide-[var(--border-line)]">
                {/* Adults */}
                <div className="flex items-center justify-between py-3 first:pt-0">
                  <div>
                    <div className="font-medium text-sm text-[var(--text-primary)]">Adults</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">Ages 13 and above</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                      className="w-9 h-9 border border-[var(--border-line)] rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:scale-[0.95] disabled:opacity-40 cursor-pointer min-h-[44px] min-w-[44px]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-display font-bold text-lg min-w-[28px] text-center text-[var(--text-primary)]">
                      {adults}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-9 h-9 border border-[var(--border-line)] rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:scale-[0.95] cursor-pointer min-h-[44px] min-w-[44px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-sm text-[var(--text-primary)]">Children</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">Ages 2 to 12</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      disabled={children <= 0}
                      className="w-9 h-9 border border-[var(--border-line)] rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:scale-[0.95] disabled:opacity-40 cursor-pointer min-h-[44px] min-w-[44px]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-display font-bold text-lg min-w-[28px] text-center text-[var(--text-primary)]">
                      {children}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChildren(children + 1)}
                      className="w-9 h-9 border border-[var(--border-line)] rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:scale-[0.95] cursor-pointer min-h-[44px] min-w-[44px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between py-3 last:pb-0">
                  <div>
                    <div className="font-medium text-sm text-[var(--text-primary)]">Infants</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">Under 2 years</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setInfants(Math.max(0, infants - 1))}
                      disabled={infants <= 0}
                      className="w-9 h-9 border border-[var(--border-line)] rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:scale-[0.95] disabled:opacity-40 cursor-pointer min-h-[44px] min-w-[44px]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-display font-bold text-lg min-w-[28px] text-center text-[var(--text-primary)]">
                      {infants}
                    </span>
                    <button
                      type="button"
                      onClick={() => setInfants(infants + 1)}
                      className="w-9 h-9 border border-[var(--border-line)] rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:scale-[0.95] cursor-pointer min-h-[44px] min-w-[44px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>

              <div>
                <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-1.5">
                  Any special requirements? (Optional)
                </label>
                <Input
                  value={specialReq}
                  onChange={(e) => setSpecialReq(e.target.value)}
                  placeholder="Wheelchair access, pure vegetarian meals, interconnecting rooms…"
                />
              </div>
            </div>
          )}

          {/* STEP 3: ROUTE */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display font-semibold text-xl sm:text-2xl text-[var(--text-primary)]">
                  Where are they traveling?
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Add planned cities and night breakdown. Country suggests automatically.
                </p>
              </div>

              <div className="space-y-3">
                {destinations.map((row, idx) => (
                  <Card
                    key={idx}
                    className="p-4 rounded-xl border border-[var(--border-line)] bg-[var(--bg-card)] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider font-semibold">
                        Stop {idx + 1}
                      </span>
                      {destinations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCity(idx)}
                          className="text-[var(--text-muted)] hover:text-red-500 p-1 cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Remove city"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)] mb-1">
                          City Name
                        </label>
                        <input
                          type="text"
                          value={row.destination_name}
                          onChange={(e) => handleUpdateCityName(idx, e.target.value)}
                          placeholder="e.g. Bangkok, Phuket, Bali"
                          className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-line)] text-[var(--text-primary)] focus:outline-none focus:border-[#D4B483]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)] mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={row.country}
                          onChange={(e) => handleUpdateCityCountry(idx, e.target.value)}
                          placeholder="e.g. Thailand, Indonesia"
                          className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-line)] text-[var(--text-primary)] focus:outline-none focus:border-[#D4B483]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[var(--text-secondary)]">Stay Duration:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateCityNights(idx, -1)}
                          disabled={row.nights <= 1}
                          className="w-8 h-8 rounded-full border border-[var(--border-line)] flex items-center justify-center text-xs hover:bg-[var(--bg-elevated)] disabled:opacity-40 cursor-pointer min-h-[44px] min-w-[44px]"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-semibold px-2">
                          {row.nights} {row.nights === 1 ? 'Night' : 'Nights'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCityNights(idx, 1)}
                          className="w-8 h-8 rounded-full border border-[var(--border-line)] flex items-center justify-center text-xs hover:bg-[var(--bg-elevated)] cursor-pointer min-h-[44px] min-w-[44px]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddCity}
                className="w-full py-3 rounded-xl border border-dashed border-[var(--border-line)] hover:border-[#D4B483] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4 text-[#D4B483]" />
                <span>+ Add City</span>
              </button>
            </div>
          )}

          {/* STEP 4: DATES & PACE */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display font-semibold text-xl sm:text-2xl text-[var(--text-primary)]">
                  When are they planning to travel?
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Departure date and rhythm of itinerary sightseeing.
                </p>
              </div>

              <Card className="p-5 rounded-xl border border-[var(--border-line)] bg-[var(--bg-card)] space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-1.5">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-line)] text-[var(--text-primary)] focus:outline-none focus:border-[#D4B483]"
                  />
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-line)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Calculated Duration</span>
                  <span className="font-mono text-xs font-bold text-[#D4B483]">
                    {totalNights} nights · {totalDays} days
                  </span>
                </div>
              </Card>

              <div>
                <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">
                  Pacing Style
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {PACING_OPTIONS.map((p) => {
                    const isSelected = pacing === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setPacing(p.id)}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all duration-200 active:scale-[0.97] min-h-[44px] flex flex-col justify-center ${
                          isSelected
                            ? 'border-[#D4B483] bg-[#D4B483]/10 ring-1 ring-[#D4B483]'
                            : 'border-[var(--border-line)] bg-[var(--bg-card)] hover:border-[#D4B483]/50'
                        }`}
                      >
                        <span className="text-xl mb-1 block">{p.emoji}</span>
                        <div className="font-medium text-xs text-[var(--text-primary)]">{p.label}</div>
                        <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{p.sub}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: STAYS */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display font-semibold text-xl sm:text-2xl text-[var(--text-primary)]">
                  What accommodation style do they prefer?
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Choose star category, property classification, and meal inclusion.
                </p>
              </div>

              <div className="space-y-4">
                {/* Hotel Category */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">
                    Hotel Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {HOTEL_CATEGORIES.map((cat) => {
                      const isSelected = hotelCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setHotelCategory(cat.id)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all active:scale-[0.97] min-h-[44px] flex items-center gap-2 ${
                            isSelected
                              ? 'border-[#D4B483] bg-[#D4B483]/10 text-[var(--text-primary)]'
                              : 'border-[var(--border-line)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <span>{cat.emoji}</span>
                          <span className="text-xs font-medium">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hotel Type */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">
                    Hotel Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {HOTEL_TYPES.map((type) => {
                      const isSelected = hotelType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setHotelType(type.id)}
                          className={`py-2 px-3 rounded-lg border text-center text-xs font-medium cursor-pointer transition-all active:scale-[0.97] min-h-[44px] flex items-center justify-center ${
                            isSelected
                              ? 'border-[#D4B483] bg-[#D4B483]/10 text-[var(--text-primary)]'
                              : 'border-[var(--border-line)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Meal Plan */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">
                    Meal Plan
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {MEAL_PLANS.map((plan) => {
                      const isSelected = mealPlan === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setMealPlan(plan.id)}
                          className={`py-2 px-3 rounded-lg border text-center text-xs font-medium cursor-pointer transition-all active:scale-[0.97] min-h-[44px] flex items-center justify-center ${
                            isSelected
                              ? 'border-[#D4B483] bg-[#D4B483]/10 text-[var(--text-primary)]'
                              : 'border-[var(--border-line)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {plan.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Room Count & Preferences */}
                <Card className="p-4 rounded-xl border border-[var(--border-line)] bg-[var(--bg-card)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-[var(--text-primary)]">Room Count</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Rooms needed per stay</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRoomCount(Math.max(1, roomCount - 1))}
                        disabled={roomCount <= 1}
                        className="w-8 h-8 rounded-full border border-[var(--border-line)] flex items-center justify-center text-xs hover:bg-[var(--bg-elevated)] disabled:opacity-40 cursor-pointer min-h-[44px] min-w-[44px]"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold px-2">{roomCount}</span>
                      <button
                        type="button"
                        onClick={() => setRoomCount(roomCount + 1)}
                        className="w-8 h-8 rounded-full border border-[var(--border-line)] flex items-center justify-center text-xs hover:bg-[var(--bg-elevated)] cursor-pointer min-h-[44px] min-w-[44px]"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)] mb-1">
                      Specific Stay Preferences (Optional)
                    </label>
                    <input
                      type="text"
                      value={stayPreferences}
                      onChange={(e) => setStayPreferences(e.target.value)}
                      placeholder="e.g. Sea view villa preferred, King bed, quiet zone"
                      className="w-full text-xs p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-line)] text-[var(--text-primary)] focus:outline-none focus:border-[#D4B483]"
                    />
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* STEP 6: EXPERIENCES */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display font-semibold text-xl sm:text-2xl text-[var(--text-primary)]">
                  What experiences should be included?
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Select activities to match with licensed local destination specialists.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {EXPERIENCE_CHIPS.map((chip) => {
                  const isSelected = selectedExperiences.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedExperiences(selectedExperiences.filter((c) => c !== chip));
                        } else {
                          setSelectedExperiences([...selectedExperiences, chip]);
                        }
                      }}
                      className={`px-3.5 py-2 rounded-full border text-xs font-medium cursor-pointer transition-all active:scale-[0.97] min-h-[44px] flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-[#D4B483] bg-[#D4B483]/15 text-[var(--text-primary)]'
                          : 'border-[var(--border-line)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[#D4B483]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-line)]" />
                      )}
                      <span>{chip}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-1.5">
                  Anything else? (Optional)
                </label>
                <Input
                  value={customExperience}
                  onChange={(e) => setCustomExperience(e.target.value)}
                  placeholder="e.g. Private yacht charter to James Bond Island, candlelight beach dinner…"
                />
              </div>
            </div>
          )}

          {/* STEP 7: BUDGET + REVIEW (OR UPSELL STATE) */}
          {step === 7 && !upsellActive && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display font-semibold text-xl sm:text-2xl text-[var(--text-primary)]">
                  Target Budget & Brief Review
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Set target budget range and verify your brief before publishing to verified DMCs.
                </p>
              </div>

              {/* Budget Quick Chips */}
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase text-[var(--text-secondary)]">
                  Quick Budget Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'under_1_5', label: 'Under ₹1.5L' },
                    { id: '1_5_to_2_5', label: '₹1.5-2.5L' },
                    { id: '2_5_to_4', label: '₹2.5-4L' },
                    { id: '4_plus', label: '₹4L+' },
                    { id: 'custom', label: 'Custom' },
                  ].map((chip) => {
                    const isSelected = selectedBudgetPreset === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => handleBudgetPreset(chip.id)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all active:scale-[0.97] min-h-[44px] flex items-center justify-center ${
                          isSelected
                            ? 'border-[#D4B483] bg-[#D4B483]/15 text-[var(--text-primary)]'
                            : 'border-[var(--border-line)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)] mb-1">
                      Min Target (₹ INR)
                    </label>
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => {
                        setBudgetMin(e.target.value);
                        setSelectedBudgetPreset('custom');
                      }}
                      className="w-full text-xs font-mono p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-line)] text-[var(--text-primary)] focus:outline-none focus:border-[#D4B483]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)] mb-1">
                      Max Target (₹ INR)
                    </label>
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => {
                        setBudgetMax(e.target.value);
                        setSelectedBudgetPreset('custom');
                      }}
                      className="w-full text-xs font-mono p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-line)] text-[var(--text-primary)] focus:outline-none focus:border-[#D4B483]"
                    />
                  </div>
                </div>
              </div>

              {/* REVIEW CARD (FinFly Step-7 Style) */}
              <div className="p-5 rounded-xl border border-[var(--border-line)] bg-[var(--bg-card)] space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-line)]">
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    RFQ Brief Review
                  </span>
                  <Badge variant="verified">READY TO PUBLISH</Badge>
                </div>

                {/* TRIP */}
                <div>
                  <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider block mb-1">
                    TRIP
                  </span>
                  <span className="rounded-full border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] inline-block">
                    {getTripTypeLabel(tripType)}
                  </span>
                </div>

                {/* TRAVELERS */}
                <div>
                  <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider block mb-1">
                    TRAVELERS
                  </span>
                  <span className="rounded-full border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] inline-block">
                    {adults} {adults === 1 ? 'adult' : 'adults'}
                    {children > 0 && ` · ${children} ${children === 1 ? 'child' : 'children'}`}
                    {infants > 0 && ` · ${infants} ${infants === 1 ? 'infant' : 'infants'}`}
                  </span>
                </div>

                {/* ROUTE */}
                <div>
                  <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider block mb-1">
                    ROUTE
                  </span>
                  <span className="rounded-full border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] inline-block">
                    {destinations
                      .map((d) => `${d.destination_name || 'Destination'} ${d.nights}N`)
                      .join(' → ')}
                  </span>
                </div>

                {/* DATES */}
                <div>
                  <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider block mb-1">
                    DATES
                  </span>
                  <span className="rounded-full border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] inline-block">
                    {formatDateDisplay(startDate)} · {totalNights} nights · {getPacingLabel(pacing)}
                  </span>
                </div>

                {/* STAYS */}
                <div>
                  <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider block mb-1">
                    STAYS
                  </span>
                  <span className="rounded-full border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] inline-block">
                    {getHotelCategoryLabel(hotelCategory)} · {hotelType.toUpperCase()} ·{' '}
                    {getMealPlanLabel(mealPlan)}
                  </span>
                </div>

                {/* EXPERIENCES */}
                <div>
                  <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider block mb-1.5">
                    EXPERIENCES
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedExperiences.map((exp) => (
                      <span
                        key={exp}
                        className="rounded-full border border-[var(--border-line)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]"
                      >
                        {exp}
                      </span>
                    ))}
                    {customExperience.trim() && (
                      <span className="rounded-full border border-[var(--border-line)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
                        {customExperience.trim()}
                      </span>
                    )}
                  </div>
                </div>

                {/* BUDGET */}
                <div>
                  <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider block mb-1">
                    BUDGET
                  </span>
                  <span className="rounded-full border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-mono font-semibold text-[#D4B483] inline-block">
                    {formatLakhDisplay(budgetMin)} – {formatLakhDisplay(budgetMax)}
                  </span>
                </div>
              </div>

              {/* Fee Line & CTA */}
              <div className="space-y-3 pt-2">
                <div className="font-mono text-xs text-center text-[var(--text-secondary)]">
                  Publishing costs 2 credits · Your balance: {balance} credits
                </div>

                {/* Sticky on mobile / inline on desktop CTA (pb clears iOS safe area; content gets
                    matching bottom padding so the bar never overlaps pills) */}
                <div className="fixed bottom-0 inset-x-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[var(--bg-page)]/95 backdrop-blur border-t border-[var(--border-line)] md:static md:p-0 md:bg-transparent md:border-t-0 z-20">
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="w-full py-3.5 px-6 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] font-semibold text-sm hover:opacity-90 active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 min-h-[44px]"
                  >
                    {isPublishing ? (
                      <span>Publishing Brief…</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#D4B483]" />
                        <span>Publish to Matched DMCs</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* UPSELL STATE: ON INSUFFICIENT CREDITS */}
          {step === 7 && upsellActive && (
            <Card className="p-6 rounded-xl border border-[#D4B483] bg-[#D4B483]/5 space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4B483]/20 flex items-center justify-center text-[#D4B483] shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-[var(--text-primary)]">
                    Not enough credits
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                    Your balance is {balance} credits. Publishing an RFQ costs 2 credits.
                  </p>
                </div>
              </div>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-[var(--border-line)] bg-[var(--bg-card)] space-y-2 hover:border-[#D4B483] transition-colors"
                  >
                    <span className="font-mono text-[10px] text-[#D4B483] uppercase tracking-wider font-semibold block">
                      {p.name}
                    </span>
                    <div className="font-display font-bold text-xl text-[var(--text-primary)]">
                      ₹{p.price_inr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {p.monthly_leads_included} credits included
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Link
                  href="/wallet"
                  className="py-2.5 px-6 rounded-full bg-[#1F2937] text-white hover:bg-black font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all border border-[#D4B483]/40 min-h-[44px]"
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#D4B483]" />
                  <span>View top-up options</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setUpsellActive(false)}
                  className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer text-center min-h-[44px] flex items-center justify-center"
                >
                  ← Back to Brief Review
                </button>
              </div>
            </Card>
          )}

          {/* Validation Error Helper */}
          {stepError && (
            <div className="flex items-center gap-1.5 text-xs text-red-500 font-mono mt-3">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{stepError}</span>
            </div>
          )}
        </div>

        {/* Desktop Bottom Controls Row: Previous (ghost) / Continue (dark pill) */}
        {step < 7 && (
          <div className="pt-4 border-t border-[var(--border-line)] flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              className="px-4 py-2 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-0 transition-opacity cursor-pointer flex items-center gap-1.5 min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="px-6 py-2.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] font-semibold text-xs hover:opacity-90 active:scale-[0.97] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm min-h-[44px]"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BrandSymbols, DmcMark } from '@/components/brand-symbols';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button, Input, Card, Badge } from '@dmcgrid/ui';
import { Phone, KeyRound, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { requestPhoneOtp, verifyPhoneOtp } from './actions';

export default function PortalAccessPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const supabase = createClient();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setMessage(null);
    setDevCode(null);

    const res = await requestPhoneOtp(phone);
    if (!res.ok) {
      setMessage({ text: res.error, type: 'error' });
      setLoading(false);
      return;
    }
    setDevCode(res.devCode ?? null);
    setMessage({ text: '6-digit code sent to your number.', type: 'success' });
    setStep('otp');
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    setLoading(true);
    setMessage(null);

    const res = await verifyPhoneOtp(phone, otpCode);
    if (!res.ok) {
      setMessage({ text: res.error, type: 'error' });
      setLoading(false);
      return;
    }

    await supabase.auth.setSession({
      access_token: res.session.access_token,
      refresh_token: res.session.refresh_token,
    });
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between p-6 md:p-12 relative overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)]">
      <BrandSymbols />

      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <DmcMark className="w-6 h-7 text-[var(--text-primary)]" />
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight">
              DMC<span className="text-[#D4B483] font-normal">Grid</span>
            </span>
            <span className="font-mono text-[9px] tracking-widest text-[var(--text-secondary)] uppercase">
              Travel Commerce Infrastructure
            </span>
          </div>
        </div>
        <div className="w-36">
          <ThemeToggle />
        </div>
      </div>

      {/* Access Box */}
      <div className="w-full max-w-md mx-auto my-12">
        <Card className="p-8 border border-[var(--border-line)] shadow-xl bg-[var(--bg-card)]">
          <div className="text-center mb-6">
            <Badge variant="gold" className="mb-3">
              SECURE PARTNER ACCESS
            </Badge>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Portal Sign-In
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Enter your registered mobile number to receive a 6-digit verification code.
            </p>
          </div>

          {devCode && (
            <div className="mb-5 p-3 rounded-[9px] text-xs bg-[#D4B483]/15 text-[var(--text-primary)] border border-[#D4B483]/30">
              <span className="font-mono">SMS gateway not connected — dev code: </span>
              <span className="font-mono font-bold text-lg tracking-widest">{devCode}</span>
            </div>
          )}

          {message && (
            <div
              className={`mb-5 p-3 rounded-[9px] text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                  : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <Input
                  id="phone"
                  type="tel"
                  label="REGISTERED MOBILE (INDIA)"
                  placeholder="+91 98XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="font-mono"
                  required
                />
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                  Indian numbers only. Your number must be registered with the operations team.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full gap-2 mt-2"
                isLoading={loading}
              >
                <Phone className="w-4 h-4" />
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  label="6-DIGIT VERIFICATION CODE"
                  placeholder="••••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="font-mono text-center tracking-[0.5em] text-lg font-bold"
                  required
                />
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5 text-center">
                  Sent to {phone}. Valid for 5 minutes.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full gap-2 mt-2"
                isLoading={loading}
              >
                <KeyRound className="w-4 h-4" />
                <span>Verify & Sign In</span>
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                  setDevCode(null);
                  setMessage(null);
                }}
                className="w-full text-center text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1 cursor-pointer"
              >
                ← Change number
              </button>
            </form>
          )}
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center font-mono text-[11px] text-[var(--text-muted)] max-w-md mx-auto">
        DMCGrid Platform · Strictly B2B · KYC Verified Partners Only
      </div>
    </div>
  );
}

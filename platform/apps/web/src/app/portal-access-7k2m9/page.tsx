'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BrandSymbols, DmcMark } from '@/components/brand-symbols';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button, Input, Card, Badge } from '@dmcgrid/ui';
import { Phone, KeyRound, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { requestPhoneOtp, verifyPhoneOtp, checkPhoneRegistered, submitOnboarding } from './actions';

export default function PortalAccessPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'onboarding' | 'submitted'>('signin');
  const [obStep, setObStep] = useState<'role' | 'company' | 'kyc'>('role');
  const [obRole, setObRole] = useState<'agent' | 'dmc'>('agent');
  const [obCompany, setObCompany] = useState('');
  const [obContact, setObContact] = useState('');
  const [obEmail, setObEmail] = useState('');
  const [obBio, setObBio] = useState('');
  const [obDestinations, setObDestinations] = useState('');
  const [obBizReg, setObBizReg] = useState('');
  const [obPan, setObPan] = useState('');
  const [obGst, setObGst] = useState('');
  const [obDocs, setObDocs] = useState('');

  const supabase = createClient();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setMessage(null);
    setDevCode(null);

    const reg = await checkPhoneRegistered(phone);
    if ('error' in reg) {
      setMessage({ text: reg.error, type: 'error' });
      setLoading(false);
      return;
    }
    if (!reg.registered) {
      setMode('onboarding');
      setObStep('role');
      setMessage({ text: 'This number is not registered yet — apply for partner access below.', type: 'success' });
      setLoading(false);
      return;
    }
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

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await submitOnboarding({
      role: obRole,
      phone,
      companyName: obCompany,
      contactName: obContact,
      email: obEmail || undefined,
      bio: obBio || undefined,
      destinations: obDestinations.split(',').map(x => x.trim()).filter(Boolean),
      businessReg: obBizReg,
      taxIdPan: obPan,
      gstNumber: obGst || undefined,
      documentUrls: obDocs.split('\n').map(x => x.trim()).filter(Boolean),
    });
    if (!res.ok) {
      setMessage({ text: res.error, type: 'error' });
      setLoading(false);
      return;
    }
    setMode('submitted');
    setLoading(false);
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

          {mode === 'signin' && (step === 'phone' ? (
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
          ))}

          {mode === 'submitted' && (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[#10B981]" />
              <h2 className="font-display text-xl font-bold">Application received</h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
                Our operations team will verify your business details and KYC documents within 1–2 business days. You'll be able to sign in with this number once approved.
              </p>
              <div className="pt-2 font-mono text-[11px] text-[var(--text-muted)]">
                {phone} · {obRole === 'agent' ? 'Travel Agent' : 'DMC'} · {obCompany}
              </div>
            </div>
          )}

          {mode === 'onboarding' && (
            <form onSubmit={handleSubmitOnboarding} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--text-muted)]">
                  Partner Application — Step {obStep === 'role' ? '1 of 3' : obStep === 'company' ? '2 of 3' : '3 of 3'}
                </span>
                <button type="button" onClick={() => { setMode('signin'); setMessage(null); }}
                  className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                  ← Back to sign-in
                </button>
              </div>

              {obStep === 'role' && (
                <div className="space-y-3">
                  <p className="text-xs text-[var(--text-secondary)]">What kind of partner are you?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => { setObRole('agent'); setObStep('company'); }}
                      className={`p-4 rounded-[9px] border text-left transition-all cursor-pointer ${obRole === 'agent' ? 'border-[#D4B483] bg-[#D4B483]/10' : 'border-[var(--border-line)] hover:bg-[var(--bg-card-hover)]'}`}>
                      <div className="font-display font-bold text-sm">Travel Agent</div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-1">Send RFQs to DMCs, compare quotes, book for your clients</div>
                    </button>
                    <button type="button" onClick={() => { setObRole('dmc'); setObStep('company'); }}
                      className={`p-4 rounded-[9px] border text-left transition-all cursor-pointer ${obRole === 'dmc' ? 'border-[#D4B483] bg-[#D4B483]/10' : 'border-[var(--border-line)] hover:bg-[var(--bg-card-hover)]'}`}>
                      <div className="font-display font-bold text-sm">DMC / Supplier</div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-1">Receive briefs, submit quotes, win agent business</div>
                    </button>
                  </div>
                </div>
              )}

              {obStep === 'company' && (
                <div className="space-y-3">
                  <Input id="ob-company" label="COMPANY NAME" placeholder={obRole === 'agent' ? 'e.g. Wanderlust Holidays' : 'e.g. Bali Heritage Tours'} value={obCompany} onChange={(e) => setObCompany(e.target.value)} required />
                  <Input id="ob-contact" label="CONTACT PERSON" placeholder="Full name" value={obContact} onChange={(e) => setObContact(e.target.value)} required />
                  <Input id="ob-email" type="email" label="BUSINESS EMAIL (OPTIONAL)" placeholder="ops@company.com" value={obEmail} onChange={(e) => setObEmail(e.target.value)} />
                  <Input id="ob-dest" label={obRole === 'agent' ? 'DESTINATIONS YOU SELL (COMMA-SEPARATED)' : 'DESTINATIONS YOU OPERATE (COMMA-SEPARATED)'} placeholder="Bali, Thailand, Dubai" value={obDestinations} onChange={(e) => setObDestinations(e.target.value)} />
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">ABOUT YOUR BUSINESS (OPTIONAL)</label>
                    <textarea id="ob-bio" rows={2}
                      placeholder={obRole === 'agent' ? 'Years in business, client segments, approx annual outbound volume…' : 'Fleet, guide network, years operating, DMC credentials…'}
                      value={obBio} onChange={(e) => setObBio(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-[9px] border border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#D4B483]/60" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={() => setObStep('role')}>← Back</Button>
                    <Button type="button" variant="primary" className="flex-1"
                      onClick={() => { if (obCompany.trim().length > 1 && obContact.trim().length > 1) setObStep('kyc'); else setMessage({ text: 'Company and contact name are required.', type: 'error' }); }}>
                      Continue →
                    </Button>
                  </div>
                </div>
              )}

              {obStep === 'kyc' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-[var(--text-muted)]">KYC verification is mandatory for all B2B partners. Your documents stay private and are reviewed only by our operations team.</p>
                  <Input id="ob-bizreg" label="BUSINESS REGISTRATION NO." placeholder="e.g. U74999MH2019PTC123456" value={obBizReg} onChange={(e) => setObBizReg(e.target.value)} required />
                  <Input id="ob-pan" label="PAN" placeholder="ABCDE1234F" value={obPan} onChange={(e) => setObPan(e.target.value.toUpperCase())} maxLength={10} className="font-mono" required />
                  <Input id="ob-gst" label="GSTIN (OPTIONAL)" placeholder="27ABCDE1234F1Z5" value={obGst} onChange={(e) => setObGst(e.target.value.toUpperCase())} maxLength={15} className="font-mono" />
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">DOCUMENT LINKS (ONE PER LINE)</label>
                    <textarea id="ob-docs" rows={3}
                      placeholder={'Registration certificate URL\nPAN card URL\nAnything else'}
                      value={obDocs} onChange={(e) => setObDocs(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-[9px] border border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#D4B483]/60 font-mono" />
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">Paste Drive/Dropbox links to your registration certificate & PAN. (Direct upload coming soon.)</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={() => setObStep('company')}>← Back</Button>
                    <Button type="submit" variant="primary" className="flex-1" isLoading={loading}>Submit Application</Button>
                  </div>
                </div>
              )}
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

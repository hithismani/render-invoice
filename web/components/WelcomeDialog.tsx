'use client';

import { useEffect, useState } from 'react';
import { VisualFrame, VisualInvoice, VisualMath, VisualLocal, VisualEditor, VisualExport } from './OnboardVisuals';

const KEY = 'renderinvoice.welcome.seen.v4';

const STEPS = [
  {
    kicker: 'Welcome',
    title: 'An unopinionated invoice generator.',
    body: 'No accounts, no backend, and no automated totals. You supply the data, we render the PDF.',
  },
  {
    kicker: 'You own the numbers',
    title: 'We never calculate.',
    body: 'Line items, tax, currency symbols, and totals: whatever you enter is what prints. Your accountant verifies the numbers, not the software.',
  },
  {
    kicker: 'Stays in this browser',
    title: 'Drafts save locally.',
    body: 'Edits write directly to IndexedDB on your machine. You can use File > History to restore earlier versions. Nothing gets uploaded to a server.',
  },
  {
    kicker: 'The editor',
    title: 'Form on the left, live preview on the right.',
    body: 'Content, Design, and Settings stack as you scroll down. Every text field accepts markdown: **bold** *italic* ~~strike~~ `code` [links](url) #–####### {@18} sizes, lists, quotes. Single newlines kept. Or paste raw JSON.',
  },
  {
    kicker: 'Leave with a file',
    title: 'Save a PDF or share a link.',
    body: 'Click Save PDF to download. When “PDF edit link” is on (default), the PDF ends with a bar — click it to reopen this exact invoice in the editor.',
  },
];

export default function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const show = () => { setStep(0); setOpen(true); };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem(KEY)) setOpen(true);
    const onShow = () => show();
    window.addEventListener('renderinvoice:onboard', onShow);
    return () => window.removeEventListener('renderinvoice:onboard', onShow);
  }, []);

  const dismiss = () => {
    try { window.localStorage.setItem(KEY, '1'); } catch {}
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (step < STEPS.length - 1) setStep((s) => s + 1);
        else dismiss();
      }
      if (e.key === 'ArrowLeft' && step > 0) {
        e.preventDefault();
        setStep((s) => s - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, step]);

  if (!open) return null;

  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111111] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_40px_80px_-20px_rgba(0,0,0,0.7)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.10),transparent_70%)]"
        />
        <StepVisual step={step} />
        <div className="relative px-7 pt-6 pb-7">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-white/35">{s.kicker}</div>
            <div className="text-[11px] tabular-nums text-white/25">{step + 1} / {STEPS.length}</div>
          </div>
          <h2 className="mt-3 text-[26px] leading-[1.15] font-semibold tracking-tight">{s.title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/50 min-h-[4.5rem]">{s.body}</p>

          <div className="mt-6 flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Step ${i + 1}`}
                onClick={() => setStep(i)}
                className={`h-1 rounded-full transition-all ${i === step ? 'w-6 bg-white' : 'w-1.5 bg-white/20 hover:bg-white/35'}`}
              />
            ))}
          </div>

          <div className="mt-7 flex items-center gap-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((n) => n - 1)}
                className="rounded-full px-4 py-3 text-[14px] font-medium text-white/50 hover:text-white transition-colors"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full px-4 py-3 text-[14px] font-medium text-white/35 hover:text-white/60 transition-colors"
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={() => { if (last) dismiss(); else setStep((n) => n + 1); }}
              className="ml-auto rounded-full bg-white text-[#111] text-[14px] font-medium px-5 py-3 hover:bg-white/90 transition-colors"
            >
              {last ? 'Start editing' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepVisual({ step }: { step: number }) {
  return (
    <div className="mx-4 mt-4">
      <VisualFrame>
        {step === 0 && <VisualInvoice />}
        {step === 1 && <VisualMath />}
        {step === 2 && <VisualLocal />}
        {step === 3 && <VisualEditor />}
        {step === 4 && <VisualExport />}
      </VisualFrame>
    </div>
  );
}

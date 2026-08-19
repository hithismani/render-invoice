import type { ReactNode } from 'react';

export function VisualFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-[148px] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
      {children}
    </div>
  );
}

export function VisualInvoice() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pt-4">
      <div className="w-[200px] h-[172px] rounded-t-lg bg-white text-[#111] shadow-[0_-8px_40px_rgba(0,0,0,0.5)] px-3.5 pt-3 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between border-b border-zinc-100 pb-2">
            <div>
              <div className="text-[9px] font-bold tracking-tight text-zinc-900 leading-tight">Acme Design Studio</div>
              <div className="text-[7px] text-zinc-400 mt-0.5">INV-2024-001 · Oct 24</div>
            </div>
            <div className="rounded bg-blue-50 px-1 py-0.5 text-[7px] font-semibold text-blue-700">PAID</div>
          </div>
          <div className="mt-2 space-y-1 text-[7px]">
            <div className="flex justify-between text-zinc-600">
              <span className="font-medium">Design Sprint (20 hrs)</span>
              <span className="font-mono text-zinc-900">$3,000</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span className="font-medium">Design System Assets</span>
              <span className="font-mono text-zinc-900">$1,200</span>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-100 pt-1.5 pb-2 flex justify-between items-baseline font-mono">
          <span className="text-[7px] text-zinc-400 font-sans uppercase tracking-wider">Total</span>
          <span className="text-[11px] font-bold text-zinc-900">$4,200.00</span>
        </div>
      </div>
    </div>
  );
}

export function VisualMath() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-3 px-6">
      <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-center">
        <div className="text-[10px] text-white/40">You typed</div>
        <div className="mt-0.5 font-mono text-base font-semibold text-white">$4,200.00</div>
      </div>
      <div className="text-white/30 text-sm">→</div>
      <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-center">
        <div className="text-[10px] text-white/40">We print</div>
        <div className="mt-0.5 font-mono text-base font-semibold text-white">$4,200.00</div>
      </div>
    </div>
  );
}

export function VisualLocal() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-4 px-6">
      <div className="relative shrink-0">
        <div className="size-14 rounded-2xl border border-white/10 bg-white/[0.04] grid place-items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/80">
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M9 7h6M9 11h6M9 15h3" />
          </svg>
        </div>
        <div className="absolute -right-1.5 -bottom-1.5 size-5 rounded-full bg-emerald-500 text-white grid place-items-center text-[10px] font-bold shadow-md">✓</div>
      </div>
      <div className="space-y-1 text-left">
        <div className="text-[12px] font-medium text-white/90">IndexedDB storage</div>
        <div className="text-[10px] text-white/40 leading-relaxed">Saves automatically to this browser. No server copy.</div>
      </div>
    </div>
  );
}

export function VisualEditor() {
  return (
    <div className="absolute inset-x-7 top-4 bottom-0 flex gap-2">
      <div className="w-[45%] rounded-t-lg border border-white/10 bg-white/[0.04] p-2 space-y-1.5 text-left">
        <div className="text-[7px] font-mono text-white/40 uppercase">Invoice Form</div>
        <div className="h-3 rounded bg-white/[0.08] px-1 text-[7px] text-white/70 flex items-center">Acme Studio</div>
        <div className="h-3 rounded bg-white/[0.04] px-1 text-[6px] text-white/40 flex items-center">Consulting ($150/hr)</div>
        <div className="h-3 rounded bg-white/[0.04] px-1 text-[6px] text-white/40 flex items-center">Net 30 terms</div>
      </div>
      <div className="flex-1 rounded-t-lg bg-white p-2.5 shadow-lg flex flex-col justify-between text-left">
        <div>
          <div className="text-[8px] font-bold text-zinc-900 leading-tight">Acme Studio</div>
          <div className="text-[6px] text-zinc-400 mt-0.5">Live vector preview</div>
        </div>
        <div className="flex justify-between items-baseline font-mono border-t border-zinc-100 pt-1">
          <span className="text-[6px] text-zinc-400 font-sans">Total</span>
          <span className="text-[9px] font-bold text-zinc-900">$4,200</span>
        </div>
      </div>
    </div>
  );
}

export function VisualExport() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-3 px-4">
      {/* Mini PDF card with clickable footer */}
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 w-[125px] shrink-0 text-left">
        <div className="text-[9px] text-white/40 mb-1 flex justify-between items-center">
          <span className="font-medium">Vector PDF</span>
        </div>
        <div className="h-[78px] rounded-md bg-white p-2 flex flex-col justify-between overflow-hidden shadow-sm">
          <div>
            <div className="text-[7px] font-bold text-zinc-900 leading-tight">Acme Studio</div>
            <div className="text-[6px] text-zinc-400">INV-001 · $4,200</div>
          </div>
          <div className="-mx-2 -mb-2 py-1 border-t border-blue-200 bg-blue-50 text-center">
            <span className="text-[6px] font-bold text-blue-700 tracking-wider">CLICK FOOTER TO EDIT ↗</span>
          </div>
        </div>
      </div>

      {/* Real example hand-off card */}
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 flex-1 text-left flex flex-col justify-between h-[106px]">
        <div>
          <div className="text-[9px] font-medium text-white/40 mb-1">Example invoice link</div>
          <div className="rounded-md bg-white/[0.06] px-2 py-1 font-mono text-[8px] text-emerald-400 truncate">
            invoicely.app/examples/freelance-consulting
          </div>
        </div>
        <div className="text-[9px] text-white/45 leading-tight">
          Pre-fills every field in the editor when opened. No account required.
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { VisualFrame } from './OnboardVisuals';

function VsLabel({ them }: { them?: boolean }) {
  return (
    <div className={`text-[8px] font-semibold tracking-[0.12em] uppercase leading-tight text-center px-1 ${them ? 'text-rose-300/70' : 'text-white/40'}`}>
      {them ? 'Other generators' : 'Our platform'}
    </div>
  );
}

function VsHandoff() {
  return (
    <div className="absolute inset-0 grid grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-2 border-r border-white/[0.06] bg-rose-950/25 px-3">
        <VsLabel them />
        <div className="w-full rounded-md bg-rose-950/50 border border-rose-300/20 px-2 py-2 text-center">
          <div className="text-[10px] text-rose-100/80 font-medium">Create account</div>
          <div className="mt-1 h-4 rounded bg-rose-400/80 text-[8px] text-rose-950 grid place-items-center font-semibold">Export PDF</div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 px-3">
        <VsLabel />
        <div className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 font-mono text-[8px] text-white/50 truncate">
          /print-view#j=…
        </div>
        <div className="h-8 w-12 rounded bg-white shadow-sm" />
      </div>
    </div>
  );
}

function VsShape() {
  return (
    <div className="absolute inset-0 grid grid-cols-2">
      <div className="flex flex-col justify-center gap-1.5 border-r border-white/[0.06] bg-rose-950/25 px-3">
        <VsLabel them />
        {['Item', 'Qty', 'Rate', 'Total'].map((c) => (
          <div key={c} className="flex items-center gap-1.5 min-w-0">
            <span className="size-2 shrink-0 rounded-sm border border-rose-300/40" />
            <span className="text-[10px] text-rose-100/70 truncate">{c}</span>
          </div>
        ))}
      </div>
      <div className="relative">
        <div className="absolute top-2 right-3"><VsLabel /></div>
        <div className="absolute inset-x-4 top-6 bottom-0 rounded-t-md bg-white px-2.5 pt-2.5 shadow-sm">
          <div className="h-1 w-8 rounded-full bg-zinc-200" />
          <div className="mt-2 flex flex-wrap gap-1">
            {['Hrs', 'Retainer', 'Ship'].map((c) => (
              <span key={c} className="rounded bg-zinc-100 px-1 py-0.5 text-[8px] text-zinc-600 font-medium">{c}</span>
            ))}
          </div>
          <div className="mt-2 h-1 w-full rounded-full bg-zinc-100" />
          <div className="mt-1 h-1 w-2/3 rounded-full bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

function VsMath() {
  return (
    <div className="absolute inset-0 grid grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-1.5 border-r border-white/[0.06] bg-rose-950/25 px-3">
        <VsLabel them />
        <div className="text-[10px] text-rose-200/50 line-through">$4,200</div>
        <div className="text-[11px] text-rose-200/80">+ auto tax</div>
        <div className="font-mono text-lg text-rose-100">$4,410</div>
      </div>
      <div className="flex flex-col items-center justify-center gap-1.5 px-3">
        <VsLabel />
        <div className="text-[10px] text-white/30">you typed</div>
        <div className="font-mono text-lg text-white">$4,200</div>
        <div className="text-[10px] text-white/30">we print $4,200</div>
      </div>
    </div>
  );
}

function VsData() {
  return (
    <div className="absolute inset-0 grid grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-1.5 border-r border-white/[0.06] bg-rose-950/25 px-3">
        <VsLabel them />
        <div className="size-10 rounded-lg border border-rose-300/30 grid place-items-center text-rose-200/80 text-lg">☁</div>
        <div className="font-mono text-[9px] text-rose-200/50">their-db.com</div>
      </div>
      <div className="flex flex-col items-center justify-center gap-1.5 px-3">
        <VsLabel />
        <div className="relative">
          <div className="size-10 rounded-lg border border-white/15 grid place-items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-white/80">
              <rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6" />
            </svg>
          </div>
          <div className="absolute -right-1 -bottom-1 size-4 rounded-full bg-white text-[#111] grid place-items-center text-[9px] font-bold">✓</div>
        </div>
        <div className="text-[10px] text-white/35">this machine</div>
      </div>
    </div>
  );
}

function VsSelfHost() {
  return (
    <div className="absolute inset-0 grid grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-1.5 border-r border-white/[0.06] bg-rose-950/25 px-3">
        <VsLabel them />
        <div className="rounded border border-rose-300/30 bg-rose-950/40 px-2 py-1 text-center font-mono text-[10px] text-rose-200">
          $29/mo SaaS
        </div>
        <div className="text-[9px] text-rose-300/50">paywalled tiers</div>
      </div>
      <div className="flex flex-col items-center justify-center gap-1.5 px-3">
        <VsLabel />
        <div className="flex items-center gap-1 rounded border border-white/10 bg-white/[0.05] px-2.5 py-1 font-mono text-[9px] text-white/80">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Free in browser
        </div>
        <div className="text-[9px] text-white/35">or 1-click self-host · $0</div>
      </div>
    </div>
  );
}

const CARDS = [
  {
    kicker: 'No account wall',
    title: 'Open link. Edit. Done.',
    body: 'No email verification, passwords, or paywalls. You are editing the moment you open the page.',
    Visual: VsHandoff,
  },
  {
    kicker: 'No forced templates',
    title: 'Your columns, not ours.',
    body: 'Retainers, milestones, hourly rates, or shipping blocks. Shape the invoice around your work, not a rigid template.',
    Visual: VsShape,
  },
  {
    kicker: 'No surprise math',
    title: 'What you type is what prints.',
    body: 'No unwanted tax formulas or rounding quirks. If you enter $4,200, $4,200 is what renders on the PDF.',
    Visual: VsMath,
  },
  {
    kicker: 'Zero server storage',
    title: 'Your data stays yours.',
    body: 'Drafts auto-save to your browser\'s IndexedDB. Share via URL hash. We have no backend to leak.',
    Visual: VsData,
  },
  {
    kicker: 'Free or self-hosted',
    title: 'Free in browser. Or host it.',
    body: 'Use it completely free right here in your browser, or deploy the static app and worker to your own Cloudflare in one click.',
    Visual: VsSelfHost,
  },
];

export default function WhyCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const isPointerDownRef = useRef(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);

    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-carousel-card]'));
    if (!cards.length) return;

    const center = scrollLeft + clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const dist = Math.abs(center - cardCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-carousel-card]');
    const targetCard = cards[index];
    if (!targetCard) return;

    const targetLeft = targetCard.offsetLeft - (el.clientWidth - targetCard.clientWidth) / 2;
    el.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  };

  const next = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const nextIdx = Math.min(CARDS.length - 1, activeIndex + 1);
    scrollToIndex(nextIdx);
  };

  const prev = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const prevIdx = Math.max(0, activeIndex - 1);
    scrollToIndex(prevIdx);
  };

  // Pointer drag events for desktop mouse + touch drag
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    isPointerDownRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 5 && !isDragging) {
      setIsDragging(true);
    }
    el.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const onPointerUpOrLeave = () => {
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      setTimeout(() => setIsDragging(false), 50);
      updateScrollState();
    }
  };

  return (
    <div className="relative mt-12 select-none">
      {/* Carousel Scroll Container */}
      <div
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUpOrLeave}
        onPointerCancel={onPointerUpOrLeave}
        className={`overflow-x-auto scrollbar-none pb-4 pt-2 cursor-grab active:cursor-grabbing touch-pan-x ${
          isDragging ? 'snap-none' : 'snap-x snap-mandatory scroll-smooth'
        }`}
      >
        <div className="flex gap-4 px-4 sm:px-6 lg:px-[max(2rem,calc((100vw-64rem)/2))]">
          {CARDS.map(({ kicker, title, body, Visual }, i) => (
            <div
              key={kicker}
              data-carousel-card
              onClick={() => {
                if (!isDragging) scrollToIndex(i);
              }}
              className={`w-[min(380px,85vw)] shrink-0 snap-center overflow-hidden rounded-[28px] border transition-all duration-300 bg-[#111111] text-left shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_40px_-15px_rgba(0,0,0,0.6)] cursor-pointer ${
                i === activeIndex
                  ? 'border-white/20 ring-1 ring-white/10 scale-[1.01]'
                  : 'border-white/[0.08] opacity-80 hover:opacity-100 hover:border-white/15'
              }`}
            >
              <div className="p-3 pb-0 pointer-events-none">
                <VisualFrame>
                  <Visual />
                </VisualFrame>
              </div>
              <div className="px-6 pt-5 pb-6">
                <div className="text-[12px] font-medium tracking-[0.14em] uppercase text-white/40">{kicker}</div>
                <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="mt-6 flex items-center justify-between px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Step Dots */}
        <div className="flex items-center gap-1.5">
          {CARDS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-7 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Prev / Next Chevrons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={(e) => {
              e.preventDefault();
              prev();
            }}
            disabled={!canScrollLeft}
            className="size-9 rounded-full border border-white/10 bg-white/5 grid place-items-center text-white/80 hover:text-white hover:bg-white/15 hover:border-white/25 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-sm"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={(e) => {
              e.preventDefault();
              next();
            }}
            disabled={!canScrollRight}
            className="size-9 rounded-full border border-white/10 bg-white/5 grid place-items-center text-white/80 hover:text-white hover:bg-white/15 hover:border-white/25 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-sm"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

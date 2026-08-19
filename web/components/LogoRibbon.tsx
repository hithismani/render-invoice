'use client';

import { useEffect, useState } from 'react';

const SEQUENCE = ['Free', 'No signup', 'No card', 'Private'];

export default function LogoRibbon({ dark = false, className = '' }: { dark?: boolean; className?: string }) {
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setStep((prev) => (prev + 1) % SEQUENCE.length);
        setFade(true);
      }, 200);
    }, 2200);

    return () => clearTimeout(timer);
  }, [step]);

  const text = SEQUENCE[step];

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide select-none transition-all duration-300 ${
        dark
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
      } ${className}`}
    >
      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <span
        className={`whitespace-nowrap transition-all duration-200 inline-block transform ${
          fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-1 scale-95'
        }`}
      >
        {text}
      </span>
    </span>
  );
}

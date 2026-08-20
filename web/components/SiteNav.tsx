'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ButtonLink } from './ui/button';
import { IArrowRight, IGithub } from './Icons';
import LogoRibbon from './LogoRibbon';
import GitHubStar from './GitHubStar';
import ApiNavMenu from './ApiNavMenu';
import { REPO } from '@/lib/repo';

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight min-w-0">
          <div className="size-7 shrink-0 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center shadow-sm shadow-blue-600/30">
            <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
            </svg>
          </div>
          <span className="truncate">RenderInvoice</span>
          <LogoRibbon className="ml-0.5 hidden xs:inline-flex sm:inline-flex" />
        </Link>

        <div className="hidden md:flex items-center gap-5 text-sm">
          <Link href="/examples" className="text-zinc-600 hover:text-zinc-900 transition-colors">Examples</Link>
          <ApiNavMenu />
          <GitHubStar />
          <ButtonLink href="/playground" variant="default" size="sm">
            Open app <IArrowRight className="size-3.5" />
          </ButtonLink>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ButtonLink href="/playground" variant="default" size="sm" className="!px-3">
            Open <IArrowRight className="size-3.5" />
          </ButtonLink>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="size-9 grid place-items-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          >
            {open ? (
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            ) : (
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-zinc-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1 text-sm">
            <Link href="/examples" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-zinc-700 hover:bg-zinc-50">Examples</Link>
            <Link href="/developers" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-zinc-700 hover:bg-zinc-50">API</Link>
            <Link href="/developers#worker" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-zinc-500 hover:bg-zinc-50 pl-5 text-xs">PDF worker · free</Link>
            <a
              href={REPO.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-zinc-700 hover:bg-zinc-50 inline-flex items-center gap-2"
            >
              <IGithub className="size-4" /> GitHub
            </a>
            <Link href="/playground" onClick={() => setOpen(false)} className="mt-1 rounded-lg px-3 py-2.5 bg-zinc-900 text-white text-center font-medium">
              Open app
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

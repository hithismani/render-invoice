import Link from 'next/link';
import { ButtonLink } from './ui/button';
import { IArrowRight } from './Icons';
import LogoRibbon from './LogoRibbon';

export default function SiteNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="size-7 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center shadow-sm shadow-blue-600/30">
            <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
            </svg>
          </div>
          <span>Invoicely</span>
          <LogoRibbon className="ml-1" />
        </Link>
        <div className="flex items-center gap-1 sm:gap-5 text-sm">
          <Link href="/examples" className="hidden sm:inline text-zinc-600 hover:text-zinc-900 transition-colors">Examples</Link>
          <Link href="/developers" className="hidden md:inline text-zinc-600 hover:text-zinc-900 transition-colors">Developers</Link>
          <Link href="/changelog" className="hidden lg:inline text-zinc-600 hover:text-zinc-900 transition-colors">Changelog</Link>
          <ButtonLink href="/playground" variant="default" size="sm">
            Open app <IArrowRight className="size-3.5" />
          </ButtonLink>
        </div>
      </div>
    </nav>
  );
}

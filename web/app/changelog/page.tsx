import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Product updates for RenderInvoice, the unopinionated invoice generator. New render engines, templates, and PDF export changes.',
  alternates: { canonical: '/changelog' },
  openGraph: {
    title: 'Changelog — RenderInvoice',
    description: 'Updates to the invoice generator, render worker, and PDF export.',
    url: '/changelog',
  },
};

const entries = [
  {
    version: 'v1.3',
    date: '2026-08-19',
    tag: 'new',
    title: 'Satori vector PDF on the free plan',
    body: 'The default Worker path (Satori) now emits a real vector PDF with selectable text from the same template as the playground. No second layout, no PNG-in-PDF. Browser Rendering remains available on Workers Paid for Chromium print-view.',
  },
  {
    version: 'v1.2',
    date: '2026-04-25',
    tag: 'new',
    title: 'Inter font and design trim',
    body: 'The classic and bold designs now bundle the Inter font to prevent system font inconsistencies across operating systems. Removed the minimal design, refined default export settings, and added Satori render fixtures to keep worker output aligned with the browser preview.',
  },
  {
    version: 'v1.1',
    date: '2026-04-14',
    tag: 'new',
    title: 'Satori render path and social cards',
    body: 'The self-hosted Cloudflare Worker now defaults to a Satori pipeline, rendering in 50 to 200 ms per invoice at roughly $0.15 per 1,000 requests. Vector PDFs with selectable text remain available using ?engine=browser. Added ?format=pdf|png output options, and each example page now includes its own open graph image.',
  },
  {
    version: 'v1.0',
    date: '2026-04-14',
    tag: 'new',
    title: 'RenderInvoice v1',
    body: 'Initial release of the Next.js 15 browser app. Includes form and JSON editors, multiple template designs, RTL support, field reordering, local draft storage in IndexedDB, URL sharing, and an optional self-hosted Cloudflare Worker for automated PDF rendering.',
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />
      <header className="border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Badge variant="blue" className="mb-4">Changelog</Badge>
          <h1 className="text-5xl font-extrabold tracking-tight">What&rsquo;s new.</h1>
          <p className="mt-3 text-zinc-600 text-lg">A log of product updates. Newest first.</p>
        </div>
      </header>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {entries.map((e, i) => (
          <div key={i} className="relative pl-8 border-l-2 border-zinc-100">
            <div className="absolute -left-[7px] top-1 size-3 rounded-full bg-zinc-900 ring-4 ring-white" />
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="font-mono font-medium text-zinc-900">{e.version}</span>
              <span>·</span>
              <span>{new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <Badge variant={e.tag === 'new' ? 'green' : 'amber'}>{e.tag}</Badge>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight">{e.title}</h2>
            <p className="mt-2 text-zinc-600 leading-relaxed">{e.body}</p>
          </div>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}

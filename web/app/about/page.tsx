import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';


export const metadata: Metadata = {
  title: 'About',
  description:
    'Why RenderInvoice exists: an unopinionated invoice generator that renders the data you already have. Browser-only, no accounts, no lock-in.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About RenderInvoice',
    description: 'An unopinionated invoice generator that renders the data you already have.',
    url: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Badge variant="blue" className="mb-4">About</Badge>
        <h1 className="text-5xl font-extrabold tracking-tight text-balance">Why we built RenderInvoice.</h1>
        <div className="mt-8 space-y-6 text-lg text-zinc-700 leading-relaxed">
          <p>
            Most invoice software enforces rigid assumptions, such as fixed tax formulas or mandatory field layouts. When an invoice requires multiple recipient locations, retainer credits, or custom column names, those tools quickly become frustrating.
          </p>
          <p>
            RenderInvoice treats an invoice as <strong>data you already have</strong>. You define the columns, summary rows, and recipient details. The app renders the layout and exports a clean vector PDF directly in your browser.
          </p>
          <p>
            There are no backend databases, user accounts, or tracking scripts. Your invoice data remains in your browser tab. Drafts and templates save to <code className="px-1.5 py-0.5 rounded bg-zinc-100">IndexedDB</code>, and links use an encoded URL hash. When you return to the page, your draft restores automatically.
          </p>
          <h2 className="text-2xl font-bold tracking-tight mt-12">Principles</h2>
          <ul className="space-y-2 list-disc pl-6 marker:text-zinc-400">
            <li><strong>Flexible formatting:</strong> We do not recalculate totals or reformat currencies, leaving values exactly as you enter them.</li>
            <li><strong>Browser-only:</strong> No servers or analytics services process your invoice data.</li>
            <li><strong>Portable:</strong> Invoices store as standard JSON, so you can share links or save local backup files.</li>
            <li><strong>Direct export:</strong> Single-page auto-fit is the default, with standard A4 multi-page export available when needed.</li>
          </ul>
        </div>
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <h3 className="font-bold text-lg">Try it for yourself.</h3>
          <p className="text-sm text-zinc-600 mt-1">No account or installation required.</p>
          <ButtonLink href="/playground" variant="primary" className="mt-4">Open playground →</ButtonLink>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

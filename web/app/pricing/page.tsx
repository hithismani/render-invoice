import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { ICheck } from '@/components/Icons';


export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'RenderInvoice is a free invoice generator. Unlimited invoices, PDF export, and a self-hostable Cloudflare Worker. No accounts or paywalls.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing — RenderInvoice is free forever',
    description: 'Unlimited invoices, PDF export, and a self-hostable render API. $0 forever.',
    url: '/pricing',
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Badge variant="green" className="mb-4">Pricing</Badge>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-balance">Free. <span className="gradient-text">Forever.</span></h1>
        <p className="mt-4 text-lg text-zinc-600 max-w-xl mx-auto">
          There&rsquo;s no backend to fund and no data to monetize. Use RenderInvoice as much as you want.
        </p>
        <div className="mt-10 max-w-md mx-auto">
          <Card className="text-left p-8">
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide">All features</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold">$0</span>
              <span className="text-zinc-500">/forever</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm">
              {[
                'Unlimited invoices',
                'All 6+ examples',
                'Unlimited local drafts',
                'Vector PDF export',
                'Shareable URLs with QR codes',
                'JSON / form dual editor',
                'Drag-to-reorder everything',
                'Offline & installable (PWA)',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <ICheck className="size-4 text-emerald-600" /> {f}
                </li>
              ))}
            </ul>
            <ButtonLink href="/playground" variant="primary" size="lg" className="w-full mt-6">Open the app →</ButtonLink>
            <p className="mt-3 text-xs text-zinc-500 text-center">No sign-up or credit card required.</p>
          </Card>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

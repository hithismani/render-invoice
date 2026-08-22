import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TEMPLATES } from '@/lib/templates';
import { IArrowRight } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Invoice Examples & PDF Templates',
  description:
    'Ready-made invoice examples for freelancers, SaaS, agencies, UK VAT, US sales tax, and multi-shipment. Customize any template and download a PDF.',
  alternates: { canonical: '/examples' },
  openGraph: {
    title: 'Invoice Examples & PDF Templates - RenderInvoice',
    description: 'Freelance, SaaS, agency, VAT, and sales-tax invoice examples you can edit and export as PDF.',
    url: '/examples',
  },
};

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />
      <header className="relative border-b border-zinc-200 overflow-hidden">
        <div aria-hidden className="absolute inset-0 dot-grid mask-fade-b" />
        <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[760px] h-[360px] bg-gradient-to-tr from-blue-200/40 via-indigo-200/30 to-transparent rounded-full blur-3xl -z-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 animate-in-up">
          <Badge variant="blue" className="mb-4">Examples</Badge>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-balance max-w-3xl">
            Pick a starting point.<br /><span className="gradient-text">Customize everything.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-600 text-pretty">
            Every example is fully editable. Open any template in the playground, update your details, and export the final PDF directly from your browser.
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEMPLATES.map((t, i) => (
            <Link
              key={t.slug}
              href={`/examples/${t.slug}`}
              className="group animate-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Card className="h-full p-7 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 group-hover:text-blue-700 transition-colors">{t.name}</h2>
                  <IArrowRight className="size-4 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm font-medium text-blue-700 mb-3">{t.tagline}</p>
                <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">{t.description}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {t.keywords.slice(0, 3).map((k) => (
                    <span key={k} className="text-[11px] px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full">{k}</span>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

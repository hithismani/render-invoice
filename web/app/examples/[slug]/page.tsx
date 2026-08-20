import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SatoriPreview from '@/components/SatoriPreview';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TEMPLATES, getTemplate, type TemplateDef } from '@/lib/templates';
import { encodeShareHash } from '@/lib/share';
import { IArrowRight } from '@/components/Icons';

export async function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return {};
  return {
    title: `${t.name} Invoice Example`,
    description: `${t.tagline} ${t.description}`.slice(0, 160),
    keywords: [...t.keywords, 'invoice example', 'invoice template', 'invoice PDF'],
    alternates: { canonical: `/examples/${t.slug}` },
    openGraph: {
      title: `${t.name} Invoice Example — RenderInvoice`,
      description: t.description,
      url: `/examples/${t.slug}`,
    },
  };
}

export default async function ExamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) notFound();

  const shareHash = encodeShareHash(t.invoice);
  const related = TEMPLATES.filter((x) => x.slug !== t.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <header className="relative border-b border-zinc-200 overflow-hidden">
        <div aria-hidden className="absolute inset-0 dot-grid mask-fade-b" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <nav className="text-sm text-zinc-500 flex items-center gap-2">
            <Link href="/" className="hover:text-zinc-900">Home</Link>
            <span>›</span>
            <Link href="/examples" className="hover:text-zinc-900">Examples</Link>
            <span>›</span>
            <span className="text-zinc-900">{t.name}</span>
          </nav>
          <div className="mt-6 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-start">
            <div>
              <Badge variant="blue" className="mb-4">Invoice example</Badge>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">{t.name} Invoice</h1>
              <p className="mt-3 text-lg text-blue-700 font-medium">{t.tagline}</p>
              <p className="mt-3 text-zinc-600 leading-relaxed">{t.description}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href={`/playground${shareHash}`} variant="default" size="lg">
                  Customize this example <IArrowRight />
                </ButtonLink>
                <ButtonLink href="/examples" variant="secondary" size="lg">
                  All examples
                </ButtonLink>
              </div>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {t.keywords.map((k) => (
                  <span key={k} className="text-xs px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-full">{k}</span>
                ))}
              </div>
            </div>
            <aside className="hidden lg:block">
              <Card className="p-5 bg-zinc-50/60">
                <div className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3">Included</div>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-zinc-500">Columns</dt>
                    <dd className="text-zinc-900 font-medium">{t.invoice.columns.join(' · ')}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Summary rows</dt>
                    <dd className="text-zinc-900 font-medium">{t.invoice.summary.map((s) => s.label).join(' · ')}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Recipients</dt>
                    <dd className="text-zinc-900 font-medium">{t.invoice.invoiceTo.length} block{t.invoice.invoiceTo.length > 1 ? 's' : ''}</dd>
                  </div>
                </dl>
              </Card>
            </aside>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Preview</h2>
          <span className="text-xs text-zinc-500">Everything below is fully editable.</span>
        </div>
        <Card className="p-2 bg-zinc-50/40 overflow-hidden">
          <SatoriPreview invoice={t.invoice} />
        </Card>

        {/* Paraphrased template philosophy & comparison section */}
        <TemplatePhilosophySection template={t} />

        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight">Other examples</h2>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r.slug} href={`/examples/${r.slug}`} className="group">
                <Card className="h-full p-5 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 group-hover:text-blue-700 transition-colors">{r.name}</h3>
                    <IArrowRight className="size-3.5 text-zinc-300 group-hover:text-blue-600 transition-all" />
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{r.tagline}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function TemplatePhilosophySection({ template }: { template: TemplateDef }) {
  const shareHash = encodeShareHash(template.invoice);
  return (
    <section className="my-16">
      <div className="relative rounded-3xl bg-zinc-950 text-white p-8 sm:p-12 lg:p-14 overflow-hidden noise border border-zinc-800 shadow-2xl">
        <div aria-hidden className="absolute inset-0 dot-grid-dark opacity-50" />
        <div aria-hidden className="absolute -top-32 right-1/4 w-[500px] h-[350px] bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="blue-dark" className="mb-4">
              Customization guide
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-balance leading-tight">
              Start with this structure. <br />
              <span className="text-zinc-400">Make it your own in seconds.</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed text-pretty">
              Every field in this {template.name.toLowerCase()} example is fully editable. Open it in the playground to adjust columns, swap rates, and download a PDF.
            </p>
          </div>

          {/* 3 Steps to Customize */}
          <div className="mt-10">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5">
                <div className="text-blue-400 font-mono text-xs font-bold mb-1.5">STEP 01</div>
                <div className="font-semibold text-white text-base">Open in editor</div>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Loads all line items, columns, summary rows, and styling directly into your browser.
                </p>
              </div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5">
                <div className="text-blue-400 font-mono text-xs font-bold mb-1.5">STEP 02</div>
                <div className="font-semibold text-white text-base">Edit details</div>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Add or remove columns, update recipient addresses, choose a Google Font, or change the accent color.
                </p>
              </div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5">
                <div className="text-blue-400 font-mono text-xs font-bold mb-1.5">STEP 03</div>
                <div className="font-semibold text-white text-base">Export PDF</div>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Download a PDF with selectable text, or copy a link to share with clients.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.06] border border-white/10">
            <div>
              <div className="font-semibold text-white text-base">Customize this {template.name.toLowerCase()} invoice</div>
              <p className="text-xs text-zinc-400 mt-0.5">Runs 100% in your browser. No sign-up or card required.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ButtonLink href={`/playground${shareHash}`} variant="secondary" size="md">
                Open in editor <IArrowRight />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

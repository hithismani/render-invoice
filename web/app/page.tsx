import Link from 'next/link';
import dynamic from 'next/dynamic';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import WhyCarousel from '@/components/WhyCarousel';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TEMPLATES } from '@/lib/templates';
import {
  ILayers,
  IUsers,
  IColumns,
  IBold,
  IImage,
  IMaximize,
  IXCircle,
  IShield,
  IArrowRight,
  ICheck,
  IGithub,
} from '@/components/Icons';
import { REPO } from '@/lib/repo';


const InteractiveHeroMock = dynamic(() => import('@/components/InteractiveHeroMock'), {
  loading: () => <div className="h-[520px] rounded-2xl bg-zinc-100 animate-pulse" />,
});

export default function HomePage() {
  return (
    <main className="bg-white text-zinc-900 overflow-hidden">
      <SiteNav />
      <Hero />
      <Logos />
      <Why />
      <HowItWorks />
      <Features />
      <ExamplesStrip />
      <DevelopersStrip />
      <CTA />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div aria-hidden className="absolute inset-0 dot-grid mask-fade-b" />
      <div aria-hidden className="absolute top-20 left-1/2 -translate-x-1/2 w-[760px] h-[520px] bg-gradient-to-tr from-blue-200/40 via-indigo-200/40 to-transparent rounded-full blur-3xl -z-10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-20 grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div className="animate-in-up">
          <Badge variant="outline" className="mb-6">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% browser · zero backend · vector PDFs
          </Badge>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-balance leading-[1.02]">
            Invoices that<br />
            <span className="gradient-text">don&rsquo;t have opinions.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg sm:text-xl text-zinc-600 text-pretty">
            Every invoice tool tells you how to bill. RenderInvoice simply renders your data with a flexible schema, live preview, and vector PDF export. No sign-up required, and nothing leaves your browser.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/playground" variant="default" size="lg">
              Try it free <IArrowRight />
            </ButtonLink>
            <ButtonLink href="/examples" variant="secondary" size="lg">
              Browse examples
            </ButtonLink>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500">
            {['No signup · No card', 'No tracking', 'Selectable PDF text', 'Works offline'].map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5">
                <ICheck className="size-4 text-emerald-600" /> {f}
              </span>
            ))}
          </div>
        </div>
        <div className="animate-in-up" style={{ animationDelay: '120ms' }}>
          <InteractiveHeroMock />
        </div>
      </div>
    </section>
  );
}

function Logos() {
  const items = ['Freelancers', 'Agencies', 'Consultants', 'SaaS teams', 'Fractional execs', 'Indie hackers'];
  return (
    <section className="border-y border-zinc-200 bg-zinc-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-xs font-medium tracking-widest text-zinc-500 uppercase">Built for</p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-10 gap-y-3 text-zinc-400 text-sm font-medium">
          {items.map((i) => <span key={i} className="hover:text-zinc-900 transition-colors">{i}</span>)}
        </div>
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden noise">
      <div aria-hidden className="absolute inset-0 dot-grid-dark opacity-60" />
      <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-transparent rounded-full blur-3xl" />
      <div className="relative py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <Badge variant="blue-dark" className="mb-4">
            Why this exists
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-tight">
            Every invoice tool has opinions. <br className="hidden sm:inline" /><span className="text-zinc-400">This one doesn&rsquo;t.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed text-pretty">
            Your invoice generator shouldn&rsquo;t try to be your compliance team or tax advisor. It should simply take your data, render a clean vector PDF, and let you hand it over to accounting and compliance to verify.
          </p>
        </div>

        <WhyCarousel />

        <p className="mt-10 text-center text-lg sm:text-xl text-white/80 max-w-2xl mx-auto px-4 text-balance">
          Build the invoice your way.{' '}
          <strong className="text-white">Then just cross-check with your accountant.</strong>
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Describe', body: 'Fill out the form or paste JSON. Add the exact fields your invoice requires.' },
    { n: '02', title: 'Preview', body: 'Review the live preview. Validation catches column and key mismatches inline.' },
    { n: '03', title: 'Download', body: 'Print directly to a vector PDF with selectable text in one click.' },
  ];
  return (
    <section id="how" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Badge variant="blue" className="mb-4">How it works</Badge>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">Create your invoice in three simple steps.</h2>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-6 relative">
          <div aria-hidden className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
          {steps.map((s) => (
            <div key={s.n} className="relative group">
              <Card className="p-8 hover:border-zinc-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 pt-10">
                <div className="absolute -top-4 left-6 size-12 rounded-xl bg-zinc-900 text-white grid place-items-center font-bold shadow-lg">{s.n}</div>
                <h3 className="text-xl font-bold text-zinc-900">{s.title}</h3>
                <p className="mt-2 text-zinc-600 leading-relaxed">{s.body}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { I: IXCircle, title: 'No account', body: 'No signup, no email confirm, no password. Open the page and type.' },
    { I: IShield, title: 'No credentials', body: 'Nothing to log into. Nothing we could leak. There is no server holding a key.' },
    { I: IUsers, title: 'Nothing of yours stored', body: 'Drafts live in this browser. Close the tab and we have never seen the invoice.' },
    { I: ILayers, title: 'Self-hostable', body: 'Clone it. Deploy the static app and the worker to your own Cloudflare in one click.' },
    { I: IColumns, title: 'Endless columns', body: 'Add as many line-item columns as the job needs. Rename them. Reorder them.' },
    { I: IUsers, title: 'Endless rows', body: 'One line or two hundred. Add recipients, shipments, and summary rows without limits.' },
    { I: IBold, title: 'Markdown in any field', body: 'Bold, italic, strikethrough, and links wherever you need them.' },
    { I: IImage, title: 'Logo & signature', body: 'URL or upload. Size it. No third-party image host required.' },
    { I: IMaximize, title: 'Auto-fit or A4', body: 'Single-page auto-fit, or shrink to a standard sheet.' },
  ];

  return (
    <section id="features" className="relative py-24 sm:py-32 bg-zinc-50/60 border-y border-zinc-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant="blue" className="mb-4">Features</Badge>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">
            No account. No credentials. Just a browser with an internet connection.
          </h2>
        </div>
      </div>
      <div className="mt-14 overflow-hidden select-none marquee-pause [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="flex">
          <div className="flex shrink-0 gap-4 pr-4 py-2 animate-marquee">
            {feats.map(({ I, title, body }, i) => (
              <Card key={`a-${i}`} className="w-[300px] shrink-0 p-6 hover:border-zinc-300 hover:shadow-lg transition-all">
                <div className="size-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 grid place-items-center mb-4">
                  <I />
                </div>
                <h3 className="font-semibold text-zinc-900">{title}</h3>
                <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">{body}</p>
              </Card>
            ))}
          </div>
          <div aria-hidden="true" className="flex shrink-0 gap-4 pr-4 py-2 animate-marquee">
            {feats.map(({ I, title, body }, i) => (
              <Card key={`b-${i}`} className="w-[300px] shrink-0 p-6 hover:border-zinc-300 hover:shadow-lg transition-all">
                <div className="size-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 grid place-items-center mb-4">
                  <I />
                </div>
                <h3 className="font-semibold text-zinc-900">{title}</h3>
                <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DevelopersStrip() {
  return (
    <section className="py-20 bg-zinc-950 text-white relative overflow-hidden noise">
      <div aria-hidden className="absolute inset-0 dot-grid-dark opacity-40" />
      <div aria-hidden className="absolute -top-20 right-1/4 w-[500px] h-[400px] bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-full blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <Badge variant="outline-dark" className="mb-4">For developers & AI agents</Badge>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">
              Agent-friendly. <br /><span className="text-zinc-400">Still no backend.</span>
            </h2>
            <p className="mt-4 max-w-xl text-zinc-300 leading-relaxed">
              The playground parses invoice JSON directly from the URL hash, so any script or AI agent that outputs a link can hand off a complete invoice. If you need batch PDF generation, deploy the Cloudflare Worker. If you prefer spreadsheets, a single <code className="font-mono text-zinc-200">=HYPERLINK</code> formula creates editable invoices.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/developers" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition-colors">
                API docs <IArrowRight />
              </Link>
              <a href="/llms.txt" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/15 text-white hover:bg-white/5 transition-colors font-mono text-sm">
                /llms.txt
              </a>
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur rounded-2xl border border-white/10 p-6 text-xs font-mono leading-relaxed">
            <div className="text-zinc-400 mb-2"># 1. Deploy (free, Satori vector PDF)</div>
            <div className="text-zinc-200">npx wrangler deploy</div>
            <div className="text-zinc-400 mt-4 mb-2"># 2. Render invoices via curl</div>
            <pre className="text-zinc-200 whitespace-pre overflow-x-auto">{`curl -X POST \\
  https://your-worker.workers.dev/v1/render \\
  -H 'Content-Type: application/json' \\
  --data-binary @invoice.json \\
  --output invoice.pdf`}</pre>
            <div className="text-zinc-400 mt-4 mb-2"># 3. Zero-backend links (put the JSON in the hash)</div>
            <div className="text-emerald-300">https://renderinvoice.com/playground#j=&lt;json&gt;   <span className="text-zinc-500"># edit</span></div>
            <div className="text-emerald-300">https://renderinvoice.com/print-view#j=&lt;json&gt;  <span className="text-zinc-500"># print</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExamplesStrip() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div className="max-w-2xl">
            <Badge variant="blue" className="mb-4">Examples</Badge>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">Start from a real-world example.</h2>
            <p className="mt-3 text-zinc-600">Freelance, SaaS, agency retainers, UK VAT, US sales tax, multi-shipment.</p>
          </div>
          <Link href="/examples" className="inline-flex items-center gap-1.5 text-blue-700 font-medium hover:text-blue-900 transition-colors">
            See all examples <IArrowRight />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.slice(0, 6).map((t) => (
            <Link key={t.slug} href={`/examples/${t.slug}`} className="group">
              <Card className="h-full p-6 hover:border-blue-300 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-zinc-900 group-hover:text-blue-700 transition-colors">{t.name}</h3>
                  <IArrowRight className="size-4 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm text-blue-700 mb-2 font-medium">{t.tagline}</p>
                <p className="text-sm text-zinc-600 line-clamp-2">{t.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-zinc-950 text-white p-10 sm:p-16 overflow-hidden noise">
          <div aria-hidden className="absolute inset-0 dot-grid-dark opacity-40" />
          <div aria-hidden className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/40 to-indigo-600/40 rounded-full blur-3xl" />
          <div aria-hidden className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-purple-600/30 to-pink-600/30 rounded-full blur-3xl" />
          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">
              Generate an invoice in<br /><span className="gradient-text">under a minute.</span>
            </h2>
            <p className="mt-4 text-zinc-300 text-lg">Open the playground, adjust the fields, and save your PDF.</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/playground" variant="secondary" size="lg">Open the playground <IArrowRight /></ButtonLink>
              <a
                href={REPO.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 h-12 px-6 text-base rounded-xl font-medium bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-all"
              >
                <IGithub className="size-4" /> Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

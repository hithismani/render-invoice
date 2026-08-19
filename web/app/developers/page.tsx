import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { IArrowRight, IGithub } from '@/components/Icons';
import { REPO } from '@/lib/repo';
import SchemaReference from '@/components/SchemaReference';
import CopyPrompt from '@/components/CopyPrompt';
import { GSHEETS_AI_PROMPT } from '@/lib/aiPrompts';

export const metadata: Metadata = {
  title: 'Invoice API for Developers',
  description:
    'Render invoices from JSON. Self-host a Cloudflare Worker for PDF or PNG, or pass invoice JSON in a URL hash. Schema, llms.txt, and Google Sheets included.',
  alternates: { canonical: '/developers' },
  openGraph: {
    title: 'Invoice API for Developers — RenderInvoice',
    description: 'POST JSON, get PDF or PNG. Or skip the backend and put invoice JSON in a URL hash.',
    url: '/developers',
  },
};

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <header className="relative border-b border-zinc-200 overflow-hidden">
        <div aria-hidden className="absolute inset-0 dot-grid mask-fade-b" />
        <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-blue-200/40 via-indigo-200/30 to-transparent rounded-full blur-3xl -z-10" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 animate-in-up">
          <Badge variant="blue" className="mb-4">Developers · AI agents · Integrations</Badge>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-balance max-w-3xl">
            No backend. <span className="gradient-text">Yours to self-host.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-600 text-pretty">
            RenderInvoice runs entirely in your browser. If you need batch PDF generation, deploy the worker to your own Cloudflare account. If you want a spreadsheet workflow, use the Google Sheets script without setting up an external API.
          </p>
          <a
            href={REPO.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-800 hover:text-zinc-950"
          >
            <IGithub className="size-4" /> {REPO.owner}/{REPO.name}
          </a>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {/* Cloudflare Worker */}
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[1.2fr_1fr]">
            <div className="p-8">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-xs font-semibold tracking-widest text-blue-600 uppercase">Self-hosted render API</div>
                <Badge variant="green">Programmatic PDFs</Badge>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                <code className="text-xl font-mono bg-zinc-100 px-1.5 py-0.5 rounded">cf-worker/</code>: Cloudflare Worker
              </h2>
              <p className="mt-3 text-zinc-600 leading-relaxed">
                A minimal Cloudflare Worker you can deploy to your Cloudflare account. Send a <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-xs">POST /v1/render</code> request with <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-xs">{`{ "invoice": {…} }`}</code> (or a bare invoice object) to receive PDF or PNG bytes. Two render engines are supported:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                <li><strong>Satori</strong> (default): JavaScript pipeline using Satori, resvg-wasm, and pdf-lib. Takes 50 to 200 ms per invoice (around $0.15 per 1,000 requests) to output a raster PDF.</li>
                <li><strong>Browser</strong> (<code className="font-mono bg-zinc-100 px-1 rounded text-xs">?engine=browser</code>): Uses Cloudflare Browser Rendering to print the public <Link href="/print-view" className="text-blue-700 underline">/print-view</Link> page in headless Chromium. Takes 500 to 2000 ms per request to generate a vector PDF with selectable text.</li>
              </ul>
              <ul className="mt-5 space-y-1.5 text-sm text-zinc-700">
                <li>• Output formats: <code className="font-mono bg-zinc-100 px-1 rounded text-xs">?format=pdf|png</code> (satori). Browser engine is always PDF. No SVG.</li>
                <li>• Optional JWT authentication (<code className="font-mono bg-zinc-100 px-1 rounded text-xs">wrangler secret put API_KEY_SECRET</code>).</li>
                <li>• Workers Paid plan ($5/mo) is only required for <code className="font-mono bg-zinc-100 px-1 rounded text-xs">?engine=browser</code>. Satori runs on the free tier.</li>
              </ul>
              <div className="mt-6 flex gap-3 flex-wrap items-center">
                <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/hithismani/render-invoice/tree/main/cf-worker">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
                </a>
                <a href="/llms.txt" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 text-sm font-medium hover:bg-zinc-50">
                  /llms.txt
                </a>
              </div>
            </div>
            <div className="bg-zinc-950 text-zinc-100 p-6 md:p-8 text-xs font-mono leading-relaxed overflow-auto">
              <div className="text-zinc-400 mb-2"># 1. One-click (Satori, free tier)</div>
              <div>deploy.workers.cloudflare.com/?url=…/tree/main/cf-worker</div>
              <div className="text-zinc-400 mt-5 mb-2"># or CLI</div>
              <div>cd cf-worker && pnpm install</div>
              <div>npx wrangler login && npx wrangler deploy</div>
              <div className="text-zinc-400 mt-5 mb-2"># 2. Call it from anything</div>
              <pre className="whitespace-pre text-zinc-200">{`curl -X POST \\
  https://your.workers.dev/v1/render \\
  -H 'Content-Type: application/json' \\
  --data-binary @invoice.json \\
  --output invoice.pdf`}</pre>
              <div className="text-zinc-400 mt-5 mb-2"># 3. Optional auth</div>
              <div>wrangler secret put API_KEY_SECRET</div>
            </div>
          </div>
        </Card>

        {/* Google Sheets */}
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[1.2fr_1fr]">
            <div className="p-8">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-xs font-semibold tracking-widest text-emerald-600 uppercase">Spreadsheet auto-fill</div>
                <Badge variant="green">No backend</Badge>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Google Sheets to invoices</h2>
              <p className="mt-3 text-zinc-600 leading-relaxed">
                A single <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-xs">HYPERLINK</code> formula creates a pre-filled playground URL from a spreadsheet row. Opening the link loads every field into the playground without API calls.
              </p>
              <ul className="mt-5 space-y-1.5 text-sm text-zinc-700">
                <li>• The playground reads invoice JSON directly from the URL hash.</li>
                <li>• Data stays in your browser and is not sent to RenderInvoice servers.</li>
                <li>• For advanced setups (such as multi-recipient invoices or dynamic columns), use the prompt below to generate an Apps Script or formula.</li>
              </ul>
              <div className="mt-5">
                <CopyPrompt prompt={GSHEETS_AI_PROMPT} />
              </div>
            </div>
            <div className="bg-zinc-950 text-zinc-100 p-6 md:p-8 text-xs font-mono leading-relaxed overflow-auto">
              <div className="text-zinc-400 mb-2"># One Sheets formula. Copy down a column.</div>
              <pre className="whitespace-pre text-zinc-200">{`=HYPERLINK(
  "https://renderinvoice.com/playground#j="
    & ENCODEURL(G2),
  "Open ↗"
)

# G2 holds the JSON for that row,
# built with & concatenation
# from your other columns.`}</pre>
            </div>
          </div>
        </Card>

        {/* Share URL protocol */}
        <Card className="p-8">
          <div className="text-xs font-semibold tracking-widest text-blue-600 uppercase">Share-URL protocol</div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Hand off an invoice with a URL.</h2>
          <p className="mt-3 text-zinc-600 leading-relaxed max-w-3xl">
            Encoding invoice JSON into the URL hash loads the invoice with no server. Point the hash at <code className="font-mono bg-zinc-100 px-1 rounded text-xs">/playground</code> to edit, or <code className="font-mono bg-zinc-100 px-1 rounded text-xs">/print-view</code> to print.
          </p>
          <div className="mt-5 space-y-3">
            <div>
              <div className="text-xs text-zinc-500 mb-1.5"><strong className="text-zinc-700">#i=</strong> &nbsp;compressed with lz-string <code className="font-mono bg-zinc-100 px-1 rounded">compressToEncodedURIComponent</code> for shorter URLs.</div>
              <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 text-xs font-mono overflow-x-auto">
                <span className="text-zinc-400">https://renderinvoice.com/playground</span>
                <span className="text-emerald-400">#i=</span>
                <span className="text-zinc-400">N4IgdghgtgpiBcIAuBLAdkgNCAlgOwCcB7TCAOgA8AHJAVwBsFE...</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1.5"><strong className="text-zinc-700">#j=</strong> &nbsp;standard <code className="font-mono bg-zinc-100 px-1 rounded">encodeURIComponent(JSON.stringify(invoice))</code>. Generates longer URLs that can be constructed from shell scripts, Apps Script, or curl.</div>
              <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 text-xs font-mono overflow-x-auto">
                <span className="text-zinc-400">https://renderinvoice.com/playground</span>
                <span className="text-emerald-400">#j=</span>
                <span className="text-zinc-400">%7B%22design%22%3A%22classic%22...</span>
                <div className="text-zinc-500 mt-2"># or skip the editor:</div>
                <span className="text-zinc-400">https://renderinvoice.com/print-view</span>
                <span className="text-emerald-400">#j=</span>
                <span className="text-zinc-400">…same JSON…</span>
              </div>
            </div>
          </div>
        </Card>

        {/* llms.txt */}
        <Card className="p-6">
          <div className="text-xs font-semibold tracking-widest text-blue-600 uppercase">Agent manifest</div>
          <h3 className="mt-2 text-lg font-bold tracking-tight">
            <code className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">/llms.txt</code>
          </h3>
          <p className="mt-2 text-sm text-zinc-600 leading-relaxed max-w-3xl">
            Follows the <a href="https://llmstxt.org" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">llms.txt</a> convention. Automated agents can read this file to understand the schema and worker configuration.
          </p>
          <a href="/llms.txt" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900">
            Read /llms.txt <IArrowRight className="size-3.5" />
          </a>
        </Card>

        {/* Schema reference */}
        <Card className="p-8">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="text-xs font-semibold tracking-widest text-blue-600 uppercase">Schema reference</div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">The invoice contract.</h2>
              <p className="mt-2 text-zinc-600 max-w-3xl">
                Every field accepted by the JSON editor and render worker. Zod defines the schema in the codebase; this is the rendered documentation view.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-zinc-100 p-5 bg-zinc-50/40">
            <SchemaReference />
          </div>
        </Card>

      </section>

      <SiteFooter />
    </div>
  );
}

import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Licenses',
  description:
    'Open-source licenses for the libraries that draw RenderInvoice PDFs. Satori, pdf-lib, Next.js, and friends.',
  alternates: { canonical: '/licenses' },
  openGraph: {
    title: 'Licenses - RenderInvoice',
    description: 'The open-source stack behind the PDF. Satori does the drawing.',
    url: '/licenses',
  },
};

const libs = [
  {
    name: 'Satori',
    by: 'Vercel',
    license: 'MPL-2.0',
    href: 'https://github.com/vercel/satori',
    blurb:
      'This is the one. Satori turns the invoice layout into an SVG - real text, real paths, no screenshot. Every PDF you download starts here. Without Satori there is no RenderInvoice PDF. We owe it everything.',
  },
  {
    name: 'Yoga',
    by: 'Meta, via Satori',
    license: 'MIT',
    href: 'https://github.com/facebook/yoga',
    blurb: 'Flexbox layout engine Satori uses so boxes land where we asked.',
  },
  {
    name: 'pdf-lib',
    by: 'Andrew Dillon',
    license: 'MIT',
    href: 'https://github.com/Hopding/pdf-lib',
    blurb: 'Paints that SVG into a PDF you can open, search, and select text in.',
  },
  {
    name: 'resvg',
    by: 'RazrFalcon',
    license: 'MPL-2.0',
    href: 'https://github.com/RazrFalcon/resvg',
    blurb: 'Rasters the same SVG when you ask for a PNG.',
  },
  {
    name: 'Next.js',
    by: 'Vercel',
    license: 'MIT',
    href: 'https://github.com/vercel/next.js',
    blurb: 'The site. Static export. The playground lives here.',
  },
  {
    name: 'React',
    by: 'Meta',
    license: 'MIT',
    href: 'https://github.com/facebook/react',
    blurb: 'The invoice template is React. Satori consumes that same tree.',
  },
  {
    name: 'marked',
    by: 'markedjs',
    license: 'MIT',
    href: 'https://github.com/markedjs/marked',
    blurb: 'Lexes the markdown in your fields.',
  },
  {
    name: 'Zod',
    by: 'Colin McDonnell',
    license: 'MIT',
    href: 'https://github.com/colinhacks/zod',
    blurb: 'Validates invoice JSON before anything draws.',
  },
  {
    name: 'lz-string',
    by: 'pieroxy',
    license: 'MIT',
    href: 'https://github.com/pieroxy/lz-string',
    blurb: 'Compresses share URLs so the hash stays short.',
  },
];

export default function LicensesPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Badge variant="blue" className="mb-4">Licenses</Badge>
        <h1 className="text-5xl font-extrabold tracking-tight text-balance">
          The PDF is not magic. <span className="gradient-text">It is Satori.</span>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
          RenderInvoice does not screenshot your invoice. It does not spin up a headless browser.
          Vercel&rsquo;s <strong>Satori</strong> draws the layout as SVG with real text. Then pdf-lib
          writes that into a PDF you can select, copy, and search. That is the whole trick.
        </p>
        <p className="mt-4 text-lg text-zinc-600 leading-relaxed">
          If the PDF looks like the playground, thank Satori. If you can highlight a line item
          in Acrobat, thank Satori. We will keep saying the name on this page so it does not
          get lost in the product copy.
        </p>

        <ul className="mt-12 space-y-8">
          {libs.map((lib) => (
            <li key={lib.name} className="border-t border-zinc-100 pt-8">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h2 className="text-2xl font-bold tracking-tight">{lib.name}</h2>
                <span className="text-xs font-mono text-zinc-500">{lib.license}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">{lib.by}</p>
              <p className="mt-3 text-zinc-700 leading-relaxed">{lib.blurb}</p>
              <a
                href={lib.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-blue-700 hover:text-blue-900"
              >
                {lib.href.replace('https://', '')} ↗
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-sm text-zinc-500 leading-relaxed">
          Fonts (Inter, Source Serif 4, IBM Plex Sans, and the rest) ship under their own
          SIL Open Font License or equivalent. See each family&rsquo;s file in the repo.
          RenderInvoice itself is provided as-is; see Terms of service.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}

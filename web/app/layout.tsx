import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://renderinvoice.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RenderInvoice - Unopinionated Invoice Generator',
    template: '%s · RenderInvoice',
  },
  description:
    'Unopinionated invoice generator. Build invoices in the browser, or POST JSON to a Cloudflare Worker and get a PDF or PNG. No account, no lock-in.',
  keywords: [
    'invoice generator',
    'free invoice generator',
    'render invoice',
    'invoice PDF',
    'invoice API',
    'JSON to PDF invoice',
    'invoice maker',
    'freelance invoice',
    'invoice template',
  ],
  authors: [{ name: 'RenderInvoice' }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'RenderInvoice',
    title: 'RenderInvoice - Unopinionated Invoice Generator',
    description:
      'Build invoices in the browser, or POST JSON to a Cloudflare Worker and get a PDF or PNG. No account, no lock-in.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RenderInvoice - Unopinionated Invoice Generator',
    description: 'Build invoices in the browser or render PDF/PNG from JSON. No account, no lock-in.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RenderInvoice',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description:
      'Unopinionated invoice generator. Web app and Cloudflare Worker. JSON in, PDF or PNG out.',
    url: SITE_URL,
    sameAs: ['https://github.com/hithismani/render-invoice'],
  };
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

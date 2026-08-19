import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://invoicely.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Invoicely: Free, flexible invoice generator',
    template: '%s · Invoicely',
  },
  description:
    'Generate professional PDF invoices directly in your browser. Flexible schema, no accounts, and no data leaving your machine.',
  keywords: [
    'free invoice generator',
    'invoice template',
    'freelance invoice',
    'PDF invoice',
    'invoice maker',
    'client-side invoice',
  ],
  authors: [{ name: 'Invoicely' }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Invoicely',
    title: 'Invoicely: Free, flexible invoice generator',
    description:
      'Create PDF invoices with live preview and custom schemas directly in your browser.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoicely: Free, flexible invoice generator',
    description: 'Create PDF invoices directly in your browser without signing up.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
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
    name: 'Invoicely',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description:
      'Browser-based invoice generator with flexible schema and instant PDF export.',
    url: SITE_URL,
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

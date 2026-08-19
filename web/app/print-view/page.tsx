import type { Metadata } from 'next';
import PrintViewClient from './PrintViewClient';

export const metadata: Metadata = {
  title: 'Print view',
  robots: { index: false, follow: false },
};

/**
 * Minimal, chrome-less invoice renderer used by the self-hosted Cloudflare
 * Worker (and any other server-side PDF pipeline). Reads an invoice from the
 * URL hash (#i=<lz-string>) and renders just <Invoice>. No nav, no footer,
 * no playground JS — ready for headless Chromium to print.
 */
export default function PrintViewPage() {
  return <PrintViewClient />;
}

import type { Metadata } from 'next';
import PrintViewClient from './PrintViewClient';

export const metadata: Metadata = {
  title: 'Print view',
  robots: { index: false, follow: false },
};

/**
 * Chrome-less invoice view. Reads invoice JSON from the URL hash and
 * renders the Satori template. No nav. For browser Save as PDF / print.
 * The Worker does not use this page.
 */
export default function PrintViewPage() {
  return <PrintViewClient />;
}

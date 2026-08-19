import type { Invoice } from '@/schema/invoiceSchema';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

export function encodeShareHash(invoice: Invoice): string {
  const json = JSON.stringify(invoice);
  return `#i=${compressToEncodedURIComponent(json)}`;
}

export function decodeShareHash(hash: string): Invoice | null {
  // #j=<urlencoded JSON> — uncompressed form. Used by integrations (e.g.
  // Google Sheets Apps Script) that can't bundle lz-string. Longer URLs,
  // but trivially constructible from any environment with JSON.stringify.
  const j = hash.match(/[#&]j=([^&]+)/);
  if (j) {
    try {
      return JSON.parse(decodeURIComponent(j[1])) as Invoice;
    } catch {
      return null;
    }
  }
  const m = hash.match(/[#&]i=([^&]+)/);
  if (!m) return null;
  try {
    const json = decompressFromEncodedURIComponent(m[1]);
    if (!json) return null;
    return JSON.parse(json) as Invoice;
  } catch {
    return null;
  }
}

function origin(): string {
  return typeof window !== 'undefined' ? window.location.origin : 'https://renderinvoice.com';
}

export function jsonShareHash(invoice: Invoice): string {
  return `#j=${encodeURIComponent(JSON.stringify(invoice))}`;
}

export function sharePath(invoice: Invoice): string {
  return `/playground${encodeShareHash(invoice)}`;
}

export function printPath(invoice: Invoice): string {
  return `/print-view${encodeShareHash(invoice)}`;
}

export function shareUrl(invoice: Invoice): string {
  return `${origin()}${sharePath(invoice)}`;
}

export function printUrl(invoice: Invoice): string {
  return `${origin()}${printPath(invoice)}`;
}

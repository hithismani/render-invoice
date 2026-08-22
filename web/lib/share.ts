import type { Invoice } from '@/schema/invoiceSchema';
import { InvoiceSchema } from '@/schema/invoiceSchema';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

export function encodeShareHash(invoice: Invoice): string {
  const json = JSON.stringify(invoice);
  return `#i=${compressToEncodedURIComponent(json)}`;
}

/**
 * Share links carry attacker-controlled JSON (anyone can hand a victim a
 * crafted URL), so every payload is schema-validated before it reaches any
 * renderer. Invalid or non-invoice shapes are rejected outright.
 */
export function decodeShareHash(hash: string): Invoice | null {
  // #j=<urlencoded JSON> - uncompressed form. Used by integrations (e.g.
  // Google Sheets Apps Script) that can't bundle lz-string. Longer URLs,
  // but trivially constructible from any environment with JSON.stringify.
  const j = hash.match(/[#&]j=([^&]+)/);
  let raw: unknown = null;
  if (j) {
    try { raw = JSON.parse(decodeURIComponent(j[1])); } catch { return null; }
  } else {
    const m = hash.match(/[#&]i=([^&]+)/);
    if (!m) return null;
    try {
      const json = decompressFromEncodedURIComponent(m[1]);
      if (!json) return null;
      raw = JSON.parse(json);
    } catch {
      return null;
    }
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  // Lenient on purpose: third-party integrations (Apps Script, API users) send
  // partial invoices - often just { logoUrl } or a few fields. Partial parsing
  // still enforces types on whatever IS present, drops unknown keys, and keeps
  // the logoUrl/signatureUrl scheme refines (no javascript:/data:text/html).
  // Renderers tolerate missing fields defensively.
  const parsed = InvoiceSchema.partial().safeParse(raw);
  return parsed.success ? (parsed.data as Invoice) : null;
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

/**
 * A minimal shape of the Invoicely invoice, mirrored from web/schema/invoiceSchema.ts.
 * Kept loose here — the Worker doesn't validate, just renders whatever valid JSON
 * the caller sends. Validation happens client-side in the playground and via the
 * Zod schema shipped with the npm package (future).
 */
export interface InvoiceLike {
  design?: 'classic' | 'bold';
  font?: string;
  accentColor?: string;
  logoPosition?: 'left' | 'center' | 'right';
  direction?: 'ltr' | 'rtl';
  autoSize?: boolean;
  filename?: string;
  invoiceHeading?: string;
  invoiceDescription?: string;
  invoiceFrom?: Record<string, string>;
  invoiceTo?: Record<string, string>[];
  metaTop?: Record<string, string>;
  metaBottom?: Record<string, string>;
  columns?: string[];
  lineItems?: Record<string, string | number>[];
  summary?: { label: string; value: string | number }[];
  logoUrl?: string;
  logoSize?: { width: number; height: number };
  digitalSignatureUrl?: string;
  signatureSize?: { width: number; height: number };
  footerText?: { topText?: string; bottomText?: string };
  isCancelled?: boolean;
  cancelledNotes?: string;
  amountsVerifiedHideDisclaimer?: boolean;
  showBuiltWith?: boolean;
  includeEditLink?: boolean;
}

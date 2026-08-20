import { z } from 'zod';

const validatedString = z.string().min(1, 'This field is required');
const LineItemSchema = z.record(z.union([z.string(), z.number()]));

export const InvoiceSchema = z.object({
  design: z.enum(['classic', 'bold']).default('classic')
    .describe('Visual variant for the rendered invoice. "classic" is the default; "bold" uses an accent header.'),
  font: z.string().optional()
    .describe('Typeface for playground, PDF, and worker. One of: Inter, Source Serif 4, IBM Plex Sans, Playfair Display, Space Grotesk, DM Sans, Fraunces, Libre Baskerville, Instrument Sans, Newsreader. Default Inter. Unknown names fall back to Inter.'),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #2563eb').default('#2563eb')
    .describe('Accent color (hex) threaded through headings, totals, and borders.'),
  logoPosition: z.enum(['center', 'left', 'right']).default('center')
    .describe('Where the logo sits in the header.'),
  direction: z.enum(['ltr', 'rtl']).default('ltr')
    .describe('Reading direction. Use "rtl" for Arabic, Hebrew, Urdu, Farsi, and other right-to-left scripts.'),
  autoSize: z.boolean().default(true)
    .describe('Whether to automatically fit the content to the page when generating PDF.'),
  filename: z.string().optional()
    .describe('The filename to use for the generated PDF.'),
  invoiceHeading: validatedString.optional()
    .describe('The main heading or title for the invoice (e.g., "Invoice").'),
  invoiceDescription: validatedString.optional()
    .describe('Subtitle. Full markdown: **bold** *italic* ~~strike~~ `code` [label](url) #–####### headings {@18}/ {@p:18} size {@18:span} - list 1. numbered > quote. Line breaks kept.'),
  invoiceFrom: z.record(z.string())
    .describe('Sender key-value pairs. Keys and values accept full markdown including size overrides ({@18}, # headings).'),
  invoiceTo: z.array(z.record(z.string()))
    .describe('Recipients as key-value objects. Keys and values accept full markdown including size overrides.'),
  metaTop: z.record(z.string())
    .describe('Metadata above line items. Keys and values accept full markdown including size overrides.'),
  metaBottom: z.record(z.string()).default({})
    .describe('Metadata below line items. Keys and values accept full markdown including size overrides.'),
  columns: z.array(z.string()).min(1, 'At least one column is required')
    .describe('Column headers for the line items table. Markdown supported.'),
  lineItems: z.array(LineItemSchema).min(1, 'At least one line item is required')
    .describe('Line item cells aligned with columns. Full markdown including currency glyphs (₹ € £) and size overrides.'),
  summary: z.array(z.object({
    label: validatedString.min(1, 'Summary label is required')
      .describe('Label for a summary item. Markdown supported.'),
    value: z.union([validatedString, z.number()])
      .refine((v) => v !== '', 'Summary value is required')
      .describe('Value for the summary item. Markdown and currency glyphs supported.'),
  })).min(1, 'At least one summary item is required')
    .describe('Invoice summary items.'),
  logoUrl: z.string().optional()
    .refine((v) => !v || v.startsWith('data:') || /^https?:\/\//.test(v), { message: 'Must be an http(s) URL or an uploaded image.' })
    .describe('Company logo URL or embedded data URL.'),
  logoSize: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional().describe('Logo dimensions.'),
  digitalSignatureUrl: z.string().optional()
    .refine((v) => !v || v.startsWith('data:') || /^https?:\/\//.test(v), { message: 'Must be an http(s) URL or an uploaded image.' })
    .describe('Digital signature image URL or embedded data URL.'),
  signatureSize: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional().describe('Signature dimensions.'),
  footerText: z.object({
    topText: validatedString.optional(),
    bottomText: validatedString.optional(),
  }).describe('Footer text. Full markdown (bold/italic/code/links/headings/lists/quotes), single newlines kept, size overrides {@18} / #–#######.'),
  isCancelled: z.boolean().optional(),
  cancelledNotes: z.string().optional()
    .describe('Notes shown when the invoice is cancelled. Same markdown as the description.'),
  amountsVerifiedHideDisclaimer: z.boolean().default(false)
    .describe('If false, a disclaimer about verifying amounts will be displayed.'),
  showBuiltWith: z.boolean().default(false)
    .describe('If true, shows a small "Built with RenderInvoice" line at the bottom of the invoice.'),
  includeEditLink: z.boolean().optional()
    .describe('If true (default), add a full-width footer rule that links back to this invoice in the playground (PDF only).'),
}).describe('The schema for the invoice data.');

export type Invoice = z.infer<typeof InvoiceSchema>;

export function validateLineItemColumns(invoice: Invoice): { valid: boolean; errors: string[] } {
  const columnsSet = new Set(invoice?.columns);
  const errors: string[] = [];
  invoice?.lineItems?.forEach((item, index) => {
    const invalidKeys = Object.keys(item).filter((k) => !columnsSet.has(k));
    if (invalidKeys.length > 0) {
      errors.push(
        `Line item ${index + 1} contains invalid keys: ${invalidKeys.join(', ')}. These keys are not defined in the 'columns' array.`,
      );
    }
  });
  return { valid: errors.length === 0, errors };
}

export const exampleInvoice: Invoice = {
  design: 'classic',
  accentColor: '#2563eb',
  logoPosition: 'center',
  direction: 'ltr',
  autoSize: true,
  filename: '',
  invoiceHeading: 'Invoice for Services Rendered',
  invoiceDescription: 'This invoice covers the services provided in September.',
  invoiceFrom: {
    'Issued By': 'Example Corp.',
    Address: '123 Example Street\nExample City, EX 12345',
    Email: 'info@example.com',
    'Tax ID': 'EX-123456789',
    Website: 'www.example.com',
    Phone: '+1 (555) 123-4567',
    'Business Hours': 'Mon-Fri: 9AM-5PM',
  },
  invoiceTo: [
    {
      'Bill To': 'Acme Corp.',
      Address: '456 Acme Avenue\nAcme City, AC 67890',
      Email: 'billing@acmecorp.com',
      'Account Number': 'ACC-789012',
      'VAT Number': 'VAT-456789',
      'Payment Terms': 'Net 30',
    },
    {
      'Ship To': 'Acme Corp. Warehouse',
      Address: '789 Warehouse Blvd\nAcme City, AC 67890',
      'Shipping Method': 'Standard Ground',
      'Tracking Number': 'TRK-123456',
      'Delivery Instructions': 'Leave at front desk',
    },
  ],
  metaTop: {
    'Invoice Number': 'INV-20231001',
    'Invoice Date': '2023-09-30',
    'Due Date': '2023-10-15',
  },
  metaBottom: {
    Terms: 'Payment due within 30 days',
    Notes: 'Thank you for your business',
  },
  columns: ['Description', 'Quantity', 'Unit Price', 'Total'],
  lineItems: [
    { Description: 'Consulting Services', Quantity: 10, 'Unit Price': '$150', Total: '$1500' },
  ],
  summary: [
    { label: 'Subtotal', value: '$3500' },
    { label: 'Tax', value: '$350' },
    { label: 'Total', value: '$3850' },
  ],
  logoUrl: 'https://placehold.co/150x50.png?text=Example+Corp+Logo',
  logoSize: { width: 150, height: 50 },
  digitalSignatureUrl: 'https://placehold.co/200x50.png?text=Signature',
  signatureSize: { width: 200, height: 50 },
  footerText: {
    topText: 'Thank you for your business!',
    bottomText: 'Please make payment by the due date.',
  },
  isCancelled: false,
  cancelledNotes: undefined,
  amountsVerifiedHideDisclaimer: false,
  showBuiltWith: false,
  includeEditLink: true,
};

/**
 * A fresh, minimal invoice used by the "Start from scratch" action. Passes
 * validation but is intentionally empty so users know to fill everything.
 */
export const blankInvoice: Invoice = {
  design: 'classic',
  accentColor: '#2563eb',
  logoPosition: 'center',
  direction: 'ltr',
  autoSize: true,
  filename: '',
  invoiceHeading: 'Invoice',
  invoiceDescription: '',
  invoiceFrom: { 'Issued By': '' },
  invoiceTo: [{ 'Bill To': '' }],
  metaTop: { 'Invoice Number': 'INV-0001', 'Invoice Date': '', 'Due Date': '' },
  metaBottom: {},
  columns: ['Description', 'Quantity', 'Rate', 'Amount'],
  lineItems: [{ Description: '', Quantity: '', Rate: '', Amount: '' }],
  summary: [{ label: 'Total', value: '' }],
  footerText: {},
  amountsVerifiedHideDisclaimer: false,
  showBuiltWith: false,
  includeEditLink: true,
};

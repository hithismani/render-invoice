import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

// Default autoSize behavior (true): page is sized to content height — no
// scaling, no clipping. PDF page dimensions match the rendered content.
export default {
  name: '16-natural-page-baseline',
  description: 'autoSize=true (default) — page = content size, no fit-to-page',
  invoice: exampleInvoice,
  pdf: true,
};

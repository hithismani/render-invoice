import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '01-baseline-classic',
  description: 'Default example invoice (classic) - sanity baseline',
  invoice: { ...exampleInvoice, design: 'classic' as const },
};

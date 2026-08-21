import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '02-baseline-bold',
  description: 'Default example invoice (bold)',
  invoice: { ...exampleInvoice, design: 'bold' as const },
};

import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '10-rtl',
  description: 'RTL direction - Arabic-style reading order',
  invoice: {
    ...exampleInvoice,
    direction: 'rtl' as const,
  },
};

import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '08-cancelled',
  description: 'Cancelled invoice — red badge in corner, notes block at bottom',
  invoice: {
    ...exampleInvoice,
    isCancelled: true,
    cancelledNotes: 'Cancelled per customer request 2026-04-20. Replacement invoice INV-20260421 issued.',
  },
};

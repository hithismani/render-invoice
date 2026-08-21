import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '14-singlepage-short',
  description: 'autoSize=false, short content — should fit A4 at 1:1, leaving whitespace below',
  invoice: { ...exampleInvoice, autoSize: false },
  pdf: true,
};

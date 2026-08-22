import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

// Default autoSize (true): portrait A4 width, height = max(A4, scaled content).
export default {
  name: '16-natural-page-baseline',
  description: 'autoSize=true - A4 width, height ≥ A4, grows with content',
  invoice: exampleInvoice,
  pdf: true,
};

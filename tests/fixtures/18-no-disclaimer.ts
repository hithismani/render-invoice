import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '18-no-disclaimer',
  description: 'amountsVerifiedHideDisclaimer:true - logo and From/To must still have spacing between them',
  invoice: { ...exampleInvoice, amountsVerifiedHideDisclaimer: true },
};

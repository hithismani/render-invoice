import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '19-bold-no-disclaimer',
  description: 'Bold with amountsVerifiedHideDisclaimer:true - accent header and From/To must still have spacing',
  invoice: { ...exampleInvoice, design: 'bold' as const, amountsVerifiedHideDisclaimer: true },
};

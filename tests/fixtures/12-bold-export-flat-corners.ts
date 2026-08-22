import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '12-bold-export-flat-corners',
  description: 'Bold with forExport=true - accent header should have flat top corners (no rounding)',
  invoice: { ...exampleInvoice, design: 'bold' as const },
  forExport: true,
};

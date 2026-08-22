import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '06-many-columns',
  description: 'Line items with 7 columns - wide tables must not crush content',
  invoice: {
    ...exampleInvoice,
    columns: ['SKU', 'Description', 'Qty', 'Unit Price', 'Discount', 'Tax', 'Total'],
    lineItems: [
      { SKU: 'A-001', Description: 'Premium consulting hours, senior staff, on-site engagement', Qty: 12, 'Unit Price': '$200', Discount: '10%', Tax: '$216', Total: '$2376' },
      { SKU: 'B-007', Description: 'Implementation services with custom integration work', Qty: 8, 'Unit Price': '$150', Discount: '$0', Tax: '$120', Total: '$1320' },
      { SKU: 'C-015', Description: 'Training', Qty: 4, 'Unit Price': '$300', Discount: '$50', Tax: '$110', Total: '$1210' },
    ],
  },
};

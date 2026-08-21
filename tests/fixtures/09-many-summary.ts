import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '09-many-summary',
  description: 'Many summary rows — Subtotal, Discount, Shipping, multi-region taxes, Total',
  invoice: {
    ...exampleInvoice,
    summary: [
      { label: 'Subtotal', value: '$3500' },
      { label: 'Volume Discount (10%)', value: '-$350' },
      { label: 'Shipping', value: '$45' },
      { label: 'CA State Tax (7.25%)', value: '$228.66' },
      { label: 'San Francisco County Tax (1.25%)', value: '$39.43' },
      { label: 'Federal Excise', value: '$12.50' },
      { label: 'Total Due', value: '$3475.59' },
    ],
  },
};

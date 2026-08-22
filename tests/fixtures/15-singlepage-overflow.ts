import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

// 30 line items + 7 columns + many summary rows + long footer - content
// will easily exceed A4 height, forcing the autoSize=false path to scale
// uniformly to fit a single page.
const longLineItems = Array.from({ length: 30 }, (_, i) => ({
  SKU: `SKU-${String(i + 1).padStart(4, '0')}`,
  Description: `Line item ${i + 1} - typical service description that takes some horizontal room`,
  Qty: 1 + (i % 5),
  'Unit Price': `$${100 + i * 7}`,
  Discount: i % 3 === 0 ? '10%' : '$0',
  Tax: `$${(10 + i * 3).toFixed(2)}`,
  Total: `$${((100 + i * 7) * (1 + (i % 5))).toFixed(2)}`,
}));

export default {
  name: '15-singlepage-overflow',
  description: 'autoSize=false, very tall content (30 line items) - must scale uniformly to fit one A4 page',
  invoice: {
    ...exampleInvoice,
    autoSize: false,
    columns: ['SKU', 'Description', 'Qty', 'Unit Price', 'Discount', 'Tax', 'Total'],
    lineItems: longLineItems,
    summary: [
      { label: 'Subtotal', value: '$45000' },
      { label: 'Volume Discount', value: '-$4500' },
      { label: 'Shipping', value: '$120' },
      { label: 'CA State Tax (7.25%)', value: '$2940.21' },
      { label: 'County Tax', value: '$507.39' },
      { label: 'Total Due', value: '$44067.60' },
    ],
  },
  pdf: true,
};

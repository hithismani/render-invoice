import { exampleInvoice } from '../../../schema/invoiceSchema.js';

// 5 recipients × 7 columns simultaneously — the worst-case combo. Ensures
// From/To wrap doesn't conflict with line items column width distribution.
export default {
  name: '21-classic-stress',
  description: 'Classic with 5 recipients AND 7 line-item columns simultaneously',
  invoice: {
    ...exampleInvoice,
    invoiceTo: [
      { 'Bill To': 'Acme Corp.', Address: '456 Acme Avenue\nAcme City, AC 67890', Email: 'billing@acme.com' },
      { 'Ship To': 'Acme Warehouse', Address: '789 Warehouse Blvd\nAcme City, AC 67890', 'Tracking Number': 'TRK-123' },
      { Approver: 'Jane Doe', Email: 'jane.doe@acme.com', Department: 'Procurement' },
      { Auditor: 'External Audit LLC', Email: 'audit@external.com', Reference: 'AUD-2024-001' },
      { CC: 'cfo@acme.com', Note: 'Quarterly review attendee' },
    ],
    columns: ['SKU', 'Description', 'Qty', 'Unit Price', 'Discount', 'Tax', 'Total'],
    lineItems: [
      { SKU: 'A-001', Description: 'Premium consulting hours, senior staff', Qty: 12, 'Unit Price': '$200', Discount: '10%', Tax: '$216', Total: '$2376' },
      { SKU: 'B-007', Description: 'Implementation services', Qty: 8, 'Unit Price': '$150', Discount: '$0', Tax: '$120', Total: '$1320' },
      { SKU: 'C-015', Description: 'Training', Qty: 4, 'Unit Price': '$300', Discount: '$50', Tax: '$110', Total: '$1210' },
    ],
  },
};

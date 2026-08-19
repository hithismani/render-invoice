import { exampleInvoice } from '../../../schema/invoiceSchema.js';

// 1 From + 3 To = 4 cards. The "tight common case" — most invoice apps cap
// recipients at 3 or 4. Verifies cards remain readable without wrapping.
export default {
  name: '23-classic-4-recipients',
  description: 'Classic with 1 From + 3 To (4 cards) — common moderate case, should not wrap yet',
  invoice: {
    ...exampleInvoice,
    invoiceTo: [
      { 'Bill To': 'Acme Corp.', Address: '456 Acme Avenue\nAcme City, AC 67890', Email: 'billing@acme.com' },
      { 'Ship To': 'Acme Warehouse', Address: '789 Warehouse Blvd\nAcme City, AC 67890', 'Tracking Number': 'TRK-123' },
      { Approver: 'Jane Doe', Email: 'jane.doe@acme.com', Department: 'Procurement' },
    ],
  },
};

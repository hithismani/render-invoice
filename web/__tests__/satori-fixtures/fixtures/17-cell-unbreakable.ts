import { exampleInvoice } from '../../../schema/invoiceSchema.js';

export default {
  name: '17-cell-unbreakable',
  description: 'Line items with unbreakable values (long URLs, long IDs) — must wrap inside the cell, not blow out the row',
  invoice: {
    ...exampleInvoice,
    columns: ['Reference', 'Description', 'Qty', 'Total'],
    lineItems: [
      {
        Reference: 'https://invoicely.example.com/orders/very-long-permalink-that-does-not-have-natural-break-points-and-should-still-wrap-inside-the-cell',
        Description: 'Order details retrievable at the reference URL',
        Qty: 1,
        Total: '$500',
      },
      {
        Reference: 'TXN-9876543210ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        Description: 'Transaction with a very long opaque identifier',
        Qty: 2,
        Total: '$200',
      },
    ],
  },
};

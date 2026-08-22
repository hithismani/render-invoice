import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '04-bold-many-recipients',
  description: 'Bold with same 5 recipients - section headers must reflect actual first key, not "Bill to"',
  invoice: {
    ...exampleInvoice,
    design: 'bold' as const,
    invoiceTo: [
      { 'Bill To': 'Acme Corp.', Address: '456 Acme Avenue\nAcme City, AC 67890', Email: 'billing@acme.com' },
      { 'Ship To': 'Acme Warehouse', Address: '789 Warehouse Blvd\nAcme City, AC 67890', 'Tracking Number': 'TRK-123' },
      { Approver: 'Jane Doe', Email: 'jane.doe@acme.com', Department: 'Procurement' },
      { Auditor: 'External Audit LLC', Email: 'audit@external.com', 'Reference': 'AUD-2024-001' },
      { CC: 'cfo@acme.com', Note: 'Quarterly review attendee' },
    ],
  },
};

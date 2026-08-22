import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '20-field-markdown',
  description: 'Markdown inside Field values - **bold**, *italic*, `code`, [links] inside From/To rows',
  invoice: {
    ...exampleInvoice,
    invoiceFrom: {
      'Issued By': '**Example Corp.** _(Delaware C-Corp)_',
      Address: '123 Example Street\nExample City, EX 12345',
      Email: 'Send invoices to [billing@example.com](mailto:billing@example.com)',
      'Tax ID': 'EX-`123456789`',
      Status: '~~pending~~ **active**',
    },
    invoiceTo: [
      {
        'Bill To': '**Acme Corp.**',
        Address: '456 Acme Avenue\nAcme City, AC 67890',
        'Reference': 'See `PO-2024-118` - *priority* shipping',
      },
    ],
  },
};

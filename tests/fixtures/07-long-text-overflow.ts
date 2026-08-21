import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '07-long-text-overflow',
  description: 'Very long values in From/To and line item description — must wrap, not overflow',
  invoice: {
    ...exampleInvoice,
    invoiceFrom: {
      'Issued By': 'Reasonably Long Corporation Name International Holdings Plc',
      Address: 'Suite 14B, 123 Some Reasonably Long Street That Might Overflow\nNorthwest Industrial District, Anytown, State 12345-6789, United States',
      'Tax ID': 'EX-12345678901234567890-LONG-ID',
      Email: 'extremely.long.billing.contact.address@example-corporation-international.com',
    },
    lineItems: [
      { Description: 'Strategic consulting engagement with multi-phase deliverables, weekly stakeholder reviews, and end-of-quarter executive briefings — see SOW for full scope', Quantity: 40, 'Unit Price': '$250', Total: '$10000' },
    ],
  },
};

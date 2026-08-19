import { exampleInvoice } from '../../../schema/invoiceSchema.js';

export default {
  name: '05-bold-non-billto-key',
  description: 'Bold with custom recipient keys (Customer, Patient) — header should be dynamic, not "Bill to"',
  invoice: {
    ...exampleInvoice,
    design: 'bold' as const,
    invoiceTo: [
      { Customer: 'Mountain Co-op', 'Customer ID': 'CUST-9981', Email: 'ap@mountaincoop.org' },
      { Patient: 'John Smith', 'Patient ID': 'PT-2024-4421', 'Date of Birth': '1985-03-12' },
    ],
  },
};

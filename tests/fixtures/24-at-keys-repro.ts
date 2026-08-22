import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

/** Every user text surface with markdown + @key@ hide + size markers. */
export default {
  name: '24-at-keys-repro',
  description: 'Full-field markdown audit: every text surface + @key@ hide + size markers',
  invoice: {
    ...exampleInvoice,
    design: 'classic',
    includeEditLink: false,
    amountsVerifiedHideDisclaimer: true,
    logoUrl: undefined,
    digitalSignatureUrl: undefined,
    isCancelled: true,
    cancelledNotes: '**Void** - see `CN-99`',
    invoiceHeading: '**Tax** Invoice',
    invoiceDescription: 'Period *Q2*\n{@11}small desc line',
    invoiceFrom: {
      'Issued By': '**Therapods** Wellness LLP',
      Address: '12 Main St\n*Suite* 4\nMumbai 400001',
      ' @Hidden From@ ': 'from-only-value',
      Email: 'billing@therapods.example',
      Note: 'Status: ~~old~~ **active**',
    },
    invoiceTo: [
      {
        'Bill To': '**Therapists** Collective',
        ' @Ref@ ': 'to-only-value',
        GSTIN: '`29ABCDE1234F1Z5`',
        Address: 'Line A\nLine B',
      },
    ],
    metaTop: {
      'Invoice Number': '**INV**-0042',
      ' @Meta Hide@ ': 'meta-only-value',
      'Payment ID': '`pay_Q2FpXg9MSGQVvN`',
    },
    metaBottom: {
      Notes:
        '{@11}Razorpay Payment ID: `pay_Q2FpXg9MSGQVvN`\nRazorpay Order ID: `order_Q2FkFNDikhnAtV`',
      ' @Bottom Hide@ ': 'bottom-only-value',
    },
    columns: ['**Description**', 'Qty', 'Amount'],
    lineItems: [
      {
        '**Description**':
          '{@11}Platform Sustenance Fee For Therapists {@11}\nRazorpay Payment ID: `pay_Q2FpXg9MSGQVvN`\nRazorpay Order ID: `order_Q2FkFNDikhnAtV`',
        Qty: 1,
        Amount: '**₹** 499.00',
      },
    ],
    summary: [
      { label: '**Subtotal**', value: '₹ 499.00' },
      { label: 'Total Due', value: '**₹ 499.00**' },
    ],
    footerText: {
      topText: '**Thank you** for your business',
      bottomText: '{@11}footer small · pay via `NEFT`',
    },
  },
};

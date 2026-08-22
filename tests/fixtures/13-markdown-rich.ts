import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: '13-markdown-rich',
  description: 'Markdown in description, footer, and cancelled notes - bold, italic, code, links, lists, blockquote',
  invoice: {
    ...exampleInvoice,
    invoiceDescription:
      'Invoice covers **September 2023** consulting services delivered under SOW-118.\nReview and remit per terms below - questions to [billing@example.com](mailto:billing@example.com).',
    footerText: {
      topText: '**Thank you for your business!**',
      bottomText:
        'Payment instructions:\n\n- ACH to routing `123456789`, account `987654321`\n- Wire to BIC `EXAMPUSXXX`\n- Check payable to *Example Corp.*\n\n> Net 30. Late payments accrue 1.5% monthly per Section 4.2 of the MSA.',
    },
  },
};

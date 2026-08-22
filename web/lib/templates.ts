import type { Invoice } from '@/schema/invoiceSchema';

export interface TemplateDef {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  keywords: string[];
  invoice: Invoice;
}

/**
 * Templates use deliberately placeholder-flavored content ("Your Awesome Agency",
 * "Your Favorite Client", round-number amounts, hello@your-company.com) so
 * users immediately understand these are fill-in-the-blank starting points,
 * not real invoices to copy verbatim.
 *
 * The disclaimer shows on every template (amountsVerifiedHideDisclaimer: false)
 * - users toggle it off from Settings once they've reviewed their amounts.
 */

export const TEMPLATES: TemplateDef[] = [
  /* =====================================================================
   * FREELANCE CONSULTING
   * ===================================================================*/
  {
    slug: 'freelance-consulting',
    name: 'Freelance Consulting',
    tagline: 'Hours × rate, one client, clean layout.',
    description:
      'The classic solo-consultant invoice: rich sender block, one client with contact + PO, hours × rate line items, subtotal and tax. Works for developers, designers, writers, and advisors.',
    keywords: ['freelance invoice', 'consulting invoice', 'hourly invoice', 'contractor invoice'],
    invoice: {
      design: 'classic',
      accentColor: '#2563eb',
      logoPosition: 'center',
      direction: 'ltr',
      autoSize: true,
      filename: '',
      invoiceHeading: 'Invoice',
      invoiceDescription: 'Consulting services: hourly',
      invoiceFrom: {
        'Issued By': 'Your Freelance Name',
        Email: 'you@your-domain.com',
        Website: 'your-domain.com',
        Phone: '+1 (555) 010-0100',
        Address: 'Your Street Address\nYour City, ST 00000\nYour Country',
        'Tax ID': 'Your tax / UTR / EIN number',
        'Business Hours': 'Mon–Fri · your working hours',
      },
      invoiceTo: [
        {
          'Bill To': 'Your Awesome Client Inc.',
          'Attention': 'Your client contact, role',
          Email: 'accounts@your-client.com',
          Phone: '+1 (555) 010-0200',
          Address: 'Client Street Address\nClient City, ST 00000',
          'Account Number': 'CLIENT-2024-001',
          'PO Number': 'PO-0001',
        },
      ],
      metaTop: {
        'Invoice Number': 'INV-0001',
        'Invoice Date': '2024-09-01',
        'Due Date': '2024-09-15',
        'Project': 'Your project name',
      },
      metaBottom: {
        'Payment Terms': 'Net 14',
        'Payment Method': 'Your preferred method: wire, ACH, Stripe, or check',
        Bank: 'Your bank · Sort / Routing · Account',
        IBAN: 'Your IBAN (if applicable)',
        Notes: 'Your late-payment policy or thank-you note goes here.',
      },
      columns: ['Description', 'Hours', 'Rate', 'Amount'],
      lineItems: [
        { Description: 'Your first service (describe the work)', Hours: 6, Rate: '$150/hr', Amount: '$900' },
        { Description: 'Your second service', Hours: 10, Rate: '$150/hr', Amount: '$1,500' },
        { Description: 'Optional fixed-fee item', Hours: 1, Rate: '$500 fixed', Amount: '$500' },
      ],
      summary: [
        { label: 'Subtotal', value: '$2,900' },
        { label: 'Tax (your rate)', value: '$0' },
        { label: 'Total Due', value: '$2,900' },
      ],
      footerText: {
        topText: 'Thank you for your business.',
        bottomText: 'Please reference the invoice number in your payment memo.',
      },
      amountsVerifiedHideDisclaimer: false,
      showBuiltWith: false,
    },
  },

  /* =====================================================================
   * SAAS SUBSCRIPTION
   * ===================================================================*/
  {
    slug: 'saas-subscription',
    name: 'SaaS Subscription',
    tagline: 'Monthly recurring + seats + prorations.',
    description:
      'Standard SaaS monthly invoice: vendor details with legal registration, customer account metadata, seat-based line items, proration, VAT. Good starting point for usage-billed products.',
    keywords: ['saas invoice', 'subscription invoice', 'recurring invoice', 'seat based billing'],
    invoice: {
      design: 'classic',
      accentColor: '#7c3aed',
      logoPosition: 'left',
      direction: 'ltr',
      autoSize: true,
      filename: '',
      invoiceHeading: 'Subscription Invoice',
      invoiceDescription: 'Your monthly billing period',
      invoiceFrom: {
        'Issued By': 'Your SaaS Co.',
        Email: 'billing@your-saas.com',
        Website: 'your-saas.com',
        Support: 'support@your-saas.com · +1 (555) 010-0300',
        Address: 'Your HQ address\nYour City, ST 00000',
        'Tax ID': 'Your EIN or tax number',
        'VAT Number': 'Your VAT number (if EU-registered)',
        'Registered': 'Your state of registration · File No.',
      },
      invoiceTo: [
        {
          'Bill To': 'Your Customer Co.',
          'Attention': 'Accounts Payable',
          Email: 'ap@your-customer.com',
          Address: 'Customer address\nCity, ST 00000',
          'Account ID': 'CUS_XXXXX',
          'Subscription ID': 'SUB_XXXXX',
          'Contract': 'Your MSA reference',
        },
      ],
      metaTop: {
        'Invoice Number': 'SUB-0001',
        'Billing Period': '2024-09-01 → 2024-09-30',
        'Invoice Date': '2024-10-01',
        'Due Date': '2024-10-15',
      },
      metaBottom: {
        'Payment Method': 'Card on file ending in your last four digits',
        'Charged On': 'Auto-charge date',
        'Next Renewal': 'Next billing date',
        Notes: 'Manage billing at your-saas.com/billing.',
      },
      columns: ['Description', 'Seats', 'Price', 'Amount'],
      lineItems: [
        { Description: 'Your Plan: monthly', Seats: 10, Price: '$XX / seat', Amount: '$XXX.XX' },
        { Description: 'Proration: seats added mid-cycle', Seats: 2, Price: '$XX / seat', Amount: '$XX.XX' },
        { Description: 'Add-on: your premium feature', Seats: 1, Price: '$XX / month', Amount: '$XX.XX' },
      ],
      summary: [
        { label: 'Subtotal', value: '$XXX.XX' },
        { label: 'Tax (your rate)', value: '$XX.XX' },
        { label: 'Total', value: '$XXX.XX' },
      ],
      footerText: {
        topText: 'Invoice paid automatically.',
        bottomText: 'Manage billing, download history, or update payment at your-saas.com/billing',
      },
      amountsVerifiedHideDisclaimer: false,
      showBuiltWith: false,
    },
  },

  /* =====================================================================
   * AGENCY RETAINER
   * ===================================================================*/
  {
    slug: 'agency-retainer',
    name: 'Agency Retainer',
    tagline: 'Fixed retainer + discretionary line items.',
    description:
      'Monthly retainer with a fixed fee plus ad-hoc additions and pass-through expenses. Perfect for agencies, fractional execs, and ongoing advisory engagements.',
    keywords: ['retainer invoice', 'agency invoice', 'monthly retainer', 'advisor invoice'],
    invoice: {
      design: 'bold',
      accentColor: '#0891b2',
      logoPosition: 'left',
      direction: 'ltr',
      autoSize: true,
      filename: '',
      invoiceHeading: 'Retainer Invoice',
      invoiceDescription: 'Your retainer month',
      invoiceFrom: {
        'Issued By': 'Your Awesome Agency Ltd.',
        Email: 'hello@your-agency.com',
        Website: 'your-agency.com',
        Phone: '+1 (555) 010-0400',
        Address: 'Your studio address\nYour City, ST 00000',
        'Tax ID': 'Your EIN / company number',
        'Registered': 'Your state · Registration ID',
      },
      invoiceTo: [
        {
          'Bill To': 'Your Favorite Client Corp.',
          'Attention': 'Your client contact, role',
          Email: 'pm@your-client.com',
          Phone: '+1 (555) 010-0500',
          Address: 'Client address\nCity, ST 00000',
          'Contract': 'MSA reference · SOW number',
          'PO': 'PO-0001',
        },
      ],
      metaTop: {
        'Invoice Number': 'RET-0001',
        'Invoice Date': '2024-09-30',
        'Due Date': '2024-10-14',
        'Retainer Month': 'September 2024',
      },
      metaBottom: {
        'Payment Terms': 'Net 14',
        'Retainer Allowance': 'Your hours / month',
        'Hours Used': 'X of Y',
        'Rollover': 'Z hours (policy)',
        Notes: 'Ad-hoc work billed at your ad-hoc rate above the allowance.',
      },
      columns: ['Description', 'Qty', 'Rate', 'Amount'],
      lineItems: [
        { Description: 'Monthly retainer (your allowance)', Qty: 1, Rate: '$X,XXX flat', Amount: '$X,XXX' },
        { Description: 'Your ad-hoc project', Qty: 1, Rate: '$X,XXX fixed', Amount: '$X,XXX' },
        { Description: 'Pass-through expense (describe)', Qty: 1, Rate: 'at cost', Amount: '$XXX' },
      ],
      summary: [
        { label: 'Subtotal', value: '$X,XXX' },
        { label: 'Tax (your rate)', value: '$0' },
        { label: 'Total Due', value: '$X,XXX' },
      ],
      footerText: {
        topText: 'Thank you for another great month.',
        bottomText: 'Questions? Reply to this email or contact your account lead.',
      },
      amountsVerifiedHideDisclaimer: false,
      showBuiltWith: false,
    },
  },

  /* =====================================================================
   * UK VAT
   * ===================================================================*/
  {
    slug: 'uk-vat',
    name: 'UK VAT',
    tagline: 'VAT-compliant invoice with registration number.',
    description:
      'A UK VAT invoice meeting HMRC requirements: VAT registration number, tax point, company number, registered office. Net · VAT · Gross breakdown in summary. Fill in your own VAT rate; we do not calculate.',
    keywords: ['UK VAT invoice', 'VAT registration', 'HMRC invoice', 'british invoice template'],
    invoice: {
      design: 'classic',
      accentColor: '#111827',
      logoPosition: 'left',
      direction: 'ltr',
      autoSize: true,
      filename: '',
      invoiceHeading: 'VAT Invoice',
      invoiceDescription: 'Tax invoice issued under VAT Notice 700',
      logoUrl: 'https://placehold.co/180x54/111827/ffffff.png?text=Your+Logo',
      logoSize: { width: 180, height: 54 },
      invoiceFrom: {
        'Issued By': 'Your Ltd.',
        'Registered Office': 'Your registered office\nLondon POSTCODE\nUnited Kingdom',
        'Company Number': 'Your Companies House number',
        'VAT Number': 'GB + your 9-digit VAT number',
        Email: 'billing@your-company.co.uk',
        Phone: '+44 20 0000 0000',
        Website: 'your-company.co.uk',
        Director: 'Your director name(s)',
      },
      invoiceTo: [
        {
          'Bill To': 'Your Client Ltd.',
          'Attention': 'Your client contact, role',
          Address: 'Client registered office\nLondon POSTCODE\nUnited Kingdom',
          'VAT Number': 'GB + client VAT number',
          'Company Number': 'Client Companies House number',
          'PO Number': 'PO-0001',
          Email: 'accounts@your-client.co.uk',
        },
      ],
      metaTop: {
        'Invoice Number': 'VAT-0001',
        'Invoice Date': '2024-09-15',
        'Tax Point': '2024-09-15',
        'Due Date': '2024-10-15',
      },
      metaBottom: {
        'Payment Terms': 'Net 30',
        'Payment Reference': 'VAT-0001',
        Bank: 'Your bank · Sort code · Account number',
        IBAN: 'Your IBAN',
        'Late Payment': 'Interest at 8% + BoE base rate per Late Payment Act 1998.',
      },
      columns: ['Description', 'Qty', 'Unit Price (Net)', 'VAT Rate', 'Net Amount'],
      lineItems: [
        { Description: 'Your first taxable item', Qty: 1, 'Unit Price (Net)': '£1,000.00', 'VAT Rate': '20%', 'Net Amount': '£1,000.00' },
        { Description: 'Your second taxable item', Qty: 5, 'Unit Price (Net)': '£100.00', 'VAT Rate': '20%', 'Net Amount': '£500.00' },
        { Description: 'Your zero-rated item (e.g., print)', Qty: 10, 'Unit Price (Net)': '£2.00', 'VAT Rate': '0% (zero-rated)', 'Net Amount': '£20.00' },
      ],
      summary: [
        { label: 'Net Total (standard-rated)', value: '£1,500.00' },
        { label: 'Net Total (zero-rated)', value: '£20.00' },
        { label: 'Net Total', value: '£1,520.00' },
        { label: 'VAT @ 20%', value: '£300.00' },
        { label: 'Gross Total Due', value: '£1,820.00' },
      ],
      footerText: {
        topText: 'Thank you. Please quote the invoice number when making payment.',
        bottomText: 'Your Ltd. is a company registered in England & Wales. Your details go here.',
      },
      amountsVerifiedHideDisclaimer: false,
      showBuiltWith: false,
    },
  },

  /* =====================================================================
   * US SALES TAX
   * ===================================================================*/
  {
    slug: 'us-sales-tax',
    name: 'US Sales Tax',
    tagline: 'Line-level taxable flag + state sales tax.',
    description:
      'A US invoice with state sales tax applied per-line. Separate Bill-To and Ship-To blocks, customer ID, PO reference, sales tax exemption notes, digital signature. Great for product sales where some items are taxable and some are not.',
    keywords: ['US sales tax invoice', 'product invoice', 'retail invoice', 'state tax invoice'],
    invoice: {
      design: 'classic',
      accentColor: '#dc2626',
      logoPosition: 'center',
      direction: 'ltr',
      autoSize: true,
      filename: '',
      invoiceHeading: 'Invoice',
      invoiceDescription: 'Goods sale: your state',
      digitalSignatureUrl: 'https://placehold.co/200x56/ffffff/111827.png?text=Your+Signature',
      signatureSize: { width: 200, height: 56 },
      invoiceFrom: {
        'Issued By': 'Your Awesome Co. LLC',
        Email: 'sales@your-company.com',
        Website: 'your-company.com',
        Phone: '+1 (555) 010-0600',
        Address: 'Your warehouse address\nYour City, ST 00000',
        'Tax ID': 'Your EIN',
        'Sales Tax Permit': 'Your state permit number',
      },
      invoiceTo: [
        {
          'Bill To': 'Your Customer LLC',
          'Attention': 'Your customer contact, role',
          Email: 'ap@your-customer.com',
          Address: 'Customer billing address\nCity, ST 00000',
          'Customer ID': 'CUST-00001',
          'PO Number': 'PO-0001',
        },
        {
          'Ship To': 'Your Customer (Warehouse)',
          'Attention': 'Receiving Dock',
          Address: 'Customer shipping address\nCity, ST 00000',
          'Shipping Method': 'Your carrier (FedEx, UPS, etc.)',
          'Tracking': 'Your tracking number',
          'Delivery Window': 'Your delivery window',
        },
      ],
      metaTop: {
        'Invoice Number': 'USA-0001',
        'Invoice Date': '2024-09-20',
        'Due Date': '2024-10-20',
        PO: 'PO-0001',
      },
      metaBottom: {
        'Payment Terms': 'Net 30',
        'Payment Methods': 'ACH, wire, or check payable to Your Awesome Co. LLC',
        ACH: 'Your routing · Your account',
        Notes: 'Tax-exempt? Email your resale certificate to sales@your-company.com.',
      },
      columns: ['Description', 'Qty', 'Unit Price', 'Taxable', 'Amount'],
      lineItems: [
        { Description: 'Your Product A (SKU-A)', Qty: 10, 'Unit Price': '$50.00', Taxable: 'Yes', Amount: '$500.00' },
        { Description: 'Your Product B (SKU-B, premium)', Qty: 5, 'Unit Price': '$120.00', Taxable: 'Yes', Amount: '$600.00' },
        { Description: 'Shipping & Handling', Qty: 1, 'Unit Price': '$40.00', Taxable: 'No', Amount: '$40.00' },
        { Description: 'Installation labor', Qty: 2, 'Unit Price': '$75.00', Taxable: 'No', Amount: '$150.00' },
      ],
      summary: [
        { label: 'Taxable Subtotal', value: '$1,100.00' },
        { label: 'Non-taxable Subtotal', value: '$190.00' },
        { label: 'Subtotal', value: '$1,290.00' },
        { label: 'Sales Tax (your state · X%)', value: '$90.75' },
        { label: 'Total Due', value: '$1,380.75' },
      ],
      footerText: {
        topText: 'Thank you for your order.',
        bottomText: 'Your returns policy goes here. See your-company.com/returns.',
      },
      amountsVerifiedHideDisclaimer: false,
      showBuiltWith: false,
    },
  },

  /* =====================================================================
   * MULTI-SHIPMENT
   * ===================================================================*/
  {
    slug: 'multi-shipment',
    name: 'Multi-Shipment',
    tagline: 'Bill-to + multiple ship-to recipients.',
    description:
      'One bill-to block with multiple shipping destinations. Each ship-to carries its own shipping method, tracking number, and delivery instructions. Common for distributors, wholesalers, and procurement scenarios.',
    keywords: ['multi recipient invoice', 'wholesale invoice', 'distributor invoice', 'ship to invoice'],
    invoice: {
      design: 'classic',
      accentColor: '#059669',
      logoPosition: 'left',
      direction: 'ltr',
      autoSize: true,
      filename: '',
      invoiceHeading: 'Invoice',
      invoiceDescription: 'Split shipment order',
      invoiceFrom: {
        'Issued By': 'Your Supply Co. Inc.',
        Email: 'orders@your-supply.com',
        Website: 'your-supply.com',
        Phone: '+1 (555) 010-0700',
        Address: 'Your warehouse address\nCity, ST 00000',
        'Tax ID': 'Your EIN',
        'DUNS': 'Your DUNS number',
      },
      invoiceTo: [
        {
          'Bill To': 'Your Customer HQ',
          'Attention': 'Your procurement contact, role',
          Email: 'procurement@your-customer.com',
          Phone: '+1 (555) 010-0800',
          Address: 'Customer HQ address\nCity, ST 00000',
          'Account Number': 'CUST-0001',
          'PO Number': 'PO-0001',
        },
        {
          'Ship To': 'Customer Warehouse A',
          'Attention': 'Shipping Dock',
          Address: 'Warehouse A address\nCity, ST 00000',
          'Shipping Method': 'Your LTL carrier',
          'Tracking': 'Tracking number A',
          'Delivery Window': 'Weekdays 07:00 to 15:00',
          'Delivery Instructions': 'Your instructions go here.',
        },
        {
          'Ship To': 'Customer Warehouse B',
          'Attention': 'Receiving',
          Address: 'Warehouse B address\nCity, ST 00000',
          'Shipping Method': 'Your freight carrier',
          'Tracking': 'Tracking number B',
          'Delivery Window': 'Weekdays 06:00 to 18:00',
          'Delivery Instructions': 'Your instructions go here.',
        },
      ],
      metaTop: {
        'Invoice Number': 'MS-0001',
        'Invoice Date': '2024-09-22',
        'Due Date': '2024-10-22',
        'Contract': 'Your MSA reference',
      },
      metaBottom: {
        'Payment Terms': 'Net 30',
        'Payment Method': 'ACH preferred',
        Bank: 'Your bank · Routing · Account',
        Notes: 'Freight charges split by destination weight. See Ship-To blocks for tracking.',
      },
      columns: ['Description', 'Qty', 'Destination', 'Unit Price', 'Amount'],
      lineItems: [
        { Description: 'Your product (SKU)', Qty: 20, Destination: 'Warehouse A', 'Unit Price': '$100.00', Amount: '$2,000.00' },
        { Description: 'Your product (SKU)', Qty: 10, Destination: 'Warehouse B', 'Unit Price': '$100.00', Amount: '$1,000.00' },
        { Description: 'Your accessory (case pack)', Qty: 15, Destination: 'Warehouse A', 'Unit Price': '$20.00', Amount: '$300.00' },
      ],
      summary: [
        { label: 'Subtotal', value: '$3,300.00' },
        { label: 'Freight (Warehouse A)', value: '$150.00' },
        { label: 'Freight (Warehouse B)', value: '$100.00' },
        { label: 'Total Due', value: '$3,550.00' },
      ],
      footerText: {
        topText: 'Thank you for your order.',
        bottomText: 'Track individual shipments using the tracking numbers in each Ship-To block.',
      },
      amountsVerifiedHideDisclaimer: false,
      showBuiltWith: false,
    },
  },
];

export function getTemplate(slug: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

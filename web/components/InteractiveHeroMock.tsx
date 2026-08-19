'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Invoice from './Invoice';
import type { Invoice as InvoiceData } from '@/schema/invoiceSchema';
import { IArrowRight } from './Icons';

interface AutoStep {
  lineItem: Record<string, string | number>;
  summary: Array<{ label: string; value: string }>;
}

interface CompanyScenario {
  id: string;
  name: string;
  design: 'classic' | 'bold';
  accentColor: string;
  baseInvoice: InvoiceData;
  steps: AutoStep[];
  finalMetaBottom: Record<string, string>;
  finalFooterText: { topText?: string; bottomText?: string };
}

const SCENARIOS: CompanyScenario[] = [
  {
    id: 'hyperline',
    name: 'Hyperline Labs',
    design: 'classic',
    accentColor: '#2563eb',
    baseInvoice: {
      design: 'classic',
      accentColor: '#2563eb',
      logoPosition: 'left',
      direction: 'ltr',
      autoSize: true,
      filename: 'invoice-hyperline-october-2024',
      invoiceHeading: 'Invoice',
      invoiceDescription: 'Design systems, UI engineering, and cloud deployment services.',
      logoUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 36" width="160" height="36">
          <rect width="36" height="36" rx="8" fill="#2563eb"/>
          <path d="M11 18l5-5 5 5-5 5z" fill="#ffffff"/>
          <circle cx="25" cy="18" r="2.5" fill="#ffffff"/>
          <text x="46" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#0f172a" letter-spacing="-0.02em">Hyperline</text>
        </svg>`
      )}`,
      logoSize: { width: 160, height: 36 },
      invoiceFrom: {
        'Issued By': 'Hyperline Labs Inc.',
        Address: '548 Market St, Suite 48201\nSan Francisco, CA 94104',
        Email: 'billing@hyperline.io',
        'Tax ID': 'EIN 84-3920194',
        Website: 'www.hyperline.io',
        Phone: '+1 (415) 890-2340',
      },
      invoiceTo: [
        {
          'Bill To': 'Starlight Technologies, Inc.',
          Attention: 'Alex Morgan · Accounts Payable',
          Address: '100 Pine Street, 14th Floor\nSan Francisco, CA 94111',
          Email: 'ap@starlight.io',
          'Account Number': 'ACT-88492',
          'PO Number': 'PO-2024-089',
        },
      ],
      metaTop: {
        'Invoice Number': 'INV-2024-0042',
        'Invoice Date': '2024-10-15',
        'Due Date': '2024-10-29',
        'Payment Terms': 'Net 14',
      },
      metaBottom: {},
      columns: ['Description', 'Qty / Hrs', 'Rate', 'Total'],
      lineItems: [],
      summary: [{ label: 'Subtotal', value: 'Calculating...' }],
      footerText: {},
      amountsVerifiedHideDisclaimer: true,
      showBuiltWith: false,
    },
    steps: [
      {
        lineItem: {
          Description: 'Design System Architecture & Component Library',
          'Qty / Hrs': '1',
          Rate: '$4,500.00',
          Total: '$4,500.00',
        },
        summary: [
          { label: 'Subtotal', value: '$4,500.00' },
          { label: 'Total Due', value: '$4,500.00' },
        ],
      },
      {
        lineItem: {
          Description: 'Frontend Web Application Development (Sprint 14 & 15)',
          'Qty / Hrs': '32 hrs',
          Rate: '$150.00',
          Total: '$4,800.00',
        },
        summary: [
          { label: 'Subtotal', value: '$9,300.00' },
          { label: 'Total Due', value: '$9,300.00' },
        ],
      },
      {
        lineItem: {
          Description: 'Cloud Infrastructure & Automated CI/CD Setup',
          'Qty / Hrs': '8 hrs',
          Rate: '$175.00',
          Total: '$1,400.00',
        },
        summary: [
          { label: 'Subtotal', value: '$10,700.00' },
          { label: 'Tax (0%)', value: '$0.00' },
          { label: 'Total Due', value: '$10,700.00' },
        ],
      },
    ],
    finalMetaBottom: {
      'Payment Terms': 'Net 14 · Payment due by October 29, 2024',
      'Wire / ACH': 'Silicon Valley Bank · Routing 121000358 · Acct 983204819',
      Notes: 'Please reference invoice number INV-2024-0042 on your remittance advice.',
    },
    finalFooterText: {
      topText: 'Thank you for your partnership!',
      bottomText: 'Hyperline Labs Inc. · 548 Market Street, Suite 48201, San Francisco, CA 94104',
    },
  },
  {
    id: 'nexus',
    name: 'Nexus Cloud',
    design: 'bold',
    accentColor: '#7c3aed',
    baseInvoice: {
      design: 'bold',
      accentColor: '#7c3aed',
      logoPosition: 'left',
      direction: 'ltr',
      autoSize: true,
      filename: 'invoice-nexus-october-2024',
      invoiceHeading: 'Subscription Invoice',
      invoiceDescription: 'Enterprise cluster compute, dedicated egress & support — Oct 2024',
      logoUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 36" width="160" height="36">
          <rect width="36" height="36" rx="8" fill="#7c3aed"/>
          <circle cx="18" cy="18" r="7" stroke="#ffffff" stroke-width="2.5" fill="none"/>
          <path d="M14 18h8M18 14v8" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
          <text x="46" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#0f172a" letter-spacing="-0.02em">NexusCloud</text>
        </svg>`
      )}`,
      logoSize: { width: 160, height: 36 },
      invoiceFrom: {
        'Issued By': 'Nexus Cloud Systems Inc.',
        Address: '415 Mission Street, Floor 32\nSan Francisco, CA 94105',
        Email: 'billing@nexuscloud.io',
        'Tax ID': 'EIN 93-8102941',
        Website: 'nexuscloud.io',
      },
      invoiceTo: [
        {
          'Bill To': 'Kinetics AI Corporation',
          Attention: 'Finance & Infrastructure Ops',
          Address: '500 Yale Ave N, Suite 500\nSeattle, WA 98109',
          'Account ID': 'CUS-99420',
          'Subscription ID': 'SUB-ENT-402',
          'PO Number': 'PO-88194',
        },
      ],
      metaTop: {
        'Invoice Number': 'SUB-2024-1108',
        'Billing Period': 'Oct 1 – Oct 31, 2024',
        'Invoice Date': '2024-10-01',
        'Due Date': '2024-10-15',
      },
      metaBottom: {},
      columns: ['Description', 'Qty / Usage', 'Rate', 'Amount'],
      lineItems: [],
      summary: [{ label: 'Subtotal', value: 'Calculating...' }],
      footerText: {},
      amountsVerifiedHideDisclaimer: true,
      showBuiltWith: false,
    },
    steps: [
      {
        lineItem: {
          Description: 'Enterprise Kubernetes Dedicated Cluster (32 Nodes)',
          'Qty / Usage': '1 mo',
          Rate: '$3,200.00',
          Amount: '$3,200.00',
        },
        summary: [
          { label: 'Subtotal', value: '$3,200.00' },
          { label: 'Total Due', value: '$3,200.00' },
        ],
      },
      {
        lineItem: {
          Description: 'GPU Compute Fleet (H100 tier — 450 reserved hrs)',
          'Qty / Usage': '450 hrs',
          Rate: '$4.50/hr',
          Amount: '$2,025.00',
        },
        summary: [
          { label: 'Subtotal', value: '$5,225.00' },
          { label: 'Total Due', value: '$5,225.00' },
        ],
      },
      {
        lineItem: {
          Description: 'Enterprise 24/7 SLA & Solutions Engineering Support',
          'Qty / Usage': '1 mo',
          Rate: '$1,500.00',
          Amount: '$1,500.00',
        },
        summary: [
          { label: 'Subtotal', value: '$6,725.00' },
          { label: 'Sales Tax (0%)', value: '$0.00' },
          { label: 'Total Due', value: '$6,725.00' },
        ],
      },
    ],
    finalMetaBottom: {
      'Payment Method': 'Direct Debit (ACH) · Verified',
      'Auto-charge Date': '2024-10-15',
      Notes: 'Manage enterprise subscription tiers or seat allocations at nexuscloud.io/billing.',
    },
    finalFooterText: {
      topText: 'Thank you for building on Nexus Cloud.',
      bottomText: 'Nexus Cloud Systems Inc. · 415 Mission St · San Francisco, CA',
    },
  },
  {
    id: 'studio-monochrome',
    name: 'Studio Monochrome',
    design: 'classic',
    accentColor: '#0f172a',
    baseInvoice: {
      design: 'classic',
      accentColor: '#0f172a',
      logoPosition: 'left',
      direction: 'ltr',
      autoSize: true,
      filename: 'invoice-studio-monochrome-october-2024',
      invoiceHeading: 'VAT Invoice',
      invoiceDescription: 'Brand identity, 3D motion graphics & packaging design artworks.',
      logoUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 36" width="170" height="36">
          <rect width="36" height="36" rx="4" fill="#0f172a"/>
          <path d="M12 24V12h4l4 7 4-7h4v12h-3.5v-7.5l-3.5 6h-2l-3.5-6V24Z" fill="#ffffff"/>
          <text x="46" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#0f172a" letter-spacing="-0.01em">MONOCHROME</text>
        </svg>`
      )}`,
      logoSize: { width: 170, height: 36 },
      invoiceFrom: {
        'Issued By': 'Studio Monochrome Ltd',
        'Registered Office': '14 Clerkenwell Close\nLondon EC1R 0AA\nUnited Kingdom',
        'Company Number': '12894102',
        'VAT Number': 'GB 394 8812 05',
        Email: 'accounts@studiomonochrome.co.uk',
        Website: 'studiomonochrome.co.uk',
      },
      invoiceTo: [
        {
          'Bill To': 'Aura Botanicals Ltd',
          Attention: 'Sophie Chen · Creative Director',
          Address: '88 Great Eastern St\nLondon EC2A 3NX\nUnited Kingdom',
          'VAT Number': 'GB 891 0293 44',
          'PO Number': 'PO-UK-2024-91',
        },
      ],
      metaTop: {
        'Invoice Number': 'VAT-2024-0391',
        'Invoice Date': '2024-10-10',
        'Tax Point': '2024-10-10',
        'Due Date': '2024-11-09',
      },
      metaBottom: {},
      columns: ['Description', 'Qty', 'Unit Price', 'VAT Rate', 'Net Amount'],
      lineItems: [],
      summary: [{ label: 'Net Subtotal', value: 'Calculating...' }],
      footerText: {},
      amountsVerifiedHideDisclaimer: true,
      showBuiltWith: false,
    },
    steps: [
      {
        lineItem: {
          Description: 'Brand Identity System & Brand Guidelines',
          Qty: '1',
          'Unit Price': '£4,000.00',
          'VAT Rate': '20%',
          'Net Amount': '£4,000.00',
        },
        summary: [
          { label: 'Net Subtotal', value: '£4,000.00' },
          { label: 'VAT @ 20%', value: '£800.00' },
          { label: 'Gross Total Due', value: '£4,800.00' },
        ],
      },
      {
        lineItem: {
          Description: '3D Product Motion Graphics & Render Pack',
          Qty: '4',
          'Unit Price': '£850.00',
          'VAT Rate': '20%',
          'Net Amount': '£3,400.00',
        },
        summary: [
          { label: 'Net Subtotal', value: '£7,400.00' },
          { label: 'VAT @ 20%', value: '£1,480.00' },
          { label: 'Gross Total Due', value: '£8,880.00' },
        ],
      },
      {
        lineItem: {
          Description: 'Sustainable Packaging Die-line Artworks',
          Qty: '6',
          'Unit Price': '£250.00',
          'VAT Rate': '20%',
          'Net Amount': '£1,500.00',
        },
        summary: [
          { label: 'Net Subtotal', value: '£8,900.00' },
          { label: 'VAT @ 20%', value: '£1,780.00' },
          { label: 'Gross Total Due', value: '£10,680.00' },
        ],
      },
    ],
    finalMetaBottom: {
      'Payment Terms': 'Net 30 · Bank Transfer',
      'Bank Details': 'Barclays Bank UK · Sort: 20-00-00 · Acc: 83920194',
      IBAN: 'GB29 BARC 2000 0083 9201 94',
      Notes: 'Please quote VAT-2024-0391 in your transfer reference.',
    },
    finalFooterText: {
      topText: 'Thank you for your business.',
      bottomText: 'Studio Monochrome Ltd · Registered in England & Wales #12894102',
    },
  },
  {
    id: 'vanguard',
    name: 'Vanguard Supply',
    design: 'bold',
    accentColor: '#059669',
    baseInvoice: {
      design: 'bold',
      accentColor: '#059669',
      logoPosition: 'left',
      direction: 'ltr',
      autoSize: true,
      filename: 'invoice-vanguard-october-2024',
      invoiceHeading: 'Commercial Invoice',
      invoiceDescription: 'Precision automation components & wholesale equipment dispatch.',
      logoUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 36" width="160" height="36">
          <rect width="36" height="36" rx="8" fill="#059669"/>
          <path d="M18 10l8 16H10z" fill="#ffffff"/>
          <text x="46" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#0f172a" letter-spacing="-0.02em">Vanguard</text>
        </svg>`
      )}`,
      logoSize: { width: 160, height: 36 },
      invoiceFrom: {
        'Issued By': 'Vanguard Supply Co.',
        Address: '1200 Logistics Pkwy, Bldg 4\nDallas, TX 75261',
        Email: 'orders@vanguardsupply.com',
        'Tax ID': 'EIN 75-4920193',
        Phone: '+1 (214) 555-0199',
        Website: 'vanguardsupply.com',
      },
      invoiceTo: [
        {
          'Bill To': 'Apex Industrial Systems LLC',
          Attention: 'Procurement & Receiving',
          Address: '740 Innovation Dr\nAustin, TX 78701',
          'Account Number': 'ACC-APEX-77',
          'PO Number': 'PO-88231',
        },
      ],
      metaTop: {
        'Invoice Number': 'VNG-2024-8842',
        'Invoice Date': '2024-10-18',
        'Due Date': '2024-11-17',
        'Shipping Method': 'FedEx Freight Priority',
      },
      metaBottom: {},
      columns: ['Description', 'Qty', 'Unit Price', 'Amount'],
      lineItems: [],
      summary: [{ label: 'Subtotal', value: 'Calculating...' }],
      footerText: {},
      amountsVerifiedHideDisclaimer: true,
      showBuiltWith: false,
    },
    steps: [
      {
        lineItem: {
          Description: 'Industrial Sensor Controller Hubs (Modbus/IP)',
          Qty: '15 units',
          'Unit Price': '$180.00',
          Amount: '$2,700.00',
        },
        summary: [
          { label: 'Subtotal', value: '$2,700.00' },
          { label: 'Total Due', value: '$2,700.00' },
        ],
      },
      {
        lineItem: {
          Description: 'High-Torque Brushless Servo Motors (48V)',
          Qty: '8 units',
          'Unit Price': '$340.00',
          Amount: '$2,720.00',
        },
        summary: [
          { label: 'Subtotal', value: '$5,420.00' },
          { label: 'Total Due', value: '$5,420.00' },
        ],
      },
      {
        lineItem: {
          Description: 'Expedited Freight & Insured Handling',
          Qty: '1 shipment',
          'Unit Price': '$380.00',
          Amount: '$380.00',
        },
        summary: [
          { label: 'Subtotal', value: '$5,800.00' },
          { label: 'Sales Tax (6.25%)', value: '$362.50' },
          { label: 'Total Due', value: '$6,162.50' },
        ],
      },
    ],
    finalMetaBottom: {
      'Payment Terms': 'Net 30 · ACH / Corporate Wire',
      'ACH Routing': 'JPMorgan Chase · Routing: 111000614 · Acc: 449201924',
      Notes: 'Tracking information dispatched via email upon bill of lading signoff.',
    },
    finalFooterText: {
      topText: 'Thank you for your order.',
      bottomText: 'Vanguard Supply Co. · Dallas Logistics Park · Dallas, TX',
    },
  },
];

export default function InteractiveHeroMock() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const scenario = SCENARIOS[scenarioIndex];
  const totalSteps = scenario.steps.length;
  const isComplete = stepIndex >= totalSteps;

  // Auto-complete timeline sequence
  useEffect(() => {
    if (isPaused) return;

    // Progression of steps
    if (stepIndex < totalSteps) {
      const stepTimer = setTimeout(() => {
        setStepIndex((s) => s + 1);
      }, 750);
      return () => clearTimeout(stepTimer);
    }

    // When complete, hold the view before transitioning to the next scenario
    const holdTimer = setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
        setStepIndex(0);
        setIsTransitioning(false);
      }, 400);
    }, 4500);

    return () => clearTimeout(holdTimer);
  }, [stepIndex, totalSteps, isPaused, scenarioIndex]);

  // Build the live auto-completed invoice data
  const currentLineItems = scenario.steps.slice(0, stepIndex).map((s) => s.lineItem);
  const currentSummary =
    stepIndex === 0
      ? [{ label: scenario.design === 'classic' && scenario.id === 'studio-monochrome' ? 'Net Subtotal' : 'Subtotal', value: '—' }]
      : scenario.steps[stepIndex - 1].summary;

  const dynamicInvoice: InvoiceData = {
    ...scenario.baseInvoice,
    lineItems: currentLineItems.length > 0 ? currentLineItems : [{ Description: 'Adding line items...', 'Qty / Hrs': '...', Rate: '...', Total: '...' }],
    summary: currentSummary,
    metaBottom: isComplete ? scenario.finalMetaBottom : {},
    footerText: isComplete ? scenario.finalFooterText : {},
    amountsVerifiedHideDisclaimer: true,
    showBuiltWith: false,
  };

  // Progress percentage (0% -> 100%)
  const progressPercent = Math.min(100, Math.round(((stepIndex + (isComplete ? 1 : 0)) / (totalSteps + 1)) * 100));

  return (
    <div className="relative">
      <style>{`
        @keyframes heroRowPop {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes computeGlow {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
            background-color: rgba(37, 99, 235, 0.08);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(37, 99, 235, 0);
            background-color: rgba(37, 99, 235, 0.04);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
            background-color: transparent;
          }
        }

        .hero-lineitem-row {
          animation: heroRowPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .hero-summary-calculating {
          animation: computeGlow 1.2s ease-out infinite;
        }
      `}</style>

      {/* Ambient background glows */}
      <div
        aria-hidden
        className="absolute -top-8 -left-8 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse transition-colors duration-1000"
        style={{
          backgroundColor:
            scenario.accentColor === '#7c3aed'
              ? '#c084fc'
              : scenario.accentColor === '#059669'
              ? '#6ee7b7'
              : '#93c5fd',
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-8 -right-8 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
      />

      {/* Browser window container */}
      <div
        className="relative transition-all duration-700 ease-out group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`relative bg-white rounded-2xl shadow-2xl shadow-zinc-900/10 overflow-hidden border border-zinc-200/90 transition-all duration-500 ease-out rotate-1 group-hover:rotate-0 ${
            isTransitioning ? 'opacity-30 scale-[0.98]' : 'opacity-100 scale-100'
          }`}
        >
          {/* Top chrome bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-100 bg-zinc-50/90">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-red-400/90" />
              <span className="size-2.5 rounded-full bg-amber-400/90" />
              <span className="size-2.5 rounded-full bg-emerald-400/90" />
            </div>

            <div className="flex items-center gap-2 ml-2 px-2.5 py-0.5 rounded-md bg-white border border-zinc-200/70 text-[11px] font-mono text-zinc-600 shadow-2xs max-w-[200px] sm:max-w-none truncate">
              <span className="size-1.5 rounded-full animate-pulse" style={{ backgroundColor: scenario.accentColor }} />
              <span className="truncate">renderinvoice.com/{scenario.id}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  isComplete
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-blue-500 animate-ping'}`}
                />
                {isComplete ? 'Live preview' : 'Populating preview...'}
              </span>
            </div>
          </div>

          {/* Progressive animated progress indicator line */}
          <div className="w-full bg-zinc-100 h-0.5 overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: scenario.accentColor,
              }}
            />
          </div>

          {/* Real invoice with live auto-completing elements */}
          <div className="relative bg-zinc-50/30">
            <div className="max-h-[560px] overflow-hidden">
              <div
                className="pointer-events-none transition-all duration-300"
                key={`${scenario.id}-${scenario.design}`}
              >
                <Invoice invoice={dynamicInvoice} performValidation={false} printView={true} />
              </div>
            </div>

            {/* Bottom gradient fade overlay */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none"
            />

            {/* Action CTA */}
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <Link
                href="/playground"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-medium shadow-xl hover:bg-gray-800 transition-all hover:-translate-y-0.5 text-sm"
              >
                Customize this in the playground
                <IArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-500 text-center">
        This is the exact invoice you&rsquo;ll see when you open the app.
      </p>
    </div>
  );
}

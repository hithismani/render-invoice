/**
 * Assert autoSize PDF page geometry:
 *  - autoSize true: width = A4 (595), height >= A4, height scales with content
 *  - autoSize false: exactly one A4 page
 */
import { readFileSync } from 'node:fs';
import satori, { init as initSatoriWasm } from 'satori';
import { PDFDocument } from 'pdf-lib';
import { invoiceElement } from '../web/components/SatoriInvoiceTemplate.jsx';
import { satoriSvgToPdf } from '../web/lib/satoriSvgToPdf.js';
import { exampleInvoice } from '../web/schema/invoiceSchema.js';
import type { Invoice } from '../web/schema/invoiceSchema.js';

const WEB = new URL('../web', import.meta.url).pathname;
const A4_W = 595;
const A4_H = 842;

async function pdfPageSize(bytes: Uint8Array) {
  const doc = await PDFDocument.load(bytes);
  const page = doc.getPages()[0];
  const { width, height } = page.getSize();
  return { width, height, n: doc.getPageCount() };
}

async function render(invoice: Invoice) {
  const regular = readFileSync(WEB + '/public/fonts/Inter-Regular.ttf');
  const bold = readFileSync(WEB + '/public/fonts/Inter-Bold.ttf');
  const svg = await satori(invoiceElement(invoice, { forExport: true }), {
    width: 900,
    embedFont: false,
    fonts: [
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: bold, weight: 700, style: 'normal' },
    ],
  });
  return satoriSvgToPdf(svg, { regular, bold }, { fitToA4: invoice.autoSize === false });
}

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exit(1);
  }
  console.log('PASS', msg);
}

async function main() {
  await initSatoriWasm(readFileSync(WEB + '/node_modules/satori/yoga.wasm'));

  const short = await render({ ...exampleInvoice, autoSize: true, amountsVerifiedHideDisclaimer: true, includeEditLink: false });
  const shortSz = await pdfPageSize(short);
  assert(shortSz.n === 1, 'autoSize short: 1 page');
  assert(Math.abs(shortSz.width - A4_W) < 0.5, `autoSize short: width A4 (got ${shortSz.width})`);
  assert(shortSz.height + 0.5 >= A4_H, `autoSize short: height ≥ A4 (got ${shortSz.height})`);
  assert(Math.abs(shortSz.height - A4_H) < 0.5, `autoSize short: short content pins to A4 height (got ${shortSz.height})`);

  const tallInv: Invoice = {
    ...exampleInvoice,
    autoSize: true,
    amountsVerifiedHideDisclaimer: true,
    includeEditLink: false,
    lineItems: Array.from({ length: 40 }, (_, i) => ({
      Description: `Line item ${i + 1} with enough text to keep rows tall`,
      Quantity: 1,
      'Unit Price': '$10',
      Total: '$10',
    })),
  };
  const tall = await render(tallInv);
  const tallSz = await pdfPageSize(tall);
  assert(tallSz.n === 1, 'autoSize tall: 1 page');
  assert(Math.abs(tallSz.width - A4_W) < 0.5, `autoSize tall: width A4 (got ${tallSz.width})`);
  assert(tallSz.height > A4_H + 20, `autoSize tall: height grows past A4 (got ${tallSz.height})`);

  const fit = await render({ ...exampleInvoice, autoSize: false, amountsVerifiedHideDisclaimer: true, includeEditLink: false });
  const fitSz = await pdfPageSize(fit);
  assert(fitSz.n === 1, 'fitToA4: 1 page');
  assert(Math.abs(fitSz.width - A4_W) < 0.5, `fitToA4: width A4 (got ${fitSz.width})`);
  assert(Math.abs(fitSz.height - A4_H) < 0.5, `fitToA4: height A4 (got ${fitSz.height})`);

  console.log('\nAll autoSize page geometry assertions passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import satori, { init as initSatoriWasm } from 'satori';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { invoiceElement } from '../components/SatoriInvoiceTemplate.jsx';
import * as schema from '../schema/invoiceSchema.js';
import { satoriSvgToPdf } from '../lib/satoriSvgToPdf.js';

async function main() {
  await initSatoriWasm(await WebAssembly.compile(readFileSync('node_modules/satori/yoga.wasm')));
  const regular = readFileSync('public/fonts/Inter-Regular.ttf');
  const bold = readFileSync('public/fonts/Inter-Bold.ttf');
  const fonts = { regular: regular.buffer.slice(regular.byteOffset, regular.byteOffset + regular.byteLength), bold: bold.buffer.slice(bold.byteOffset, bold.byteOffset + bold.byteLength) };

  const cases = [
    { name: 'classic', invoice: { ...schema.exampleInvoice, design: 'classic' as const, logoUrl: undefined, digitalSignatureUrl: undefined } },
    { name: 'bold', invoice: { ...schema.exampleInvoice, design: 'bold' as const, logoUrl: undefined, digitalSignatureUrl: undefined } },
    { name: 'autosize-a4', invoice: { ...schema.exampleInvoice, autoSize: false, logoUrl: undefined, digitalSignatureUrl: undefined } },
  ];

  const outDir = '__tests__/invoice-fixtures/output';
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  for (const c of cases) {
    const svg = await satori(invoiceElement(c.invoice, { forExport: true }), {
      width: 900,
      embedFont: false,
      fonts: [
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
      ],
    });
    const pdf = await satoriSvgToPdf(svg, fonts, { fitToA4: c.invoice.autoSize === false });
    const path = `${outDir}/${c.name}.vector.pdf`;
    writeFileSync(path, pdf);
    const head = Buffer.from(pdf.subarray(0, 5)).toString();
    const { execFileSync } = await import('node:child_process');
    const extracted = execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8' });
    const hasInvoice = extracted.includes('Invoice');
    const hasAcme = extracted.includes('Acme');
    console.log(`${c.name}: ${pdf.byteLength} bytes  %PDF=${head === '%PDF-'}  Invoice=${hasInvoice} Acme=${hasAcme}`);
    console.log(extracted.split('\n').slice(0, 4).join(' | '));
    if (head !== '%PDF-') throw new Error(`${c.name} is not a PDF`);
    if (!hasInvoice) throw new Error(`${c.name} missing selectable "Invoice"`);
  }
}

main();

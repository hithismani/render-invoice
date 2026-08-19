/**
 * Satori render pipeline for Cloudflare Workers (free tier).
 *
 *   invoice JSON
 *     -> satori (embedFont:false)  -> SVG with real <text> + path geometry
 *     -> satoriSvgToPdf            -> vector PDF (selectable text, borders, radius)
 *
 *   format=png still uses resvg for images only — never embedded into PDF.
 *
 * For Chromium print-view PDFs use ?engine=browser (Workers Paid).
 */

import satori, { init as initSatoriWasm } from 'satori/standalone';
import { Resvg, initWasm as initResvgWasm } from '@resvg/resvg-wasm';
import RESVG_WASM_MODULE from '../wasm/resvg.wasm';
import SATORI_WASM_MODULE from '../wasm/yoga.wasm';
import { invoiceElement } from '../../web/components/SatoriInvoiceTemplate.js';
import type { Invoice } from '../../web/schema/invoiceSchema.js';
import type { InvoiceLike } from './types.js';
import { compressToEncodedURIComponent } from './lz.js';
import { loadInvoiceFont } from '../../web/lib/invoiceFonts.js';
import { satoriSvgToPdf } from '../../web/lib/satoriSvgToPdf.js';

let resvgReady = false;
let satoriReady = false;

const isAlreadyInitialized = (e: unknown) => /already initialized/i.test(e instanceof Error ? e.message : String(e));

async function ensureResvg(): Promise<void> {
  if (resvgReady) return;
  try { await initResvgWasm(RESVG_WASM_MODULE); }
  catch (e) { if (!isAlreadyInitialized(e)) throw e; }
  resvgReady = true;
}

async function ensureSatori(): Promise<void> {
  if (satoriReady) return;
  try { await initSatoriWasm(SATORI_WASM_MODULE); }
  catch (e) { if (!isAlreadyInitialized(e)) throw e; }
  satoriReady = true;
}

export async function renderSvg(invoice: InvoiceLike, width = 900, embedFont = true): Promise<string> {
  await ensureSatori();
  const { family, regular, bold } = await loadInvoiceFont(invoice.font);
  const tree = invoiceElement(invoice as Invoice, { forExport: true });
  return satori(tree, {
    width,
    embedFont,
    fonts: [
      { name: family, data: regular, weight: 400, style: 'normal' },
      { name: family, data: bold, weight: 700, style: 'normal' },
    ],
  });
}

export async function renderPng(invoice: InvoiceLike, width = 900): Promise<Uint8Array> {
  const svg = await renderSvg(invoice, width, true);
  await ensureResvg();
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width * 2 } });
  return resvg.render().asPng();
}

/** Vector PDF: selectable text, path borders/radius. Never a full-page PNG. */
export async function renderPdf(invoice: InvoiceLike, width = 900): Promise<Uint8Array> {
  const fitToA4 = invoice.autoSize === false;
  const svg = await renderSvg(invoice, width, false);
  const { regular, bold } = await loadInvoiceFont(invoice.font);
  const editUrl =
    invoice.includeEditLink === false
      ? undefined
      : `https://renderinvoice.com/playground#i=${compressToEncodedURIComponent(JSON.stringify(invoice))}`;
  return satoriSvgToPdf(svg, { regular, bold }, { fitToA4, editUrl });
}

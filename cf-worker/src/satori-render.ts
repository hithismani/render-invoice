/**
 * Satori render pipeline for Cloudflare Workers.
 *
 *   invoice JSON
 *     -> satori (pure JS)      -> SVG
 *     -> @resvg/resvg-wasm     -> PNG bytes
 *     -> pdf-lib               -> single-page raster PDF (PNG embedded)
 *
 * Speed: ~50–200ms per invoice on Workers, versus 500–2000ms for Browser Rendering.
 * Cost: just Worker CPU time (fractions of a cent) versus $0.09 per browser session.
 *
 * Output formats: SVG, PNG, and **raster PDF** (a single-page PDF whose page
 * is a PNG of the SVG). Text is NOT selectable in the PDF — the rendering is
 * rasterized at resvg time. That's a real trade-off but a sensible one for
 * batch/archive/email use cases where:
 *   - You need a PDF MIME type (compliance archives, email attachments)
 *   - You don't need text selection or copy/paste
 *   - You care about speed and per-invoice cost
 *
 * For customer-facing PDFs that need selectable text and pixel-perfect
 * fidelity to the live preview, use `?engine=browser` instead.
 */

// Use satori's `/standalone` entry — its main entry auto-fetches yoga.wasm
// at runtime, which Cloudflare's runtime rejects ("Wasm code generation
// disallowed by embedder"). The /standalone entry exports an `init()` that
// accepts a pre-compiled WebAssembly.Module, which Workers do allow.
// (Older satori versions exposed this as `/wasm` — 0.26 renamed it.)
// Same pattern for resvg: bound .wasm module → initWasm.
import satori, { init as initSatoriWasm } from 'satori/standalone';
import { Resvg, initWasm as initResvgWasm } from '@resvg/resvg-wasm';
// Static WASM imports — wrangler's `[[rules]] type = "CompiledWasm"` turns
// these into `WebAssembly.Module` bindings at build time. The .wasm files
// are copied from node_modules into cf-worker/wasm/ by the `postinstall`
// script (./scripts/copy-wasm.mjs) so the import paths are stable across
// pnpm hoisting reshuffles. Type comes from src/types-shim.d.ts.
import RESVG_WASM_MODULE from '../wasm/resvg.wasm';
import SATORI_WASM_MODULE from '../wasm/yoga.wasm';
import { PDFDocument, PDFString } from 'pdf-lib';
// Single source of truth: the v1 playground template. Keeping a parallel
// worker-local template here used to drift silently — features that shipped
// on the website (Bold variant, Field paragraph flow, Markdown, dynamic
// section headers, logo, signature, autoSize, forExport, …) wouldn't appear
// in worker output. By reusing v1's template we get 1:1 parity for free.
import { invoiceElement } from '../../web/components/SatoriInvoiceTemplate.js';
import type { Invoice } from '../../web/schema/invoiceSchema.js';
import type { InvoiceLike } from './types.js';
import { compressToEncodedURIComponent } from './lz.js';
import { loadInvoiceFont } from '../../web/lib/invoiceFonts.js';

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

// A4 portrait in PDF points (72 dpi). 8.27" × 11.69".
const A4_W_PT = 595;
const A4_H_PT = 842;

export async function renderSvg(invoice: InvoiceLike, width = 900): Promise<string> {
  await ensureSatori();
  const { family, regular, bold } = await loadInvoiceFont(invoice.font);
  const tree = invoiceElement(invoice as Invoice, { forExport: true });
  return satori(tree, {
    width,
    fonts: [
      { name: family, data: regular, weight: 400, style: 'normal' },
      { name: family, data: bold, weight: 700, style: 'normal' },
    ],
  });
}

export async function renderPng(invoice: InvoiceLike, width = 900): Promise<Uint8Array> {
  const svg = await renderSvg(invoice, width);
  await ensureResvg();
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width * 2 } });
  return resvg.render().asPng();
}

export async function renderPdf(invoice: InvoiceLike, width = 900): Promise<Uint8Array> {
  // Honor invoice.autoSize identically to the v1 browser pipeline (see
  // web/lib/satoriRender.ts:renderPdf). Default true → page sized to content;
  // false → uniform shrink-to-fit into a single A4 page.
  const fitToA4 = invoice.autoSize === false;
  const png = await renderPng(invoice, width);
  const pdf = await PDFDocument.create();
  const image = await pdf.embedPng(png);
  const naturalW = image.width / 2;
  const naturalH = image.height / 2;
  if (fitToA4) {
    const scale = Math.min(A4_W_PT / naturalW, A4_H_PT / naturalH);
    const drawW = naturalW * scale;
    const drawH = naturalH * scale;
    const page = pdf.addPage([A4_W_PT, A4_H_PT]);
    page.drawImage(image, { x: (A4_W_PT - drawW) / 2, y: A4_H_PT - drawH, width: drawW, height: drawH });
    stampEditLink(pdf, invoice, { x: (A4_W_PT - drawW) / 2, y: A4_H_PT - drawH, w: drawW, h: 16 * scale });
  } else {
    const page = pdf.addPage([naturalW, naturalH]);
    page.drawImage(image, { x: 0, y: 0, width: naturalW, height: naturalH });
    stampEditLink(pdf, invoice, { x: 0, y: 0, w: naturalW, h: 16 });
  }
  return pdf.save();
}

function editUrl(invoice: InvoiceLike): string {
  return `https://renderinvoice.com/playground#i=${compressToEncodedURIComponent(JSON.stringify(invoice))}`;
}

function stampEditLink(
  pdf: PDFDocument,
  invoice: InvoiceLike,
  rect: { x: number; y: number; w: number; h: number },
): void {
  if (invoice.includeEditLink === false) return;
  pdf.getPages()[0].node.addAnnot(
    pdf.context.register(
      pdf.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [rect.x, rect.y, rect.x + rect.w, rect.y + rect.h],
        Border: [0, 0, 0],
        A: { Type: 'Action', S: 'URI', URI: PDFString.of(editUrl(invoice)) },
      }),
    ),
  );
}

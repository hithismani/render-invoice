/**
 * Client-side Satori render pipeline.
 */

import satori, { init as initSatoriWasm } from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { PDFDocument, PDFString } from 'pdf-lib';
import type { Invoice } from '@/schema/invoiceSchema';
import { invoiceElement } from '@/components/SatoriInvoiceTemplate';
import { shareUrl } from '@/lib/share';
import { loadInvoiceFont } from '@/lib/invoiceFonts';

// Use the full Inter TTFs we already bundle for jsPDF (in /public/fonts/),
// not fontsource's `inter-latin-*.woff` subsets. The Latin-only subsets are
// missing General Punctuation glyphs (•, —, →, etc.) that show up in the
// Markdown component's bullet lists and free-text fields. When Satori hits
// a glyph not in any provided font, it falls back to a built-in serif and
// outlines that glyph as a `<path>` — that's why the rendered SVG had Times-
// shaped path blobs scattered through it.
//
// Loading the full TTFs (one network fetch, browser-cached) gives Satori the
// complete Latin + Latin-Ext + General-Punctuation + Symbols coverage Inter
// actually ships, so every character renders as `<text>` in Inter.
const RESVG_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm';
const SATORI_WASM_URL =
  'https://cdn.jsdelivr.net/npm/satori@0.26.0/yoga.wasm';

let resvgReady = false;
let satoriWasmReady = false;
let initPromise: Promise<void> | null = null;

function isAlreadyInitialized(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /already initialized/i.test(msg);
}

async function ensureResvg(): Promise<void> {
  if (resvgReady) return;
  const res = await fetch(RESVG_WASM_URL);
  if (!res.ok) throw new Error(`resvg wasm fetch failed: ${res.status}`);
  try {
    await initWasm(res);
  } catch (e) {
    if (!isAlreadyInitialized(e)) throw e;
  }
  resvgReady = true;
}

async function ensureSatoriWasm(): Promise<void> {
  if (satoriWasmReady) return;
  const res = await fetch(SATORI_WASM_URL);
  if (!res.ok) throw new Error(`satori wasm fetch failed: ${res.status}`);
  try {
    await initSatoriWasm(res);
  } catch (e) {
    if (!isAlreadyInitialized(e)) throw e;
  }
  satoriWasmReady = true;
}

export async function initSatori(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = ensureSatoriWasm();
  return initPromise;
}

export interface RenderOpts {
  /** True for export targets (PDF/SVG/PNG download). Drops preview-only
   *  flourishes from the template. */
  forExport?: boolean;
  /** When false, Satori emits real `<text>` elements (font-family/size on the
   *  element) instead of converting glyphs to `<path>`. Required for the
   *  selectable-text vector PDF route. Defaults to true. */
  embedFont?: boolean;
}

export async function renderSvg(invoice: Invoice, width = 900, opts: RenderOpts = {}): Promise<string> {
  await initSatori();
  const { family, regular, bold } = await loadInvoiceFont(invoice.font);
  return satori(invoiceElement(invoice, { forExport: opts.forExport }), {
    width,
    embedFont: opts.embedFont ?? true,
    fonts: [
      { name: family, data: regular, weight: 400, style: 'normal' },
      { name: family, data: bold, weight: 700, style: 'normal' },
    ],
  });
}

export async function renderPng(invoice: Invoice, width = 900): Promise<Uint8Array> {
  const svg = await renderSvg(invoice, width, { forExport: true });
  await ensureResvg();
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width * 2 } });
  return resvg.render().asPng();
}

/* ─── Vector / selectable-text PDF ───────────────────────────────────────
 *
 * Pipeline:
 *   1. Render Satori with embedFont:false → SVG containing real `<text>`
 *      elements (font-family="inter" font-size="..." font-weight="...").
 *   2. Parse the SVG string into a live SVGElement via DOMParser, attached
 *      off-screen so svg2pdf can read computed layout.
 *   3. Reuse the same Inter TTFs Satori already loaded (from /public/fonts/) —
 *      one fetch, one cache, both pipelines.
 *   4. Register both weights with jsPDF via addFileToVFS + addFont so
 *      svg2pdf's findFirstAvailableFontFamily picks Inter (not Helvetica).
 *      Crucially, the bold variant is registered with style='bold' (not
 *      'normal' with weight=700) so svg2pdf's lookup actually finds it.
 *   5. Call pdf.svg(svgEl) — svg2pdf walks the SVG and emits Tj operators
 *      for each <text>, producing real selectable PDF text.
 *
 * Result: PDF with vector-perfect Inter text, copyable / selectable.
 */
function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  // Chunked to avoid call-stack overflow on large arrays (Inter TTF ~410 KB).
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK) as unknown as number[]);
  }
  return btoa(binary);
}

export async function renderVectorPdf(invoice: Invoice, width = 900): Promise<Uint8Array> {
  const svgString = await renderSvg(invoice, width, { forExport: true, embedFont: false });

  // svg2pdf needs a real DOM SVGElement (not a string) so it can read computed
  // layout. Attach off-screen, then clean up on exit.
  const parser = new DOMParser();
  const parsed = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = parsed.documentElement as unknown as SVGSVGElement;

  const widthAttr = parseFloat(svgEl.getAttribute('width') || String(width));
  const heightAttr = parseFloat(svgEl.getAttribute('height') || '1200');

  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;';
  host.appendChild(svgEl);
  document.body.appendChild(host);

  try {
    const [{ jsPDF }, , { family, regular, bold }] = await Promise.all([
      import('jspdf'),
      import('svg2pdf.js'),
      loadInvoiceFont(invoice.font),
    ]);

    const pdf = new jsPDF({
      unit: 'pt',
      format: [widthAttr, heightAttr],
      orientation: widthAttr > heightAttr ? 'landscape' : 'portrait',
    });

    // Register Inter at every weight svg2pdf might ask for. The CRITICAL
    // detail: jsPDF's `addFont(file, name, style, weight)` does NOT use the
    // `style` argument verbatim — it calls combineFontStyleAndFontWeight on
    // (style, weight) and stores under the *combined* key. So we always
    // pass the BASE style ('normal' or 'italic') plus the numeric weight
    // and let jsPDF produce the canonical key:
    //
    //    addFont(.., 'inter', 'normal', 400)  → key 'normal'
    //    addFont(.., 'inter', 'normal', 700)  → key 'bold'
    //    addFont(.., 'inter', 'italic', 400)  → key 'italic'
    //    addFont(.., 'inter', 'italic', 700)  → key 'bolditalic'
    //    addFont(.., 'inter', 'normal', 500)  → key '500normal'
    //    addFont(.., 'inter', 'italic', 600)  → key '600italic'  …etc.
    //
    // (My earlier attempt passed style='600normal' AND weight=600 — jsPDF
    // combined those to '600' + '600normal' = '600600normal'. The console
    // warning still showed `'600normal'` because that's what svg2pdf was
    // looking for; ours was registered under a doubled-up key, so it
    // missed and fell back to Times.)
    //
    // Italic uses Regular (no synthetic slant) — bundling Inter-Italic.ttf
    // is a follow-up if real italic in the PDF matters.
    const tag = family.replace(/\s+/g, '');
    const key = family.toLowerCase();
    pdf.addFileToVFS(`${tag}-Regular.ttf`, arrayBufferToBase64(regular));
    pdf.addFileToVFS(`${tag}-Bold.ttf`, arrayBufferToBase64(bold));

    for (const w of [100, 200, 300, 400, 500, 600, 700, 800, 900]) {
      const ttf = w >= 500 ? `${tag}-Bold.ttf` : `${tag}-Regular.ttf`;
      pdf.addFont(ttf, key, 'normal', w);
      pdf.addFont(ttf, key, 'italic', w);
    }

    await pdf.svg(svgEl, { width: widthAttr, height: heightAttr });
    if (invoice.includeEditLink !== false) {
      pdf.link(0, heightAttr - 16, widthAttr, 16, { url: shareUrl(invoice) });
    }
    return new Uint8Array(pdf.output('arraybuffer'));
  } finally {
    host.remove();
  }
}

// A4 portrait in PDF points (1pt = 1/72 inch). 8.27" × 11.69".
const A4_W_PT = 595;
const A4_H_PT = 842;

/**
 * Render the invoice to a single-page raster PDF.
 *
 * Two modes, controlled by `invoice.autoSize` (default true):
 *
 * - **autoSize: true** — page is sized to the rendered content height.
 *   No scaling, no clipping, no whitespace. The browser's PDF viewer will
 *   fit the page to the window. Best for invoices that don't need to fit
 *   a physical sheet.
 *
 * - **autoSize: false** — content is rendered at A4 width (595pt) and the
 *   page is locked to A4. If content fits within A4 height, it sits at the
 *   top of the page with whitespace below. If it overflows, it's scaled
 *   uniformly to fit (never enlarged). This is the "shrink everything to
 *   one page" mode users want when printing or sending PDFs that must fit
 *   a standard sheet.
 *
 * The 2x scaling factor below comes from `renderPng` invoking resvg with
 * `fitTo: { mode: 'width', value: width * 2 }` — i.e. the rasterized image
 * is at 2x density relative to the natural pt dimensions.
 */
export async function renderPdf(invoice: Invoice, width = 900): Promise<Uint8Array> {
  const fitToA4 = invoice.autoSize === false;
  // For both modes we render at the same visual default width (900pt).
  // Rendering at 595pt directly would force narrower columns / more text
  // wrapping, then leave side whitespace after height-driven uniform
  // scaling — visually worse than rendering wide and scaling down.
  const png = await renderPng(invoice, width);

  const pdf = await PDFDocument.create();
  const image = await pdf.embedPng(png);
  const naturalW = image.width / 2;
  const naturalH = image.height / 2;

  if (fitToA4) {
    // Uniform shrink-to-fit. Width-scale (A4_W / 900 = 0.661) is the
    // limiter for typical invoices; height-scale only kicks in for very
    // tall content. Result: A4 width is filled, content sits at top.
    const scale = Math.min(A4_W_PT / naturalW, A4_H_PT / naturalH);
    const drawW = naturalW * scale;
    const drawH = naturalH * scale;
    const page = pdf.addPage([A4_W_PT, A4_H_PT]);
    page.drawImage(image, {
      x: (A4_W_PT - drawW) / 2,
      y: A4_H_PT - drawH,
      width: drawW,
      height: drawH,
    });
    stampEditLink(pdf, invoice, { x: (A4_W_PT - drawW) / 2, y: A4_H_PT - drawH, w: drawW, h: 16 * scale });
  } else {
    const page = pdf.addPage([naturalW, naturalH]);
    page.drawImage(image, { x: 0, y: 0, width: naturalW, height: naturalH });
    stampEditLink(pdf, invoice, { x: 0, y: 0, w: naturalW, h: 16 });
  }

  return pdf.save();
}

function stampEditLink(
  pdf: PDFDocument,
  invoice: Invoice,
  rect: { x: number; y: number; w: number; h: number },
): void {
  if (invoice.includeEditLink === false) return;
  const page = pdf.getPages()[0];
  page.node.addAnnot(
    pdf.context.register(
      pdf.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [rect.x, rect.y, rect.x + rect.w, rect.y + rect.h],
        Border: [0, 0, 0],
        A: { Type: 'Action', S: 'URI', URI: PDFString.of(shareUrl(invoice)) },
      }),
    ),
  );
}

export function downloadPdfBytes(bytes: Uint8Array, filename = 'invoice.pdf'): void {
  const blob = new Blob([bytes as unknown as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadSvg(svg: string, filename = 'invoice.svg'): void {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

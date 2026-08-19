/**
 * RenderInvoice self-hostable render Worker.
 *
 * Endpoints:
 *   POST /v1/render?engine=satori&format=png|pdf   (default: pdf)
 *   POST /v1/render?engine=browser                  (always pdf — vector + selectable text)
 *
 * The API returns either an image (PNG) or a document (PDF). SVG isn't
 * exposed: it's an intermediate format that callers rarely consume directly,
 * and dropping it keeps the surface to two clear "what do I do with this
 * bytes" outcomes.
 *
 * Two render engines, each with its sweet spot:
 *
 *   Satori (default, free) — same template as the playground.
 *            format=pdf → vector PDF (selectable text, path borders/radius, edit link).
 *            format=png → raster image only (never stuffed into a PDF).
 *
 *   Browser Rendering (paid) — headless Chromium prints /print-view.
 *
 * Optional auth: verify a bearer JWT signed with API_KEY_SECRET.
 */

import puppeteer from '@cloudflare/puppeteer';
import { compressToEncodedURIComponent } from './lz.js';
import { renderPdf, renderPng } from './satori-render.js';
import type { InvoiceLike } from './types.js';

export interface Env {
  BROWSER?: Fetcher;
  RENDERINVOICE_PRINT_URL: string;
  API_KEY_SECRET?: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === 'GET' && url.pathname === '/') {
      return json({
        name: 'renderinvoice',
        endpoints: [
          'POST /v1/render?engine=satori&format=pdf|png  (pdf = vector + selectable text)',
          'POST /v1/render?engine=browser                (Chromium print-view, Workers Paid)',
        ],
        docs: 'https://renderinvoice.com/developers',
      });
    }

    if (req.method !== 'POST' || url.pathname !== '/v1/render') {
      return json({ error: 'Not found' }, 404);
    }

    // Optional bearer-token auth.
    if (env.API_KEY_SECRET) {
      const auth = req.headers.get('authorization') || '';
      if (!auth.startsWith('Bearer ')) return json({ error: 'Missing bearer token' }, 401);
      const ok = await verifyJwt(auth.slice(7), env.API_KEY_SECRET);
      if (!ok) return json({ error: 'Invalid token' }, 401);
    }

    let body: unknown;
    try { body = await req.json(); }
    catch { return json({ error: 'Body must be JSON' }, 400); }
    const invoice = unwrapInvoice(body);
    if (!invoice) {
      return json({ error: 'Send { "invoice": {…} } or a bare invoice object' }, 400);
    }

    const engine = (url.searchParams.get('engine') || 'satori').toLowerCase();
    const format = (url.searchParams.get('format') || 'pdf').toLowerCase();

    try {
      if (engine === 'satori') {
        return await renderWithSatori(invoice, format);
      }
      if (engine === 'browser') {
        if (!env.BROWSER) {
          return json({ error: 'engine=browser needs the Browser Rendering binding (Workers Paid). Default Satori PDF is already vector.' }, 400);
        }
        return await renderWithBrowser(invoice, env);
      }
      return json({ error: `Unknown engine "${engine}" — use satori or browser` }, 400);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : String(e) }, 500);
    }
  },
} satisfies ExportedHandler<Env>;

async function renderWithSatori(invoice: InvoiceLike, format: string): Promise<Response> {
  if (format === 'png') {
    const png = await renderPng(invoice);
    return new Response(png as BodyInit, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store', 'X-Render-Engine': 'satori' } });
  }
  if (format === 'pdf' || !format) {
    const pdf = await renderPdf(invoice);
    return new Response(pdf as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="invoice.pdf"',
        'Cache-Control': 'no-store',
        'X-Render-Engine': 'satori',
        'X-Pdf-Type': 'vector',
      },
    });
  }
  return json({ error: `Unknown format "${format}" — engine=satori supports format=png or format=pdf.` }, 400);
}

async function renderWithBrowser(invoice: InvoiceLike, env: Env & { BROWSER: Fetcher }): Promise<Response> {
  const hash = compressToEncodedURIComponent(JSON.stringify(invoice));
  const target = `${env.RENDERINVOICE_PRINT_URL}#i=${hash}`;

  const browser = await puppeteer.launch(env.BROWSER);
  try {
    const page = await browser.newPage();
    await page.goto(target, { waitUntil: 'networkidle0' });
    const dims = await page.evaluate(() => {
      const root = document.getElementById('invoice-content');
      if (!root) return null;
      const r = root.getBoundingClientRect();
      return { w: Math.ceil(r.width), h: Math.ceil(r.height), autoSize: (root as HTMLElement).dataset.autosize !== '0' };
    });
    const pdf = dims?.autoSize
      ? await page.pdf({ width: `${dims.w}px`, height: `${dims.h}px`, margin: { top: 0, bottom: 0, left: 0, right: 0 }, printBackground: true })
      : await page.pdf({ format: 'A4', margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' }, printBackground: true });
    return new Response(pdf as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="invoice.pdf"',
        'Cache-Control': 'no-store',
        'X-Render-Engine': 'browser',
      },
    });
  } finally {
    await browser.close();
  }
}

function unwrapInvoice(body: unknown): InvoiceLike | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const rec = body as Record<string, unknown>;
  const inner = rec.invoice;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) return inner as InvoiceLike;
  if ('columns' in rec || 'invoiceFrom' in rec || 'lineItems' in rec) return rec as InvoiceLike;
  return null;
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

/** Minimal HS256 JWT verification. Payload shape: { sub, exp }. */
async function verifyJwt(token: string, secret: string): Promise<boolean> {
  try {
    const [h, p, s] = token.split('.');
    if (!h || !p || !s) return false;
    const data = `${h}.${p}`;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sig = Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
    const ok = await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(data));
    if (!ok) return false;
    const payload = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && Date.now() / 1000 > payload.exp) return false;
    return true;
  } catch { return false; }
}

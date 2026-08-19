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
 *   Browser Rendering (optional) — headless Chromium prints local Satori SVG.
 *
 * Auth: Authorization: Bearer <API_KEY_SECRET> (required). Optional ALLOWED_IPS.
 */

import puppeteer from '@cloudflare/puppeteer';
import { renderPdf, renderPng, renderSvg } from './satori-render.js';
import type { InvoiceLike } from './types.js';

export interface Env {
  BROWSER?: Fetcher;
  API_KEY_SECRET?: string;
  ALLOWED_IPS?: string;
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

    if (!env.API_KEY_SECRET) return json({ error: 'Worker is not configured: API_KEY_SECRET is required' }, 500);
    const allowedIps = (env.ALLOWED_IPS || '').split(',').map((ip) => ip.trim()).filter(Boolean);
    const clientIp = req.headers.get('CF-Connecting-IP') || '';
    if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) return json({ error: 'IP not allowed' }, 403);
    const auth = req.headers.get('authorization') || '';
    if (auth !== `Bearer ${env.API_KEY_SECRET}`) return json({ error: 'Unauthorized' }, 401);

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
        return await renderWithBrowser(invoice, env as Env & { BROWSER: Fetcher });
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
  const svg = await renderSvg(invoice, 900, false);

  const browser = await puppeteer.launch(env.BROWSER);
  try {
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;padding:0;background:#fff}svg{display:block}</style></head><body>${svg}</body></html>`, { waitUntil: 'networkidle0' });
    const dims = await page.evaluate(() => {
      const root = document.querySelector('svg');
      if (!root) return null;
      const r = root.getBoundingClientRect();
      return { w: Math.ceil(r.width), h: Math.ceil(r.height), autoSize: true };
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

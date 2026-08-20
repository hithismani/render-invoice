/**
 * RenderInvoice self-hostable render Worker.
 *
 *   POST /v1/render?format=pdf|png   (default: pdf)
 *
 * Same template as the playground. PDF has selectable text. PNG is an image.
 * Free Workers plan. No Chromium.
 *
 * Auth: Authorization: Bearer <API_KEY_SECRET> (required). Optional ALLOWED_IPS.
 */

import { renderPdf, renderPng } from './satori-render.js';
import type { InvoiceLike } from './types.js';

export interface Env {
  API_KEY_SECRET?: string;
  ALLOWED_IPS?: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === 'GET' && url.pathname === '/') {
      return json({
        name: 'renderinvoice',
        endpoints: ['POST /v1/render?format=pdf|png'],
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
    if (engine !== 'satori') {
      return json({ error: `Unknown engine "${engine}" — use satori (default)` }, 400);
    }

    const format = (url.searchParams.get('format') || 'pdf').toLowerCase();
    try {
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
      return json({ error: `Unknown format "${format}" — use format=png or format=pdf.` }, 400);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : String(e) }, 500);
    }
  },
} satisfies ExportedHandler<Env>;

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

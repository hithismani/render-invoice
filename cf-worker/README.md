# invoicely-render: self-hostable Cloudflare Worker

Accepts Invoicely invoice JSON and returns either a **PNG** (image) or a
**PDF** (document). Two render engines, chosen per request based on your
output requirements.

## Engines

| Engine | Speed | Cost per 1000 | Output | When to use |
| --- | --- | --- | --- | --- |
| **`satori` (default)** | 50 to 200 ms | ~$0.15 | PNG **or** raster PDF | Batch jobs, email attachments, thumbnails, or automated processing |
| **`browser`** | 500 to 2000 ms | ~$90 | Vector PDF, selectable text | Customer-facing PDFs where text selection, copy-paste, and search indexing matter |

The Satori PDF is **raster** (a PNG wrapped in a PDF page), meaning text is not
selectable. This is suitable for automated pipelines or delivery archives.
For interactive documents, use Browser Rendering for a true vector PDF with
selectable text matching the live preview.

The render template is **shared with the playground at
[invoicely.app/playground](https://invoicely.app/playground)**: `cf-worker`
imports `web/components/SatoriInvoiceTemplate.tsx` directly, so rendering
behavior matches the web UI across layouts, custom fields, and RTL text.

## Deploy

One-click (Satori only, free tier):

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hithismani/astro-apiinvoicegenerator/tree/v1)

```bash
cd cf-worker
pnpm install
npx wrangler login
npx wrangler deploy
```

- **Workers Paid plan** is required only if you use `?engine=browser`
  (Cloudflare Browser Rendering needs it).
- Satori runs on the free plan subject to standard Workers CPU limits.

## Use it

### Default: fast raster PDF (Satori)

`invoice.json` may be `{ "invoice": {…} }` or a bare invoice object.

```bash
curl -X POST https://your-worker.workers.dev/v1/render \
  -H 'Content-Type: application/json' \
  --data-binary @invoice.json \
  --output invoice.pdf
```

### PNG (Satori)

```bash
curl -X POST "https://your-worker.workers.dev/v1/render?format=png" \
  -H 'Content-Type: application/json' \
  --data-binary @invoice.json \
  --output invoice.png
```

### Vector PDF with selectable text (Browser Rendering)

```bash
curl -X POST "https://your-worker.workers.dev/v1/render?engine=browser" \
  -H 'Content-Type: application/json' \
  --data-binary @invoice.json \
  --output invoice.pdf
```

## How each engine works

### Satori (`engine=satori`)

1. The Worker calls the `invoiceElement(...)` factory used by the playground
   (`web/components/SatoriInvoiceTemplate.tsx`) to avoid template divergence.
2. Satori produces an SVG.
3. `@resvg/resvg-wasm` rasterizes the SVG to a PNG at 2x DPI.
4. For PDF output, `pdf-lib` wraps the PNG in a single-page PDF sized to the image.
   Respects `invoice.autoSize`: `false` fits one A4 page, while
   `true` (default) sizes the page to content.

Everything runs inside the Worker process without a headless browser. WASM modules
(`yoga.wasm` for Satori's flexbox and `resvg.wasm` for rasterization) are
imported as **CompiledWasm bindings** via wrangler's `[[rules]]`. They are copied
into `cf-worker/wasm/` by `scripts/copy-wasm.mjs` during postinstall so import paths
remain stable. Inter fonts (Regular and Bold) are fetched once per Worker instance
and cached in module scope.

The PDF response sets `X-Pdf-Type: raster` to indicate raster output.

`includeEditLink` (default true) stamps a URI annotation on the footer rule
pointing at `https://invoicely.app/playground#i=…`. Set `false` to omit.

### Browser Rendering (`engine=browser`)

1. Worker launches headless Chromium via the `BROWSER` binding.
2. Navigates to `INVOICELY_PRINT_URL#i=<lz-compressed-invoice-json>`.
3. Calls `page.pdf()` to produce a vector PDF with selectable text.

## Auth (optional)

Turn on bearer-token checking by setting a secret:

```bash
npx wrangler secret put API_KEY_SECRET
```

With the secret set, every request requires an `Authorization: Bearer <jwt>` header
signed with HS256 using that secret.

## Satori vs v1 template parity

The Satori template is an alternative renderer to the Tailwind version in
`web/components/Invoice.tsx`. It provides the same structure using Satori's CSS
subset (flex and inline styles).

Visual output is very close. For exact visual parity with the interactive web view,
use `engine=browser`.

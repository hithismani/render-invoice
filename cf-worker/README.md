# renderinvoice: self-hostable Cloudflare Worker

Accepts RenderInvoice invoice JSON and returns either a **PNG** (image) or a
**PDF** (document). Two render engines, chosen per request based on your
output requirements.

## Engines

| Engine | Speed | Cost per 1000 | Output | When to use |
| --- | --- | --- | --- | --- |
| **`satori` (default)** | 50 to 200 ms | ~$0.15 | Vector PDF (selectable text) or PNG | Default. Same template as the playground. |
| **`browser`** | 500 to 2000 ms | ~$90 | Vector PDF via Chromium | Optional headless print of `/print-view` (Browser Rendering). |

The render template is **shared with the playground at
[renderinvoice.com/playground](https://renderinvoice.com/playground)**: `cf-worker`
imports `web/components/SatoriInvoiceTemplate.tsx` directly, so rendering
behavior matches the web UI across layouts, custom fields, and RTL text.

## Deploy

Repo-root one-click is the free Satori vector PDF worker. This folder adds the optional Browser Rendering binding for Chromium print-view.

[![Deploy browser worker](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hithismani/render-invoice/tree/main/cf-worker)

```bash
cd cf-worker
pnpm install
npx wrangler login
npx wrangler deploy
```

- `?engine=satori` (default) is a vector PDF with selectable text on the free plan.
- `?format=png` returns an image only.
- Browser Rendering (`[browser]` binding) is optional for `?engine=browser`.

## Use it

### Default: vector PDF (Satori)

`invoice.json` may be `{ "invoice": {…} }` or a bare invoice object.

```bash
curl -X POST https://your-worker.workers.dev/v1/render \
  -H "Authorization: Bearer $API_KEY_SECRET" \
  -H 'Content-Type: application/json' \
  --data-binary @invoice.json \
  --output invoice.pdf
```

### PNG (Satori)

```bash
curl -X POST "https://your-worker.workers.dev/v1/render?format=png" \
  -H "Authorization: Bearer $API_KEY_SECRET" \
  -H 'Content-Type: application/json' \
  --data-binary @invoice.json \
  --output invoice.png
```

### Vector PDF with selectable text (Browser Rendering)

```bash
curl -X POST "https://your-worker.workers.dev/v1/render?engine=browser" \
  -H "Authorization: Bearer $API_KEY_SECRET" \
  -H 'Content-Type: application/json' \
  --data-binary @invoice.json \
  --output invoice.pdf
```

## How each engine works

### Satori (`engine=satori`)

1. Same `invoiceElement(...)` template as the playground.
2. **PDF:** Satori with `embedFont: false` → SVG with real `<text>` + path geometry →
   `satoriSvgToPdf` (pdf-lib). Selectable text, path borders/radius, edit-link annotation.
   Never embeds a full-page PNG.
3. **PNG only:** Satori + resvg at 2x DPI (image response, not used inside PDF).
4. `autoSize: false` shrinks the vector page onto one A4; default sizes the page to content.

Runs entirely in the Worker (no Browser Rendering). WASM (`yoga.wasm`, and `resvg.wasm` for PNG)
via wrangler `CompiledWasm` rules.

The PDF response sets `X-Pdf-Type: vector` (selectable text, path geometry).

`includeEditLink` (default true) stamps a URI annotation on the footer rule
pointing at `https://renderinvoice.com/playground#i=…`. Set `false` to omit.

### Browser Rendering (`engine=browser`)

1. Worker launches headless Chromium via the `BROWSER` binding.
2. Builds the same Satori SVG locally and sets it as the page content.
3. Calls `page.pdf()` to produce a vector PDF with selectable text.

## Auth and IP allowlist

`API_KEY_SECRET` is mandatory for `/v1/render`. Set it as a Worker secret:

```bash
npx wrangler secret put API_KEY_SECRET
```

If it is missing, the Worker returns HTTP 500 and refuses to render. Every request
requires `Authorization: Bearer <API_KEY_SECRET>`. This is the same static bearer
secret used by the Render/Docker service.

Optional IP allowlist: set `ALLOWED_IPS` as a comma-separated Worker variable.
Cloudflare supplies the client address through `CF-Connecting-IP`.

```toml
[vars]
ALLOWED_IPS = "203.0.113.10,198.51.100.24"
```

## Satori vs v1 template parity

The Satori template is an alternative renderer to the Tailwind version in
`web/components/Invoice.tsx`. It provides the same structure using Satori's CSS
subset (flex and inline styles).

Visual output is very close. For exact visual parity with the interactive web view,
use `engine=browser`.

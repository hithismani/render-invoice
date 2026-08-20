# RenderInvoice

An unopinionated invoice generator. You supply the data. It renders the PDF.

Open [the playground](https://renderinvoice.com/playground), fill the form or paste JSON, download a PDF. The text is selectable. No account. Nothing is uploaded. Drafts live in IndexedDB on your machine.

[Playground](https://renderinvoice.com/playground) · [Examples](https://renderinvoice.com/examples) · [API docs](https://renderinvoice.com/developers) · [llms.txt](https://renderinvoice.com/llms.txt) · [Licenses](https://renderinvoice.com/licenses)

## What it does

- Form editor and a raw JSON editor, with a live preview
- Any columns, any number of recipients, any summary rows. Drag to reorder all of them.
- Markdown in any field: **bold** *italic* ~~strike~~ `code` [links](url), plus headings, lists, and quotes in description/footer
- Logo and signature, from a URL or an upload
- Classic or bold layout, curated typefaces, any accent color, LTR or RTL
- PDF with selectable text. Auto-fit to one page, or A4.
- Optional footer rule on the PDF that reopens that exact invoice in the editor
- Local drafts, history, and templates. Share as a URL or a QR code.
- Works offline. Installable as a PWA.

Currency, dates, and totals are whatever you type. RenderInvoice never recalculates them.

**Supported typefaces:** Inter, Source Serif 4, IBM Plex Sans, Playfair Display, Space Grotesk, DM Sans, Fraunces, Libre Baskerville, Instrument Sans, Newsreader. Unknown `font` values fall back to Inter.

## For scripts and agents

```
https://renderinvoice.com/playground#j=<encodeURIComponent(JSON.stringify(invoice))>
https://renderinvoice.com/print-view#j=<same>
```

`#j=` is plain JSON. `#i=` is lz-string compressed.

Agents: [`/llms.txt`](https://renderinvoice.com/llms.txt). For PDF **bytes**, self-host the worker:

## PDF worker (separate repo)

Public package: [hithismani/render-invoice-worker](https://github.com/hithismani/render-invoice-worker)  
Vendored here as the git submodule `workers/` (`workers/cf-worker`).

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hithismani/render-invoice-worker/tree/main/cf-worker)

```bash
git clone https://github.com/hithismani/render-invoice-worker.git
cd render-invoice-worker/cf-worker
pnpm install
npx wrangler secret put API_KEY_SECRET
npx wrangler deploy
```

```http
POST /v1/render
Authorization: Bearer <API_KEY_SECRET>
Content-Type: application/json
```

```bash
curl -X POST https://your-worker.workers.dev/v1/render \
  -H "Authorization: Bearer $API_KEY_SECRET" \
  -H 'Content-Type: application/json' \
  --data-binary @invoice.json \
  --output invoice.pdf
```

`autoSize` (default true) sizes the page to content. `autoSize: false` fits one A4.

## Repo layout

```bash
git clone --recurse-submodules https://github.com/hithismani/render-invoice.git
# or after clone:
git submodule update --init --recursive
```

- [`web/`](web/) — Next.js static site (playground, examples, print-view)
- [`workers/`](workers/) — submodule → [render-invoice-worker](https://github.com/hithismani/render-invoice-worker) (`cf-worker/` inside)

How the PDF is drawn: [licenses](https://renderinvoice.com/licenses).

## Disclaimer

Provided **as-is, without warranties or guarantees**. Verify totals and legal requirements before sending invoices.

See [Terms](https://businessaddons.com/disclaimers/terms-of-service) and [Privacy](https://businessaddons.com/disclaimers/privacy-policy). A [BusinessAddons](https://businessaddons.com) product.

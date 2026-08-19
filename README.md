# RenderInvoice

An unopinionated invoice generator. You supply the data. It renders the PDF.

Open [the playground](https://renderinvoice.com/playground), fill the form or paste JSON, download a vector PDF. No account. Nothing is uploaded. Drafts live in IndexedDB on your machine.

Most invoice tools pick your columns, compute your tax, and keep the file on their server. This one does none of that. You name the fields. You type the totals. Your accountant checks the numbers, not the software.

[Playground](https://renderinvoice.com/playground) · [Examples](https://renderinvoice.com/examples) · [Developer docs](https://renderinvoice.com/developers) · [llms.txt](https://renderinvoice.com/llms.txt)

## What it does

- Form editor and a raw JSON editor, with a live preview
- Any columns, any number of recipients, any summary rows. Drag to reorder all of them.
- Markdown in any field
- Logo and signature, from a URL or an upload
- Classic or bold layout, curated typefaces (Inter and friends), any accent color, LTR or RTL
- Vector PDF with selectable text. Auto-fit to one page, or A4.
- Optional footer rule on the PDF that reopens that exact invoice in the editor
- Local drafts, history, and templates. Share as a URL or a QR code.
- Works offline. Installable as a PWA.

Currency, dates, and totals are whatever you type. RenderInvoice never recalculates them.

## For scripts and agents

The invoice is JSON. Put it in the URL hash and the page hydrates itself. There is no hosted API on renderinvoice.com.

```
https://renderinvoice.com/playground#j=<encodeURIComponent(JSON.stringify(invoice))>
https://renderinvoice.com/print-view#j=<same>
```

`#j=` is plain JSON, so it works from curl, Apps Script, or a spreadsheet. `#i=` is the same payload compressed with lz-string.

A Google Sheets `=HYPERLINK` formula can open a finished invoice from a row. Agents can read [`/llms.txt`](https://renderinvoice.com/llms.txt) for the live schema.

If you need PDF bytes instead of a link, deploy a Worker and `POST /v1/render`.

## Deploy the render API (Cloudflare)

One invoice template (`SatoriInvoiceTemplate`) everywhere: playground, print-view, and the Worker. Two one-click deploys. Repo must stay **public**.

### Free: vector PDF

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hithismani/render-invoice/tree/main)

`POST /v1/render` → **vector** PDF (selectable text, path borders/radius, edit link). `?format=png` for image only — never stuffed into a PDF. Cloudflare free plan.

```bash
npx wrangler deploy
```

### Paid: Chromium print

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hithismani/render-invoice/tree/main/cf-worker)

Same Worker plus Browser Rendering. `?engine=browser` prints `/print-view` in headless Chromium. Workers Paid.

```bash
cd cf-worker && pnpm install && npx wrangler deploy
```

```bash
curl -X POST https://your-worker.workers.dev/v1/render \
  -H 'Content-Type: application/json' \
  --data-binary @invoice.json \
  --output invoice.pdf
```

## Repo

- [`web/`](web/) — Next.js 15 static export. Playground, examples, print view. One invoice template: `SatoriInvoiceTemplate`.
- [`cf-worker/`](cf-worker/) — render Worker. Satori vector PDF on the free plan; Browser Rendering if you deploy this folder on Workers Paid.

More: [web/README.md](web/README.md) · [cf-worker/README.md](cf-worker/README.md) · [renderinvoice.com/developers](https://renderinvoice.com/developers)

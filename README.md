# RenderInvoice

An unopinionated invoice generator. You supply the data. It renders the PDF.

Open [the playground](https://renderinvoice.com/playground), fill the form or paste JSON, download a PDF. The text is selectable. No account. Nothing is uploaded. Drafts live in IndexedDB on your machine.

Most invoice tools pick your columns, compute your tax, and keep the file on their server. This one does none of that. You name the fields. You type the totals. Your accountant checks the numbers, not the software.

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

The invoice is JSON. Put it in the URL hash and the page hydrates itself. There is no hosted render API on renderinvoice.com.

```
https://renderinvoice.com/playground#j=<encodeURIComponent(JSON.stringify(invoice))>
https://renderinvoice.com/print-view#j=<same>
```

`#j=` is plain JSON. `#i=` is the same payload compressed with lz-string.

Agents can read [`/llms.txt`](https://renderinvoice.com/llms.txt) for the live schema. For PDF **bytes**, self-host the Cloudflare Worker and `POST /v1/render`.

## API

```http
POST /v1/render
Authorization: Bearer <API_KEY_SECRET>
Content-Type: application/json
```

```json
{ "invoice": { "...": "..." } }
```

Bare invoice objects are also accepted. Response: PDF bytes (`?format=png` for an image). Missing or wrong key → `401`. IP not on allowlist → `403`. Bad body → `400`.

`API_KEY_SECRET` is **required**. Optional `ALLOWED_IPS` is a comma-separated list of caller IPs.

`autoSize` (default true) sizes the page to the invoice. `autoSize: false` scales onto one A4.

## Deploy the PDF worker

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hithismani/render-invoice/tree/main)

Uses the repo-root `wrangler.toml`. Free Cloudflare plan. Same template as the playground. Repo must stay **public** for the button.

```bash
npx wrangler secret put API_KEY_SECRET
npx wrangler deploy
```

```bash
curl -X POST https://your-worker.workers.dev/v1/render \
  -H "Authorization: Bearer $API_KEY_SECRET" \
  -H 'Content-Type: application/json' \
  --data-binary @invoice.json \
  --output invoice.pdf
```

How the PDF is drawn: [licenses](https://renderinvoice.com/licenses).

## Estimated costs

Planning estimates only, not provider quotes:

| Deployment | Estimate | Notes |
| --- | ---: | --- |
| Cloudflare Worker | $0 free plan | Subject to Cloudflare free limits |

## Repo layout

- [`web/`](web/) — Next.js static site (playground, examples, print-view)
- [`cf-worker/`](cf-worker/) — Cloudflare Worker (PDF / PNG)

More: [web/README.md](web/README.md) · [cf-worker/README.md](cf-worker/README.md) · [renderinvoice.com/developers](https://renderinvoice.com/developers)

## Disclaimer

Provided **as-is, without warranties or guarantees** of any kind, including merchantability, fitness for a particular purpose, accuracy of rendered invoices, uptime, or continued free-tier availability.

You must verify totals, tax, and legal requirements before sending invoices. Free hosting tiers may sleep, throttle, change, or end without notice. Self-hosted deployments are your responsibility for secrets, IP allowlists, security, and scaling.

See [Terms of service](https://businessaddons.com/disclaimers/terms-of-service) and [Privacy policy](https://businessaddons.com/disclaimers/privacy-policy). A [BusinessAddons](https://businessaddons.com) product.

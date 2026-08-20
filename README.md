# RenderInvoice

An unopinionated invoice generator. You supply the data. It renders the PDF.

Open [the playground](https://renderinvoice.com/playground), fill the form or paste JSON, download a PDF. The text is selectable. No account. Nothing is uploaded. Drafts live in IndexedDB on your machine.

[Playground](https://renderinvoice.com/playground) · [Examples](https://renderinvoice.com/examples) · [API docs](https://renderinvoice.com/developers) · [llms.txt](https://renderinvoice.com/llms.txt) · [Licenses](https://renderinvoice.com/licenses)

## What it does

- Form editor and a raw JSON editor, with a live preview
- Any columns, any number of recipients, any summary rows. Drag to reorder all of them.
- Markdown in every text field (see table below). Currency glyphs (₹ € £ ¥ …) via Inter fallback. PDF edit bar when `includeEditLink` is true (default).
- Logo and signature, from a URL or an upload
- Classic or bold layout, curated typefaces, any accent color, LTR or RTL
- PDF with selectable text. Auto-fit to one page, or A4.
- Optional footer rule on the PDF that reopens that exact invoice in the editor
- Local drafts, history, and templates. Share as a URL or a QR code.
- Works offline. Installable as a PWA.

Currency, dates, and totals are whatever you type. RenderInvoice never recalculates them.

### Markdown tags (every text field)

| Tag | Meaning |
| --- | --- |
| `**bold**` / `__bold__` | Bold |
| `*italic*` / `_italic_` | Italic |
| `***both***` | Bold + italic |
| `~~strike~~` | Strikethrough |
| `` `code` `` | Inline code |
| `[label](url)` | Link (clickable in PDF) |
| bare `user@host` | Autolinked mailto in PDF |
| `#` … `#######` | Headings H1–H7 (scale from field base size) |
| `{@18}` or `{@p:18}` | Absolute px size for the rest of that line |
| `{@18:span text}` | Inline run at absolute px size |
| `- item` / `* item` | Unordered list |
| `1. item` | Ordered list |
| `> quote` | Blockquote |
| `---` | Horizontal rule |
| single newline | Hard line break (kept) |

Not supported: tables, images, raw HTML, footnotes. Glyphs like `₹ € £ ¥ ₩ ₽ • — …` work as plain text.

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

- [`web/`](web/) — Next.js static site (playground, examples, print-view). **This is what Vercel/Pages deploys.**
- [`workers/`](workers/) — git submodule → [render-invoice-worker](https://github.com/hithismani/render-invoice-worker) (`cf-worker/` inside). **Dev only** — not required for the website build.

```bash
# Site only (enough for Vercel Root Directory = web)
git clone https://github.com/hithismani/render-invoice.git

# Full checkout including worker submodule (local API work)
git clone --recurse-submodules https://github.com/hithismani/render-invoice.git
# or: git submodule update --init --recursive
```

Vercel: set **Root Directory** to `web`. Do not enable “Include git submodules” — the site does not import `workers/`.

How the PDF is drawn: [licenses](https://renderinvoice.com/licenses).

## Disclaimer

Provided **as-is, without warranties or guarantees**. Verify totals and legal requirements before sending invoices.

See [Terms](https://businessaddons.com/disclaimers/terms-of-service) and [Privacy](https://businessaddons.com/disclaimers/privacy-policy). A [BusinessAddons](https://businessaddons.com) product.

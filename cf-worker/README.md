# renderinvoice: self-hostable Cloudflare Worker

Accepts invoice JSON and returns a **PDF** (selectable text) or a **PNG**.

Same template as the playground. Free Workers plan. No Chromium.

## Deploy

Repo-root one-click (recommended):

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hithismani/render-invoice/tree/main)

Or from this folder:

```bash
cd cf-worker
pnpm install
npx wrangler login
npx wrangler secret put API_KEY_SECRET
npx wrangler deploy
```

## Use it

`invoice.json` may be `{ "invoice": {…} }` or a bare invoice object.

```bash
curl -X POST https://your-worker.workers.dev/v1/render \
  -H "Authorization: Bearer $API_KEY_SECRET" \
  -H 'Content-Type: application/json' \
  --data-binary @invoice.json \
  --output invoice.pdf
```

```bash
curl -X POST "https://your-worker.workers.dev/v1/render?format=png" \
  -H "Authorization: Bearer $API_KEY_SECRET" \
  -H 'Content-Type: application/json' \
  --data-binary @invoice.json \
  --output invoice.png
```

`autoSize` (default true) sizes the page to the invoice. `autoSize: false` scales onto one A4.

## Auth

```bash
npx wrangler secret put API_KEY_SECRET
```

Every `/v1/render` request needs `Authorization: Bearer <API_KEY_SECRET>`. Missing secret → 500.

Optional IP allowlist via Worker var `ALLOWED_IPS` (Cloudflare sends the client as `CF-Connecting-IP`).

How the PDF is drawn: [renderinvoice.com/licenses](https://renderinvoice.com/licenses).

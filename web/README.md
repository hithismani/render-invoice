# RenderInvoice (v1)

A browser-based invoice generator built with Next.js 15 (App Router, static export), Tailwind CSS, and Zod. Exports vector PDFs through the browser print pipeline without an external backend.

## Run locally

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # static export → ./out
```

## Routes

| Path | Description |
| --- | --- |
| `/` | Landing page: interactive preview, features, and setup |
| `/playground` | Full editor (form and JSON tabs, live preview, PDF export) |
| `/examples` | Gallery of 6 curated invoice examples |
| `/examples/[slug]` | Individual example pages with previews |
| `/changelog` | Product updates |
| `/about` | Overview and principles |
| `/pricing` | Free tier |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/manifest.webmanifest` | SEO and PWA |

## Deploy

The app builds to `out/` as static HTML. Drop it behind any CDN:

### Vercel
```bash
vercel --prod
```
Picks up `vercel.json`. Security headers and long cache on `_next/static`.

### Cloudflare Pages
```bash
pnpm build
# Connect repo in CF dashboard, build command: pnpm build, output: out
```
Picks up `public/_headers`.

### Netlify
```bash
netlify deploy --prod --dir=out
```
Also honors `public/_headers`.

### Static S3 / GitHub Pages / any CDN
```bash
pnpm build
# Upload out/ contents to your bucket
```

## Environment variables

- `NEXT_PUBLIC_SITE_URL`: used for canonical URLs, Open Graph tags, and sitemaps. Defaults to `https://renderinvoice.com`.

## Architecture notes

- **Storage**: `localStorage` for drafts and templates (`lib/storage.ts`, `lib/draft.ts`).
- **Sharing**: compressed URL hash via `lz-string` (`lib/share.ts`), plus QR codes via `qrcode`.
- **PDFs**: iframe + `window.print()` with dynamic `@page` rules to produce vector, selectable-text PDFs with single-page auto-fit or A4 options.
- **Validation**: Zod runs in-form, with errors mapped by path to fields (`schema/invoiceSchema.ts`).
- **Reordering**: `@dnd-kit` for drag handles on columns, line items, summary rows, and key-value pairs.

## Offline support

All features work offline. Closing the browser tab without saving is the only risk of data loss, which the auto-restore draft feature helps prevent.

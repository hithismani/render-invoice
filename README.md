# RenderInvoice

Browser-only invoice generator. No hosted backend.

## One-click deploy (Cloudflare)

The app and the render API are two Workers. Each button clones the repo into your account and deploys.

[![Deploy the app](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hithismani/render-invoice/tree/main/web)

[![Deploy the render worker](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hithismani/render-invoice/tree/main)

| Button | What you get | Plan |
| --- | --- | --- |
| App | Static playground at `*.workers.dev` | Free |
| Render worker | `POST /v1/render` → PNG or raster PDF | Free |

`?engine=browser` (vector PDF) is **not** in the one-click worker — it needs Workers Paid + Browser Rendering. After deploy: `cd cf-worker && npx wrangler deploy` using `cf-worker/wrangler.toml`.

Repo must stay **public** for the buttons to work.

## Manual

```bash
# App
cd web && pnpm install && pnpm build && npx wrangler deploy

# Render worker (Satori, same as the button)
npx wrangler deploy

# Render worker (Satori + browser engine)
cd cf-worker && pnpm install && npx wrangler deploy
```

Docs: [web/README.md](web/README.md) · [cf-worker/README.md](cf-worker/README.md) · https://renderinvoice.com/developers

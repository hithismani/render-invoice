# RenderInvoice browser PDF service

This is the optional Chromium PDF service for Render. The Docker image builds
and serves the frontend itself, opens its local `/print-view` page, and returns
a selectable, vector PDF. It does not depend on `renderinvoice.com` at runtime.
It is not required for the free Satori Worker.

## Render

**Blueprint (recommended):**  
[Deploy on Render](https://dashboard.render.com/blueprint/new?repo=https://github.com/hithismani/render-invoice)

Or create a Docker Web Service from this repository. Docker context = repo root;
Dockerfile = `render-service/Dockerfile`. Root `render.yaml` defines the Blueprint.

`API_KEY_SECRET` is mandatory. The service refuses to start without it. Every
request must include `Authorization: Bearer <API_KEY_SECRET>`. Same static bearer
auth as the Cloudflare Worker.

Set `ALLOWED_IPS` to a comma-separated allowlist when callers have fixed IPs:

```text
ALLOWED_IPS=203.0.113.10,198.51.100.24
```

When `ALLOWED_IPS` is omitted, any IP may connect with the correct key.
`RENDERINVOICE_PRINT_URL` is only needed if you intentionally want the service
to print a separately deployed frontend.

## Any Docker host

```bash
docker build -f render-service/Dockerfile -t renderinvoice-browser .
docker run --rm -p 10000:10000 \
  -e API_KEY_SECRET=replace-me \
  -e ALLOWED_IPS=203.0.113.10 \
  renderinvoice-browser
```

## API

```bash
curl -X POST https://your-render-service.onrender.com/v1/render \
  -H "Authorization: Bearer $API_KEY_SECRET" \
  -H 'Content-Type: application/json' \
  --data-binary @invoice.json \
  --output invoice.pdf
```

The request accepts `{ "invoice": { ... } }` or a bare invoice object.

The request contract matches the Cloudflare Worker:

```http
POST /v1/render
Authorization: Bearer <API_KEY_SECRET>
Content-Type: application/json
```

The service returns PDF only. The Cloudflare Worker also exposes its image
response and optional Cloudflare Browser Rendering path.

## Cost planning

Render Free is $0, but the service sleeps when idle and has limited resources.
A self-hosted Docker deployment costs whatever the host costs. A small VM is
often roughly $5 to $10/month, depending on the provider and traffic. These are
planning estimates, not quotes.

## Disclaimer

Provided as-is, without warranties or guarantees (accuracy, uptime, free-tier
availability). You verify invoice content before sending. See the root README.

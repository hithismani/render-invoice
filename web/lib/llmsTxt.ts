import { dumpSchemaText } from './schemaFields';
import { MARKDOWN_HELP } from './markdownHelp';

export function generateLlmsTxt(): string {
  const schema = dumpSchemaText(undefined, 4);
  return `# RenderInvoice: AI agent integration guide

RenderInvoice is a browser-only invoice generator at https://renderinvoice.com.
There is no RenderInvoice-hosted backend. This file is generated from the
invoice schema.

## 1. Share-URL protocol (stateless, no infrastructure)

Put the full invoice JSON in the URL hash. Two encodings, two destinations.

Encodings:
  #j=<encodeURIComponent(JSON.stringify(invoice))>
      Uncompressed. Use this from Apps Script, curl, or any agent.
  #i=<lz-string compressToEncodedURIComponent>
      Shorter. Only if you can bundle lz-string.

Destinations:
  https://renderinvoice.com/playground#j=<json>
      Opens the editor with every field filled. Human reviews and downloads.
  https://renderinvoice.com/print-view#j=<json>
      Chrome-less invoice. Ready to print / Save as PDF. No nav, no playground.

Example (agent builds the object, then):

  const hash = '#j=' + encodeURIComponent(JSON.stringify(invoice));
  const edit  = 'https://renderinvoice.com/playground' + hash;
  const print = 'https://renderinvoice.com/print-view' + hash;

That is the free, zero-backend path. Do not invent a POST API on renderinvoice.com.
There is none.

PDF footer: when includeEditLink is true (default), the saved PDF draws a
visible bottom bar (edit link hit target) and stamps a full-width
link back to /playground#i=… so the same invoice can be reopened.

## 2. Self-hosted Cloudflare Worker (optional render API)

Only if you need programmatic PDF bytes. One Worker. Same template as the
playground. PDF with selectable text. Free plan.

    https://deploy.workers.cloudflare.com/?url=https://github.com/hithismani/render-invoice-worker/tree/main/cf-worker
    POST https://<your-worker>/v1/render
    POST https://<your-worker>/v1/render?format=png

  Content-Type: application/json
  { "invoice": <Invoice> }     // or a bare invoice object
  autoSize defaults true (page = content). autoSize: false fits one A4.

## 3. Invoice JSON schema

  {
${schema}
  }

## Markdown (every text field)

${MARKDOWN_HELP}

Supported tags:
  **bold**  *italic*  ***both***  ~~strike~~  \`code\`  [label](url)
  bare emails → mailto links in PDF
  # ## ### #### ##### ###### #######   headings (scale from field base size)
  {@18} line   {@p:18} line   {@18:inline span}   absolute px sizes
  - item   * item   1. item   > quote   ---
  single newline = hard break

Not supported: tables, images, raw HTML, footnotes.
Currency/punctuation as plain text: ₹ € £ ¥ ₩ ₽ • — – … → ← ·

Constraints:
- Every key used in lineItems must be present in the columns array.
- summary[].value is a string (formatted) or a number. Compute totals before creating the JSON.
- Currency, date, and number formatting is all agent-controlled. RenderInvoice
  never calculates or reformats values.
- font must be one of: Inter, Source Serif 4, IBM Plex Sans, Playfair Display,
  Space Grotesk, DM Sans, Fraunces, Libre Baskerville, Instrument Sans, Newsreader.
  Default Inter. Anything else falls back to Inter.

## 4. Browser-driving agents

Agents that drive a real browser can fill /playground. Prefer emitting a
#j= URL instead: it is faster and does not require clicking the form.

## Canonical example slugs

- freelance-consulting
- saas-subscription
- agency-retainer
- uk-vat
- us-sales-tax
- multi-shipment

Each: https://renderinvoice.com/examples/<slug>
Open in playground: https://renderinvoice.com/examples/<slug> then the page's share hash,
or build #j= yourself from the same JSON shape.
`;
}

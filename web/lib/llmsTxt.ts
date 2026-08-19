import { invoiceSchemaFields, type SchemaField } from './schemaFields';

function dumpFields(fields: SchemaField[], indent: number): string {
  const pad = ' '.repeat(indent);
  return fields.map((f) => {
    const opt = f.optional ? '?' : '';
    const note = [
      f.defaultValue !== undefined ? `default ${f.defaultValue}` : '',
      f.description || '',
    ].filter(Boolean).join(', ');
    const line = `${pad}${f.key}${opt}: ${f.type},${note ? `  // ${note}` : ''}`;
    if (!f.children?.length) return line;
    return `${line}\n${dumpFields(f.children, indent + 2)}`;
  }).join('\n');
}

export function generateLlmsTxt(): string {
  const schema = dumpFields(invoiceSchemaFields(), 4);
  return `# Invoicely: AI agent integration guide

Invoicely is a browser-only invoice generator at https://invoicely.app.
There is no Invoicely-hosted backend. This file is generated from the
live Zod schema, which is the source of truth.

## 1. Share-URL protocol (stateless, no infrastructure)

Put the full invoice JSON in the URL hash. Two encodings, two destinations.

Encodings:
  #j=<encodeURIComponent(JSON.stringify(invoice))>
      Uncompressed. Use this from Apps Script, curl, or any agent.
  #i=<lz-string compressToEncodedURIComponent>
      Shorter. Only if you can bundle lz-string.

Destinations:
  https://invoicely.app/playground#j=<json>
      Opens the editor with every field filled. Human reviews and downloads.
  https://invoicely.app/print-view#j=<json>
      Chrome-less invoice. Ready to print / Save as PDF. No nav, no playground.

Example (agent builds the object, then):

  const hash = '#j=' + encodeURIComponent(JSON.stringify(invoice));
  const edit  = 'https://invoicely.app/playground' + hash;
  const print = 'https://invoicely.app/print-view' + hash;

That is the free, zero-backend path. Do not invent a POST API on invoicely.app.
There is none.

PDF footer: when includeEditLink is true (default), the saved PDF stamps a
link back to /playground#i=… so the same invoice can be reopened.

## 2. Self-hosted Cloudflare Worker (optional render API)

Only if you need programmatic PDF/PNG bytes. Deploy cf-worker/ yourself.

One-click (Satori, free tier):
  https://deploy.workers.cloudflare.com/?url=https://github.com/hithismani/astro-apiinvoicegenerator/tree/v1

  POST https://<your-worker>/v1/render?engine=satori&format=pdf|png
  POST https://<your-worker>/v1/render?engine=browser
  Content-Type: application/json
  { "invoice": <Invoice> }     // or a bare invoice object

  engine=satori (default)
    format=pdf (default)  raster PDF (PNG embedded, text not selectable)
    format=png            image/png
  engine=browser
    always application/pdf (vector, selectable text)
    prints /print-view#i=<lz> in headless Chromium
    Workers Paid required. No SVG.

## 3. Invoice JSON schema (generated from Zod)

  {
${schema}
  }

Constraints:
- Every key used in lineItems must be present in the columns array.
- summary[].value is a string (formatted) or a number. Compute totals before creating the JSON.
- Currency, date, and number formatting is all agent-controlled. Invoicely
  never calculates or reformats values.

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

Each: https://invoicely.app/examples/<slug>
Open in playground: https://invoicely.app/examples/<slug> then the page's share hash,
or build #j= yourself from the same JSON shape.
`;
}

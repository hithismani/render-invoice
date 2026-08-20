export const GSHEETS_AI_PROMPT = `I want to turn a Google Sheet into a one-click invoice generator using RenderInvoice (https://renderinvoice.com, a browser-only invoice tool with no backend).

The integration is pure link-building. An Apps Script reads the active row, builds an RenderInvoice invoice JSON object, and constructs a URL like:

  https://renderinvoice.com/playground#j=<encodeURIComponent(JSON.stringify(invoice))>

Opening that URL pre-fills every field in the playground. From there I (or my client) review and download a PDF. No API calls, no auth, no Cloudflare Worker, and no Drive integration.

Please:
1. Propose a Google Sheet column layout that matches my business (described below). Keep one row per invoice. Include columns for: From block, Bill To block, invoice meta (number, date, due, project), line items (description / qty / rate / amount up to N rows), summary rows (subtotal, tax, total), and design settings (accentColor hex, design = "classic" or "bold").
2. Write a complete Apps Script (Code.gs) with: buildInvoice(row), shareUrlFor(invoice), openActiveRow() that pops a modal that calls window.open(url), and onOpen() that adds an "RenderInvoice" menu.
3. Make the script defensive about empty cells and stop reading line items at the first blank row.

Before writing code, please READ these reference docs so the JSON shape and URL format are correct:
- Plain-language schema and share-URL spec for AI agents: https://renderinvoice.com/llms.txt
- API page (schema reference, examples): https://renderinvoice.com/developers
- Live invoice examples to model after: https://renderinvoice.com/examples

Constraints from the schema:
- Every key used in lineItems[] rows must also appear in columns[].
- summary[].value is a string or number that I compute in the sheet; RenderInvoice never calculates totals, formats currency, or applies tax.
- Pre-fill design ("classic" or "bold") and accentColor (#RRGGBB).
- Text fields accept markdown: **bold** *italic* ~~strike~~ \`code\` [label](url). Description and footer also take # headings, - lists, 1. numbered, > quotes.

My business: <describe your invoicing, e.g., "UK design freelancer billing hourly + 20% VAT", "SaaS with monthly seats and proration", "agency with retainers and split shipping addresses">.

My existing sheet (if any): <paste a header row, or describe the columns you already have, or leave blank to start from your suggestion>.
`;

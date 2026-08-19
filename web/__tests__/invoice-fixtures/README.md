# Invoice fixture harness

Renders every edge-case invoice through the production template and writes
`.svg`, `.png`, and a vector `.pdf` into `output/`. Same files for the
in-process run and the Cloudflare Worker (`*.worker.pdf`).

## Usage

```bash
# render every fixture
pnpm test:fixtures

# render only fixtures whose filename contains "many"
pnpm test:fixtures -- only=many
```

Outputs land in `output/<name>.svg`, `.png`, and `.pdf` (gitignored).

## Adding a fixture

Create `fixtures/NN-some-name.ts` exporting a default object:

```ts
import { exampleInvoice } from '../../../schema/invoiceSchema.js';

export default {
  name: 'NN-some-name',           // optional; defaults to filename without .ts
  description: 'What this exercises — short sentence',
  invoice: { ...exampleInvoice, /* mutations */ },
  width: 900,                     // optional, default 900
  forExport: false,               // optional, default false (drops preview-only flourishes)
};
```

Filenames are sorted alphabetically, so prefix with a number to control order.

## What each fixture is for

| File | Targeted edge case |
|---|---|
| `01-baseline-classic` | Sanity baseline (classic) |
| `02-baseline-bold` | Sanity baseline (bold) |
| `03-classic-many-recipients` | Wrap behavior — 5 recipients in classic |
| `04-bold-many-recipients` | Same in bold + dynamic section headers |
| `05-bold-non-billto-key` | Bold section header reflects actual key (Customer / Patient), not hard-coded "Bill to" |
| `06-many-columns` | 7-column line items don't crush text |
| `07-long-text-overflow` | Long values wrap instead of overflowing |
| `08-cancelled` | Cancelled badge + notes |
| `09-many-summary` | Many summary rows (subtotal, multiple taxes, total) |
| `10-rtl` | RTL direction |
| `11-tiny-blank` | Minimal invoice (most fields empty) |
| `12-bold-export-flat-corners` | Bold accent header has flat top corners with `forExport: true` |

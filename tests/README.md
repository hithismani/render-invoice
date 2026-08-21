# Monorepo tests

Shared suite covering **both** packages:

| Script | What |
|---|---|
| `pnpm test` | web fixtures + web security + worker fixtures + worker security |
| `pnpm test:web` | playground render pipeline (SVG/PNG/PDF) over all fixtures |
| `pnpm test:worker` | HTTP harness against local `wrangler dev` (`workers/cf-worker`) |
| `pnpm test:security` | web markdown XSS / share-hash validation |
| `pnpm test:security:worker` | worker auth, body limit, shape checks |

Fixtures live in `tests/fixtures/` (shared). Outputs go to `tests/output/` (gitignored).

```bash
# everything
pnpm test

# one fixture on web only
pnpm test:web -- only=03

# one fixture against the worker
pnpm test:worker -- only=03
```

### Adding a fixture

Create `fixtures/NN-name.ts`:

```ts
import { exampleInvoice } from '../../web/schema/invoiceSchema.js';

export default {
  name: 'NN-name',
  description: 'What this exercises',
  invoice: { ...exampleInvoice /* mutations */ },
};
```

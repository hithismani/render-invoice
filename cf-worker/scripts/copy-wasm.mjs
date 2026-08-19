/**
 * Copy WebAssembly modules from node_modules into cf-worker/wasm/.
 *
 * The Cloudflare Workers runtime forbids runtime WASM compilation, so the
 * worker imports `.wasm` files as static modules (turned into
 * `WebAssembly.Module` bindings by wrangler's `[[rules]] type =
 * "CompiledWasm"`). pnpm's hoisting reshuffles paths under
 * `node_modules/.pnpm/...`, which would break import paths every time the
 * lockfile changes — so we copy the .wasm files to a stable location at
 * install time and reference *those*.
 *
 * Run automatically via `postinstall`. Idempotent.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const WASM_DIR = join(ROOT, 'wasm');
const NM = join(ROOT, 'node_modules');

if (!existsSync(WASM_DIR)) mkdirSync(WASM_DIR, { recursive: true });

// Walk node_modules to find a file by basename — more robust than
// require.resolve (which fails when the package's exports field doesn't
// expose the .wasm path) and survives pnpm's hoisting.
function findFile(rootDir, fileName, depthLimit = 6) {
  const queue = [{ dir: rootDir, depth: 0 }];
  while (queue.length) {
    const { dir, depth } = queue.shift();
    if (depth > depthLimit) continue;
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        queue.push({ dir: p, depth: depth + 1 });
      } else if (e.name === fileName) {
        return p;
      }
    }
  }
  return null;
}

const sources = [
  // resvg's WASM — used to rasterize Satori's SVG output to PNG.
  ['index_bg.wasm', 'resvg.wasm', '@resvg'],
  // yoga.wasm — Satori's bundled flexbox layout engine. Must come from the
  // satori package (not yoga-wasm-web) because satori 0.26+ ships its own
  // yoga build that's matched to its loader.
  ['yoga.wasm', 'yoga.wasm', 'satori'],
];

let copied = 0;
for (const [needle, outName, scopeHint] of sources) {
  // Search the relevant package scope first to avoid hitting the wrong copy
  // when the same filename exists in multiple packages.
  const searchRoots = scopeHint ? [join(NM, scopeHint), join(NM, '.pnpm')] : [join(NM, '.pnpm'), NM];
  let src = null;
  for (const root of searchRoots) {
    if (!existsSync(root)) continue;
    src = findFile(root, needle);
    if (src) break;
  }
  if (!src) {
    console.error(`copy-wasm: could not locate ${needle} under ${NM}`);
    process.exit(1);
  }
  copyFileSync(src, join(WASM_DIR, outName));
  copied++;
}
console.log(`copy-wasm: ${copied} file(s) → ${WASM_DIR}`);

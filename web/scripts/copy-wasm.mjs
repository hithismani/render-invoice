/**
 * Copy WebAssembly modules from lockfile-pinned node_modules → public/wasm/.
 *
 * Same-origin delivery (no CDN) without committing binaries. Versions come
 * from package.json / pnpm-lock.yaml; this just materializes the files the
 * browser fetches at /wasm/*.wasm. Run via postinstall + before next build.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = join(ROOT, 'public', 'wasm');
const NM = join(ROOT, 'node_modules');

if (!existsSync(NM)) {
  console.error('copy-wasm: node_modules missing — run pnpm install first');
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

function findFile(rootDir, fileName, depthLimit = 8) {
  const queue = [{ dir: rootDir, depth: 0 }];
  while (queue.length) {
    const { dir, depth } = queue.shift();
    if (depth > depthLimit) continue;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) queue.push({ dir: p, depth: depth + 1 });
      else if (e.name === fileName) return p;
    }
  }
  return null;
}

// Prefer package-scoped roots so we don't grab a same-named file from another dep.
const sources = [
  ['index_bg.wasm', 'resvg.wasm', '@resvg'],
  ['yoga.wasm', 'yoga.wasm', 'satori'],
];

let copied = 0;
for (const [needle, outName, scopeHint] of sources) {
  const searchRoots = [join(NM, scopeHint), join(NM, '.pnpm'), NM];
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
  copyFileSync(src, join(OUT, outName));
  copied++;
}
console.log(`copy-wasm: ${copied} file(s) → ${OUT}`);

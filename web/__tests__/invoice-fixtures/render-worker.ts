/**
 * Worker HTTP harness — POSTs every fixture to a locally-spawned `wrangler dev`
 * and saves the response next to the in-process renders. Output goes to
 * `output/<name>.worker.{svg,png,pdf}`.
 *
 * Run with:  pnpm test:fixtures:worker
 *        or  pnpm test:fixtures:worker only=03
 *
 * Auto-starts wrangler dev on port 8788, waits for "Ready on http", runs all
 * fixtures, and tears wrangler down on exit. No manual server management.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve as pathResolve } from 'node:path';
import type { Invoice } from '../../schema/invoiceSchema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = pathResolve(__dirname, '../..');
const FIXTURES_DIR = join(__dirname, 'fixtures');
const OUTPUT_DIR = join(__dirname, 'output');
const WORKER_DIR = pathResolve(ROOT, '../cf-worker');
const PORT = 8788;
const READY_MARKER = /Ready on http/i;
const WRANGLER_TIMEOUT_MS = 60_000;

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

interface Fixture {
  name: string;
  description: string;
  invoice: Invoice;
  width?: number;
  forExport?: boolean;
  pdf?: boolean;
}

async function loadFixtures(filter?: string): Promise<Fixture[]> {
  const files = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.ts')).sort();
  const wanted = filter ? files.filter((f) => f.includes(filter)) : files;
  const out: Fixture[] = [];
  for (const f of wanted) {
    const mod = (await import(join(FIXTURES_DIR, f))) as { default: Fixture };
    if (!mod.default?.invoice) continue;
    out.push({ ...mod.default, name: mod.default.name || f.replace(/\.ts$/, '') });
  }
  return out;
}

async function startWranglerDev(): Promise<ChildProcess> {
  console.log(`Starting wrangler dev (cwd=${WORKER_DIR}, port=${PORT})…`);
  // Use wrangler.dev.toml — same worker code, but with the Browser Rendering
  // binding removed so wrangler dev can boot locally. The Satori engine path
  // (which is what we exercise here) doesn't need the BROWSER binding.
  // log-level=info is needed: the "Ready on http" message comes from the
  // [wrangler:inf] logger; --log-level warn would suppress it and we'd time out.
  const proc = spawn('npx', ['wrangler', 'dev', '--config', 'wrangler.dev.toml', '--port', String(PORT), '--ip', '127.0.0.1', '--log-level', 'info'], {
    cwd: WORKER_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0' },
  });

  return new Promise((resolve, reject) => {
    let buffered = '';
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        proc.kill('SIGINT');
        reject(new Error(`wrangler dev did not become ready within ${WRANGLER_TIMEOUT_MS}ms.\nlast output:\n${buffered.slice(-1000)}`));
      }
    }, WRANGLER_TIMEOUT_MS);

    const onChunk = (chunk: Buffer) => {
      const s = chunk.toString();
      buffered += s;
      if (!resolved && READY_MARKER.test(buffered)) {
        resolved = true;
        clearTimeout(timeout);
        // Wait a beat for the server to actually accept connections.
        setTimeout(() => resolve(proc), 250);
      }
    };
    proc.stdout?.on('data', onChunk);
    proc.stderr?.on('data', onChunk);
    proc.on('exit', (code) => {
      if (!resolved) {
        clearTimeout(timeout);
        reject(new Error(`wrangler dev exited with code ${code} before becoming ready.\noutput:\n${buffered}`));
      }
    });
  });
}

async function postFixture(fix: Fixture, format: 'png' | 'pdf'): Promise<{ bytes: Uint8Array; ms: number; status: number; errorText?: string }> {
  const t0 = Date.now();
  const res = await fetch(`http://127.0.0.1:${PORT}/v1/render?engine=satori&format=${format}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoice: fix.invoice }),
  });
  const ms = Date.now() - t0;
  const bytes = new Uint8Array(await res.arrayBuffer());
  // Capture body for error responses so we can show what blew up.
  let errorText: string | undefined;
  if (res.status !== 200) {
    try { errorText = new TextDecoder().decode(bytes).slice(0, 500); } catch {}
  }
  return { bytes, ms, status: res.status, errorText };
}

async function main() {
  const args = process.argv.slice(2);
  const onlyArg = args.find((a) => a.startsWith('only='));
  const only = onlyArg ? onlyArg.slice(5) : undefined;

  const fixtures = await loadFixtures(only);
  if (fixtures.length === 0) {
    console.error(`No fixtures matched ${only ? `only=${only}` : '(all)'}`);
    process.exit(1);
  }

  const wrangler = await startWranglerDev();
  const cleanup = () => { try { wrangler.kill('SIGINT'); } catch {} };
  process.on('SIGINT', () => { cleanup(); process.exit(130); });
  process.on('exit', cleanup);

  console.log(`Wrangler ready on http://127.0.0.1:${PORT}\n`);
  console.log('  fixture                                       png         pdf');
  console.log('  ─────────────────────────────────────────  ──────────  ──────────');

  const timings = { png: [] as number[], pdf: [] as number[] };
  const failures: string[] = [];

  try {
    for (const fix of fixtures) {
      const cells: string[] = [];
      try {
        const pngRes = await postFixture(fix, 'png');
        if (pngRes.status !== 200) throw new Error(`png → HTTP ${pngRes.status}: ${pngRes.errorText ?? ''}`);
        writeFileSync(join(OUTPUT_DIR, `${fix.name}.worker.png`), pngRes.bytes);
        timings.png.push(pngRes.ms);
        cells.push(`${String(pngRes.ms).padStart(8)}ms`);

        const pdfRes = await postFixture(fix, 'pdf');
        if (pdfRes.status !== 200) throw new Error(`pdf → HTTP ${pdfRes.status}: ${pdfRes.errorText ?? ''}`);
        writeFileSync(join(OUTPUT_DIR, `${fix.name}.worker.pdf`), pdfRes.bytes);
        timings.pdf.push(pdfRes.ms);
        cells.push(`${String(pdfRes.ms).padStart(8)}ms`);

        console.log(`  ${fix.name.padEnd(42)} ${cells.join('  ')}`);
      } catch (e) {
        failures.push(`${fix.name}: ${e instanceof Error ? e.message : String(e)}`);
        console.error(`  ✗ ${fix.name.padEnd(42)} ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  } finally {
    wrangler.kill('SIGINT');
  }

  console.log('');
  console.log('  HTTP timing summary (includes cold-start on first request)');
  console.log('  format     n   mean    p50    p95   first   total');
  console.log('  ───────── ─── ────── ────── ────── ─────── ───────');
  for (const [k, xs] of Object.entries(timings) as Array<['png' | 'pdf', number[]]>) {
    if (xs.length === 0) continue;
    const sorted = [...xs].sort((a, b) => a - b);
    const total = sorted.reduce((s, x) => s + x, 0);
    const first = xs[0];
    const mean = Math.round(total / xs.length);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1];
    console.log(`  ${k.padEnd(9)} ${String(xs.length).padStart(3)} ${String(mean).padStart(5)}  ${String(p50).padStart(5)}  ${String(p95).padStart(5)}   ${String(first).padStart(5)}   ${String(total).padStart(5)}`);
  }

  if (failures.length) {
    console.log('');
    console.log(`${failures.length} failure(s):`);
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

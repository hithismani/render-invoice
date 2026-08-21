/**
 * Cloudflare Worker HTTP harness — spawns `wrangler dev` against workers/cf-worker,
 * POSTs every shared fixture, writes *.worker.{png,pdf}.
 *
 * Run from monorepo root:  pnpm test:worker
 * Filter:                  pnpm test:worker -- only=03
 *
 * Uses a throwaway API_KEY_SECRET so the harness matches production auth.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve as pathResolve } from 'node:path';
import type { Invoice } from '../web/schema/invoiceSchema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = pathResolve(__dirname, '..');
const FIXTURES_DIR = join(__dirname, 'fixtures');
const OUTPUT_DIR = join(__dirname, 'output');
const WORKER_DIR = join(REPO, 'workers/cf-worker');
const DEV_VARS = join(WORKER_DIR, '.dev.vars');
const PORT = 8788;
const READY_MARKER = /Ready on http/i;
const WRANGLER_TIMEOUT_MS = 90_000;
/** Matches wrangler .dev.vars — not a real secret. */
const TEST_API_KEY = 'fixture-test-key';

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

function writeDevVars(): void {
  writeFileSync(
    DEV_VARS,
    `API_KEY_SECRET=${TEST_API_KEY}\nPLAYGROUND_URL=https://renderinvoice.com\n`,
  );
}

function removeDevVars(): void {
  try {
    unlinkSync(DEV_VARS);
  } catch {
    /* ignore */
  }
}

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
  if (!existsSync(join(WORKER_DIR, 'wrangler.toml'))) {
    throw new Error(`Worker dir missing or incomplete: ${WORKER_DIR}`);
  }
  writeDevVars();
  console.log(`[worker] Starting wrangler dev (cwd=${WORKER_DIR}, port=${PORT})…`);
  const wranglerBin = join(WORKER_DIR, 'node_modules/.bin/wrangler');
  const proc = spawn(
    wranglerBin,
    ['dev', '--config', 'wrangler.toml', '--port', String(PORT), '--ip', '127.0.0.1', '--log-level', 'info'],
    {
      cwd: WORKER_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' },
    },
  );

  return new Promise((resolve, reject) => {
    let buffered = '';
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      proc.kill('SIGINT');
      reject(
        new Error(
          `wrangler dev did not become ready within ${WRANGLER_TIMEOUT_MS}ms.\nlast output:\n${buffered.slice(-1000)}`,
        ),
      );
    }, WRANGLER_TIMEOUT_MS);

    const onChunk = (chunk: Buffer) => {
      const s = chunk.toString();
      buffered += s;
      if (!settled && READY_MARKER.test(buffered)) {
        settled = true;
        clearTimeout(timeout);
        setTimeout(() => resolve(proc), 250);
      }
    };
    proc.stdout?.on('data', onChunk);
    proc.stderr?.on('data', onChunk);
    proc.on('exit', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(new Error(`wrangler dev exited with code ${code} before becoming ready.\noutput:\n${buffered}`));
    });
  });
}

async function postFixture(
  fix: Fixture,
  format: 'png' | 'pdf',
): Promise<{ bytes: Uint8Array; ms: number; status: number; errorText?: string }> {
  const t0 = Date.now();
  const res = await fetch(`http://127.0.0.1:${PORT}/v1/render?engine=satori&format=${format}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TEST_API_KEY}`,
    },
    body: JSON.stringify({ invoice: fix.invoice }),
  });
  const ms = Date.now() - t0;
  const bytes = new Uint8Array(await res.arrayBuffer());
  let errorText: string | undefined;
  if (res.status !== 200) {
    try {
      errorText = new TextDecoder().decode(bytes).slice(0, 500);
    } catch {
      /* ignore */
    }
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
  const cleanup = () => {
    try {
      wrangler.kill('SIGINT');
    } catch {
      /* ignore */
    }
    removeDevVars();
  };
  process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.on('exit', cleanup);

  console.log(`[worker] Ready on http://127.0.0.1:${PORT}\n`);
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
    console.log(
      `  ${k.padEnd(9)} ${String(xs.length).padStart(3)} ${String(mean).padStart(5)}  ${String(p50).padStart(5)}  ${String(p95).padStart(5)}   ${String(first).padStart(5)}   ${String(total).padStart(5)}`,
    );
  }

  if (failures.length) {
    console.log('');
    console.log(`${failures.length} failure(s):`);
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
  console.log(`\n[worker] Done — outputs in ${OUTPUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

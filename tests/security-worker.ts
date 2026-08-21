/**
 * Worker security / config regressions against a live wrangler dev instance.
 * Run from monorepo root:  pnpm test:security:worker
 * (also included in `pnpm test:worker` via the auth'd fixture harness)
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve as pathResolve } from 'node:path';
import { exampleInvoice } from '../web/schema/invoiceSchema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = pathResolve(__dirname, '..');
const WORKER_DIR = join(REPO, 'workers/cf-worker');
const DEV_VARS = join(WORKER_DIR, '.dev.vars');
const PORT = 8789;
const READY_MARKER = /Ready on http/i;
const KEY = 'security-test-key';

let failures = 0;
function check(name: string, cond: boolean, detail?: string): void {
  if (cond) console.log(`  ok    ${name}`);
  else {
    failures++;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function startWrangler(): Promise<ChildProcess> {
  if (!existsSync(join(WORKER_DIR, 'wrangler.toml'))) {
    throw new Error(`Worker dir missing: ${WORKER_DIR}`);
  }
  writeFileSync(DEV_VARS, `API_KEY_SECRET=${KEY}\nPLAYGROUND_URL=https://custom.example\n`);
  const wranglerBin = join(WORKER_DIR, 'node_modules/.bin/wrangler');
  const proc = spawn(
    wranglerBin,
    ['dev', '--config', 'wrangler.toml', '--port', String(PORT), '--ip', '127.0.0.1', '--log-level', 'info'],
    {
      cwd: WORKER_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' },
      detached: false,
    },
  );
  await new Promise<void>((resolve, reject) => {
    let buf = '';
    let settled = false;
    const t = setTimeout(() => {
      if (settled) return;
      settled = true;
      proc.kill('SIGINT');
      reject(new Error(`wrangler not ready\n${buf.slice(-800)}`));
    }, 90_000);
    const on = (c: Buffer) => {
      buf += c.toString();
      if (!settled && READY_MARKER.test(buf)) {
        settled = true;
        clearTimeout(t);
        setTimeout(() => resolve(), 250);
      }
    };
    proc.stdout?.on('data', on);
    proc.stderr?.on('data', on);
    proc.on('exit', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(t);
      reject(new Error(`wrangler exited ${code}\n${buf}`));
    });
  });
  return proc;
}

async function req(
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; body: string; headers: Headers }> {
  const res = await fetch(`http://127.0.0.1:${PORT}${path}`, init);
  return { status: res.status, body: await res.text(), headers: res.headers };
}

async function main() {
  console.log('[security/worker] spinning up wrangler…');
  const wrangler = await startWrangler();
  const cleanup = () => {
    try {
      wrangler.kill('SIGINT');
    } catch {
      /* ignore */
    }
    try {
      unlinkSync(DEV_VARS);
    } catch {
      /* ignore */
    }
  };
  process.on('exit', cleanup);

  try {
    console.log('[security/worker] auth + validation');
    const noAuth = await req('/v1/render?format=pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice: exampleInvoice }),
    });
    check('rejects missing auth', noAuth.status === 401);

    const badAuth = await req('/v1/render?format=pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer wrong' },
      body: JSON.stringify({ invoice: exampleInvoice }),
    });
    check('rejects bad bearer', badAuth.status === 401);

    const ok = await req('/v1/render?format=pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ invoice: exampleInvoice }),
    });
    check('accepts good bearer', ok.status === 200, `status=${ok.status} body=${ok.body.slice(0, 120)}`);
    check('returns pdf content-type', (ok.headers.get('content-type') || '').includes('application/pdf'));

    const huge = 'x'.repeat(1_100_000);
    const tooBig = await req('/v1/render?format=pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KEY}`,
        'Content-Length': String(huge.length),
      },
      body: huge,
    });
    check('rejects oversized body', tooBig.status === 413);

    const badJson = await req('/v1/render?format=pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: 'not-json',
    });
    check('rejects non-json', badJson.status === 400);

    const notInvoice = await req('/v1/render?format=pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ foo: 1 }),
    });
    check('rejects non-invoice shape', notInvoice.status === 400);

    const root = await req('/');
    check('GET / is public', root.status === 200);
  } finally {
    cleanup();
  }

  if (failures > 0) {
    console.error(`\n${failures} check(s) failed`);
    process.exit(1);
  }
  console.log('\n[security/worker] All checks passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

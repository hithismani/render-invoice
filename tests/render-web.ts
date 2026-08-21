/**
 * Web pipeline fixture harness — SVG / PNG / vector PDF via the playground
 * template (satori + resvg + satoriSvgToPdf).
 *
 * Run from monorepo root:  pnpm test:web
 * Filter:                  pnpm test:web -- only=03
 */

import satori, { init as initSatoriWasm } from 'satori';
import { Resvg, initWasm as initResvgWasm } from '@resvg/resvg-wasm';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve as pathResolve } from 'node:path';
import { invoiceElement } from '../web/components/SatoriInvoiceTemplate.jsx';
import type { Invoice } from '../web/schema/invoiceSchema.js';
import { satoriSvgToPdf } from '../web/lib/satoriSvgToPdf.js';
import { encodeShareHash } from '../web/lib/share.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = pathResolve(__dirname, '..');
const WEB = join(REPO, 'web');
const FIXTURES_DIR = join(__dirname, 'fixtures');
const OUTPUT_DIR = join(__dirname, 'output');

const INTER_REGULAR_PATH = join(WEB, 'public/fonts/Inter-Regular.ttf');
const INTER_BOLD_PATH = join(WEB, 'public/fonts/Inter-Bold.ttf');
const SATORI_WASM_PATH = join(WEB, 'node_modules/satori/yoga.wasm');
const RESVG_WASM_PATH = join(WEB, 'node_modules/@resvg/resvg-wasm/index_bg.wasm');

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
    if (!mod.default?.invoice) {
      console.warn(`! ${f} has no default export with .invoice — skipping`);
      continue;
    }
    out.push({ ...mod.default, name: mod.default.name || f.replace(/\.ts$/, '') });
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const onlyArg = args.find((a) => a.startsWith('only='));
  const only = onlyArg ? onlyArg.slice(5) : undefined;

  const t0 = Date.now();
  const [regular, bold, satoriWasm, resvgWasm] = [
    readFileSync(INTER_REGULAR_PATH),
    readFileSync(INTER_BOLD_PATH),
    readFileSync(SATORI_WASM_PATH),
    readFileSync(RESVG_WASM_PATH),
  ];

  await initSatoriWasm(await WebAssembly.compile(satoriWasm));
  await initResvgWasm(await WebAssembly.compile(resvgWasm));

  const fixtures = await loadFixtures(only);
  if (fixtures.length === 0) {
    console.error(`No fixtures matched ${only ? `only=${only}` : '(all)'}`);
    process.exit(1);
  }

  console.log(`[web] Loaded ${fixtures.length} fixture(s) in ${Date.now() - t0}ms`);
  console.log('');
  console.log('  fixture                                     svg     png     pdf');
  console.log('  ─────────────────────────────────────────  ──────  ──────  ──────');

  const fontsCfg = [
    { name: 'Inter', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: bold, weight: 700 as const, style: 'normal' as const },
  ];

  const timings: Record<string, number[]> = { svg: [], png: [], pdf: [] };
  const failures: string[] = [];

  for (const fix of fixtures) {
    try {
      const fitToA4 = fix.invoice.autoSize === false;
      const renderWidth = fix.width ?? 900;

      const ts = Date.now();
      const svg = await satori(invoiceElement(fix.invoice, { forExport: fix.forExport ?? false }), {
        width: renderWidth,
        fonts: fontsCfg,
      });
      const svgMs = Date.now() - ts;
      writeFileSync(join(OUTPUT_DIR, `${fix.name}.web.svg`), svg);
      timings.svg.push(svgMs);

      const tp = Date.now();
      const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: renderWidth * 2 } });
      const png = resvg.render().asPng();
      const pngMs = Date.now() - tp;
      writeFileSync(join(OUTPUT_DIR, `${fix.name}.web.png`), png);
      timings.png.push(pngMs);

      const td = Date.now();
      const svgText = await satori(invoiceElement(fix.invoice, { forExport: fix.forExport ?? false }), {
        width: renderWidth,
        embedFont: false,
        fonts: fontsCfg,
      });
      const bytes = await satoriSvgToPdf(
        svgText,
        { regular, bold },
        {
          fitToA4,
          editUrl:
            fix.invoice.includeEditLink === false
              ? undefined
              : `https://renderinvoice.com/playground${encodeShareHash(fix.invoice)}`,
        },
      );
      writeFileSync(join(OUTPUT_DIR, `${fix.name}.web.pdf`), bytes);
      const pdfMs = Date.now() - td;
      timings.pdf.push(pdfMs);

      const cell = (n: number) => String(n).padStart(5) + 'ms';
      console.log(`  ${fix.name.padEnd(42)} ${cell(svgMs)}  ${cell(pngMs)}  ${cell(pdfMs)}`);
    } catch (e) {
      failures.push(`${fix.name}: ${e instanceof Error ? e.message : String(e)}`);
      console.error(`  ✗ ${fix.name.padEnd(42)} ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.log('');
  printTimingSummary(timings);
  if (failures.length) {
    console.log('');
    console.log(`${failures.length} failure(s):`);
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
  console.log(`\n[web] Done in ${Date.now() - t0}ms — outputs in ${OUTPUT_DIR}`);
}

function printTimingSummary(timings: Record<string, number[]>): void {
  const stat = (xs: number[]) => {
    if (xs.length === 0) return { n: 0, p50: 0, p95: 0, mean: 0, total: 0 };
    const sorted = [...xs].sort((a, b) => a - b);
    const total = sorted.reduce((s, x) => s + x, 0);
    return {
      n: xs.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1],
      mean: Math.round(total / xs.length),
      total,
    };
  };
  console.log('  Timing summary (ms)');
  console.log('  stage      n   mean    p50    p95   total');
  console.log('  ───────── ─── ────── ────── ────── ───────');
  for (const [k, xs] of Object.entries(timings)) {
    const s = stat(xs);
    if (s.n === 0) continue;
    console.log(
      `  ${k.padEnd(9)} ${String(s.n).padStart(3)} ${String(s.mean).padStart(5)}  ${String(s.p50).padStart(5)}  ${String(s.p95).padStart(5)}   ${String(s.total).padStart(5)}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

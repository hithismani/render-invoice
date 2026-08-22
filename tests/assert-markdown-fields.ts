/**
 * Assert every user text surface renders markdown / @key@ hide / size markers
 * without leaking raw syntax. Run: pnpm test:web is separate; this is:
 *   bash tests/run.sh assert-markdown-fields.ts
 */
import { readFileSync } from 'node:fs';
import satori, { init as initSatoriWasm } from 'satori';
import { invoiceElement } from '../web/components/SatoriInvoiceTemplate.jsx';
import { displayKey, needsBlockMarkdown, stripMarkdown } from '../web/components/SatoriMarkdown.jsx';
import { displayKey as displayKeyDom, formatMarkdown } from '../web/lib/formatMarkdown.js';

const WEB = new URL('../web', import.meta.url).pathname;

function fail(msg: string): never {
  console.error('FAIL', msg);
  process.exit(1);
}

function assert(cond: unknown, msg: string) {
  if (!cond) fail(msg);
  console.log('PASS', msg);
}

async function main() {
  // Centralized helpers stay in sync
  assert(displayKey(' @Ref@ ') === '', 'displayKey hides trimmed @wrap@');
  assert(displayKey('@Meta Hide@') === '', 'displayKey hides @Meta Hide@');
  assert(displayKey('Email') === 'Email', 'displayKey keeps plain keys');
  assert(displayKey('a@b') === 'ab', 'displayKey strips stray @');
  assert(displayKeyDom(' @Ref@ ') === displayKey(' @Ref@ '), 'DOM displayKey matches Satori');
  assert(needsBlockMarkdown('a\nb'), 'needsBlockMarkdown newlines');
  assert(needsBlockMarkdown('{@11}x'), 'needsBlockMarkdown size');
  assert(!needsBlockMarkdown('plain'), 'needsBlockMarkdown plain false');
  assert(stripMarkdown('**x**') === 'x', 'stripMarkdown bold');

  const html = formatMarkdown('{@11}hi {@11}\n`code`');
  assert(!html.includes('{@'), 'formatMarkdown never leaks {@');
  assert(html.includes('font-size:11px'), 'formatMarkdown applies size');
  assert(html.includes('<code>'), 'formatMarkdown code');

  await initSatoriWasm(readFileSync(WEB + '/node_modules/satori/yoga.wasm'));
  const fonts = [
    { name: 'Inter', data: readFileSync(WEB + '/public/fonts/Inter-Regular.ttf'), weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: readFileSync(WEB + '/public/fonts/Inter-Bold.ttf'), weight: 700 as const, style: 'normal' as const },
  ];
  const mod = await import('../tests/fixtures/24-at-keys-repro.ts');
  const svg = await satori(invoiceElement(mod.default.invoice, { forExport: true }), {
    width: 900,
    embedFont: false,
    fonts,
  });
  const words = [...svg.matchAll(/>([^<>]+)<\/text>/g)].map((m) => m[1]);
  const joined = words.join(' ');
  const compact = joined.replace(/[\s\-]+/g, '');

  assert(!/@Ref@/i.test(joined), 'PDF: no @Ref@ label');
  assert(!/Meta\s*Hide/i.test(joined), 'PDF: no Meta Hide label');
  assert(!/Bottom\s*Hide/i.test(joined), 'PDF: no Bottom Hide label');
  assert(!/Hidden\s*From/i.test(joined), 'PDF: no Hidden From label');
  assert(!/\{\s*@\s*\d+/.test(joined), 'PDF: no bare {@n} leak');
  assert(!/\*\*/.test(joined), 'PDF: no ** leak');
  assert(!/~~/.test(joined), 'PDF: no ~~ leak');
  assert(compact.includes('fromonlyvalue'), 'PDF: hidden-from value prints');
  assert(compact.includes('toonlyvalue'), 'PDF: hidden-to value prints');
  assert(compact.includes('metaonlyvalue'), 'PDF: hidden-meta value prints');
  assert(compact.includes('bottomonlyvalue'), 'PDF: hidden-bottom value prints');
  assert(compact.includes('pay_Q2FpXg9MSGQVvN'), 'PDF: pay id in body');
  assert(compact.includes('Platform') && compact.includes('Sustenance'), 'PDF: line item body');
  assert(compact.includes('Thankyou'), 'PDF: footer top');
  assert(compact.includes('NEFT'), 'PDF: footer bottom code');
  assert(compact.includes('Void'), 'PDF: cancelled notes');
  assert(compact.includes('Tax') && compact.includes('Invoice'), 'PDF: heading');
  assert(compact.includes('Suite'), 'PDF: multi-line address keeps italic word');

  console.log('\nAll markdown-field assertions passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

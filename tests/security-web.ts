/**
 * Web security regressions (formatMarkdown XSS sink + share-hash validation).
 * Run from monorepo root:  pnpm test:security
 */
import { formatMarkdown } from '../web/lib/formatMarkdown.js';
import { decodeShareHash, encodeShareHash } from '../web/lib/share.js';
import { exampleInvoice } from '../web/schema/invoiceSchema.js';

let failures = 0;
function check(name: string, cond: boolean, detail?: string): void {
  if (cond) console.log(`  ok    ${name}`);
  else {
    failures++;
    console.error(`  FAIL  ${name}${detail ? ` - ${detail}` : ''}`);
  }
}

console.log('[security/web] formatMarkdown: HTML escaping');
check('img onerror escaped', !formatMarkdown('<img src=x onerror=alert(1)>').includes('<img'));
check('script tag escaped', !formatMarkdown('<script>alert(1)</script>').includes('<script>'));
check('iframe escaped', !formatMarkdown('<iframe src="//evil"></iframe>').includes('<iframe'));
check('output is inert entities', formatMarkdown('<b>x</b>').includes('&lt;b&gt;x&lt;/b&gt;'));

console.log('[security/web] formatMarkdown: markdown still works');
check('bold', formatMarkdown('**b**') === '<strong>b</strong>');
check('italic', formatMarkdown('*i*') === '<em>i</em>');
check('code', formatMarkdown('`c`') === '<code>c</code>');
check('h1 size', formatMarkdown('# h').includes('font-size:1.75em'));
check('block size override', formatMarkdown('{@18:x}').includes('font-size:18px'));
check('line breaks', formatMarkdown('a\nb').includes('<br>'));

console.log('[security/web] formatMarkdown: link scheme allowlist');
check('https kept', formatMarkdown('[a](https://e.com)').includes('<a href="https://e.com"'));
check('http kept', formatMarkdown('[a](http://e.com)').includes('<a href="http://e.com"'));
check('mailto kept', formatMarkdown('[a](mailto:a@b.c)').includes('<a href="mailto:a@b.c"'));
check('relative kept', formatMarkdown('[a](/playground)').includes('href="/playground"'));
check('javascript: stripped', !formatMarkdown('[a](javascript:alert(1))').includes('<a '));
check('data: stripped', !formatMarkdown('[a](data:text/html,<b>)').includes('<a '));
check('vbscript: stripped', !formatMarkdown('[a](vbscript:x)').includes('<a '));
check('stripped link keeps label', formatMarkdown('[label](javascript:x)') === 'label');
check(
  'quote breakout neutralized',
  !formatMarkdown('[a](https://x.com/" onmouseover="alert(1))').includes('" onmouseover'),
);

console.log('[security/web] decodeShareHash: validation');
const good = decodeShareHash(encodeShareHash(exampleInvoice));
check('lz round-trip', !!good && good.invoiceHeading === exampleInvoice.invoiceHeading);
check('j= form accepted', !!decodeShareHash(`#j=${encodeURIComponent(JSON.stringify(exampleInvoice))}`));
check(
  'partial invoice accepted (logo only)',
  !!decodeShareHash(`#j=${encodeURIComponent(JSON.stringify({ logoUrl: 'data:image/png;base64,iVBORw0KGgo=' }))}`),
);
check(
  'partial invoice accepted (few fields)',
  !!decodeShareHash(`#j=${encodeURIComponent(JSON.stringify({ invoiceHeading: 'Hi', metaTop: { 'Invoice Number': 'INV-1' } }))}`),
);
check(
  'unknown keys stripped',
  (() => {
    const d = decodeShareHash(`#j=${encodeURIComponent(JSON.stringify({ invoiceHeading: 'X', evil: '<script>' }))}`);
    return !!d && !('evil' in (d as unknown as Record<string, unknown>));
  })(),
);
check(
  'bad logoUrl scheme rejected',
  decodeShareHash(`#j=${encodeURIComponent(JSON.stringify({ logoUrl: 'javascript:alert(1)' }))}`) === null,
);
check(
  'bad accentColor rejected',
  decodeShareHash(`#j=${encodeURIComponent(JSON.stringify({ ...exampleInvoice, accentColor: 'red;<script>' }))}`) ===
    null,
);
check(
  'wrong-typed field rejected',
  decodeShareHash(`#j=${encodeURIComponent(JSON.stringify({ columns: 'not-an-array' }))}`) === null,
);
check('non-object rejected', decodeShareHash(`#j=${encodeURIComponent('[1,2]')}`) === null);
check('garbage lz rejected', decodeShareHash('#i=!!!!') === null);
check('empty hash rejected', decodeShareHash('') === null);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\n[security/web] All checks passed');

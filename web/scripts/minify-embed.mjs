import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { transform } from 'esbuild';

const SRC = new URL('../public/renderinvoice.js', import.meta.url);
const bytes = readFileSync(SRC, 'utf8');

const { code } = await transform(bytes, {
  minify: true,
  target: ['chrome80', 'firefox80', 'safari13'],
  legalComments: 'inline',
});

const out = (name) => new URL('../public/' + name, import.meta.url);
const gz = gzipSync(Buffer.from(code), { level: 9 });
const br = brotliCompressSync(Buffer.from(code));

writeFileSync(out('renderinvoice.min.js'), code);
writeFileSync(out('renderinvoice.min.js.gz'), gz);
writeFileSync(out('renderinvoice.min.js.br'), br);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(
  'renderinvoice: ' + kb(statSync(SRC).size) + ' -> ' + kb(code.length) + ' min, '
  + kb(gz.length) + ' gz, ' + kb(br.length) + ' br',
);

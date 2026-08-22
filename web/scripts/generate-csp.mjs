/**
 * Post-build CSP generator.
 *
 * Next's static export inlines RSC/hydration bootstrap <script> blocks whose
 * contents change per page and per build, so a static `script-src 'self'`
 * would block hydration and break the site. Two deploy targets, two policies:
 *
 *   - Cloudflare (out/_headers): hash-based, one scoped CSP per page. The
 *     _headers file ships in the SAME build artifact as the HTML, so hashes
 *     always match. Strict: blocks inline event handlers + foreign scripts.
 *
 *   - Vercel (vercel.json): portable policy with 'unsafe-inline' for scripts.
 *     Vercel rebuilds the HTML itself and snapshots vercel.json before the
 *     build, so committed hashes can never match what it serves. See the
 *     note at the vercel.json section below.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'out');

const CSP = (hashes) =>
  `default-src 'self'; script-src 'self' 'wasm-unsafe-eval'${[...hashes].sort().map((h) => ` ${h}`).join('')}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://api.github.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'`;

function* walkHtml(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walkHtml(p);
    else if (entry.name.endsWith('.html')) yield p;
  }
}

/** Collect attribute-less <script> bodies per exported page. */
const pages = new Map();
for (const file of walkHtml(OUT)) {
  const rel = relative(OUT, file);
  const urlPath =
    rel === 'index.html' ? '/' : `/${rel.replace(/\.html$/, '')}`;
  const html = readFileSync(file, 'utf8');
  const hashes = new Set();
  // Bare "<script>" only - tags with attributes (src, type…) are skipped;
  // JSON-LD and friends are non-executable and don't need allowlisting.
  for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    if (m[1].trim().length === 0) continue;
    hashes.add(`'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
  }
  pages.set(urlPath, hashes);
}

// 404.html is served for arbitrary unmatched paths, so its hashes are the
// catch-all baseline; every concrete page gets its own scoped rule.
const defaultHashes = pages.get('/404') ?? new Set();
pages.delete('/404');

const STATIC_HEADERS = [
  '  X-Content-Type-Options: nosniff',
  '  X-Frame-Options: SAMEORIGIN',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  Permissions-Policy: interest-cohort=()',
].join('\n');

// 1) Cloudflare Workers/Pages assets (_headers, last-matching-rule-wins).
const blocks = [`/*\n${STATIC_HEADERS}\n  Content-Security-Policy: ${CSP(defaultHashes)}`];
for (const [path, hashes] of [...pages].sort(([a], [b]) => a.localeCompare(b))) {
  blocks.push(`${path}\n  Content-Security-Policy: ${CSP(hashes)}`);
}
blocks.push('/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable');
writeFileSync(join(OUT, '_headers'), `${blocks.join('\n')}\n`);

// 2) Vercel (vercel.json) - PORTABLE policy, no hashes.
//
// Vercel runs its own `next build` and snapshots vercel.json BEFORE the
// build, so per-build script hashes can never match the HTML it serves
// (mismatch = every inline script blocked = white page). The only stable
// option there is 'unsafe-inline' for scripts. Primary XSS defense is
// library-level: formatMarkdown escapes all user HTML before it can reach
// dangerouslySetInnerHTML. Cloudflare deploys keep the strict hashed CSP
// above because out/_headers ships in the same artifact as the HTML.
const vercelPath = join(ROOT, 'vercel.json');
const vercel = JSON.parse(readFileSync(vercelPath, 'utf8'));
const baseHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'interest-cohort=()' },
];
const VERCEL_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://api.github.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'";
vercel.headers = [
  {
    source: '/:path*',
    headers: [
      ...baseHeaders,
      { key: 'Content-Security-Policy', value: VERCEL_CSP },
    ],
  },
  {
    source: '/_next/static/(.*)',
    headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
  },
];
writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);

rmSync(join(ROOT, 'public', '_headers'), { force: true });

let maxLen = 0;
for (const [, h] of pages) maxLen = Math.max(maxLen, CSP(h).length);
console.log(
  `generate-csp: ${pages.size} page rule(s) + catch-all (${defaultHashes.size} hashes); longest CSP ${maxLen} bytes`,
);

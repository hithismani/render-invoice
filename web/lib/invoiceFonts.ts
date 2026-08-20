export const POPULAR_FONTS = [
  'Inter',
  'Source Serif 4',
  'IBM Plex Sans',
  'Playfair Display',
  'Space Grotesk',
  'DM Sans',
  'Fraunces',
  'Libre Baskerville',
  'Instrument Sans',
  'Newsreader',
] as const;

const LEGACY: Record<string, string> = {
  inter: 'Inter',
  serif: 'Source Serif 4',
  plex: 'IBM Plex Sans',
};

const ALLOWED = new Set<string>(POPULAR_FONTS.map((f) => f.toLowerCase()));

/** Canonical typeface name, or Inter if unknown / not in the curated list. */
export function satoriFontName(family?: string | null): string {
  const n = (family || 'Inter').trim();
  if (!n) return 'Inter';
  const legacy = LEGACY[n.toLowerCase()];
  if (legacy) return legacy;
  if (ALLOWED.has(n.toLowerCase())) {
    return POPULAR_FONTS.find((f) => f.toLowerCase() === n.toLowerCase()) || 'Inter';
  }
  return 'Inter';
}

export function fontStack(family?: string | null): string {
  const n = satoriFontName(family);
  return n === 'Inter'
    ? `"Inter", ui-sans-serif, system-ui, sans-serif`
    : `"${n}", "Inter", ui-sans-serif, system-ui, sans-serif`;
}

export function googleCssHref(family?: string | null): string {
  const n = satoriFontName(family);
  if (n === 'Inter') {
    return `https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap`;
  }
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(n)}:wght@400;700&family=Inter:wght@400;700&display=swap`;
}

const cache = new Map<string, { regular: ArrayBuffer; bold: ArrayBuffer }>();

function isSfnt(buf: ArrayBuffer): boolean {
  if (buf.byteLength < 4) return false;
  const b = new Uint8Array(buf, 0, 4);
  if (b[0] === 0x00 && b[1] === 0x01 && b[2] === 0x00 && b[3] === 0x00) return true;
  const tag = String.fromCharCode(b[0], b[1], b[2], b[3]);
  return tag === 'OTTO' || tag === 'true' || tag === 'typ1';
}

export type LoadedFont = {
  family: string;
  regular: ArrayBuffer;
  bold: ArrayBuffer;
  /** Full Inter — covers ₹ € £ ¥ and general punctuation missing from latin subsets. */
  fallbackRegular: ArrayBuffer;
  fallbackBold: ArrayBuffer;
};

export async function loadInvoiceFont(family?: string | null): Promise<LoadedFont> {
  const name = satoriFontName(family);
  const primary = await loadPair(name);
  const inter = name === 'Inter' ? primary : await loadPair('Inter');
  return {
    family: name,
    regular: primary.regular,
    bold: primary.bold,
    fallbackRegular: inter.regular,
    fallbackBold: inter.bold,
  };
}

async function loadPair(name: string): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  const hit = cache.get(name);
  if (hit && isSfnt(hit.regular) && isSfnt(hit.bold)) return hit;
  if (hit) cache.delete(name);

  if (name === 'Inter') {
    try {
      const [lr, lb] = await Promise.all([fetch('/fonts/Inter-Regular.ttf'), fetch('/fonts/Inter-Bold.ttf')]);
      if (lr.ok && lb.ok) {
        const pair = { regular: await lr.arrayBuffer(), bold: await lb.arrayBuffer() };
        if (isSfnt(pair.regular) && isSfnt(pair.bold)) {
          cache.set(name, pair);
          return pair;
        }
      }
    } catch {
      /* worker / missing local files */
    }
  }

  try {
    const regular = await fetchTtf(name, 400);
    const bold = await fetchTtf(name, 700).catch(() => regular);
    const pair = { regular, bold };
    cache.set(name, pair);
    return pair;
  } catch {
    if (name !== 'Inter') return loadPair('Inter');
    throw new Error(`Could not load font "${name}"`);
  }
}

async function fetchTtf(family: string, weight: number): Promise<ArrayBuffer> {
  // Prefer fuller fontsource builds (latin-ext includes many currency signs).
  // Fall back through latin → Google CSS TTF.
  const subsets = ['latin-ext', 'latin'];
  for (const subset of subsets) {
    try {
      const fromSource = await fetchFontsource(family, weight, subset);
      if (isSfnt(fromSource)) return fromSource;
    } catch {
      /* try next */
    }
  }
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
  const css = await fetch(cssUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
    },
  });
  if (css.ok) {
    const text = await css.text();
    const urls = [...text.matchAll(/src:\s*url\(([^)]+)\)/g)].map((m) => m[1]);
    const ttfUrl = urls.find((u) => /\.(ttf|otf)(\?|$)/i.test(u)) || urls.find((u) => !/woff2?/i.test(u));
    if (ttfUrl) {
      const file = await fetch(ttfUrl);
      if (file.ok) {
        const buf = await file.arrayBuffer();
        if (isSfnt(buf)) return buf;
      }
    }
  }
  throw new Error(`No TTF for "${family}" ${weight}`);
}

function slug(family: string): string {
  return family
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchFontsource(family: string, weight: number, subset: string): Promise<ArrayBuffer> {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/${slug(family)}@5.2.5/${subset}-${weight}-normal.ttf`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Could not load fontsource "${family}" ${subset}`);
  return r.arrayBuffer();
}

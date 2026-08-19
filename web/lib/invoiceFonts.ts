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

export function satoriFontName(family?: string | null): string {
  const n = (family || 'Inter').trim();
  if (!n) return 'Inter';
  return LEGACY[n.toLowerCase()] || n;
}

export function fontStack(family?: string | null): string {
  const n = satoriFontName(family);
  return `"${n}", ui-sans-serif, system-ui, sans-serif`;
}

export function googleCssHref(family?: string | null): string {
  const n = satoriFontName(family);
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(n)}:wght@400;700&display=swap`;
}

const cache = new Map<string, { regular: ArrayBuffer; bold: ArrayBuffer }>();

export async function loadInvoiceFont(family?: string | null): Promise<{ family: string; regular: ArrayBuffer; bold: ArrayBuffer }> {
  const name = satoriFontName(family);
  const hit = cache.get(name);
  if (hit) return { family: name, ...hit };

  if (name === 'Inter') {
    try {
      const [lr, lb] = await Promise.all([fetch('/fonts/Inter-Regular.ttf'), fetch('/fonts/Inter-Bold.ttf')]);
      if (lr.ok && lb.ok) {
        const pair = { regular: await lr.arrayBuffer(), bold: await lb.arrayBuffer() };
        cache.set(name, pair);
        return { family: name, ...pair };
      }
    } catch {
      /* worker / missing local files */
    }
  }

  try {
    const regular = await fetchGoogleTtf(name, 400);
    const bold = await fetchGoogleTtf(name, 700).catch(() => regular);
    cache.set(name, { regular, bold });
    return { family: name, regular, bold };
  } catch {
    if (name !== 'Inter') return loadInvoiceFont('Inter');
    throw new Error(`Could not load font "${name}"`);
  }
}

async function fetchGoogleTtf(family: string, weight: number): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
  const css = await fetch(cssUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
    },
  });
  if (css.ok) {
    const text = await css.text();
    const m = text.match(/src:\s*url\(([^)]+)\)/);
    if (m) {
      const file = await fetch(m[1]);
      if (file.ok) return file.arrayBuffer();
    }
  }
  return fetchFontsource(family, weight);
}

function slug(family: string): string {
  return family.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function fetchFontsource(family: string, weight: number): Promise<ArrayBuffer> {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/${slug(family)}@5.2.5/latin-${weight}-normal.ttf`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Could not load Google Font "${family}"`);
  return r.arrayBuffer();
}

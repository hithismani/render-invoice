/**
 * Satori SVG (embedFont:false) → vector PDF.
 * Path geometry (fills, strokes, radius), selectable text, clickable URL/email + edit link.
 * Never wraps a full-page PNG. Logo/signature data-URLs are content images only.
 */
import {
  PDFDocument,
  PDFName,
  PDFString,
  rgb,
  StandardFonts,
  type PDFFont,
  type PDFPage,
  type RGB,
} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const A4_W = 595;
const A4_H = 842;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const URL_RE = /^(https?:\/\/|www\.)\S+$/i;

export async function satoriSvgToPdf(
  svg: string,
  fonts: {
    regular: ArrayBuffer | Uint8Array;
    bold: ArrayBuffer | Uint8Array;
    /** Optional glyph fallback (e.g. full Inter) for currency / punctuation. */
    fallbackRegular?: ArrayBuffer | Uint8Array;
    fallbackBold?: ArrayBuffer | Uint8Array;
  },
  opts: {
    fitToA4?: boolean;
    editUrl?: string;
  } = {},
): Promise<Uint8Array> {
  const dim = svg.match(/<svg[^>]*width="([^"]+)"[^>]*height="([^"]+)"/);
  if (!dim) throw new Error('SVG missing width/height');
  const svgW = parseFloat(dim[1]);
  const svgH = parseFloat(dim[2]);

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const toBytes = (data: ArrayBuffer | Uint8Array): Uint8Array =>
    data instanceof Uint8Array ? data : new Uint8Array(data);

  let regular: PDFFont;
  let bold: PDFFont;
  let fallbackRegular: PDFFont | null = null;
  let fallbackBold: PDFFont | null = null;
  try {
    regular = await pdf.embedFont(toBytes(fonts.regular), { subset: true });
    bold = await pdf.embedFont(toBytes(fonts.bold), { subset: true });
  } catch (err) {
    console.warn('[satoriSvgToPdf] custom font embed failed, falling back to Helvetica:', err);
    regular = await pdf.embedFont(StandardFonts.Helvetica);
    bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  }
  if (fonts.fallbackRegular) {
    try {
      fallbackRegular = await pdf.embedFont(toBytes(fonts.fallbackRegular), { subset: true });
      fallbackBold = fonts.fallbackBold
        ? await pdf.embedFont(toBytes(fonts.fallbackBold), { subset: true })
        : fallbackRegular;
    } catch {
      /* primary only */
    }
  }

  const page = pdf.addPage([svgW, svgH]);
  const links = await paint(
    svg,
    page,
    svgW,
    svgH,
    regular,
    bold,
    fallbackRegular,
    fallbackBold,
    pdf,
    fillsFromDefs(svg),
  );

  for (const L of links) {
    stampLink(pdf, L.uri, L.rect);
  }
  // Full-width hit target over the bottom edit bar drawn by the template.
  const EDIT_BAR_H = 28;
  if (opts.editUrl) {
    stampLink(pdf, opts.editUrl, { x: 0, y: 0, w: svgW, h: EDIT_BAR_H });
  }

  const raw = await pdf.save();

  // Always land on portrait A4 *width*.
  // - autoSize (fitToA4=false): height = max(A4, scaled content) - short invoices
  //   get a full A4 sheet; tall ones grow past A4 but stay A4-wide portrait.
  // - fitToA4=true: scale uniformly onto one A4 page (may shrink).
  const out = await PDFDocument.create();
  const [embedded] = await out.embedPdf(raw);

  let scale: number;
  let drawW: number;
  let drawH: number;
  let pageW: number;
  let pageH: number;
  let ox: number;
  let oy: number;

  if (opts.fitToA4) {
    scale = Math.min(A4_W / svgW, A4_H / svgH);
    drawW = svgW * scale;
    drawH = svgH * scale;
    pageW = A4_W;
    pageH = A4_H;
    ox = (A4_W - drawW) / 2;
    oy = A4_H - drawH;
  } else {
    scale = A4_W / svgW;
    drawW = A4_W;
    drawH = svgH * scale;
    pageW = A4_W;
    pageH = Math.max(A4_H, drawH);
    ox = 0;
    oy = pageH - drawH;
  }

  const pageOut = out.addPage([pageW, pageH]);
  pageOut.drawPage(embedded, { x: ox, y: oy, width: drawW, height: drawH });
  for (const L of links) {
    stampLink(out, L.uri, {
      x: ox + L.rect.x * scale,
      y: oy + L.rect.y * scale,
      w: L.rect.w * scale,
      h: L.rect.h * scale,
    });
  }
  if (opts.editUrl) {
    stampLink(out, opts.editUrl, { x: ox, y: oy, w: drawW, h: EDIT_BAR_H * scale });
  }
  return out.save();
}

function stampLink(
  pdf: PDFDocument,
  uri: string,
  rect: { x: number; y: number; w: number; h: number },
) {
  if (rect.w <= 0 || rect.h <= 0) return;
  const page = pdf.getPages()[0];
  const annot = pdf.context.obj({
    Type: 'Annot',
    Subtype: PDFName.of('Link'),
    Rect: [rect.x, rect.y, rect.x + Math.max(rect.w, 4), rect.y + Math.max(rect.h, 4)],
    Border: [0, 0, 0],
    C: [0.15, 0.39, 0.92],
    A: {
      Type: 'Action',
      S: 'URI',
      URI: PDFString.of(uri),
    },
  });
  page.node.addAnnot(pdf.context.register(annot));
}

function fillsFromDefs(svg: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of svg.matchAll(/<(linearGradient|radialGradient)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
    const id = attrs(m[2]).id;
    const stop = m[3].match(/stop-color="([^"]+)"/);
    if (id && stop) map.set(id, stop[1]);
  }
  for (const m of svg.matchAll(/<pattern\b([^>]*)>([\s\S]*?)<\/pattern>/g)) {
    const id = attrs(m[1]).id;
    const url = m[2].match(/fill="url\(#([^)]+)\)"/);
    const stop = m[2].match(/stop-color="([^"]+)"/);
    if (id && url && map.has(url[1])) map.set(id, map.get(url[1])!);
    else if (id && stop) map.set(id, stop[1]);
  }
  return map;
}

function attrs(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([a-zA-Z0-9:-]+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) out[m[1]] = m[2];
  return out;
}

function num(a: Record<string, string>, k: string, d = 0): number {
  const v = parseFloat(a[k] ?? '');
  return Number.isFinite(v) ? v : d;
}

function isNearWhite(fill?: string): boolean {
  if (!fill) return false;
  const c = fill.toLowerCase().trim();
  if (c === '#fff' || c === '#ffffff' || c === 'white') return true;
  if (/^#f{3,6}$/i.test(c)) return true;
  const m = c.match(/^#([0-9a-f]{6})/i);
  if (m) {
    const n = parseInt(m[1], 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return r > 250 && g > 250 && b > 250;
  }
  return false;
}

function isPageBackdrop(a: Record<string, string>, svgW: number, svgH: number): boolean {
  return num(a, 'x') <= 1 && num(a, 'y') <= 1 && num(a, 'width') >= svgW - 2 && num(a, 'height') >= svgH - 2;
}

function resolveFill(raw: string | undefined, fills: Map<string, string>): string | undefined {
  if (!raw) return raw;
  if (raw.startsWith('url(#')) {
    const id = raw.slice(5, -1);
    return fills.get(id) || raw;
  }
  return raw;
}

type LinkHit = { uri: string; rect: { x: number; y: number; w: number; h: number } };
type TextFrag = { x: number; y: number; w: number; h: number; text: string; fill: string };

/** Draw text using primary font, falling back per-glyph for missing currency/etc. */
function drawTextRun(
  page: PDFPage,
  text: string,
  x0: number,
  y: number,
  size: number,
  primary: PDFFont,
  fallback: PDFFont | null,
  color: RGB,
  opacity: number,
  /** When set, advances are scaled so the run matches Satori's laid-out width. */
  targetWidth: number,
  letterSpacing: number,
): number {
  const chars = [...text];
  if (chars.length === 0) return 0;

  type Slot = { ch: string; font: PDFFont; w: number };
  const slots: Slot[] = chars.map((ch) => {
    for (const font of fallback ? [primary, fallback] : [primary]) {
      try {
        const w = font.widthOfTextAtSize(ch, size);
        // .notdef / missing often reports 0 width
        if (w > 0.01) return { ch, font, w };
      } catch {
        /* try next */
      }
    }
    // Last resort: advance half-em so layout doesn't collapse
    return { ch, font: primary, w: size * 0.5 };
  });

  // Satori/CSS letter-spacing is added after every glyph (including the last),
  // and the SVG width attribute includes that trailing tracking.
  const natural =
    slots.reduce((s, g) => s + g.w, 0) + letterSpacing * chars.length;
  // Micro-fit to Satori width when metrics drift slightly. Avoid large scales
  // (those usually mean a missing glyph we already substituted).
  let scale = 1;
  if (targetWidth > 0 && natural > 0) {
    const ratio = targetWidth / natural;
    if (ratio > 0.9 && ratio < 1.1) scale = ratio;
  }

  let x = x0;
  for (let i = 0; i < slots.length; i++) {
    const g = slots[i];
    try {
      page.drawText(g.ch, { x, y, size, font: g.font, color, opacity });
    } catch {
      if (fallback && g.font !== fallback) {
        try {
          page.drawText(g.ch, { x, y, size, font: fallback, color, opacity });
        } catch {
          /* skip glyph */
        }
      }
    }
    // Advance glyph width + tracking after every character (CSS behavior).
    x += (g.w + letterSpacing) * scale;
  }
  return targetWidth > 0 ? targetWidth : x - x0;
}

async function paint(
  svg: string,
  page: PDFPage,
  svgW: number,
  svgH: number,
  regular: PDFFont,
  bold: PDFFont,
  fallbackRegular: PDFFont | null,
  fallbackBold: PDFFont | null,
  pdf: PDFDocument,
  fills: Map<string, string>,
): Promise<LinkHit[]> {
  const visual = svg.replace(/<(mask|clipPath)\b[\s\S]*?<\/\1>/g, '');
  const tagRe = /<(rect|text|image|line|path)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g;
  let m: RegExpExecArray | null;
  const images: Promise<void>[] = [];
  const frags: TextFrag[] = [];

  while ((m = tagRe.exec(visual))) {
    const [, tag, rawAttrs, body] = m;
    const a = attrs(rawAttrs);
    a.fill = resolveFill(a.fill, fills) || a.fill;
    const stroke = a.stroke && a.stroke !== 'none' ? parseColor(a.stroke) : null;
    const fillRaw = a.fill && a.fill !== 'none' ? a.fill : undefined;
    const fill = fillRaw ? parseColor(fillRaw) : null;

    if (tag === 'text') {
      const text = decode(body || '');
      if (!text) continue;
      const size = num(a, 'font-size', 12);
      const weightRaw = a['font-weight'] || '400';
      const weightNum = Number(weightRaw);
      const useBold =
        weightRaw === 'bold' ||
        weightRaw === 'bolder' ||
        (Number.isFinite(weightNum) && weightNum >= 500);
      const font = useBold ? bold : regular;
      const fallback = useBold ? fallbackBold : fallbackRegular;
      const tracking = num(a, 'letter-spacing', 0);
      const fillC = fill ?? { color: rgb(0, 0, 0), opacity: 1 };
      const opacity = a.opacity != null ? Number(a.opacity) * (fillC.opacity ?? 1) : fillC.opacity;
      const x0 = num(a, 'x');
      const ySvg = num(a, 'y');
      const yPdf = svgH - ySvg;
      const h = num(a, 'height', size * 1.2);
      const targetW = num(a, 'width', 0);

      // Always run through glyph-aware drawer so ₹ / • / — survive latin subsets,
      // and so letter-spacing matches Satori's precomputed width.
      const runW = drawTextRun(
        page,
        text,
        x0,
        yPdf,
        size,
        font,
        fallback,
        fillC.color,
        opacity ?? 1,
        targetW,
        tracking,
      );
      frags.push({ x: x0, y: yPdf, w: runW || targetW || size, h, text, fill: a.fill || '#000' });
      continue;
    }

    if (tag === 'image') {
      images.push(drawImageEl(page, a, svgH, pdf));
      continue;
    }

    if (tag === 'line') {
      drawLineEl(page, a, svgH);
      continue;
    }

    // Skip Satori overflow white layout boxes (not real design bg)
    if (isNearWhite(fillRaw) && !stroke && !isPageBackdrop(a, svgW, svgH)) continue;

    if (tag === 'path' && a.d) {
      // Absolute SVG coords → must pin origin at 0,0 (pdf-lib defaults to page cursor)
      drawSvgPathAbs(page, a.d, svgH, fill, stroke, num(a, 'stroke-width', stroke ? 1 : 0));
      continue;
    }

    if (tag === 'rect') {
      const w = num(a, 'width');
      const h = num(a, 'height');
      if (w <= 0 || h <= 0) continue;
      page.drawRectangle({
        x: num(a, 'x'),
        y: svgH - num(a, 'y') - h,
        width: w,
        height: h,
        color: fill?.color,
        opacity: fill?.opacity ?? 1,
        borderColor: stroke?.color,
        borderWidth: stroke ? Math.max(num(a, 'stroke-width', 1), 0.5) : 0,
        borderOpacity: stroke?.opacity ?? 1,
      });
    }
  }

  await Promise.all(images);
  return mergeLinkHits(frags);
}

/** Merge adjacent *blue* text frags into clickable emails/URLs (skip black labels). */
function mergeLinkHits(frags: TextFrag[]): LinkHit[] {
  const hits: LinkHit[] = [];
  const used = new Set<number>();
  // Only consider link-colored fragments so "Email:" labels stay out.
  const blue = frags
    .map((f, idx) => ({ f, idx }))
    .filter(({ f }) => isBlue(f.fill))
    .sort((a, b) => a.f.y - b.f.y || a.f.x - b.f.x);

  for (let i = 0; i < blue.length; i++) {
    if (used.has(blue[i].idx)) continue;
    const seed = blue[i];
    if (!/[.@a-z0-9]/i.test(seed.f.text)) continue;

    const line = blue.filter(
      (b) => !used.has(b.idx) && Math.abs(b.f.y - seed.f.y) <= 2,
    ).sort((a, b) => a.f.x - b.f.x);

    const seedLineIdx = line.findIndex((x) => x.idx === seed.idx);
    if (seedLineIdx < 0) continue;
    let lo = seedLineIdx;
    let hi = seedLineIdx;
    while (lo > 0 && line[lo].f.x - (line[lo - 1].f.x + line[lo - 1].f.w) <= 10) lo--;
    while (hi < line.length - 1 && line[hi + 1].f.x - (line[hi].f.x + line[hi].f.w) <= 10) hi++;

    const run = line.slice(lo, hi + 1);
    const cleaned = run.map((r) => r.f.text).join('').replace(/\s+/g, '');
    // Drop table headers etc. that happen to be blue
    if (cleaned.length < 4 || !/[.@]|www/i.test(cleaned)) {
      continue;
    }
    let uri: string | null = null;
    if (EMAIL_RE.test(cleaned)) uri = `mailto:${cleaned}`;
    else if (URL_RE.test(cleaned)) uri = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
    if (!uri) continue;

    const x1 = run[0].f.x;
    const x2 = Math.max(...run.map((r) => r.f.x + r.f.w));
    const y = Math.min(...run.map((r) => r.f.y));
    const h = Math.max(...run.map((r) => r.f.h));
    hits.push({ uri, rect: { x: x1, y: y - 2, w: Math.max(x2 - x1, 8), h: Math.max(h, 10) } });
    for (const r of run) used.add(r.idx);
  }
  return hits;
}

function isBlue(fill: string): boolean {
  const c = parseColor(fill);
  if (!c) return false;
  return c.color.blue > 0.55 && c.color.blue > c.color.red + 0.15 && c.color.blue > c.color.green + 0.1;
}

/**
 * pdf-lib drawSvgPath already flips SVG Y via scale(1,-1) around (x,y).
 * Origin (0, svgH) maps absolute Satori path coords into PDF space.
 */
function drawSvgPathAbs(
  page: PDFPage,
  d: string,
  svgH: number,
  fill: { color: RGB; opacity: number } | null,
  stroke: { color: RGB; opacity: number } | null,
  borderWidth: number,
) {
  try {
    const opts: {
      x: number;
      y: number;
      color?: RGB;
      opacity?: number;
      borderColor?: RGB;
      borderWidth: number;
      borderOpacity?: number;
    } = {
      x: 0,
      y: svgH,
      borderWidth: stroke ? Math.max(borderWidth, 0.5) : 0,
    };
    if (fill) {
      opts.color = fill.color;
      opts.opacity = fill.opacity ?? 1;
    }
    if (stroke) {
      opts.borderColor = stroke.color;
      opts.borderOpacity = stroke.opacity ?? 1;
    }
    page.drawSvgPath(d, opts);
  } catch {
    /* malformed path */
  }
}

function drawLineEl(page: PDFPage, a: Record<string, string>, svgH: number) {
  const c = parseColor(a.stroke);
  if (!c) return;
  page.drawLine({
    start: { x: num(a, 'x1'), y: svgH - num(a, 'y1') },
    end: { x: num(a, 'x2'), y: svgH - num(a, 'y2') },
    thickness: Math.max(num(a, 'stroke-width', 1), 0.5),
    color: c.color,
    opacity: c.opacity,
  });
}

async function drawImageEl(page: PDFPage, a: Record<string, string>, svgH: number, pdf: PDFDocument) {
  const href = a.href || a['xlink:href'];
  if (!href?.startsWith('data:')) return;
  const w = num(a, 'width');
  const h = num(a, 'height');
  if (w <= 0 || h <= 0) return;
  const comma = href.indexOf(',');
  if (comma < 0) return;
  const meta = href.slice(5, comma);
  try {
    const bytes = Uint8Array.from(atob(href.slice(comma + 1)), (c) => c.charCodeAt(0));
    const img =
      meta.includes('png') || meta.includes('image/png')
        ? await pdf.embedPng(bytes)
        : await pdf.embedJpg(bytes);
    page.drawImage(img, {
      x: num(a, 'x'),
      y: svgH - num(a, 'y') - h,
      width: w,
      height: h,
    });
  } catch {
    /* skip */
  }
}

function parseColor(raw?: string): { color: RGB; opacity: number } | null {
  if (!raw || raw === 'none' || raw.startsWith('url(')) return null;
  if (raw.startsWith('#')) {
    const h = raw.slice(1);
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    if (full.length < 6) return null;
    const opacity = full.length >= 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1;
    return {
      color: rgb(
        parseInt(full.slice(0, 2), 16) / 255,
        parseInt(full.slice(2, 4), 16) / 255,
        parseInt(full.slice(4, 6), 16) / 255,
      ),
      opacity,
    };
  }
  const m = raw.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return {
    color: rgb(+m[1] / 255, +m[2] / 255, +m[3] / 255),
    opacity: m[4] != null ? +m[4] : 1,
  };
}

function decode(s: string): string {
  return s
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

/**
 * Satori-safe markdown renderer.
 *
 * Why we have this: Satori's CSS subset doesn't support inline HTML markup
 * cleanly — `<br>` inside `<span>` is unreliable, lists (`<ul>`/`<ol>`/`<li>`)
 * aren't natively supported, and bare whitespace text nodes between sibling
 * spans get collapsed. So instead of feeding markdown's HTML output into
 * Satori (which breaks), we lex markdown ourselves and emit a flex-only
 * structure: every block becomes a flex column, every "logical line" is a
 * separate flex child, and inline emphasis renders as styled `<span>`
 * children of a flex row. This is the same discipline we use elsewhere in
 * the template (see Field).
 *
 * Supported subset:
 *   - paragraphs, hard line breaks (single `\n` counts)
 *   - **bold**, *italic*, `code`, ~~strike~~
 *   - [links](url) and autolinked emails/URLs
 *   - unordered lists (•) and ordered lists (1.)
 *   - blockquotes (left border, padded)
 *   - headings h1–h7 (`#` … `#######`), sized relative to base fontSize
 *   - size overrides:
 *       {@18} line/block at 18px
 *       {@18:inline span}
 *       {@p:12} same as {@12} (paragraph size alias)
 *
 * Intentionally NOT supported:
 *   - tables (don't fit Satori's flex model — use the line-items table instead)
 *   - images, HTML passthrough, footnotes
 */

import React from 'react';
import { marked, type Tokens } from 'marked';

marked.setOptions({ gfm: true, breaks: true });

interface MarkdownProps {
  text: string;
  /** Optional base style applied to the outermost container. Useful for
   *  setting fontSize / color from the surrounding context. */
  style?: React.CSSProperties;
  /** Tighter vertical rhythm for table cells / meta fields. */
  compact?: boolean;
}

/** h1..h7 multipliers against the surrounding base fontSize. */
const HEADING_SCALE: Record<number, number> = {
  1: 1.75,
  2: 1.5,
  3: 1.3,
  4: 1.15,
  5: 1.0,
  6: 0.9,
  7: 0.8,
};

function baseFontSize(style?: React.CSSProperties): number {
  const raw = style?.fontSize;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const n = parseFloat(raw);
    if (Number.isFinite(n)) return n;
  }
  return 13;
}

// Private-use sentinels — marked leaves these alone (unlike HTML comments,
// which get swallowed as raw html blocks along with following text).
const SZ_OPEN = '\uE010'; // block size open  SZ_OPEN + "18" + SZ_CLOSE
const SZ_CLOSE = '\uE011';
const H_OPEN = '\uE012'; // heading depth override
const H_CLOSE = '\uE013';
const IN_OPEN = '\uE000'; // inline size IN_OPEN + size + IN_MID + text + IN_END
const IN_MID = '\uE001';
const IN_END = '\uE002';

/**
 * Preprocess custom size syntax and h7 (marked only does h1–h6).
 *   {@18}rest of line     → block size marker
 *   {@p:18}rest           → alias for paragraph size
 *   {@18:inline text}     → inline size span
 *   ####### heading       → h6 with depth-7 scale marker
 */
function preprocess(text: string): string {
  let s = String(text ?? '');
  // h7 → h6 with a depth marker the renderer understands
  s = s.replace(/^(\s{0,3})#######\s+/gm, `$1###### ${H_OPEN}7${H_CLOSE} `);
  // inline size {@18:text} first so bare {@n} does not steal the colon form
  s = s.replace(/\{@(\d+(?:\.\d+)?):([^}]*)\}/g, (_m, size: string, inner: string) => {
    return `${IN_OPEN}${size}${IN_MID}${inner}${IN_END}`;
  });
  // line-start bare {@18}/{@p:18} → block size (survives codespans on the same line)
  s = s.replace(/^(\s*)\{@(?:p:)?(\d+(?:\.\d+)?)\}\s*/gm, `$1${SZ_OPEN}$2${SZ_CLOSE}`);
  // mid/end-of-line bare markers: size the rest, or strip if nothing left (never print `{@11}`)
  s = s.replace(/\{@(?:p:)?(\d+(?:\.\d+)?)\}([^\n]*)/g, (_m, size: string, rest: string) => {
    const body = String(rest)
      .replace(/\{@(?:p:)?\d+(?:\.\d+)?\}/g, '')
      .replace(/^\s+/, '')
      .replace(/\s+$/, '');
    if (!body) return '';
    return `${IN_OPEN}${size}${IN_MID}${body}${IN_END}`;
  });
  return s;
}

export function Markdown({ text, style, compact }: MarkdownProps): React.ReactElement {
  if (!text) return <div style={{ display: 'flex', ...style }} />;
  const base = baseFontSize(style);
  const tokens = marked.lexer(preprocess(text));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 2 : 6, ...style, fontSize: base }}>
      {tokens.map((tok, i) => renderBlock(tok, i, base))}
    </div>
  );
}

/** Hide label when key is fully wrapped in `@…@` (after trim). Else strip stray `@`. */
export function displayKey(key: string): string {
  const k = String(key ?? '').trim();
  if (!k) return '';
  if (k.startsWith('@') && k.endsWith('@')) return '';
  return k.replace(/@/g, '');
}

/** True when value needs block markdown (lists, headings, multi-line, …). */
export function needsBlockMarkdown(text: string): boolean {
  const s = String(text ?? '');
  return /[\n\r]|^[ \t]{0,3}#{1,7}\s|^[ \t]*([-*+]|\d+\.)\s|^[ \t]*>|```|\{@(?:p:)?\d/.test(s);
}

/** Strip markdown / size markers down to plain text (copyright, filenames, …). */
export function stripMarkdown(text: string): string {
  if (!text) return '';
  let s = String(text);
  s = s.replace(/\{@(?:p:)?\d+(?:\.\d+)?\}/g, '');
  s = s.replace(/\{@\d+(?:\.\d+)?:([^}]*)\}/g, '$1');
  s = s.replace(/^#{1,7}\s+/gm, '');
  s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  s = s.replace(/`{1,3}([^`]*)`{1,3}/g, '$1');
  s = s.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');
  s = s.replace(/_{1,3}([^_]+)_{1,3}/g, '$1');
  s = s.replace(/~~([^~]+)~~/g, '$1');
  s = s.replace(/^>\s?/gm, '');
  s = s.replace(/^[\s]*[-*+]\s+/gm, '');
  s = s.replace(/^[\s]*\d+\.\s+/gm, '');
  s = s.replace(/\n+/g, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

const SIZE_RE = new RegExp(`^${SZ_OPEN}([\\d.]+)${SZ_CLOSE}\\s*`);
const H_RE = new RegExp(`${H_OPEN}(\\d+)${H_CLOSE}`);

function peelSizePrefix(text: string): { size?: number; text: string } {
  const m = text.match(SIZE_RE);
  if (!m) return { text };
  return { size: parseFloat(m[1]), text: text.slice(m[0].length) };
}

function consumeSizeMarker(tokens: Tokens.Generic[] | undefined): { size?: number; rest: Tokens.Generic[] } {
  if (!tokens || tokens.length === 0) return { rest: tokens || [] };
  const rest = [...tokens];
  let size: number | undefined;

  if (rest.length > 0 && rest[0].type === 'text') {
    const t = rest[0] as Tokens.Text;
    // Nested inline tokens on text (rare)
    if (t.tokens && t.tokens.length > 0) {
      const inner = consumeSizeMarker(t.tokens as Tokens.Generic[]);
      if (inner.size != null) {
        size = inner.size;
        rest[0] = { ...t, tokens: inner.rest } as Tokens.Text;
        return { size, rest };
      }
    }
    const peeled = peelSizePrefix(String(t.text || ''));
    if (peeled.size != null) {
      size = peeled.size;
      if (peeled.text) rest[0] = { ...t, text: peeled.text, raw: peeled.text } as Tokens.Text;
      else rest.shift();
    }
  }
  return { size, rest };
}

function headingDepth(tok: Tokens.Heading): number {
  const raw = String(tok.raw || '') + ' ' + String(tok.text || '');
  const m = raw.match(H_RE);
  if (m) return Math.min(Math.max(parseInt(m[1], 10), 1), 7);
  const first = tok.tokens?.[0];
  if (first && first.type === 'text' && H_RE.test(String((first as Tokens.Text).text || ''))) {
    const mm = String((first as Tokens.Text).text).match(H_RE);
    if (mm) return Math.min(Math.max(parseInt(mm[1], 10), 1), 7);
  }
  return Math.min(Math.max(tok.depth || 1, 1), 7);
}

function renderBlock(tok: Tokens.Generic, key: number, base: number): React.ReactNode {
  switch (tok.type) {
    case 'paragraph': {
      const p = tok as Tokens.Paragraph;
      const { size, rest } = consumeSizeMarker(p.tokens as Tokens.Generic[] | undefined);
      return <Paragraph key={key} tokens={rest} fontSize={size ?? base} />;
    }

    case 'heading': {
      const h = tok as Tokens.Heading;
      const depth = headingDepth(h);
      // Strip depth sentinel from inline tokens before render
      const cleaned = (h.tokens || []).map((t) => {
        if (t.type !== 'text') return t;
        const tt = t as Tokens.Text;
        const next = String(tt.text || '').replace(new RegExp(`${H_OPEN}\\d+${H_CLOSE}\\s*`, 'g'), '');
        return { ...tt, text: next, raw: next } as Tokens.Text;
      }) as Tokens.Generic[];
      const { size: override, rest } = consumeSizeMarker(cleaned);
      const fontSize = override ?? Math.round(base * (HEADING_SCALE[depth] ?? 1) * 10) / 10;
      return (
        <div
          key={key}
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            fontSize,
            fontWeight: 700,
            marginTop: depth <= 2 ? 4 : 2,
          }}
        >
          {renderInline(rest, fontSize, {})}
        </div>
      );
    }

    case 'list': {
      const list = tok as Tokens.List;
      return (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 4 }}>
          {list.items.map((item, i) => {
            const start = typeof list.start === 'number' ? list.start : 1;
            const marker = list.ordered ? `${start + i}.` : '•';
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'row', gap: 8, minWidth: 0 }}>
                <span style={{ flexShrink: 0, color: '#71717a' }}>{marker}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  {(item.tokens || []).map((sub, j) => renderBlock(sub, j, base))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'blockquote': {
      const bq = tok as Tokens.Blockquote;
      return (
        <div
          key={key}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            paddingLeft: 12,
            borderLeft: '3px solid #e4e4e7',
            color: '#52525b',
          }}
        >
          {(bq.tokens || []).map((sub, i) => renderBlock(sub, i, base))}
        </div>
      );
    }

    case 'code': {
      const code = tok as Tokens.Code;
      return (
        <div
          key={key}
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 10,
            borderRadius: 4,
            backgroundColor: '#f4f4f5',
            fontFamily: 'monospace',
            fontSize: Math.max(11, base - 1),
            color: '#27272a',
          }}
        >
          {code.text.split('\n').map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>
              {line || ' '}
            </div>
          ))}
        </div>
      );
    }

    case 'space':
      return null;

    case 'hr':
      return (
        <div
          key={key}
          style={{ display: 'flex', borderTop: '1px solid #e4e4e7', marginTop: 4, marginBottom: 4 }}
        />
      );

    case 'text': {
      const t = tok as Tokens.Text;
      const { size, rest } = consumeSizeMarker(
        (t.tokens as Tokens.Generic[] | undefined) ||
          ([{ type: 'text', text: t.text, raw: t.text }] as unknown as Tokens.Generic[]),
      );
      return <Paragraph key={key} tokens={rest} fontSize={size ?? base} />;
    }

    case 'html':
      return null;

    default:
      if ('text' in tok && typeof tok.text === 'string') {
        return (
          <div key={key} style={{ display: 'flex' }}>
            {tok.text}
          </div>
        );
      }
      return null;
  }
}

/**
 * Paragraph = a block whose inline tokens may contain hard line breaks
 * (`<br>`) and styled spans. We split into "logical lines" first (each
 * gets its own flex row), then within a line we render styled inline
 * tokens as flex-row siblings. This is the discipline that survives
 * Satori's inline-flow quirks.
 */
function Paragraph({
  tokens,
  fontSize,
}: {
  tokens: Tokens.Generic[];
  fontSize: number;
}): React.ReactElement {
  const lines = splitOnBreaks(tokens);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize }}>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            minWidth: 0,
            fontSize,
            // Per-word spans (see renderInline) — gap is the only reliable
            // inter-word space under Satori's flex model.
            gap: 4,
          }}
        >
          {renderInline(line, fontSize, {})}
        </div>
      ))}
    </div>
  );
}

function splitOnBreaks(tokens: Tokens.Generic[]): Tokens.Generic[][] {
  const out: Tokens.Generic[][] = [[]];
  for (const t of tokens) {
    if (t.type === 'br') out.push([]);
    else out[out.length - 1].push(t);
  }
  return out.filter((ln) => ln.length > 0);
}

/** Satori's flex layout drops leading/trailing whitespace from sibling
 *  inline children. So when a text token sits next to a styled token
 *  (e.g. "covers " + **bold**), the boundary space disappears and we get
 *  "covers**bold**". Converting boundary spaces to NBSP preserves them
 *  without affecting wrapping behavior between words. */
function preserveBoundarySpaces(text: string): string {
  return text
    .replace(/^( +)/, (_: string, sp: string) => '\u00a0'.repeat(sp.length))
    .replace(/( +)$/, (_: string, sp: string) => '\u00a0'.repeat(sp.length));
}

/** Expand inline size sentinels into synthetic runs. */
function expandSizeSentinels(text: string): Array<{ kind: 'text'; text: string } | { kind: 'size'; size: number; text: string }> {
  const out: Array<{ kind: 'text'; text: string } | { kind: 'size'; size: number; text: string }> = [];
  const re = new RegExp(`${IN_OPEN}([\\d.]+)${IN_MID}([^${IN_END}]*)${IN_END}`, 'g');
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) });
    out.push({ kind: 'size', size: parseFloat(m[1]), text: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) });
  if (out.length === 0) out.push({ kind: 'text', text });
  return out;
}

let _spanKey = 0;
function nextKey(): number {
  return _spanKey++;
}

/** One flex item per word so Satori can wrap at word boundaries. */
function wordSpans(text: string, style: React.CSSProperties): React.ReactNode[] {
  const cleaned = text
    .replace(new RegExp(`${SZ_OPEN}[\\d.]+${SZ_CLOSE}`, 'g'), '')
    .replace(new RegExp(`${H_OPEN}\\d+${H_CLOSE}`, 'g'), '');
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (
      <span key={nextKey()} style={style}>
        {w}
      </span>
    ));
}

/**
 * Flatten inline markdown to per-word `<span>`s (with style accumulated through
 * bold/italic/link/…). Nested wrapper spans are intentionally avoided — Satori
 * won't break inside a multi-word span, so emphasis must paint onto each word.
 */
function renderInline(
  tokens: Tokens.Generic[],
  _baseSize: number,
  style: React.CSSProperties,
): React.ReactNode[] {
  return tokens.flatMap((tok) => {
    switch (tok.type) {
      case 'text': {
        const t = tok as Tokens.Text;
        if (t.tokens && t.tokens.length > 0) {
          return renderInline(t.tokens as Tokens.Generic[], _baseSize, style);
        }
        const parts = expandSizeSentinels(t.text || '');
        return parts.flatMap((part) => {
          if (part.kind === 'size') {
            return wordSpans(part.text, { ...style, fontSize: part.size });
          }
          return wordSpans(part.text, style);
        });
      }
      case 'strong': {
        const s = tok as Tokens.Strong;
        return renderInline((s.tokens || []) as Tokens.Generic[], _baseSize, {
          ...style,
          fontWeight: 700,
        });
      }
      case 'em': {
        const e = tok as Tokens.Em;
        return renderInline((e.tokens || []) as Tokens.Generic[], _baseSize, {
          ...style,
          fontStyle: 'italic',
        });
      }
      case 'codespan': {
        const c = tok as Tokens.Codespan;
        return wordSpans(c.text, {
          ...style,
          fontFamily: 'monospace',
          backgroundColor: '#f4f4f5',
          padding: '0 3px',
          borderRadius: 2,
        });
      }
      case 'link': {
        const l = tok as Tokens.Link;
        return renderInline((l.tokens || []) as Tokens.Generic[], _baseSize, {
          ...style,
          color: '#2563eb',
          textDecoration: 'underline',
        });
      }
      case 'del': {
        const d = tok as Tokens.Del;
        return renderInline((d.tokens || []) as Tokens.Generic[], _baseSize, {
          ...style,
          textDecoration: 'line-through',
        });
      }
      case 'br':
        return [];
      case 'escape': {
        const e = tok as Tokens.Escape;
        return wordSpans(e.text, style);
      }
      case 'html':
        return [];
      default:
        if ('text' in tok && typeof tok.text === 'string') {
          return wordSpans(tok.text, style);
        }
        return [];
    }
  });
}

/**
 * Inline markdown as a flat list of word spans — for embedding inside a parent
 * flex-wrap row (e.g. Field: `Label:` + words share one wrapping line).
 */
export function inlineMarkdownWords(
  text: string,
  style: React.CSSProperties = {},
): React.ReactNode[] {
  if (!text) return [];
  try {
    const tokens = marked.lexer(preprocess(String(text)));
    const out: React.ReactNode[] = [];
    const base = baseFontSize(style);
    for (const tok of tokens) {
      if (tok.type === 'paragraph' || tok.type === 'text' || tok.type === 'heading') {
        const raw =
          tok.type === 'heading'
            ? ((tok as Tokens.Heading).tokens as Tokens.Generic[] | undefined)
            : tok.type === 'paragraph'
              ? ((tok as Tokens.Paragraph).tokens as Tokens.Generic[] | undefined)
              : ([{ type: 'text', text: (tok as Tokens.Text).text, raw: (tok as Tokens.Text).text }] as unknown as Tokens.Generic[]);
        const { size, rest } = consumeSizeMarker(raw);
        const fs = size ?? (tok.type === 'heading' ? Math.round(base * (HEADING_SCALE[headingDepth(tok as Tokens.Heading)] ?? 1) * 10) / 10 : base);
        const st: React.CSSProperties = {
          ...style,
          fontSize: fs,
          ...(tok.type === 'heading' ? { fontWeight: 700 } : null),
        };
        for (const line of splitOnBreaks(rest)) {
          out.push(...renderInline(line, fs, st));
        }
      } else if (tok.type === 'space') {
        continue;
      } else {
        // lists / quotes etc. — flatten plain text fallback
        if ('text' in tok && typeof (tok as { text?: string }).text === 'string') {
          out.push(...wordSpans(String((tok as { text: string }).text), style));
        }
      }
    }
    return out;
  } catch {
    return wordSpans(String(text), style);
  }
}

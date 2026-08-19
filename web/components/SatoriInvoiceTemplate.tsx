/**
 * Satori-compatible invoice template (JSX).
 *
 * CRITICAL: Every <div> MUST have explicit display: flex, display: contents,
 * or display: none. Satori does not support default block layout.
 */

import React from 'react';
import { marked, type Tokens } from 'marked';
// Relative import (not `@/schema/...`) so this module resolves cleanly when
// imported from the cf-worker too — the worker's bundler doesn't honor v1's
// tsconfig path aliases.
import type { Invoice } from '../schema/invoiceSchema';
import { Markdown } from './SatoriMarkdown';
import { satoriFontName } from '../lib/invoiceFonts';

const PAGE_WIDTH = 900;

function copyrightOf(inv: Invoice): string {
  const from = inv.invoiceFrom || {};
  const name =
    from['Issued By'] ||
    from['Company'] ||
    from['Legal Name'] ||
    from['Name'] ||
    Object.values(from)[0] ||
    '';
  const dateStr =
    inv.metaTop?.['Invoice Date'] ||
    inv.metaTop?.['Date'] ||
    inv.metaTop?.['Tax Point'] ||
    '';
  const y = dateStr ? new Date(dateStr).getFullYear() : NaN;
  const year = Number.isFinite(y) ? y : new Date().getFullYear();
  return name ? `© ${year} ${name}. All rights reserved.` : `© ${year}. All rights reserved.`;
}

function displayKey(key: string): string {
  return !key.startsWith('@') || !key.endsWith('@') ? key.replace(/@/g, '') : '';
}

/* ─── Shared components ─── */

function DisclaimerBox(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, marginBottom: 12, padding: 16, borderRadius: 8, backgroundColor: 'rgba(254,252,232,0.9)', border: '1px solid rgba(254,240,138,0.5)' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', width: 18, height: 18, backgroundColor: '#a16207', color: '#ffffff', borderRadius: 4, fontSize: 12, fontWeight: 700, alignItems: 'center', justifyContent: 'center' }}>!</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#854d0e' }}>Notice</span>
      </div>
      <span style={{ fontSize: 12, color: '#a16207' }}>
        RenderInvoice.com does not verify totals, calculations, or tax rates. Please check all line items and legal requirements before sending. To hide this message, check the verification box under Options in the editor.
      </span>
    </div>
  );
}

function BuiltWith(): React.ReactElement {
  return (
    <div style={{ display: 'flex', marginTop: 4, fontSize: 10, color: '#9ca3af' }}>
      Built with RenderInvoice · un-opinionated invoice generator
    </div>
  );
}

function LogoImage({ url, size, fallbackHeight = 40 }: { url?: string; size?: { width: number; height: number }; fallbackHeight?: number }): React.ReactElement | null {
  if (!url) return null;
  return (
    <img src={url} alt="Logo" width={size?.width || fallbackHeight * 3} height={size?.height || fallbackHeight} style={{ objectFit: 'contain' }} />
  );
}

function SignatureImage({ url, size, fallbackWidth = 160 }: { url?: string; size?: { width: number; height: number }; fallbackWidth?: number }): React.ReactElement | null {
  if (!url) return null;
  const w = size?.width || fallbackWidth;
  const h = size?.height || fallbackWidth / 4;
  return <img src={url} alt="Signature" width={w} height={h} style={{ objectFit: 'contain' }} />;
}

/* ─── Table helpers ─── */

/** Heuristic column weight. "Wide" columns (Description, Notes, Item, …) get
 *  more horizontal room than tight numeric ones (Qty, Tax, Total) so the
 *  table doesn't crush long text fields when there are 5+ columns. */
function columnFlex(colName: string): number {
  return /description|item|details|notes|service|task|line\s*item/i.test(colName) ? 2.5 : 1;
}

/** `minWidth: 0` lets cells shrink below their intrinsic content width inside
 *  the flex row (otherwise long unbroken values force the row to overflow).
 *  `wordBreak: 'break-word'` then wraps the long content within the cell. */
const cellOverflow = { minWidth: 0, wordBreak: 'break-word' as const };

function TableHead({ cols, accent }: { cols: string[]; accent: string }): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', padding: '12px 48px', borderBottom: '1px solid #e5e7eb', gap: 8 }}>
      {cols.map((c, i) => (
        <div key={c} style={{ display: 'flex', flex: columnFlex(c), ...cellOverflow, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: accent, fontWeight: 600, textAlign: i === cols.length - 1 ? 'right' : 'left' }}>
          {c}
        </div>
      ))}
    </div>
  );
}

function TableRows({ cols, lineItems }: { cols: string[]; lineItems: Array<Record<string, unknown>> }): React.ReactElement[] {
  return lineItems.map((item, ri) => (
    <div key={ri} style={{ display: 'flex', flexDirection: 'row', padding: '10px 48px', borderBottom: '1px solid #f3f4f6', gap: 8 }}>
      {cols.map((c, i) => {
        const v = item[c];
        return (
          <div key={c} style={{ display: 'flex', flex: columnFlex(c), ...cellOverflow, fontSize: 13, color: '#111827', textAlign: i === cols.length - 1 ? 'right' : 'left' }}>
            {v != null ? String(v) : ''}
          </div>
        );
      })}
    </div>
  ));
}

/* ─── Cancelled badge ─── */

function CancelledBadge({ notes }: { notes?: string }): React.ReactElement {
  return (
    <div style={{ display: 'flex', position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', color: '#ffffff', padding: '8px 16px', fontSize: 13, fontWeight: 600, zIndex: 10 }}>
      {notes || 'Cancelled'}
    </div>
  );
}

/* ─── Label + multi-line value field ───
 *
 * Satori does not faithfully implement inline layout: `<br/>` nested inside
 * `<span>` is unreliable, and bare whitespace text nodes between sibling
 * spans get collapsed. So instead of relying on inline flow, render each
 * visible line as its own flex child, and use flex `gap` for label spacing.
 */
/* ─── Bold party block ───
 *
 * Used by Bold for both "From" and each "To" recipient. Pulls the FIRST
 * key as an uppercase section header (so "Issued By" → "ISSUED BY",
 * "Bill To" → "BILL TO", "Patient" → "PATIENT") and the FIRST value as
 * a prominent line, then renders remaining entries as Field rows. This
 * makes Bold's headers fully dynamic — they reflect whatever keys the
 * caller used, not a hard-coded "Bill to" / "Ship to" guess.
 */
function BoldPartyBlock({
  entries,
  accent,
}: {
  entries: Array<[string, string]>;
  accent: string;
}): React.ReactElement | null {
  if (entries.length === 0) return null;
  const [headerKey, headerValue] = entries[0];
  const rest = entries.slice(1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <div style={{ display: 'flex', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: accent, marginBottom: 4, wordBreak: 'break-word' }}>
        {headerKey}
      </div>
      <div style={{ display: 'flex', fontSize: 14, fontWeight: 600, color: '#18181b', wordBreak: 'break-word' }}>
        {headerValue}
      </div>
      {rest.map(([k, v]) => (
        <Field key={k} label={k} value={v} labelStyle={{ color: '#71717a' }} />
      ))}
    </div>
  );
}

/**
 * Field renders a label + value as a *paragraph*, not a tabular row. When the
 * value wraps, wrapped lines flow back to the left edge of the container
 * (under the label), the way you'd read a printed sentence. This is closer
 * to "**Label:** value continues across multiple lines if it has to" than to
 * a 2-column key/value layout.
 *
 * Implementation: each word becomes its own flex item inside a `flexWrap`
 * row. The label is the first item (nowrap, styled). Subsequent items are
 * per-word value spans separated by `gap: 4`. When the row exceeds the
 * container width, the next word wraps to a new visible line at the left
 * edge — exactly the natural paragraph behavior.
 *
 * Why per-word spans instead of one big span: Satori treats inline spans as
 * non-breakable units. A single `<span>{value}</span>` with multi-word text
 * doesn't word-wrap inside a constrained flex item — it overflows. Splitting
 * to one span per word gives flex layout the break opportunities it needs.
 */
function Field({
  label,
  value,
  labelStyle,
}: {
  label: string;
  value: string;
  labelStyle: React.CSSProperties;
}): React.ReactElement {
  const lines = String(value ?? '').split('\n');
  const [first = '', ...rest] = lines;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 13, color: '#111827', minWidth: 0, gap: 2 }}>
      <FieldLine label={label} value={first} labelStyle={labelStyle} />
      {rest.map((line, i) => (
        <FieldLine key={i} value={line} />
      ))}
    </div>
  );
}

function FieldLine({
  label,
  value,
  labelStyle,
}: {
  label?: string;
  value: string;
  labelStyle?: React.CSSProperties;
}): React.ReactElement {
  const tokens = inlineLexValue(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', minWidth: 0, gap: 4 }}>
      {label && (
        <span style={{ ...labelStyle, whiteSpace: 'nowrap' }}>{`${label}:`}</span>
      )}
      {tokensToWordSpans(tokens, {}, { current: 0 })}
    </div>
  );
}

/** Parse a single-line value as inline markdown. Handles **bold**, *italic*,
 *  `code`, [links](url), ~~strike~~ — anything marked recognizes inline.
 *  Falls back to a plain text token if anything goes wrong, so a stray
 *  unmatched asterisk never breaks the field. */
function inlineLexValue(value: string): Tokens.Generic[] {
  if (!value) return [];
  try {
    const blocks = marked.lexer(value);
    const para = blocks.find((b) => b.type === 'paragraph') as Tokens.Paragraph | undefined;
    if (para?.tokens && para.tokens.length > 0) return para.tokens as Tokens.Generic[];
  } catch {
    // fall through to plain text
  }
  return [{ type: 'text', text: value, raw: value } as unknown as Tokens.Generic];
}

/** Walk inline markdown tokens and emit one `<span>` per word, with inline
 *  style accumulated from any wrapping emphasis (bold/italic/code/link).
 *
 *  Why per-word: Satori's flex-wrap rows wrap on flex-item boundaries, not
 *  inside a span's text. Splitting `<span>"Reasonably Long Corporation"</span>`
 *  into three spans gives the layout three break opportunities. The Field's
 *  parent flex container has `gap: 4` so word spacing is visually preserved.
 */
function tokensToWordSpans(
  tokens: Tokens.Generic[],
  style: React.CSSProperties,
  ctr: { current: number },
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  for (const tok of tokens) {
    switch (tok.type) {
      case 'text': {
        const t = tok as Tokens.Text;
        if (t.tokens && t.tokens.length > 0) {
          out.push(...tokensToWordSpans(t.tokens as Tokens.Generic[], style, ctr));
        } else {
          for (const w of t.text.split(/\s+/).filter(Boolean)) {
            out.push(<span key={ctr.current++} style={style}>{w}</span>);
          }
        }
        break;
      }
      case 'strong': {
        const s = tok as Tokens.Strong;
        out.push(...tokensToWordSpans(s.tokens as Tokens.Generic[], { ...style, fontWeight: 700 }, ctr));
        break;
      }
      case 'em': {
        const e = tok as Tokens.Em;
        out.push(...tokensToWordSpans(e.tokens as Tokens.Generic[], { ...style, fontStyle: 'italic' }, ctr));
        break;
      }
      case 'codespan': {
        const c = tok as Tokens.Codespan;
        for (const w of c.text.split(/\s+/).filter(Boolean)) {
          out.push(
            <span key={ctr.current++} style={{ ...style, fontFamily: 'monospace', backgroundColor: '#f4f4f5', padding: '0 3px', borderRadius: 2 }}>{w}</span>,
          );
        }
        break;
      }
      case 'link': {
        const l = tok as Tokens.Link;
        out.push(...tokensToWordSpans(l.tokens as Tokens.Generic[], { ...style, color: '#2563eb', textDecoration: 'underline' }, ctr));
        break;
      }
      case 'del': {
        const d = tok as Tokens.Del;
        out.push(...tokensToWordSpans(d.tokens as Tokens.Generic[], { ...style, textDecoration: 'line-through' }, ctr));
        break;
      }
      case 'escape': {
        const e = tok as Tokens.Escape;
        for (const w of e.text.split(/\s+/).filter(Boolean)) {
          out.push(<span key={ctr.current++} style={style}>{w}</span>);
        }
        break;
      }
      default: {
        if ('text' in tok && typeof tok.text === 'string') {
          for (const w of tok.text.split(/\s+/).filter(Boolean)) {
            out.push(<span key={ctr.current++} style={style}>{w}</span>);
          }
        }
      }
    }
  }
  return out;
}

/* ═════════════════════════════════════════════════════════════════
   CLASSIC
   ═════════════════════════════════════════════════════════════════ */

function ClassicTemplate({ invoice }: { invoice: Invoice }): React.ReactElement {
  const accent = invoice.accentColor || '#2563eb';
  const cols = invoice.columns || [];
  const logoPos = invoice.logoPosition || 'center';
  const logoJustify = logoPos === 'left' ? 'flex-start' : logoPos === 'right' ? 'flex-end' : 'center';

  // Spacing strategy: the outer flex column owns ALL vertical rhythm via
  // `gap` and `padding`. Individual sections only declare horizontal padding
  // (`'0 48px'`). That way removing any conditional section (e.g. disclaimer
  // when amountsVerifiedHideDisclaimer:true) doesn't collapse the layout —
  // gap kicks in uniformly between whichever sections do render.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: PAGE_WIDTH, backgroundColor: '#ffffff', fontFamily: satoriFontName(invoice.font), color: '#111827', position: 'relative', paddingTop: 32, paddingBottom: 24, gap: 14 }}>
      {(invoice.isCancelled || invoice.cancelledNotes) && <CancelledBadge notes={invoice.cancelledNotes} />}

      {/* Logo + Heading */}
      {invoice.logoUrl ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: logoJustify, padding: '0 48px', gap: 8 }}>
          <LogoImage url={invoice.logoUrl} size={invoice.logoSize} />
          {invoice.invoiceHeading && <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{invoice.invoiceHeading}</div>}
          {invoice.invoiceDescription && <Markdown text={invoice.invoiceDescription} style={{ fontSize: 14, color: '#4b5563' }} />}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 48px', gap: 8 }}>
          {invoice.invoiceHeading && <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{invoice.invoiceHeading}</div>}
          {invoice.invoiceDescription && <Markdown text={invoice.invoiceDescription} style={{ fontSize: 14, color: '#4b5563' }} />}
        </div>
      )}

      {!invoice.amountsVerifiedHideDisclaimer && (
        <div style={{ display: 'flex', padding: '0 48px' }}>
          <DisclaimerBox />
        </div>
      )}

      {/* From / To — wraps to multiple rows when there are many recipients.
          Each card has flex-basis 220px with grow+shrink, so 1–3 cards share
          a single row evenly, 4–5 wrap into 2 rows, etc. */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: '0 48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 220px', minWidth: 0, border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, gap: 4 }}>
          {Object.entries(invoice.invoiceFrom || {}).map(([k, v]) => (
            <Field key={k} label={displayKey(k)} value={String(v)} labelStyle={{ fontWeight: 500 }} />
          ))}
        </div>
        {(invoice.invoiceTo || []).map((recipient, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 220px', minWidth: 0, border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, gap: 4 }}>
            {Object.entries(recipient).map(([k, v]) => (
              <Field key={k} label={k} value={String(v)} labelStyle={{ fontWeight: 500 }} />
            ))}
          </div>
        ))}
      </div>

      {/* Meta top */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16, padding: '0 48px', flexWrap: 'wrap' }}>
        {Object.entries(invoice.metaTop || {}).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 120 }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{k}:</span>
            <span style={{ fontSize: 13, color: '#1f2937' }}>{String(v)}</span>
          </div>
        ))}
      </div>

      {/* Line items */}
      <div style={{ display: 'flex', flexDirection: 'column', margin: '0 48px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <TableHead cols={cols} accent={accent} />
        {TableRows({ cols, lineItems: invoice.lineItems || [] })}
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '0 48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: 320, gap: 6 }}>
          {(invoice.summary || []).map((s, i) => {
            const isLast = i === (invoice.summary?.length || 0) - 1;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '6px 0', borderTop: isLast ? `2px solid ${accent}` : '1px solid #f3f4f6', marginTop: isLast ? 6 : 0 }}>
                <span style={{ fontSize: 13, color: isLast ? '#111827' : '#6b7280', fontWeight: isLast ? 700 : 400 }}>{s.label}</span>
                <span style={{ fontSize: isLast ? 16 : 13, color: isLast ? accent : '#111827', fontWeight: isLast ? 700 : 500 }}>{String(s.value)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meta bottom */}
      {invoice.metaBottom && Object.keys(invoice.metaBottom).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16, padding: '0 48px', flexWrap: 'wrap' }}>
          {Object.entries(invoice.metaBottom).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 120 }}>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{k}:</span>
              <span style={{ fontSize: 13, color: '#1f2937' }}>{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Signature */}
      {invoice.digitalSignatureUrl && (
        <div style={{ display: 'flex', padding: '0 48px' }}>
          <SignatureImage url={invoice.digitalSignatureUrl} size={invoice.signatureSize} />
        </div>
      )}

      {/* Footer */}
      {(invoice.footerText?.topText || invoice.footerText?.bottomText) && (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 48px', gap: 4 }}>
          {invoice.footerText?.topText && <Markdown text={invoice.footerText.topText} style={{ fontSize: 16, fontWeight: 600, color: '#111827' }} />}
          {invoice.footerText?.bottomText && <Markdown text={invoice.footerText.bottomText} style={{ fontSize: 13, color: '#6b7280' }} />}
        </div>
      )}

      {invoice.invoiceFrom?.Email && (
        <div style={{ display: 'flex', padding: '0 48px' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{invoice.invoiceFrom.Email}</span>
        </div>
      )}

      {invoice.cancelledNotes && (
        <div style={{ display: 'flex', margin: '0 48px', backgroundColor: '#ef4444', color: '#ffffff', padding: '8px 16px', borderRadius: 4 }}>
          <Markdown text={invoice.cancelledNotes} style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }} />
        </div>
      )}

      {/* Copyright */}
      <div style={{ display: 'flex', padding: '0 48px', fontSize: 12, color: '#6b7280' }}>{copyrightOf(invoice)}</div>

      {invoice.showBuiltWith && (
        <div style={{ display: 'flex', padding: '0 48px' }}>
          <BuiltWith />
        </div>
      )}

      {!invoice.amountsVerifiedHideDisclaimer && (
        <div style={{ display: 'flex', padding: '0 48px' }}>
          <DisclaimerBox />
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   BOLD
   ═════════════════════════════════════════════════════════════════ */

function BoldTemplate({ invoice, forExport }: { invoice: Invoice; forExport?: boolean }): React.ReactElement {
  const accent = invoice.accentColor || '#2563eb';
  const cols = invoice.columns || [];
  const logoPos = invoice.logoPosition || 'center';
  const invNum = invoice.metaTop?.['Invoice Number'] || invoice.metaTop?.['Number'] || '';
  const logoRowDir = logoPos === 'right' ? 'row-reverse' : 'row';
  const logoTextAlign = logoPos === 'right' ? 'right' : 'left';

  function darkenHex(hex: string, amount: number): string {
    const clean = hex.replace('#', '');
    const r = Math.max(0, parseInt(clean.substring(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(clean.substring(2, 4), 16) - amount);
    const b = Math.max(0, parseInt(clean.substring(4, 6), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  const darker = darkenHex(accent, 40);

  // Same spacing strategy as Classic: outer column owns vertical rhythm via
  // `gap`. The accent header is the only section that bleeds to the page
  // edges (no horizontal padding), so it lives flush. Everything else is
  // horizontal-padding-only.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: PAGE_WIDTH, backgroundColor: '#ffffff', fontFamily: satoriFontName(invoice.font), color: '#111827', position: 'relative', paddingBottom: 24, gap: 16 }}>
      {(invoice.isCancelled || invoice.cancelledNotes) && <CancelledBadge notes={invoice.cancelledNotes} />}

      {/* Accent header — top corners flat in exports (PDF/SVG/PNG) so the
          page edge looks intentional, but rounded in the live preview to
          match the playground card aesthetic. */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '40px 48px', borderRadius: forExport ? 0 : '8px 8px 0 0', backgroundImage: `linear-gradient(135deg, ${accent}, ${darker})`, color: '#ffffff' }}>
        <div style={{ display: 'flex', flexDirection: logoRowDir, alignItems: 'flex-start', gap: 24 }}>
          {invoice.logoUrl && (
            <div style={{ display: 'flex', backgroundColor: '#ffffff', borderRadius: 6, padding: 8 }}>
              <LogoImage url={invoice.logoUrl} size={invoice.logoSize} fallbackHeight={36} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, textAlign: logoTextAlign }}>
            <div style={{ display: 'flex', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8 }}>
              {invoice.invoiceHeading || 'Invoice'}
            </div>
            {invNum && <div style={{ display: 'flex', fontSize: 36, fontWeight: 800, marginTop: 4 }}>{invNum}</div>}
            {invoice.invoiceDescription && <Markdown text={invoice.invoiceDescription} style={{ fontSize: 14, opacity: 0.8, marginTop: 8, color: '#ffffff' }} />}
          </div>
        </div>
      </div>

      {!invoice.amountsVerifiedHideDisclaimer && (
        <div style={{ display: 'flex', padding: '0 48px' }}>
          <DisclaimerBox />
        </div>
      )}

      {/* From / To — Bold's signature look uses the FIRST key/value of each
          party as a typographic header (uppercase letter-spaced label +
          prominent name), then renders the remaining fields as Field rows.
          That makes the section header dynamic: a recipient keyed by
          "Customer", "Patient", "Approver" etc. shows that key as the header
          instead of a hard-coded "Bill to". */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 16, padding: '0 48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 240px', minWidth: 0, gap: 6 }}>
          <BoldPartyBlock
            entries={Object.entries(invoice.invoiceFrom || {}).map(([k, v]) => [displayKey(k), String(v)] as [string, string])}
            accent={accent}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 240px', minWidth: 0, gap: 16 }}>
          {(invoice.invoiceTo || []).map((recipient, i) => (
            <BoldPartyBlock
              key={i}
              entries={Object.entries(recipient).map(([k, v]) => [k, String(v)] as [string, string])}
              accent={accent}
            />
          ))}
        </div>
      </div>

      {/* Meta top (accent box) */}
      {invoice.metaTop && Object.keys(invoice.metaTop).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16, padding: '16px', margin: '0 48px', borderRadius: 8, backgroundColor: `${accent}14`, flexWrap: 'wrap' }}>
          {Object.entries(invoice.metaTop).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 120 }}>
              <span style={{ fontSize: 11, color: '#71717a', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Line items */}
      <div style={{ display: 'flex', flexDirection: 'column', margin: '0 48px', borderRadius: 8, border: '1px solid #e4e4e7', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'row', padding: '12px 16px', backgroundColor: accent, color: '#ffffff', gap: 8 }}>
          {cols.map((c, i) => (
            <div key={c} style={{ display: 'flex', flex: columnFlex(c), ...cellOverflow, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', textAlign: i === cols.length - 1 ? 'right' : 'left' }}>
              {c}
            </div>
          ))}
        </div>
        {(invoice.lineItems || []).map((item, ri) => (
          <div key={ri} style={{ display: 'flex', flexDirection: 'row', padding: '12px 16px', backgroundColor: ri % 2 ? '#fafafa' : '#ffffff', gap: 8 }}>
            {cols.map((c, i) => {
              const v = item[c];
              return (
                <div key={c} style={{ display: 'flex', flex: columnFlex(c), ...cellOverflow, fontSize: 13, color: '#27272a', textAlign: i === cols.length - 1 ? 'right' : 'left' }}>
                  {v != null ? String(v) : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '0 48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: 320, borderRadius: 8, border: '1px solid #e4e4e7', overflow: 'hidden' }}>
          {(invoice.summary || []).map((s, i) => {
            const isLast = i === (invoice.summary?.length || 0) - 1;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: isLast ? accent : i % 2 ? '#fafafa' : '#ffffff', color: isLast ? '#ffffff' : undefined }}>
                <span style={{ fontSize: 13, fontWeight: isLast ? 700 : 400, color: isLast ? '#ffffff' : '#52525b' }}>{s.label}</span>
                <span style={{ fontSize: isLast ? 16 : 13, fontWeight: isLast ? 700 : 500, color: isLast ? '#ffffff' : '#18181b' }}>{String(s.value)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meta bottom */}
      {invoice.metaBottom && Object.keys(invoice.metaBottom).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16, flexWrap: 'wrap', padding: '0 48px' }}>
          {Object.entries(invoice.metaBottom).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 180, padding: 16, borderRadius: 8, backgroundColor: '#fafafa', border: '1px solid #f4f4f5', gap: 2 }}>
              <div style={{ display: 'flex', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#71717a', marginBottom: 2 }}>{k}</div>
              <span style={{ fontSize: 13, color: '#3f3f46' }}>{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Signature */}
      {invoice.digitalSignatureUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 48px' }}>
          <div style={{ display: 'flex', fontSize: 11, color: '#71717a', marginBottom: 4 }}>Signed</div>
          <SignatureImage url={invoice.digitalSignatureUrl} size={invoice.signatureSize} fallbackWidth={180} />
        </div>
      )}

      {/* Footer */}
      {(invoice.footerText?.topText || invoice.footerText?.bottomText) && (
        <div style={{ display: 'flex', flexDirection: 'column', margin: '0 48px', paddingTop: 16, borderTop: '1px solid #e4e4e7', gap: 4 }}>
          {invoice.footerText?.topText && <Markdown text={invoice.footerText.topText} style={{ fontSize: 14, color: '#18181b', fontWeight: 600 }} />}
          {invoice.footerText?.bottomText && <Markdown text={invoice.footerText.bottomText} style={{ fontSize: 12, color: '#71717a' }} />}
        </div>
      )}

      {invoice.cancelledNotes && (
        <div style={{ display: 'flex', margin: '0 48px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 4 }}>
          <Markdown text={invoice.cancelledNotes} style={{ fontSize: 13, color: '#b91c1c' }} />
        </div>
      )}

      <div style={{ display: 'flex', padding: '0 48px', fontSize: 11, color: '#71717a' }}>{copyrightOf(invoice)}</div>

      {invoice.showBuiltWith && (
        <div style={{ display: 'flex', padding: '0 48px' }}>
          <BuiltWith />
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═════════════════════════════════════════════════════════════════ */

export interface InvoiceRenderOpts {
  /** True when rendering for export (PDF/SVG/PNG). Strips preview-only
   *  flourishes — e.g. rounded corners on the bold accent header that look
   *  right inside a card preview but not on a printed page edge. */
  forExport?: boolean;
}

export function invoiceElement(invoice: Invoice, opts: InvoiceRenderOpts = {}): React.ReactElement {
  const design = invoice.design || 'classic';
  const dir = invoice.direction || 'ltr';

  const template =
    design === 'bold' ? <BoldTemplate invoice={invoice} forExport={opts.forExport} />
    : <ClassicTemplate invoice={invoice} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: PAGE_WIDTH, direction: dir, backgroundColor: '#ffffff' }}>
      {template}
      {invoice.includeEditLink !== false && (
        <div style={{ display: 'flex', width: '100%', height: 16, borderTop: '1px solid #e5e7eb' }} />
      )}
    </div>
  );
}

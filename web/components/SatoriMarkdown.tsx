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
 *   - paragraphs, hard line breaks
 *   - **bold**, *italic*, `code`
 *   - [links](url)  (rendered as colored underlined text — no real anchor)
 *   - unordered lists (•) and ordered lists (1.)
 *   - blockquotes (left border, padded)
 *   - headings (h1–h3)
 *
 * Intentionally NOT supported:
 *   - tables (don't fit Satori's flex model — use the line-items table instead)
 *   - images, HTML passthrough, footnotes
 */

import React from 'react';
import { marked, type Tokens } from 'marked';

interface MarkdownProps {
  text: string;
  /** Optional base style applied to the outermost container. Useful for
   *  setting fontSize / color from the surrounding context. */
  style?: React.CSSProperties;
}

export function Markdown({ text, style }: MarkdownProps): React.ReactElement {
  if (!text) return <div style={{ display: 'flex', ...style }} />;
  const tokens = marked.lexer(text);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {tokens.map((tok, i) => renderBlock(tok, i))}
    </div>
  );
}

function renderBlock(tok: Tokens.Generic, key: number): React.ReactNode {
  switch (tok.type) {
    case 'paragraph':
      return <Paragraph key={key} tokens={(tok as Tokens.Paragraph).tokens || []} />;

    case 'heading': {
      const h = tok as Tokens.Heading;
      const fontSize = h.depth === 1 ? 20 : h.depth === 2 ? 17 : 15;
      return (
        <div key={key} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', fontSize, fontWeight: 700, marginTop: 4 }}>
          {renderInline(h.tokens || [])}
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
                  {(item.tokens || []).map((sub, j) => renderBlock(sub, j))}
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
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 12, borderLeft: '3px solid #e4e4e7', color: '#52525b' }}>
          {(bq.tokens || []).map((sub, i) => renderBlock(sub, i))}
        </div>
      );
    }

    case 'code': {
      const code = tok as Tokens.Code;
      return (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', padding: 10, borderRadius: 4, backgroundColor: '#f4f4f5', fontFamily: 'monospace', fontSize: 12, color: '#27272a' }}>
          {code.text.split('\n').map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>{line || ' '}</div>
          ))}
        </div>
      );
    }

    case 'space':
      return null;

    case 'hr':
      return <div key={key} style={{ display: 'flex', borderTop: '1px solid #e4e4e7', marginTop: 4, marginBottom: 4 }} />;

    case 'text': {
      // Top-level loose text token (rare — usually wrapped in paragraph).
      const t = tok as Tokens.Text;
      const inline = t.tokens || [{ type: 'text', text: t.text, raw: t.text } as unknown as Tokens.Generic];
      return <Paragraph key={key} tokens={inline} />;
    }

    default:
      // Unknown token — fall back to its plain text if available.
      if ('text' in tok && typeof tok.text === 'string') {
        return <div key={key} style={{ display: 'flex' }}>{tok.text}</div>;
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
function Paragraph({ tokens }: { tokens: Tokens.Generic[] }): React.ReactElement {
  const lines = splitOnBreaks(tokens);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {lines.map((line, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', minWidth: 0 }}>
          {renderInline(line)}
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
  return text.replace(/^( +)/, (_, sp: string) => ' '.repeat(sp.length))
             .replace(/( +)$/, (_, sp: string) => ' '.repeat(sp.length));
}

function renderInline(tokens: Tokens.Generic[]): React.ReactNode[] {
  return tokens.flatMap((tok, i) => {
    switch (tok.type) {
      case 'text': {
        const t = tok as Tokens.Text;
        // Tokens.Text in inline context can itself have nested inline tokens
        // (e.g. for emphasis markers within text). Recurse if so.
        if (t.tokens && t.tokens.length > 0) return renderInline(t.tokens);
        return [<span key={i}>{preserveBoundarySpaces(t.text)}</span>];
      }
      case 'strong': {
        const s = tok as Tokens.Strong;
        return [<span key={i} style={{ fontWeight: 700 }}>{renderInline(s.tokens || [])}</span>];
      }
      case 'em': {
        const e = tok as Tokens.Em;
        return [<span key={i} style={{ fontStyle: 'italic' }}>{renderInline(e.tokens || [])}</span>];
      }
      case 'codespan': {
        const c = tok as Tokens.Codespan;
        return [<span key={i} style={{ fontFamily: 'monospace', backgroundColor: '#f4f4f5', padding: '1px 4px', borderRadius: 3 }}>{c.text}</span>];
      }
      case 'link': {
        const l = tok as Tokens.Link;
        return [<span key={i} style={{ color: '#2563eb', textDecoration: 'underline' }}>{renderInline(l.tokens || [])}</span>];
      }
      case 'del': {
        const d = tok as Tokens.Del;
        return [<span key={i} style={{ textDecoration: 'line-through' }}>{renderInline(d.tokens || [])}</span>];
      }
      case 'br':
        // Already handled by splitOnBreaks; if one slips through, render a thin gap.
        return [<span key={i}> </span>];
      case 'escape': {
        const e = tok as Tokens.Escape;
        return [<span key={i}>{e.text}</span>];
      }
      default:
        if ('text' in tok && typeof tok.text === 'string') {
          return [<span key={i}>{tok.text}</span>];
        }
        return [];
    }
  });
}

/** Canonical markdown surface — keep README / llms.txt / developers in sync via this module. */

export const MARKDOWN_INLINE =
  '**bold**  *italic*  ***bold italic***  ~~strike~~  `code`  [label](url)  {@18:inline size}';

export const MARKDOWN_BLOCKS =
  '# … ####### headings  {@18} / {@p:18} line size  - list  1. numbered  > quote  ---';

export const MARKDOWN_TAGS = [
  { tag: '**text** or __text__', meaning: 'Bold' },
  { tag: '*text* or _text_', meaning: 'Italic' },
  { tag: '***text***', meaning: 'Bold + italic' },
  { tag: '~~text~~', meaning: 'Strikethrough' },
  { tag: '`code`', meaning: 'Inline code (monospace chip)' },
  { tag: '[label](https://…)', meaning: 'Link (blue, underlined; clickable in PDF)' },
  { tag: 'user@host (bare email)', meaning: 'Autolinked mailto in PDF' },
  { tag: '# heading', meaning: 'H1 — ~1.75× field base size, bold' },
  { tag: '## heading', meaning: 'H2 — ~1.5×' },
  { tag: '### heading', meaning: 'H3 — ~1.3×' },
  { tag: '#### heading', meaning: 'H4 — ~1.15×' },
  { tag: '##### heading', meaning: 'H5 — ~1.0×' },
  { tag: '###### heading', meaning: 'H6 — ~0.9×' },
  { tag: '####### heading', meaning: 'H7 — ~0.8× (non-standard extension)' },
  { tag: '{@18} rest of line', meaning: 'Absolute font size in px for that line/block' },
  { tag: '{@p:18} rest of line', meaning: 'Same as {@18} (paragraph-size alias)' },
  { tag: '{@18:span text}', meaning: 'Inline run at absolute px size' },
  { tag: '- item  or  * item', meaning: 'Unordered list' },
  { tag: '1. item', meaning: 'Ordered list' },
  { tag: '> quote', meaning: 'Blockquote' },
  { tag: '---', meaning: 'Horizontal rule' },
  { tag: 'single newline', meaning: 'Hard line break (kept; does not need a blank line)' },
] as const;

export const MARKDOWN_NOT_SUPPORTED =
  'tables, images, raw HTML, footnotes, task lists';

export const MARKDOWN_HELP = [
  'Markdown in every text field (heading, description, from/to keys & values, meta, columns, cells, summary, footer, cancelled notes).',
  `Inline: ${MARKDOWN_INLINE}.`,
  `Blocks: ${MARKDOWN_BLOCKS}.`,
  'Size: #–####### scale from the field base size; {@18} / {@p:18} set absolute px for a line; {@18:span} sizes an inline run.',
  'Line breaks: a single newline is kept (no need for a blank line).',
  'Currency/punctuation glyphs (₹ € £ ¥ ₩ ₽ • — …) render via the invoice font + Inter fallback.',
  `Not supported: ${MARKDOWN_NOT_SUPPORTED}.`,
].join(' ');

/** Multi-line block for README / developers / llms.txt. */
export function markdownReferenceBlock(): string {
  const rows = MARKDOWN_TAGS.map((t) => `  ${t.tag.padEnd(28)} ${t.meaning}`).join('\n');
  return [
    'Markdown (every text field)',
    rows,
    '',
    `Not supported: ${MARKDOWN_NOT_SUPPORTED}.`,
    'Currency glyphs as plain text: ₹ € £ ¥ ₩ ₽ and punctuation • — – … → ← ·',
  ].join('\n');
}

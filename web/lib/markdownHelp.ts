/** Canonical markdown surface - keep README / llms.txt / developers / dialog in sync. */

export const MARKDOWN_INLINE =
  '**bold**  *italic*  ***bold italic***  ~~strike~~  `code`  [label](url)  {@18:inline size}';

export const MARKDOWN_BLOCKS =
  '# … ####### headings  {@18} / {@p:18} line size  - list  1. numbered  > quote  ---';

export const MARKDOWN_FIELDS =
  'invoiceHeading, invoiceDescription, invoiceFrom keys & values, invoiceTo keys & values, metaTop / metaBottom keys & values, columns, line-item cells, summary labels & values, footerText, cancelledNotes';

export type MarkdownTagRow = { tag: string; meaning: string; group: 'inline' | 'size' | 'block' | 'keys' };

export const MARKDOWN_TAGS: readonly MarkdownTagRow[] = [
  { group: 'inline', tag: '**text** or __text__', meaning: 'Bold' },
  { group: 'inline', tag: '*text* or _text_', meaning: 'Italic' },
  { group: 'inline', tag: '***text***', meaning: 'Bold + italic' },
  { group: 'inline', tag: '~~text~~', meaning: 'Strikethrough' },
  { group: 'inline', tag: '`code`', meaning: 'Inline code (monospace chip)' },
  { group: 'inline', tag: '[label](https://…)', meaning: 'Link (blue, underlined; clickable in PDF)' },
  { group: 'inline', tag: 'user@host (bare email)', meaning: 'Autolinked mailto in PDF' },
  { group: 'size', tag: '# heading … ####### heading', meaning: 'H1–H7 - scale from the field’s base size, bold' },
  { group: 'size', tag: '{@18} rest of line', meaning: 'Absolute font size in px for the rest of that line' },
  { group: 'size', tag: '{@p:18} rest of line', meaning: 'Same as {@18} (paragraph-size alias)' },
  { group: 'size', tag: '{@18:span text}', meaning: 'Inline run at absolute px size' },
  { group: 'block', tag: '- item  or  * item', meaning: 'Unordered list' },
  { group: 'block', tag: '1. item', meaning: 'Ordered list' },
  { group: 'block', tag: '> quote', meaning: 'Blockquote' },
  { group: 'block', tag: '---', meaning: 'Horizontal rule' },
  { group: 'block', tag: 'single newline', meaning: 'Hard line break (kept; no blank line required)' },
  { group: 'keys', tag: '@Label@  (full key)', meaning: 'Hide the key label; print the value only (from / to / meta)' },
  { group: 'keys', tag: 'spaces around @…@', meaning: 'Trimmed first - " @note@ " still hides the label' },
] as const;

export const MARKDOWN_GROUP_LABELS: Record<MarkdownTagRow['group'], string> = {
  inline: 'Inline emphasis',
  size: 'Size & headings',
  block: 'Blocks & breaks',
  keys: 'Key-value keys',
};

export const MARKDOWN_NOT_SUPPORTED =
  'tables, images, raw HTML, footnotes, task lists';

export const MARKDOWN_GLYPHS = '₹ € £ ¥ ₩ ₽ • — – … → ← ·';

export const MARKDOWN_HELP = [
  `Markdown in every text field (${MARKDOWN_FIELDS}).`,
  `Inline: ${MARKDOWN_INLINE}.`,
  `Blocks: ${MARKDOWN_BLOCKS}.`,
  'Size: #–####### scale from the field base size; {@18} / {@p:18} set absolute px for a line; {@18:span} sizes an inline run.',
  'Keys: wrap a key in @…@ (e.g. "@note@") to hide the label and print the value only.',
  'Line breaks: a single newline is kept (no need for a blank line).',
  `Currency/punctuation glyphs (${MARKDOWN_GLYPHS}) render via the invoice font + Inter fallback.`,
  `Not supported: ${MARKDOWN_NOT_SUPPORTED}.`,
].join(' ');

/** Multi-line block for README / developers / llms.txt. */
export function markdownReferenceBlock(): string {
  const rows = MARKDOWN_TAGS.map((t) => `  ${t.tag.padEnd(32)} ${t.meaning}`).join('\n');
  return [
    'Markdown (every text field)',
    `Applies to: ${MARKDOWN_FIELDS}.`,
    '',
    rows,
    '',
    `Not supported: ${MARKDOWN_NOT_SUPPORTED}.`,
    `Currency glyphs as plain text: ${MARKDOWN_GLYPHS}`,
  ].join('\n');
}

/** GitHub-flavored table for root README. */
export function markdownReadmeTable(): string {
  const header = '| Tag | Meaning |\n| --- | --- |';
  const rows = MARKDOWN_TAGS.map((t) => `| \`${t.tag.replace(/\|/g, '\\|')}\` | ${t.meaning} |`).join('\n');
  return [
    '### Markdown tags (every text field)',
    '',
    header,
    rows,
    '',
    `Not supported: ${MARKDOWN_NOT_SUPPORTED}. Glyphs like \`${MARKDOWN_GLYPHS}\` work as plain text.`,
  ].join('\n');
}

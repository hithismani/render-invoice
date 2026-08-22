/** Lightweight HTML markdown for the DOM invoice preview (non-Satori). */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only these href schemes survive markdown links. Blocks javascript:, data:, vbscript:. */
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#|\.\/)/i;

export function formatMarkdown(text: string | number | undefined | null): string {
  if (text === null || typeof text === 'undefined') return '';
  // Escape user content BEFORE any transforms so raw HTML can never reach
  // dangerouslySetInnerHTML. Markdown syntax chars (* _ ` ~ [ ] ( ) { } @ #)
  // are unaffected by entity escaping, so the rules below still apply.
  let html = escapeHtml(String(text));

  // Size overrides - colon form first; bare form sizes rest of line and strips leftover bare markers
  html = html.replace(/\{@(\d+(?:\.\d+)?):([^}]*)\}/g, '<span style="font-size:$1px">$2</span>');
  html = html.replace(/\{@(?:p:)?(\d+(?:\.\d+)?)\}([^\n]*)/g, (_m, size: string, rest: string) => {
    const body = String(rest)
      .replace(/\{@(?:p:)?\d+(?:\.\d+)?\}/g, '')
      .replace(/^\s+/, '')
      .replace(/\s+$/, '');
    return `<span style="font-size:${size}px">${body}</span>`;
  });

  // Headings (h1–h7) - process before other inline so # isn't eaten
  html = html.replace(/^#{7}\s+(.+)$/gm, '<span style="font-size:0.8em;font-weight:700;display:block">$1</span>');
  html = html.replace(/^######\s+(.+)$/gm, '<span style="font-size:0.9em;font-weight:700;display:block">$1</span>');
  html = html.replace(/^#####\s+(.+)$/gm, '<span style="font-size:1em;font-weight:700;display:block">$1</span>');
  html = html.replace(/^####\s+(.+)$/gm, '<span style="font-size:1.15em;font-weight:700;display:block">$1</span>');
  html = html.replace(/^###\s+(.+)$/gm, '<span style="font-size:1.3em;font-weight:700;display:block">$1</span>');
  html = html.replace(/^##\s+(.+)$/gm, '<span style="font-size:1.5em;font-weight:700;display:block">$1</span>');
  html = html.replace(/^#\s+(.+)$/gm, '<span style="font-size:1.75em;font-weight:700;display:block">$1</span>');

  html = html.replace(/\*{3}(.*?)\*{3}/g, '<strong><em>$1</em></strong>');
  html = html.replace(/_{3}(.*?)_{3}/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, url: string) => {
    const u = url.trim();
    if (!SAFE_HREF.test(u)) return label;
    return `<a href="${u}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  html = html.replaceAll(/\n/g, '<br>');
  return html;
}

/** Plain-text form of markdown (copyright lines, etc.). */
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

/** Hide label when key is fully wrapped in `@…@` (after trim). Else strip stray `@`. */
export function displayKey(key: string): string {
  const k = String(key ?? '').trim();
  if (!k) return '';
  if (k.startsWith('@') && k.endsWith('@')) return '';
  return k.replace(/@/g, '');
}

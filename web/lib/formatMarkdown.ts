/** Lightweight HTML markdown for the DOM invoice preview (non-Satori). */

export function formatMarkdown(text: string | number | undefined | null): string {
  if (text === null || typeof text === 'undefined') return '';
  let html = String(text);

  // Size overrides
  html = html.replace(/\{@(\d+(?:\.\d+)?):([^}]*)\}/g, '<span style="font-size:$1px">$2</span>');
  html = html.replace(/\{@(?:p:)?(\d+(?:\.\d+)?)\}([^\n]*)/g, '<span style="font-size:$1px">$2</span>');

  // Headings (h1–h7) — process before other inline so # isn't eaten
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
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
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

export function displayKey(key: string): string {
  return !key.startsWith('@') || !key.endsWith('@') ? key.replace(/@/g, '') : '';
}

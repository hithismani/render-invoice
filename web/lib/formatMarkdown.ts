export function formatMarkdown(text: string | number | undefined | null): string {
  if (text === null || typeof text === 'undefined') return '';
  let html = String(text);
  html = html.replace(/\*{3}(.*?)\*{3}/g, '<strong><em>$1</em></strong>');
  html = html.replace(/_{3}(.*?)_{3}/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replaceAll(/\n/g, '<br>');
  return html;
}

export function displayKey(key: string): string {
  return !key.startsWith('@') || !key.endsWith('@') ? key.replace(/@/g, '') : '';
}

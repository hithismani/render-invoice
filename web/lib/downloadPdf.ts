import type { Invoice } from '@/schema/invoiceSchema';

function isStubFilename(name?: string): boolean {
  if (!name) return true;
  return /^your-/.test(name) || name === 'example-invoice-september-2023';
}

export function resolveFilename(invoice: Partial<Invoice>): string {
  const custom = invoice.filename?.replace(/\.pdf$/i, '').trim();
  if (custom && !isStubFilename(custom)) return custom;
  const invoiceNumber = invoice?.metaTop?.['Invoice Number'];
  if (invoiceNumber) return `invoice-${invoiceNumber}`;
  const heading = invoice.invoiceHeading?.trim();
  if (heading) return heading.replace(/\s+/g, '-').toLowerCase();
  return 'invoice';
}

/**
 * Serialize every active stylesheet on the live page into a single CSS string.
 * Same-origin rules only — cross-origin sheets (e.g. Google Fonts) throw on
 * `cssRules` access and are silently skipped.
 */
function collectInlineCss(): string {
  const chunks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      for (const rule of Array.from(rules)) chunks.push(rule.cssText);
    } catch {
      /* cross-origin — skip */
    }
  }
  return chunks.join('\n');
}

/** Copy any <link rel="stylesheet"> so external hosts (fonts etc.) still work. */
function collectLinkTags(): string {
  return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((n) => n.outerHTML)
    .join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Vector PDF via the browser's print pipeline.
 * - Mounts the invoice in a hidden iframe at a fixed capture width
 * - Inlines every active CSS rule so Tailwind styles apply instantly (no race)
 * - Waits for fonts, measures real rendered height, injects @page size
 * - Triggers print → user saves as PDF with selectable text
 */
export async function downloadInvoicePdf(element: HTMLElement, invoice: Partial<Invoice>): Promise<void> {
  const filename = resolveFilename(invoice);
  const autoFit = invoice.autoSize !== false;

  // Deterministic layout: ignore responsive breakpoints, render at a fixed print width.
  const captureWidth = 900;

  const inlineCss = collectInlineCss();
  const linkTags = collectLinkTags();

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = `position:fixed;left:-99999px;top:0;width:${captureWidth}px;height:100px;border:0;opacity:0;pointer-events:none;`;
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  const win = iframe.contentWindow!;

  doc.open();
  doc.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(filename)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
    ${linkTags}
    <style>${inlineCss}</style>
    <style id="print-overrides">
      html, body {
        margin: 0; padding: 0; background: #fff;
        font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      #print-root { width: ${captureWidth}px; margin: 0 auto; }
      #print-root, #print-root * { box-shadow: none !important; }
      /* Force the responsive max-width constraint flat */
      #print-root .max-w-\\[85rem\\] { max-width: 100% !important; }
      /* Hide click-to-focus affordances in print */
      #print-root [data-section] { outline: none !important; cursor: default !important; }
      @media print {
        html, body, #print-root { page-break-inside: avoid; break-inside: avoid; }
      }
    </style>
  </head>
  <body><div id="print-root">${element.outerHTML}</div></body>
</html>`);
  doc.close();

  // Wait for fonts + one layout tick.
  await new Promise<void>((resolve) => {
    const ready = () => {
      const fonts = (doc as any).fonts?.ready ?? Promise.resolve();
      Promise.resolve(fonts).then(() => {
        win.requestAnimationFrame(() => setTimeout(resolve, 100));
      });
    };
    if (doc.readyState === 'complete') ready();
    else win.addEventListener('load', ready, { once: true });
  });

  const root = doc.getElementById('print-root') as HTMLDivElement;
  const contentH = Math.ceil(root.getBoundingClientRect().height);
  const contentW = captureWidth;

  // autoSize: A4 width, height = max(A4, content) in portrait. fit-to-A4: one A4 sheet.
  const A4_W_MM = 210;
  const A4_H_MM = 297;
  const heightMm = Math.max(A4_H_MM, A4_W_MM * (contentH / contentW));

  const pageStyle = doc.createElement('style');
  pageStyle.textContent = autoFit
    ? `@page { size: ${A4_W_MM}mm ${heightMm}mm; margin: 0; }
       html, body { width: ${A4_W_MM}mm; margin: 0; background: #fff; }
       #print-root {
         width: ${contentW}px;
         transform: scale(calc(${A4_W_MM}mm / ${contentW}px));
         transform-origin: top left;
       }`
    : `@page { size: A4; margin: 12mm; }`;
  doc.head.appendChild(pageStyle);

  await new Promise((r) => setTimeout(r, 60));

  try {
    win.focus();
    win.print();
  } finally {
    setTimeout(() => iframe.remove(), 2000);
  }
}

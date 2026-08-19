const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { compressToEncodedURIComponent } = require('lz-string');

const port = Number(process.env.PORT || 10000);
const staticDir = process.env.STATIC_DIR || path.resolve(__dirname, '../web-out');
const printOrigin = process.env.RENDERINVOICE_PRINT_URL || `http://127.0.0.1:${port}`;
const apiKey = process.env.API_KEY_SECRET;
const allowedIps = new Set(
  (process.env.ALLOWED_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean),
);

if (!apiKey) {
  console.error('API_KEY_SECRET is required. Refusing to start.');
  process.exit(1);
}

let browserPromise;

function getBrowser() {
  browserPromise ||= chromium.launch({ headless: true });
  return browserPromise;
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress?.replace(/^::ffff:/, '') || '';
}

function authorized(req) {
  if (req.headers.authorization !== `Bearer ${apiKey}`) return false;
  return allowedIps.size === 0 || allowedIps.has(clientIp(req));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) reject(new Error('Request body is too large'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function unwrapInvoice(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (body.invoice && typeof body.invoice === 'object' && !Array.isArray(body.invoice)) return body.invoice;
  if (body.columns || body.invoiceFrom || body.lineItems) return body;
  return null;
}

async function renderPdf(invoice) {
  const hash = `#i=${compressToEncodedURIComponent(JSON.stringify(invoice))}`;
  const pageUrl = `${printOrigin}/print-view${hash}`;
  const browser = await getBrowser();
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1 });
  try {
    await page.goto(pageUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('#invoice-content svg', { state: 'visible', timeout: 30_000 });
    await page.evaluate(() => document.fonts?.ready);
    const dims = await page.evaluate(() => {
      const root = document.getElementById('invoice-content');
      const svg = root?.querySelector('svg');
      if (!root || !svg) throw new Error('Invoice preview did not render');
      const rect = svg.getBoundingClientRect();
      return {
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
        autoSize: root.dataset.autosize !== '0',
      };
    });
    const options = dims.autoSize
      ? { width: `${dims.width}px`, height: `${dims.height}px`, margin: { top: 0, right: 0, bottom: 0, left: 0 }, printBackground: true }
      : { format: 'A4', margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }, printBackground: true };
    return await page.pdf(options);
  } finally {
    await page.close();
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    return json(res, 200, { name: 'renderinvoice-browser-service', status: 'ok' });
  }
  if (req.method === 'GET') return serveStatic(req, res);
  if (req.method !== 'POST' || req.url !== '/v1/render') return json(res, 404, { error: 'Not found' });
  if (!authorized(req)) return json(res, 401, { error: 'Unauthorized' });
  try {
    const invoice = unwrapInvoice(JSON.parse(await readBody(req)));
    if (!invoice) return json(res, 400, { error: 'Send { "invoice": {…} } or a bare invoice object' });
    const pdf = await renderPdf(invoice);
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.filename || 'invoice.pdf'}"`,
      'Cache-Control': 'no-store',
      'X-Render-Engine': 'chromium-service',
      'X-Pdf-Type': 'vector',
    });
    res.end(pdf);
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

function serveStatic(req, res) {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const relative = pathname === '/print-view' || pathname === '/print-view/'
    ? 'print-view/index.html'
    : pathname.replace(/^\//, '');
  const file = path.resolve(staticDir, relative || 'index.html');
  if (!file.startsWith(path.resolve(staticDir) + path.sep)) return json(res, 400, { error: 'Invalid path' });
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) return json(res, 404, { error: 'Not found' });
    const ext = path.extname(file);
    const type = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.woff': 'font/woff',
      '.ttf': 'font/ttf',
    }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(file).pipe(res);
  });
}

server.listen(port, '0.0.0.0', () => console.log(`renderinvoice browser service listening on ${port}`));
process.on('SIGTERM', async () => {
  server.close();
  if (browserPromise) (await browserPromise).close();
});

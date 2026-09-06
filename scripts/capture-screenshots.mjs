import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const ROOT = resolve('dist');
const PORT = 4188;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

// Simple SPA static server
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    let file = normalize(join(ROOT, pathname));

    // Try direct file first
    let body;
    try {
      body = await readFile(file);
    } catch {
      // SPA Fallback to index.html
      file = join(ROOT, 'index.html');
      body = await readFile(file);
    }

    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'text/html; charset=utf-8' });
    res.end(body);
  } catch (err) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('404');
  }
});

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const routesToCapture = [
  { name: 'dashboard.png', path: '/admin' },
  { name: 'products.png', path: '/admin/products' },
  { name: 'basket-builder.png', path: '/loja/cestas-cafe-da-manha/cesta' },
  { name: 'public-store.png', path: '/loja/cestas-cafe-da-manha' },
  { name: 'inventory.png', path: '/admin/inventory' },
  { name: 'labels.png', path: '/admin/products/labels' },
];

async function run() {
  await mkdir('docs/screenshots', { recursive: true });

  await new Promise(r => server.listen(PORT, r));
  console.log(`Preview server listening at http://localhost:${PORT}`);

  for (const item of routesToCapture) {
    const outPath = resolve('docs/screenshots', item.name);
    const targetUrl = `http://localhost:${PORT}${item.path}`;
    console.log(`Capturing ${item.name} from ${targetUrl}...`);

    const cmd = `"${EDGE_PATH}" --headless --disable-gpu --no-first-run --no-default-browser-check --window-size=1280,820 --virtual-time-budget=4000 "--screenshot=${outPath}" "${targetUrl}"`;

    try {
      await execAsync(cmd);
      console.log(`✓ Saved ${item.name}`);
    } catch (err) {
      console.error(`✗ Error capturing ${item.name}:`, err.message);
    }
  }

  server.close();
  console.log('Done capturing screenshots!');
}

run().catch(console.error);

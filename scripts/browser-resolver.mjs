import fs from 'fs';
import path from 'path';

/**
 * Localiza dinamicamente o executável do Google Chrome ou Microsoft Edge no sistema operacional.
 * Garante que testes E2E executem sem depender de download prévio no cache do Puppeteer.
 */
export function getSystemBrowserPath() {
  const possiblePaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    // Google Chrome no Windows (64-bit / 32-bit / Local AppData)
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    // Microsoft Edge no Windows
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    // Linux (Debian, Ubuntu, Fedora, Alpine)
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ];

  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }

  return undefined;
}

/**
 * Retorna as opções padronizadas de inicialização do Puppeteer com auto-detecção do browser.
 */
export function getPuppeteerLaunchOptions(extraArgs = []) {
  const executablePath = getSystemBrowserPath();
  const options = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', ...extraArgs],
  };

  if (executablePath) {
    options.executablePath = executablePath;
  }

  return options;
}

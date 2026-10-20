// Headless export of the posters: A4, Instagram 1:1, Facebook cover, as SVG + PNG.
//   npm run export                          all formats, default theme, to ./out
//   npm run export -- --theme paper --seed 42 --only a4,square --out ./print --no-png
//
// Starts the poster generator (vite) on a free port, drives it with Chrome through
// playwright-core and writes the files. Uses the same render and rasterize code as the
// Save buttons in the preview, so the output is identical.
//
// Browser: system Google Chrome. If it is not installed, set CHROME_PATH to a Chrome/Chromium
// binary, or run `npx playwright-core install chromium` and it falls back to that.
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { values: o } = parseArgs({
  options: {
    theme: { type: 'string', default: 'rust' }, // id from src/themes.js
    seed: { type: 'string', default: '7' },
    only: { type: 'string' }, // comma list of format ids from src/formats.js: a4,square,fb
    out: { type: 'string', default: 'out' },
    'no-svg': { type: 'boolean', default: false },
    'no-png': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (o.help) {
  console.log(
    'npm run export -- [--theme rust|patina|paper|mono] [--seed N] [--only a4,square,fb,carousel-1,...] [--out dir] [--no-svg] [--no-png]',
  );
  process.exit(0);
}
if (o['no-svg'] && o['no-png']) {
  console.error('Nothing to do: both --no-svg and --no-png given.');
  process.exit(1);
}
if (!/^\d+$/.test(o.seed)) {
  console.error(`--seed must be a non-negative integer, got "${o.seed}"`);
  process.exit(1);
}

async function launch() {
  const opts = { headless: true };
  if (process.env.CHROME_PATH) return chromium.launch({ ...opts, executablePath: process.env.CHROME_PATH });
  try {
    return await chromium.launch({ ...opts, channel: 'chrome' });
  } catch (e) {
    try {
      return await chromium.launch(opts); // playwright's own chromium, if installed
    } catch {
      throw new Error(
        'No browser found. Install Google Chrome, set CHROME_PATH, or run: npx playwright-core install chromium\n' + e.message,
      );
    }
  }
}

const server = await createServer({
  root,
  logLevel: 'error',
  server: { port: 0, host: '127.0.0.1', open: false },
});
let browser;
try {
  await server.listen();
  const base = server.resolvedUrls.local[0].replace(/\/$/, '');

  // format list comes from the app itself, so a new format in formats.js is picked up
  const { formats } = await server.ssrLoadModule('/src/formats.js');
  const { themes } = await server.ssrLoadModule('/src/themes.js');
  if (!themes.some((t) => t.id === o.theme)) {
    throw new Error(`Unknown theme "${o.theme}". Available: ${themes.map((t) => t.id).join(', ')}`);
  }
  const want = o.only ? o.only.split(',').map((s) => s.trim()) : formats.map((f) => f.id);
  const unknown = want.filter((id) => !formats.some((f) => f.id === id));
  if (unknown.length) throw new Error(`Unknown format(s): ${unknown.join(', ')}. Available: ${formats.map((f) => f.id).join(', ')}`);

  const outDir = path.resolve(process.cwd(), o.out);
  await fs.mkdir(outDir, { recursive: true });

  browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(`${base}/#theme=${o.theme}&seed=${o.seed}`);
  // fonts and wordmark/speaker measuring settle after the first render
  await page.waitForFunction(() => document.querySelectorAll('svg').length > 0);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);

  for (const f of formats.filter((f) => want.includes(f.id))) {
    const base = `oksidas-${f.id}-${o.theme}-${o.seed}`;
    const sel = `section[data-id="${f.id}"] svg`;
    if (!o['no-svg']) {
      const svg = await page.evaluate(async (sel) => {
        const { svgString } = await import('/src/export.js');
        return svgString(document.querySelector(sel));
      }, sel);
      await fs.writeFile(path.join(outDir, `${base}.svg`), svg);
      console.log(`${path.relative(process.cwd(), path.join(outDir, base))}.svg`);
    }
    if (!o['no-png']) {
      const b64 = await page.evaluate(
        async ([sel, w, h]) => {
          const { pngBase64 } = await import('/src/export.js');
          return pngBase64(document.querySelector(sel), w, h);
        },
        [sel, f.w, f.h],
      );
      await fs.writeFile(path.join(outDir, `${base}.png`), Buffer.from(b64, 'base64'));
      console.log(`${path.relative(process.cwd(), path.join(outDir, base))}.png  (${f.w}x${f.h})`);
    }
  }
} catch (e) {
  console.error(e.message ?? e);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await server.close();
}

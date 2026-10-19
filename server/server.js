// OKSIDAS RSVP server: serves the built site, a tiny JSON API and a password-protected admin view.
// No npm dependencies — Node's built-in http + sqlite.
//
// env:
//   PORT            8080
//   DB_PATH         ./data/rsvp.db
//   BASE_COUNT      registrations collected elsewhere, added to the public count (17)
//   ADMIN_USER      admin
//   ADMIN_PASSWORD  required for /admin; admin is disabled when empty
//   TRUST_PROXY     1 = take client IP from X-Forwarded-For (only behind your own reverse proxy)
//   STATIC_DIR      ../dist-site
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { createHash, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 8080);
const DB_PATH = path.resolve(process.env.DB_PATH ?? path.join(here, '../data/rsvp.db'));
const BASE_COUNT = Number(process.env.BASE_COUNT ?? 0) || 0;
const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const STATIC_DIR = path.resolve(process.env.STATIC_DIR ?? path.join(here, '../dist-site'));

// ---- storage ----------------------------------------------------------------------------------

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS rsvp (
    id         INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name  TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,  -- stored lowercased
    phone      TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT
  );
`);

const q = {
  count: db.prepare('SELECT COUNT(*) AS n FROM rsvp'),
  exists: db.prepare('SELECT 1 FROM rsvp WHERE email = ?'),
  insert: db.prepare('INSERT INTO rsvp (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)'),
  update: db.prepare(
    "UPDATE rsvp SET first_name = ?, last_name = ?, phone = ?, updated_at = datetime('now') WHERE email = ?",
  ),
  all: db.prepare('SELECT * FROM rsvp ORDER BY id DESC'),
};

const dbCount = () => Number(q.count.get().n);
const publicCount = () => BASE_COUNT + dbCount();

// Same email again updates the entry instead of adding one, so the count stays honest.
// sqlite calls are synchronous, so check + write can't interleave with another request.
function save(r) {
  if (q.exists.get(r.email)) {
    q.update.run(r.first_name, r.last_name, r.phone, r.email);
    return { updated: true };
  }
  q.insert.run(r.first_name, r.last_name, r.email, r.phone);
  return { updated: false };
}

// ---- validation -------------------------------------------------------------------------------

const clean = (v) =>
  typeof v === 'string'
    ? v
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    : '';

function validate(b) {
  const r = {
    first_name: clean(b.first_name),
    last_name: clean(b.last_name),
    email: clean(b.email).toLowerCase(),
    phone: clean(b.phone),
  };
  const digits = r.phone.replace(/\D/g, '').length;
  if (!r.first_name || r.first_name.length > 100) return { field: 'first_name', error: 'Įveskite vardą.' };
  if (!r.last_name || r.last_name.length > 100) return { field: 'last_name', error: 'Įveskite pavardę.' };
  if (r.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email))
    return { field: 'email', error: 'Patikrinkite el. pašto adresą.' };
  if (!/^\+?[\d\s()-]+$/.test(r.phone) || digits < 6 || digits > 15)
    return { field: 'phone', error: 'Patikrinkite telefono numerį.' };
  if (b.consent !== true) return { field: 'consent', error: 'Reikia jūsų sutikimo dėl duomenų naudojimo.' };
  return { data: r };
}

// ---- rate limit (in memory, per IP) -----------------------------------------------------------

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 10;
const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const a = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  a.push(now);
  hits.set(ip, a);
  return a.length > MAX_HITS;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, a] of hits) if (a.every((t) => now - t >= WINDOW_MS)) hits.delete(ip);
}, WINDOW_MS).unref();

function clientIp(req) {
  if (TRUST_PROXY) {
    // last entry is the one our own proxy appended; earlier ones are client-controlled
    const xff = String(req.headers['x-forwarded-for'] ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (xff.length) return xff.at(-1);
  }
  return req.socket.remoteAddress ?? '?';
}

// ---- admin ------------------------------------------------------------------------------------

const sha = (s) => createHash('sha256').update(s).digest();
const ADMIN_HASH = sha(`${ADMIN_USER}:${ADMIN_PASSWORD}`);

function authed(req) {
  const m = /^Basic\s+(.+)$/i.exec(req.headers.authorization ?? '');
  if (!m) return false;
  return timingSafeEqual(sha(Buffer.from(m[1], 'base64').toString('utf8')), ADMIN_HASH);
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function adminHtml(rows) {
  const tr = rows
    .map(
      (r) =>
        `<tr><td>${r.id}</td><td>${esc(r.first_name)}</td><td>${esc(r.last_name)}</td>` +
        `<td><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></td><td><a href="tel:${esc(r.phone.replace(/[^\d+]/g, ''))}">${esc(r.phone)}</a></td>` +
        `<td>${esc(r.created_at)}</td><td>${esc(r.updated_at)}</td></tr>`,
    )
    .join('');
  return `<!doctype html><html lang="lt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OKSIDAS registracijos</title>
<style>body{font:14px/1.4 system-ui,sans-serif;margin:24px;background:#15110e;color:#f3ebe2}a{color:#e2582b}
table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:6px 10px;border-bottom:1px solid #4a3d33}
th{color:#9a8d80;font-weight:600}.muted{color:#9a8d80}</style></head><body>
<h1>OKSIDAS registracijos</h1>
<p>Svetainėje: <b>${dbCount()}</b> <span class="muted">+ ${BASE_COUNT} iš anksčiau = viešas skaičius ${publicCount()}</span></p>
<p><a href="/admin/rsvp.csv">Atsisiųsti CSV</a></p>
<table><thead><tr><th>#</th><th>Vardas</th><th>Pavardė</th><th>El. paštas</th><th>Telefonas</th><th>Sukurta (UTC)</th><th>Atnaujinta (UTC)</th></tr></thead>
<tbody>${tr || '<tr><td colspan="7" class="muted">Kol kas nėra.</td></tr>'}</tbody></table></body></html>`;
}

function csv(rows) {
  // prefix values a spreadsheet would run as a formula
  const cell = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s) && !/^\+?[\d\s()-]+$/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const cols = ['id', 'first_name', 'last_name', 'email', 'phone', 'created_at', 'updated_at'];
  const lines = [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))];
  return '\ufeff' + lines.join('\r\n') + '\r\n'; // BOM so Excel reads UTF-8 (ąčęėįšųūž)
}

// ---- http -------------------------------------------------------------------------------------

const BASE_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'same-origin',
  'x-frame-options': 'DENY',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...BASE_HEADERS, ...headers });
  res.end(body);
}
const json = (res, status, obj) =>
  send(res, status, JSON.stringify(obj), { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });

function readBody(req, limit = 8 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(Object.assign(new Error('too large'), { status: 413 }));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

async function serveStatic(res, pathname) {
  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    return send(res, 400, 'Bad request');
  }
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(STATIC_DIR, rel);
  if (!file.startsWith(STATIC_DIR + path.sep)) return send(res, 404, 'Not found');
  try {
    const data = await readFile(file);
    send(res, 200, data, {
      'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      // vite puts content-hashed files into /assets
      'cache-control': rel.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
  } catch {
    send(res, 404, 'Not found', { 'content-type': 'text/plain; charset=utf-8' });
  }
}

async function handle(req, res) {
  const { pathname } = new URL(req.url, 'http://x');
  const ip = clientIp(req);

  if (pathname === '/api/count' && req.method === 'GET') return json(res, 200, { count: publicCount() });

  if (pathname === '/api/rsvp' && req.method === 'POST') {
    // JSON only: a cross-site form can't send it without a CORS preflight, which we never answer
    if (!String(req.headers['content-type'] ?? '').startsWith('application/json'))
      return json(res, 415, { error: 'Unsupported content type.' });
    if (limited(ip)) return json(res, 429, { error: 'Per daug bandymų. Pabandykite vėliau.' });
    let body;
    try {
      body = JSON.parse(await readBody(req));
    } catch (e) {
      return json(res, e.status ?? 400, { error: 'Netinkama užklausa.' });
    }
    if (!body || typeof body !== 'object') return json(res, 400, { error: 'Netinkama užklausa.' });
    // honeypot: humans never see this field; pretend success so bots don't adapt
    if (body.website) return json(res, 200, { ok: true, updated: false, count: publicCount() });
    const v = validate(body);
    if (v.error) return json(res, 422, v);
    const { updated } = save(v.data);
    return json(res, 200, { ok: true, updated, count: publicCount() });
  }

  if (pathname === '/admin' || pathname === '/admin/rsvp.csv') {
    if (!ADMIN_PASSWORD) return send(res, 503, 'Admin disabled: set ADMIN_PASSWORD.');
    if (!authed(req)) {
      if (req.headers.authorization && limited(ip)) return send(res, 429, 'Too many attempts.');
      return send(res, 401, 'Auth required', { 'www-authenticate': 'Basic realm="OKSIDAS admin", charset="UTF-8"' });
    }
    const rows = q.all.all();
    if (pathname === '/admin')
      return send(res, 200, adminHtml(rows), { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    return send(res, 200, csv(rows), {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="oksidas-rsvp.csv"',
      'cache-control': 'no-store',
    });
  }

  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(res, pathname);
  send(res, 405, 'Method not allowed');
}

const server = http.createServer((req, res) =>
  handle(req, res).catch((e) => {
    console.error(e);
    if (!res.headersSent) json(res, 500, { error: 'Serverio klaida.' });
  }),
);

server.listen(PORT, () => {
  console.log(`oksidas rsvp on :${PORT}, db ${DB_PATH}, base count ${BASE_COUNT}, admin ${ADMIN_PASSWORD ? 'on' : 'OFF'}`);
});

// node as PID 1 in docker ignores SIGTERM unless handled
for (const sig of ['SIGTERM', 'SIGINT'])
  process.on(sig, () => {
    server.close();
    db.close();
    process.exit(0);
  });

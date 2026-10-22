// Rooktest: opent de site op een telefoonscherm en faalt bij JavaScript-fouten of ontbrekende bestanden.
// Gebruik: node tools/test_smoke.js   (vraagt Playwright; staat globaal in de cloudomgeving)
const http = require('http');
const fs = require('fs');
const path = require('path');

let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(process.execPath, '../../lib/node_modules/playwright'))); }

const ROOT = path.resolve(__dirname, '..', 'public');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.mp3': 'audio/mpeg' };

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, rel === '/' ? 'index.html' : rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end();
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();

  const problems = [];
  page.on('pageerror', e => problems.push('JS-fout: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('response', r => { if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`); });

  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  if (!(await page.title())) problems.push('pagina heeft geen titel');
  if (!(await page.$('#c'))) problems.push('canvas #c ontbreekt');
  try { JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8')); }
  catch (e) { problems.push('manifest.json is geen geldige JSON: ' + e.message); }

  await browser.close();
  server.close();

  if (problems.length) {
    console.error('MISLUKT:\n - ' + [...new Set(problems)].join('\n - '));
    process.exit(1);
  }
  console.log('OK: site opent zonder fouten');
})().catch(e => { console.error(e); process.exit(1); });

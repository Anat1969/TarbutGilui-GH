// מפיק PDF לכל כתבה מתוך vite preview: דף A4 אחד עם רקע מלא. נכשל אם טקסט גולש מאזור בדף, או אם יצא יותר מדף אחד. הרצה: npm run build && npm run preview, ואז npm run articles.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const base = process.env.URL || 'http://localhost:4173/';
const out = path.join(__dirname, '..', 'public', 'articles');
const { articles } = require('../src/data/articles.json');
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  for (const a of articles) {
    await p.goto(`${base}#/articles?id=${a.id}`);
    await p.waitForSelector('[data-testid=article]');
    await p.evaluate(() => document.fonts.ready);
    if (a.img) await p.waitForFunction(() => { const i = document.querySelector('.cover-fig img'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 30000 });
    await p.waitForTimeout(600);
    await p.emulateMedia({ media: 'print' });
    const over = await p.evaluate(() => [...document.querySelectorAll('.sheet .sh')].filter((z) => z.scrollHeight > z.clientHeight + 1 || z.scrollWidth > z.clientWidth + 1).map((z) => `${z.className} ${z.scrollHeight}>${z.clientHeight}`));
    if (over.length) { console.error(`${a.id}: טקסט גולש: ${over.join(', ')}`); process.exit(1); }
    const file = path.join(out, `${a.id}.pdf`);
    await p.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true });
    const pages = (fs.readFileSync(file, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    if (pages !== 1) { console.error(`${a.id}: ${pages} דפים במקום אחד`); process.exit(1); }
    await p.emulateMedia({ media: 'screen' });
    console.log(a.id, Math.round(fs.statSync(file).size / 1024) + 'KB', 'דף אחד');
  }
  await b.close();
})();

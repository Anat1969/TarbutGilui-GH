// מפיק PDF לכל כתבה מתוך vite preview: שישה דפי A4 עם רקע מלא. הרצה: npm run build && npm run preview, ואז npm run articles.
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
    const file = path.join(out, `${a.id}.pdf`);
    await p.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(a.id, Math.round(fs.statSync(file).size / 1024) + 'KB');
  }
  await b.close();
})();

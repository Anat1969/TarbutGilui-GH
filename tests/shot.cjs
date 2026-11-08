// צילומי מסך לבדיקה בעין: כל המסכים, במחשב ובנייד.
const { chromium } = require('playwright');
const base = process.env.URL || 'http://localhost:4173/';
const out = process.env.OUT || 'shots';
const pages = [['home', '#/'], ['tree', '#/tree'], ['culture', '#/culture'], ['prize', '#/prize'], ['sources', '#/sources']];
(async () => {
  require('fs').mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  for (const [vw, vh, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: vw, height: vh } });
    for (const [n, h] of pages) {
      await p.goto(base + h); await p.waitForTimeout(900);
      await p.screenshot({ path: `${out}/${n}-${tag}.png`, fullPage: process.env.FULL === '1' });
    }
    await p.close();
  }
  await b.close();
})();

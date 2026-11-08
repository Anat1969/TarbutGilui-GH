// בדיקות Playwright מול vite preview, עם מוקים לכפתור הלוגו ולפונקציית ה-AI.
const { chromium } = require('playwright');
const base = process.env.URL || 'http://localhost:4173/';
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'} ${m}`); if (!c) fails++; };
const MENU = `customElements.define('ai-menu', class extends HTMLElement { connectedCallback() { this.innerHTML = '<button class="logo">A&I</button>'; } });`;

async function page(b, opts = {}) {
  const ctx = await b.newContext(opts);
  const p = await ctx.newPage();
  const calls = [];
  await p.route('https://appofapp-gh.vercel.app/ai-menu.js', (r) => r.fulfill({ contentType: 'text/javascript', body: MENU }));
  await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: '' }));
  await p.route('https://upload.wikimedia.org/**', (r) => r.abort());
  await p.route('https://thumb.wikimedia.org/**', (r) => r.abort());
  await p.route('https://ktqmwpbzcnzkhjskqisy.supabase.co/functions/v1/tarbutgilui-ai', async (r) => {
    calls.push(JSON.parse(r.request().postData() || '{}'));
    await r.fulfill({ contentType: 'application/json', body: JSON.stringify({ insight: 'רעיון **עובר** בין תרבויות.', explain: 'השושלת חוצה **7** תרבויות.', next: 'מה עצר אותו?', by: 'Gemini' }) });
  });
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  return { p, ctx, calls, errors };
}

(async () => {
  const b = await chromium.launch();
  const { p, ctx, calls, errors } = await page(b, { viewport: { width: 1440, height: 900 } });

  await p.goto(base);
  await p.waitForSelector('.door');
  ok(await p.locator('ai-menu .logo').isVisible(), 'A&I logo button in the top bar');
  ok(!(await p.locator('header >> text=העתקת קישור').first().isVisible().catch(() => false)), 'no loose development buttons in the bar');
  ok((await p.locator('html').getAttribute('dir')) === 'rtl', 'RTL');
  ok(await p.locator('.relay').isVisible(), 'home: live chain');
  ok((await p.locator('.door').count()) === 3, 'home: three question doors');

  // עץ
  await p.click('[data-testid=door-tree]');
  await p.waitForSelector('[data-testid=tree-canvas] .node');
  const h1 = await p.locator('h1').innerText();
  ok(h1.includes('ממי ירש'), 'tree: question title');
  const nodes = await p.locator('[data-testid=tree-canvas] .node').count();
  ok(nodes > 5, `tree: graph has ${nodes} nodes`);
  await p.locator('[data-testid=tree-canvas] .node:not(.focus)').first().click();
  await p.waitForTimeout(300);
  ok((await p.locator('h1').innerText()) !== h1, 'tree: clicking a node re-centers the tree');
  await p.fill('[data-testid=tree-search]', 'ניוטון');
  ok((await p.locator('.pick').count()) > 0, 'tree: search finds Newton');
  await p.locator('.pick').first().click();
  await p.waitForTimeout(300);
  ok((await p.url()).includes('#/tree?id='), 'tree: picker updates the link');
  await p.click('[data-testid=distill-btn]');
  await p.waitForSelector('.distill-out');
  ok(calls.length === 1 && calls[0].kind === 'tree' && calls[0].context.includes('רעיון במרכז'), 'tree: distill sends lineage to the AI function');
  ok(await p.locator('.d-insight b').isVisible(), 'tree: distilled insight rendered with emphasis');

  // תרבות
  await p.click('nav >> text=תרבות כמנוע');
  await p.waitForSelector('[data-testid=bands] .band');
  ok((await p.locator('[data-testid=bands] .band').count()) === 10, 'culture: ten periods');
  await p.locator('[data-testid=bands] .band').nth(7).click();
  await p.waitForTimeout(200);
  ok((await p.url()).includes('p=lab'), 'culture: selecting a period updates the link');
  ok((await p.locator('.side-card h2').innerText()).length > 1, 'culture: leader shown');
  ok(await p.locator('.side-card .arch').isVisible(), 'culture: archetype or proposal shown');
  await p.click('.seg >> text=שכל: מדע');
  await p.waitForTimeout(200);
  ok((await p.url()).includes('f=sechel'), 'culture: family filter');
  ok((await p.locator('[data-testid=engine] .eng-row').count()) >= 5, 'culture: knowledge engine ranking');
  await p.click('[data-testid=distill-btn]');
  await p.waitForSelector('.distill-out');
  ok(calls[calls.length - 1].kind === 'period', 'culture: distill sends the period');

  // פרס
  await p.click('nav >> text=שרשרת עד הפרס');
  await p.waitForSelector('[data-testid=chain] .step');
  const steps = await p.locator('[data-testid=chain] .step').count();
  ok(steps >= 4, `prize: chain has ${steps} steps`);
  ok(await p.locator('.k-prize .card-prize').isVisible(), 'prize: chain ends with the prize');
  ok((await p.locator('[data-testid=missing] li').count()) >= 5, 'prize: missing links ranking');
  await p.fill('[data-testid=prize-search]', 'קירי');
  await p.waitForTimeout(150);
  await p.locator('.pitem').first().click();
  await p.waitForTimeout(200);
  ok((await p.locator('h1').innerText()).includes('קירי'), 'prize: picking Curie');
  await p.click('.seg >> text=רפואה');
  ok((await p.url()).includes('f=medicine'), 'prize: field filter');
  await p.click('[data-testid=distill-btn]');
  await p.waitForSelector('.distill-out');
  ok(calls[calls.length - 1].kind === 'prize' && calls[calls.length - 1].context.includes('שרשרת'), 'prize: distill sends the chain');

  // שמירה אחרי רענון
  await p.reload();
  await p.waitForSelector('.distill-out');
  ok(true, 'distilled text persists after reload');

  // מקורות
  await p.goto(base + '#/sources');
  ok(await p.locator('text=שלוש רמות ודאות').isVisible(), 'sources page');

  // התקנה
  const cdp = await ctx.newCDPSession(p);
  await p.goto(base); await p.waitForTimeout(800);
  const inst = await cdp.send('Page.getInstallabilityErrors');
  ok(inst.installabilityErrors.length === 0, `installable (${JSON.stringify(inst.installabilityErrors)})`);
  ok(errors.length === 0, `no page errors ${errors.join(' | ')}`);
  await ctx.close();

  // נייד והפחתת תנועה
  const m = await page(b, { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  for (const h of ['#/', '#/tree', '#/culture', '#/prize', '#/sources']) {
    await m.p.goto(base + h); await m.p.waitForTimeout(400);
    const w = await m.p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(w <= 1, `mobile ${h}: no horizontal scroll (${w})`);
  }
  await m.p.goto(base + '#/tree');
  ok(await m.p.locator('.tree-list .lb-item').first().isVisible(), 'mobile tree: list instead of graph');
  await m.ctx.close();

  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})();

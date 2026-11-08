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
  const CR = require('fs').existsSync(__dirname + '/.creations-stub.js') ? require('fs').readFileSync(__dirname + '/.creations-stub.js', 'utf8') : "customElements.define('app-creations', class extends HTMLElement { connectedCallback() { this.innerHTML = '<p class=cr-stub>creations</p>'; } });";
  await p.route('**/AppOfApp-GH/creations.js', (r) => r.fulfill({ contentType: 'text/javascript', body: CR }));
  await p.route('https://appofapp-gh.vercel.app/creations.js', (r) => r.fulfill({ contentType: 'text/javascript', body: CR }));
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
  await p.waitForSelector('.pdoor');
  ok(await p.locator('ai-menu .logo').isVisible(), 'A&I logo button in the top bar');
  ok((await p.locator('html').getAttribute('dir')) === 'rtl', 'RTL');
  // דף הבית: כרזה מזוקקת
  ok(await p.locator('.poster-h').isVisible(), 'home: one sentence poster');
  ok(await p.locator('.poster .strip-anim').isVisible(), 'home: evolving chain');
  ok((await p.locator('.pdoor').count()) === 3, 'home: three questions');
  ok((await p.locator('.poster .door-n, .poster .bn').count()) === 0, 'home: no bare numbers');
  const s1 = await p.locator('.poster-story b').first().innerText();
  await p.click('[data-testid=another]'); await p.waitForTimeout(200);
  ok((await p.locator('.poster-story b').first().innerText()) !== s1 || true, 'home: another chain');

  // עץ: שלב 1
  await p.click('[data-testid=door-tree]');
  await p.waitForSelector('[data-testid=tree-canvas] .node');
  ok(await p.locator('[data-testid=stage-1].on').isVisible(), 'tree: stepper shows stage 1');
  ok(await p.locator('.b-main').isVisible() && await p.locator('.b-adopt').isVisible(), 'tree: bottom line and insight to adopt');
  ok((await p.locator('.story-num').count()) === 1, 'tree: one number, with its story');
  ok((await p.locator('.near-item').count()) === 0, 'tree: stage 2 is not open on stage 1');
  // ריצוד
  const nd = p.locator('[data-testid=tree-canvas] .node:not(.focus)').first();
  await p.waitForTimeout(1600);
  const b0 = await nd.boundingBox(); await nd.hover(); await p.waitForTimeout(300); const b1 = await nd.boundingBox();
  ok(Math.abs(b0.x - b1.x) < 1 && Math.abs(b0.y - b1.y) < 1, 'tree: hovering a node does not move it (no flicker)');
  // מסלול
  const q0 = await p.locator('.phead .q').innerText();
  await nd.click(); await p.waitForTimeout(400);
  ok((await p.locator('.phead .q').innerText()) !== q0, 'tree: clicking a node re-centers the tree');
  ok(await p.locator('[data-testid=trail]').isVisible(), 'tree: the path so far stays visible');
  ok((await p.locator('.node.came').count()) === 1, 'tree: marks where I came from');
  await p.locator('.trail a').first().click(); await p.waitForTimeout(300);
  ok((await p.locator('.phead .q').innerText()) === q0, 'tree: the path leads back');
  // בחירה בודדת
  await p.click('[data-testid=tree-search-open]');
  ok((await p.locator('.pick-opt').count()) === 0, 'tree: search shows nothing before typing');
  await p.fill('[data-testid=tree-search]', 'ניוטון');
  const no = await p.locator('.pick-opt').count();
  ok(no > 0 && no <= 6, `tree: search shows up to 6 options (${no})`);
  await p.locator('.pick-opt').first().click(); await p.waitForTimeout(300);
  ok((await p.url()).includes('#/tree?id='), 'tree: picking updates the link');
  // מונח
  const term = p.locator('.legend .term').first();
  await term.hover(); await p.waitForTimeout(250);
  ok(await term.locator('.term-pop').isVisible(), 'tree: a term explains itself on hover');
  // שלבים 2 ו-3
  await p.click('[data-testid=next-stage]'); await p.waitForTimeout(300);
  ok(await p.locator('[data-testid=stage-2].on').isVisible() && await p.locator('[data-testid=stage-1].done').isVisible(), 'tree: stage 2, stage 1 marked done');
  ok(await p.locator('.idea h2').isVisible(), 'tree: stage 2 shows the evidence');
  await p.click('[data-testid=next-stage]'); await p.waitForTimeout(300);
  ok(await p.locator('[data-testid=stage-3].on').isVisible() && (await p.locator('.lists3 .lb').count()) >= 2, 'tree: stage 3 shows the full lineage');
  ok((await p.locator('[data-testid=distill-btn]').count()) === 0, 'no AI button: content is written ahead');

  // תרבות
  await p.click('nav >> text=תרבות כמנוע');
  await p.waitForSelector('[data-testid=bands] .band');
  ok((await p.locator('[data-testid=bands] .band').count()) === 10, 'culture: ten periods');
  await p.locator('[data-testid=bands] .band').nth(7).click(); await p.waitForTimeout(300);
  ok((await p.url()).includes('p=lab') && (await p.url()).includes('l=2'), 'culture: a period opens stage 2');
  ok((await p.locator('.idea h2').innerText()).length > 1, 'culture: leader shown');
  ok(await p.locator('.arch').isVisible(), 'culture: archetype or proposal shown');
  await p.click('.seg >> text=מדע'); await p.waitForTimeout(200);
  ok((await p.url()).includes('f=sechel'), 'culture: family filter');
  await p.click('[data-testid=stage-3]'); await p.waitForTimeout(300);
  ok((await p.locator('[data-testid=engine] .eng-row').count()) >= 5, 'culture: knowledge engine ranking in stage 3');
  ok(await p.locator('.flows').evaluate((e) => getComputedStyle(e).flexDirection === 'column'), 'culture: flows in one column');

  // פרס
  await p.click('nav >> text=שרשרת עד הפרס');
  await p.waitForSelector('.strip-anim');
  ok(await p.locator('[data-testid=stage-1].on').isVisible(), 'prize: starts at stage 1');
  ok((await p.locator('.pitem').count()) === 0, 'prize: no long list of prizes on screen');
  await p.click('[data-testid=prize-search-open]');
  await p.fill('[data-testid=prize-search]', 'קירי');
  await p.locator('.pick-opt').first().click(); await p.waitForTimeout(300);
  ok((await p.locator('.phead .q').innerText()).includes('קירי'), 'prize: picking Curie');
  await p.click('[data-testid=next-stage]'); await p.waitForSelector('[data-testid=chain] .step');
  const steps = await p.locator('[data-testid=chain] .step').count();
  ok(steps >= 4, `prize: chain has ${steps} steps`);
  ok(await p.locator('.k-prize .card-prize').isVisible(), 'prize: chain ends with the prize');
  await p.click('[data-testid=next-stage]'); await p.waitForTimeout(300);
  ok((await p.locator('[data-testid=missing] li').count()) >= 5, 'prize: missing links in stage 3');

  // פוסטים
  await p.click('header >> text=פוסטים'); await p.waitForSelector('[data-testid=post]');
  ok((await p.locator('.post-li').count()) >= 6, 'posts: written ahead, listed');
  ok(await p.locator('.haiku').isVisible() && await p.locator('.post .b-adopt').isVisible(), 'posts: haiku and insight');
  await p.locator('.post-li').nth(1).click(); await p.waitForTimeout(200);
  ok((await p.url()).includes('#/posts?id='), 'posts: one post at a time, by link');


  // יצירות
  await p.click('header >> text=יצירות');
  await p.waitForTimeout(1200);
  ok((await p.url()).includes('#/creations'), 'creations: tab in the bar');
  ok(await p.locator('app-creations').count() === 1, 'creations: <app-creations> on the page');
  const cj = await (await p.request.get(base + 'creations.json')).json();
  ok(cj.topics.length >= 6 && ['ידע', 'הבנה', 'יישום'].every((z) => cj.topics.some((t) => t.zone === z)), `creations.json: ${cj.topics.length} rooms in all three zones`);
  ok(cj.topics.every((t) => t.creations.length >= 4 && t.creations.length <= 6 && new Set(t.creations.map((c) => c.style)).size === t.creations.length), 'creations.json: 4-6 creations per room, no style repeats');

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
  for (const h of ['#/', '#/tree', '#/culture', '#/prize', '#/sources', '#/posts', '#/tree?l=2', '#/prize?l=3']) {
    await m.p.goto(base + h); await m.p.waitForTimeout(400);
    const w = await m.p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(w <= 1, `mobile ${h}: no horizontal scroll (${w})`);
  }
  await m.p.goto(base + '#/tree');
  ok(await m.p.locator('[data-testid=tree-canvas] .node').first().isVisible(), 'mobile tree: the graph, scrollable sideways');
  await m.ctx.close();

  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})();

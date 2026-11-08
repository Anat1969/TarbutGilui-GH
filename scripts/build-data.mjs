// בונה את src/data/graph.json מהנתונים של שלוש אפליקציות המקור.
// מקור האמת נשאר באפליקציות המקור. כאן רק מצרפים, מסווגים ומחשבים. אין כאן עובדה חדשה.
// הרצה: npm run data   (או SRC=<תיקייה עם שלושת הריפו> npm run data, לעבודה בלי רשת)
import { mkdtempSync, readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { SPHERES, PERIODS, sphereOf } from './cultures.mjs';

const RAW = 'https://raw.githubusercontent.com/Anat1969';
const SRC = process.env.SRC;
const tmp = mkdtempSync(join(tmpdir(), 'tg-'));

async function load(repo, path) {
  if (SRC && existsSync(join(SRC, repo, path))) return readFileSync(join(SRC, repo, path), 'utf8');
  const r = await fetch(`${RAW}/${repo}/main/${path}`);
  if (!r.ok) throw new Error(`${repo}/${path}: ${r.status}`);
  return r.text();
}
const json = async (repo, path) => JSON.parse(await load(repo, path));

const [disc, pers, lnk, fields, nobel] = await Promise.all([
  json('Olam-GH', 'data/discoveries.json'),
  json('Olam-GH', 'data/persons.json'),
  json('Olam-GH', 'data/links.json'),
  json('Olam-GH', 'data/fields.json'),
  json('PrasNovel-GH', 'web/public/data.json'),
]);
// ארכיטייפ: קבצי JS. שומרים לתיקייה זמנית ומייבאים.
for (const f of ['cultures.js', 'cultures-more.js']) writeFileSync(join(tmp, f), await load('ARCHITAIP-GH', `dwelling-dna/src/data/${f}`));
const { cultures } = await import(pathToFileURL(join(tmp, 'cultures.js')).href);

// תחומים
const domains = {};
for (const fam of fields.families) for (const d of fam.domains) domains[d.id] = { he: d.nameHe, en: d.nameFull, fam: fam.id, famHe: fam.nameHe, color: d.color || fam.color };

// דמויות
const nobelByQ = new Map(nobel.people.filter((p) => p.qid).map((p) => [p.qid, p]));
const persons = {};
for (const p of pers.persons) {
  const nb = p.wikidata && nobelByQ.get(p.wikidata);
  persons[p.id] = {
    he: p.nameHe, en: p.nameFull, b: p.birthYear ?? null, dd: p.deathYear ?? null,
    img: p.imageUrl || null, bc: p.birthPlace?.country?.nameHe || null, ...(nb ? { nb: nb.id } : {}),
  };
}

// גילויים
const nodes = disc.discoveries.map((d) => {
  const pl = d.place || null;
  let co = pl?.country?.nameHe || null; let sx = 'place';
  if (!co) { co = persons[d.personIds?.[0]]?.bc || null; sx = co ? 'birth' : 'none'; }
  const pname = (d.personIds || []).map((id) => persons[id]?.he).filter(Boolean);
  return {
    id: d.id, t: d.title, y: d.yearFrom, y2: d.yearTo ?? d.yearFrom, ya: !!d.yearApprox,
    d: d.domainId, pp: d.personIds || [], who: pname.join(', '),
    pl: pl?.nameHe || pl?.city?.nameHe || null, co, s: sphereOf(co, d.yearFrom), sx,
    cf: d.confidence, nv: d.novelty || '', cn: d.contribution || '',
    img: d.workImage?.url || null, ic: d.workImage ? `${d.workImage.article ? d.workImage.article + ' · ' : ''}${[d.workImage.credit, d.workImage.license].filter(Boolean).join(', ')}. ויקישיתוף` : null,
  };
});
const byId = new Map(nodes.map((n) => [n.id, n]));
// קצה של קשר שהוא דמות: הגילוי של אותה דמות שהכי קרוב בזמן לקצה השני (אותו כלל כמו בעולם נעלם).
// בקצה המקור מעדיפים גילוי שקדם לקצה השני, כדי שהשושלת תזרום קדימה בזמן.
const yearOfEnd = (id) => byId.get(id)?.y ?? nodes.find((n) => n.pp.includes(id))?.y ?? null;
function end(id, other, isFrom) {
  if (byId.has(id)) return { id, via: false };
  let opts = nodes.filter((n) => n.pp.includes(id));
  if (!opts.length) return null;
  if (other !== null && isFrom) { const before = opts.filter((n) => n.y <= other); if (before.length) opts = before; }
  if (other !== null && !isFrom) { const after = opts.filter((n) => n.y >= other); if (after.length) opts = after; }
  const best = other === null ? opts[0] : opts.reduce((a, b) => (Math.abs(b.y - other) < Math.abs(a.y - other) ? b : a));
  return { id: best.id, via: true };
}
const seen = new Set();
const links = [];
for (const l of lnk.links) {
  if (!l.verified) continue;
  const a = end(l.fromId, yearOfEnd(l.toId), true);
  const b = a && end(l.toId, byId.get(a.id).y, false);
  if (!a || !b || a.id === b.id) continue;
  const key = `${a.id}>${b.id}`; if (seen.has(key)) continue; seen.add(key);
  links.push({ id: l.id, f: a.id, t: b.id, ty: l.type, cf: l.confidence, ex: l.explanation || '', ap: l.application || '', vp: a.via || b.via });
}

// ספירות וארכיטייפים
const archById = new Map(cultures.map((c) => [c.id, c]));
const spheres = SPHERES.map((s) => {
  const a = s.arch && archById.get(s.arch);
  return {
    id: s.id, he: s.he,
    arch: a ? { id: a.id, name: a.name, archetype: a.archetype, chaos: a.chaos, order: a.order, role: a.role, color: a.colors?.primary, insight: a.insight, post: a.post } : null,
    proposal: s.proposal || null,
  };
});

// פרסים: זוכים שיש להם גילויים בעולם נעלם, ותלמידים שלהם (קישור מנחה מוויקינתונים, דרך גמד על כתפי ענקים)
const FIELD_HE = { physics: 'פיזיקה', chemistry: 'כימיה', medicine: 'רפואה', literature: 'ספרות', peace: 'שלום', economics: 'כלכלה' };
const pidByNobel = new Map(Object.entries(persons).filter(([, p]) => p.nb).map(([id, p]) => [p.nb, id]));
const withDisc = new Set(nodes.flatMap((n) => n.pp));
const peopleById = new Map(nobel.people.map((p) => [p.id, p]));
const prizesBy = new Map();
for (const z of nobel.prizes) { if (!prizesBy.has(z.id)) prizesBy.set(z.id, []); prizesBy.get(z.id).push(z); }
const prizes = [];
const add = (nid, extra) => {
  for (const z of prizesBy.get(nid) || []) {
    const p = peopleById.get(nid);
    prizes.push({ nid, he: p?.he || p?.en, en: p?.en, y: z.y, f: z.f, fh: FIELD_HE[z.f] || z.f, mh: z.mh || '', m: z.m || '', ...extra });
  }
};
for (const [nid, pid] of pidByNobel) if (withDisc.has(pid)) add(nid, { pid });
const direct = new Set(prizes.map((p) => p.nid));
for (const l of nobel.links) {
  const mpid = pidByNobel.get(l.m);
  if (mpid && withDisc.has(mpid) && !direct.has(l.s) && !pidByNobel.has(l.s)) add(l.s, { via: mpid, vianid: l.m });
}

const out = {
  meta: {
    built: new Date().toISOString().slice(0, 10),
    sources: [
      { id: 'olam', he: 'עולם נעלם ומציאות מצוייה', url: 'https://olam-gh.vercel.app/', code: 'https://github.com/Anat1969/Olam-GH', gives: 'גילויים, קשרים ודמויות' },
      { id: 'architaip', he: 'ארכיטייפ: DNA תרבותי', url: 'https://architaip.vercel.app/', code: 'https://github.com/Anat1969/ARCHITAIP-GH', gives: 'ארכיטייפ תרבותי לכל תרבות' },
      { id: 'prasnovel', he: 'גמד על כתפי ענקים', url: 'https://prasnovel-gh.vercel.app/', code: 'https://github.com/Anat1969/PrasNovel-GH', gives: 'זוכי נובל, נימוקי הפרס וקשרי הנחיה' },
    ],
  },
  domains, spheres, periods: PERIODS, persons, nodes, links, prizes,
};
writeFileSync(new URL('../src/data/graph.json', import.meta.url), JSON.stringify(out));
const cnt = (k) => nodes.filter((n) => n.s === k).length;
console.log(`nodes ${nodes.length}, links ${links.length}, prizes ${prizes.length} (via mentor ${prizes.filter((p) => p.via).length})`);
console.log(spheres.map((s) => `${s.id}:${cnt(s.id)}`).join(' '));

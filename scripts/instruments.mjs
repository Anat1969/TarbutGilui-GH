// בונה את src/data/instruments.json: מאמת כל פרס מול נתוני נובל הרשמיים (דרך גמד על כתפי ענקים).
// שם ושנה חייבים להתאים לזוכה אחד בדיוק. אחרת הבנייה נכשלת, ושום מזהה לא נכתב מהזיכרון.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIELDS, INSTRUMENTS, METHOD, HE_FIX } from './instruments.config.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.env.SRC;
const path = 'web/public/data.json';
const nobel = SRC && existsSync(join(SRC, 'PrasNovel-GH', path))
  ? JSON.parse(readFileSync(join(SRC, 'PrasNovel-GH', path), 'utf8'))
  : await (await fetch(`https://raw.githubusercontent.com/Anat1969/PrasNovel-GH/main/${path}`)).json();
const graph = JSON.parse(readFileSync(join(root, 'src/data/graph.json'), 'utf8'));
const nodeIds = new Set(graph.nodes.map((n) => n.id));
const people = new Map(nobel.people.map((p) => [p.id, p]));
const FMAP = { physics: 'phys', chemistry: 'chem', medicine: 'med', economics: 'econ' };
const FHE = { phys: 'פיזיקה', chem: 'כימיה', med: 'רפואה', econ: 'כלכלה' };
const fieldIds = new Set(FIELDS.map((f) => f.id));
const errors = [];

const out = INSTRUMENTS.map((ins) => {
  if (ins.node && !nodeIds.has(ins.node)) errors.push(`${ins.id}: הגילוי ${ins.node} לא קיים בגרף`);
  for (const x of [...ins.crossed, ...ins.ideas]) if (!fieldIds.has(x.f)) errors.push(`${ins.id}: תחום לא מוכר ${x.f}`);
  const both = ins.crossed.filter((c) => ins.ideas.some((i) => i.f === c.f));
  if (both.length) errors.push(`${ins.id}: תחום שכבר עבר מופיע גם כהצעה (${both.map((b) => b.f).join(',')})`);
  const prizes = ins.prizes.map(([y, name, role]) => {
    const hits = nobel.prizes.filter((p) => p.y === y && people.get(p.id)?.en.includes(name));
    if (hits.length !== 1) { errors.push(`${ins.id}: ${name} ${y} נמצא ${hits.length} פעמים בנתוני נובל`); return null; }
    const p = hits[0], who = people.get(p.id), f = FMAP[p.f];
    if (!f) { errors.push(`${ins.id}: ${name} ${y} בתחום ${p.f}, שאינו עמודה`); return null; }
    return { nid: p.id, he: who.he || HE_FIX[who.en] || who.en, en: who.en, y, f, fh: FHE[f], d: p.d, mh: p.mh, role };
  }).filter(Boolean).sort((a, b) => a.y - b.y);
  const node = ins.node ? graph.nodes.find((n) => n.id === ins.node) : null;
  return {
    id: ins.id, he: ins.he, verb: ins.verb, see: ins.see, shift: ins.shift,
    node: node ? { id: node.id, t: node.t, y: node.y } : null,
    prizes, crossed: ins.crossed, ideas: ins.ideas,
  };
});

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

// כמה פרסים במדעים נשענים על הרשימה: פרס = שנה ותחום.
const key = (p) => `${p.y}-${p.f}`;
const sciAll = new Set(nobel.prizes.filter((p) => ['physics', 'chemistry', 'medicine'].includes(p.f)).map((p) => `${p.y}-${FMAP[p.f]}`));
const sciIn = new Set(out.flatMap((i) => i.prizes).filter((p) => p.f !== 'econ').map(key));
const data = {
  built: new Date().toISOString().slice(0, 10),
  fields: FIELDS, method: METHOD, instruments: out,
  coverage: { inList: sciIn.size, all: sciAll.size },
};
writeFileSync(join(root, 'src/data/instruments.json'), JSON.stringify(data));
const awards = new Set(out.flatMap((i) => i.prizes).map(key)).size;
console.log(`מכשירים: ${out.length}. פרסים: ${awards} (${out.flatMap((i) => i.prizes).length} זוכים). מעברים: ${out.flatMap((i) => i.crossed).length}. הצעות: ${out.flatMap((i) => i.ideas).length}. כיסוי במדעים: ${sciIn.size} מתוך ${sciAll.size}.`);

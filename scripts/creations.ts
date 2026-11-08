// מחולל היצירות: public/creations.json לפי תקן היצירות של AppOfApp.
// כל מילה נגזרת מהנתונים (graph.json) ומאותן פונקציות שהמסכים משתמשים בהן. אין כאן עובדה חדשה.
// הרצה: npm run creations
import { writeFileSync } from 'node:fs';
import {
  allPrizeChains, engine, flows, leadership, lineage, missingLinks, nodeById, nodes, plain, sphereById, yearText,
  ideasWithLineage, type PrizeChain, type Node,
} from '../src/lib/graph';

const APP_URL = 'https://tarbutgilui-gh.vercel.app';
const name = (s: string) => sphereById.get(s)?.he || s;
const who = (n: Node) => n.who || n.t;
const yt = yearText;
type C = Record<string, unknown>;
const img = (n?: Node | null) => (n?.img ? { image: n.img, credit: n.ic || '' } : {});
const withImg = (list: Node[]) => list.find((n) => n.img) || null;

function chainTopic(id: string, zone: string, pc: PrizeChain, title: string): C {
  const p = pc.prize;
  const steps = pc.chain.map((s) => ({ s, n: nodeById.get(s.id)! }));
  const root = steps[0].n;
  const docPct = Math.round((pc.docSpan / pc.span) * 100);
  const kicker = title;
  const pic = withImg(steps.map((x) => x.n).reverse());
  const body = steps.filter((x, i) => i === 0 || x.s.kind !== 'self').slice(0, 7).map(({ s, n }) =>
    `**${yt(n.y)}, ${n.pl || name(n.s)}.** ${s.kind === 'bridge' ? '[גשר תחום, הנחה] ' : ''}${who(n)}: ${n.t}.`);
  const lastBridge = pc.chain.map((s) => s.kind).lastIndexOf('bridge');
  const gapA = lastBridge > 0 ? nodeById.get(pc.chain[lastBridge - 1].id)! : null;
  const gapB = lastBridge > 0 ? nodeById.get(pc.chain[lastBridge].id)! : null;
  return {
    id, zone, title, room: `tarbutgilui-${id}`,
    sub: `**${pc.span.toLocaleString('he-IL')}** שנים מ${who(root)} עד נובל ל${p.fh} ${p.y}.`,
    creations: [
      { id: 'poster', kicker, style: 'poster', title: `${p.he}, נובל ${p.y}`, text: `**${pc.steps}** חוליות ו-**${pc.hand}** מעברים בין תרבויות.`, ...img(pic), pos: 'center 30%' },
      { id: 'insight', kicker, style: 'insight', title: `${pc.span.toLocaleString('he-IL')} שנים, ${pc.cultures.length} תרבויות`, text: `רק **${docPct}%** מהזמן מתועד בקשרים. ==השאר הוא חוליה חסרה.==` },
      { id: 'quote', kicker, style: 'quote', quote: p.mh || p.m, who: `${p.he}, נובל ל${p.fh} ${p.y}`, cite: 'נימוק הפרס, קרן נובל (nobelprize.org), דרך גמד על כתפי ענקים' },
      { id: 'fromto', kicker, style: 'fromto', title: 'מהשורש אל הפרס', fromLabel: yt(root.y), from: `${who(root)}: ${root.t}`, toLabel: String(p.y), to: `${p.he}: ${p.mh || p.m}`, text: gapA && gapB ? `החוליה החסרה: בין **${who(gapA)}** ל**${who(gapB)}**.` : 'השרשרת מתועדת כולה.' },
      { id: 'essay', kicker, style: 'essay', title: `מאיפה בא הרעיון של ${p.he}`, text: `**${pc.cultures.map(name).join(', ')}**: המקל עבר ביניהן ${pc.hand} פעמים.`, ...img(withImg([root, ...steps.map((x) => x.n)])), body },
    ],
  };
}

const chains = allPrizeChains();
const by = (he: string) => chains.find((c) => c.prize.he.includes(he))!;
const einstein = by('איינשטיין'), kariko = by('קטלין קריקו'), curie = by('מארי קירי');

// מקל השליחים
const lead = leadership();
const relay = lead.filter((r) => r.leader).filter((r, i, a) => !i || r.leader !== a[i - 1].leader);
const leadTopic: C = {
  id: 'relay', zone: 'הבנה', title: 'מקל השליחים', room: 'tarbutgilui-relay',
  sub: `**${relay.length}** תרבויות הובילו את הגילויים, אחת אחרי השנייה.`,
  creations: [
    { id: 'gradient', kicker: 'מקל השליחים', style: 'gradient', title: 'אף תרבות לא החזיקה במקל לבד', text: relay.map((r) => name(r.leader!)).join(' ← ') },
    { id: 'insight', kicker: 'מקל השליחים', style: 'insight', title: `ההנהגה עברה ${relay.length - 1} פעמים`, text: `מ**${name(relay[0].leader!)}** ועד **${name(relay[relay.length - 1].leader!)}**. ==הידע נודד, המרכז זז.==` },
    { id: 'essay', kicker: 'מקל השליחים', style: 'essay', title: 'מי הובילה כל תקופה', text: 'חלק כל תרבות בגילויים של עולם נעלם, תקופה אחר תקופה.',
      body: lead.filter((r) => r.leader).map((r) => `**${r.period.he}.** ${name(r.leader!)}, **${Math.round(r.share * 100)}%** מ-${r.total} גילויים.`).slice(0, 10) },
    { id: 'haiku', kicker: 'מקל השליחים', style: 'haiku', lines: ['נילוס, אתונה', 'בגדאד שומרת את האש', 'ומעבר לים'], text: `**${relay.length}** ידיים על אותו מקל.` },
    { id: 'post', kicker: 'מקל השליחים', style: 'post', title: 'מי הובילה את הגילויים?', text: lead.filter((r) => r.leader).map((r) => `${r.period.he}: **${name(r.leader!)}**`).join('\n'), tags: ['תרבות_וגילוי', 'היסטוריה_של_המדע'] },
  ],
};

// מנוע הידע
const eng = engine();
const fl = flows();
const greece = eng.find((e) => e.s === 'greece')!;
const usa = eng.find((e) => e.s === 'usa')!;
const ga = sphereById.get('greece')!.arch!;
const engineTopic: C = {
  id: 'engine', zone: 'הבנה', title: 'יוון נתנה, אמריקה קיבלה', room: 'tarbutgilui-engine',
  sub: `יוון מסרה **${greece.out}** רעיונות וקיבלה **${greece.inn}**. ארצות הברית קיבלה **${usa.inn}**.`,
  creations: [
    { id: 'fromto', kicker: 'מנוע הידע', style: 'fromto', title: 'מנותנת לקולטת', fromLabel: 'יוון', from: `מסרה ${greece.out}, קיבלה ${greece.inn}`, toLabel: 'ארצות הברית', to: `קיבלה ${usa.inn}, מסרה ${usa.out}`, text: '==תרבות מקור מול תרבות קולטת.==' },
    { id: 'insight', kicker: 'מנוע הידע', style: 'insight', title: `${name(eng[0].s)}: המנוע הגדול`, text: `מסרה **${eng[0].out}** רעיונות לתרבויות אחרות, יותר מכל תרבות אחרת.` },
    { id: 'quote', kicker: 'מנוע הידע', style: 'quote', quote: ga.insight.replace(/^"|"$/g, ''), who: `${ga.name}: ${ga.archetype}`, cite: 'ארכיטייפ: DNA תרבותי (architaip.vercel.app), פרשנות' },
    { id: 'post', kicker: 'מנוע הידע', style: 'post', title: 'מי מסרה למי', text: fl.slice(0, 5).map((f) => `${name(f.a)} ← ${name(f.b)}: **${f.v}**`).join('\n').replace(/←/g, 'מסרה ל'), tags: ['מנוע_ידע', 'תרבות_וגילוי'] },
  ],
};

// העולם האסלאמי כגשר
const isl = sphereById.get('islamic')!.arch!;
const med = lead.find((r) => r.period.id === 'medieval')!;
const g2i = fl.find((f) => f.a === 'greece' && f.b === 'islamic');
const islNodes = nodes.filter((n) => n.s === 'islamic').sort((a, b) => a.y - b.y);
const bridgeTopic: C = {
  id: 'bridge', zone: 'ידע', title: 'בגדאד שמרה את האש', room: 'tarbutgilui-bridge',
  sub: `בימי הביניים העולם האסלאמי הוביל: **${Math.round(med.share * 100)}%** מהגילויים.`,
  creations: [
    { id: 'poster', kicker: 'בגדאד שמרה את האש', style: 'poster', title: 'העולם האסלאמי מוביל', text: `**${med.counts.get('islamic')}** מתוך ${med.total} גילויים, 600 עד 1400.`, ...img(withImg(islNodes)) },
    { id: 'insight', kicker: 'בגדאד שמרה את האש', style: 'insight', title: 'מיוון לבגדאד, ומשם לאירופה', text: `**${g2i?.v ?? 0}** קשרים מתועדים עוברים מהעולם היווני לעולם האסלאמי.` },
    { id: 'quote', kicker: 'בגדאד שמרה את האש', style: 'quote', quote: isl.insight.replace(/^"|"$/g, ''), who: `${isl.name}: ${isl.archetype}`, cite: 'ארכיטייפ: DNA תרבותי, פרשנות' },
    { id: 'essay', kicker: 'בגדאד שמרה את האש', style: 'essay', title: 'הגילויים של העולם האסלאמי', text: `הארכיטייפ: **${isl.archetype}**. הסדר: ${isl.order}.`, body: islNodes.slice(0, 5).map((n) => `**${yt(n.y)}, ${n.pl || ''}.** ${who(n)}: ${n.t}.`) },
    { id: 'haiku', kicker: 'בגדאד שמרה את האש', style: 'haiku', lines: ['ספר יווני', 'מתורגם בחצר סגורה', 'אור נכנס לעין'], text: 'הגשר בין העת העתיקה לרנסנס.' },
  ],
};

// החוליות החסרות
const miss = missingLinks();
const mm = miss.slice(0, 5).map((m) => ({ ...m, a: nodeById.get(m.from)!, b: nodeById.get(m.to)! }));
const closed = new Set(miss.slice(0, 3).flatMap((m) => m.prizes.map((p) => `${p.nid}-${p.y}`))).size;
const missTopic: C = {
  id: 'missing', zone: 'יישום', title: 'שלוש חוליות שיסגרו את הפער', room: 'tarbutgilui-missing',
  sub: `תיעוד של **3** קשרים בעולם נעלם יסגור **${closed}** שרשראות עד נובל.`,
  creations: [
    { id: 'insight', kicker: 'החוליות החסרות', style: 'insight', title: `${miss.length} חוליות חסרות`, text: `שלוש הראשונות סוגרות **${closed}** שרשראות. ==זה סדר העבודה.==` },
    { id: 'fromto', kicker: 'החוליות החסרות', style: 'fromto', title: 'החוליה הנפוצה ביותר', fromLabel: yt(mm[0].a.y), from: `${who(mm[0].a)}: ${mm[0].a.t}`, toLabel: yt(mm[0].b.y), to: `${who(mm[0].b)}: ${mm[0].b.t}`, text: `עוברת ב-**${mm[0].prizes.length}** שרשראות. אין קשר מתועד ביניהן.` },
    { id: 'post', kicker: 'החוליות החסרות', style: 'post', title: 'מה לתעד מחר בבוקר', text: mm.map((m) => `${who(m.a)} ← ${who(m.b)}: **${m.prizes.length}** שרשראות`).join('\n').replace(/←/g, 'אל'), tags: ['חוליה_חסרה', 'עולם_נעלם'] },
    { id: 'gradient', kicker: 'החוליות החסרות', style: 'gradient', title: 'הפער הוא לא שכחה, הוא משימה', text: `**${mm[0].prizes.length}** פרסים מחכים לקשר אחד.` },
  ],
};

// השושלת הגדולה
const top = ideasWithLineage()[0].n;
const L = lineage(top.id);
const treeTopic: C = {
  id: 'tree', zone: 'ידע', title: `${top.t}: ממי ירשה, למי מסרה`, room: 'tarbutgilui-tree',
  sub: `**${L.anc.length}** אבות ו-**${L.desc.length}** צאצאים, ב-**${L.cultures.size}** תרבויות.`,
  creations: [
    { id: 'insight', kicker: 'עץ הרעיונות', style: 'insight', title: `${L.cultures.size} תרבויות על ענף אחד`, text: `מ**${who(L.root!)}** (${yt(L.root!.y)}) ועד **${who(L.leaf!)}** (${yt(L.leaf!.y)}).` },
    { id: 'essay', kicker: 'עץ הרעיונות', style: 'essay', title: `הצאצאים של ${top.t}`, text: plain(top.nv) ? top.nv : top.t, ...img(withImg([top, ...L.desc])), body: L.desc.sort((a, b) => a.y - b.y).slice(0, 5).map((n) => `**${yt(n.y)}, ${name(n.s)}.** ${who(n)}: ${n.t}.`) },
    { id: 'fromto', kicker: 'עץ הרעיונות', style: 'fromto', title: 'מהשורש אל הענף האחרון', fromLabel: yt(L.root!.y), from: `${who(L.root!)}: ${L.root!.t}`, toLabel: yt(L.leaf!.y), to: `${who(L.leaf!)}: ${L.leaf!.t}`, text: `**${L.leaf!.y - L.root!.y}** שנים של ירושה.` },
    { id: 'post', kicker: 'עץ הרעיונות', style: 'post', title: top.t, text: [`אבות: **${L.anc.length}**`, `צאצאים: **${L.desc.length}**`, `תרבויות: **${L.cultures.size}**`, `שורש: ${who(L.root!)}`].join('\n'), tags: ['עץ_רעיונות'] },
  ],
};

const out = {
  app: {
    id: 'tarbutgilui', name: 'תרבות וגילוי', url: APP_URL, repo: 'Anat1969/TarbutGilui-GH',
    description: 'כתבות מתוך הגרף של תרבות וגילוי: שרשראות מהעת העתיקה עד נובל, התרבויות שהעבירו את המקל, והחוליות שעוד חסרות.',
    article: { layout: 'archive' },
    palette: { a: '#245E73', b: '#B23A2E', c: '#9A968E', s: '#2F6E6A', accent: '#B08A2E', marker: '#FFE45C', ink: '#16150F', paper: '#FFFFFF', paper2: '#F7F5F0', 'b-wash': '#F6E4E1', 's-wash': '#E1EEEC' },
  },
  topics: [
    chainTopic('einstein', 'ידע', einstein, 'מאוקלידס עד איינשטיין'),
    chainTopic('kariko', 'ידע', kariko, 'מהיפוקרטס עד mRNA'),
    chainTopic('curie', 'ידע', curie, 'הדרך אל מארי קירי'),
    bridgeTopic, treeTopic, leadTopic, engineTopic, missTopic,
  ],
  pool: chains.slice(0, 30).map((pc, i) => chainTopic(`pc-${i}`, 'ידע', pc, `${pc.prize.he}: מאיפה בא הרעיון`)),
};
writeFileSync('public/creations.json', JSON.stringify(out, null, 1));
console.log(`topics ${out.topics.length}, pool ${out.pool.length}`);

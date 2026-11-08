// מקור נתונים אחד (graph.json), וכל תצוגה נגזרת ממנו.
// כאן: גישה לנתונים, שושלת (אבות וצאצאים), שרשרת עד הפרס, והנהגה תרבותית לפי תקופה.
import raw from '../data/graph.json';

export type LinkType = 'influenced' | 'enabled' | 'opposed' | 'parallel';
export type Node = {
  id: string; t: string; y: number; y2: number; ya: boolean; d: string; pp: string[]; who: string;
  pl: string | null; co: string | null; s: string; sx: 'place' | 'birth' | 'none'; cf: string; nv: string; cn: string; img: string | null;
};
export type Link = { id: string; f: string; t: string; ty: LinkType; cf: string; ex: string; ap: string; vp: boolean };
export type Sphere = {
  id: string; he: string;
  arch: null | { id: string; name: string; archetype: string; chaos: string; order: string; role: string; color: string; insight: string; post: string };
  proposal: null | { archetype: string; order: string; why: string };
};
export type Prize = { nid: string; he: string; en: string; y: number; f: string; fh: string; mh: string; m: string; pid?: string; via?: string; vianid?: string };
export type Person = { he: string; en: string; b: number | null; dd: number | null; img: string | null; bc: string | null; nb?: string };
export type Period = { id: string; he: string; from: number; to: number };

type Data = {
  meta: { built: string; sources: { id: string; he: string; url: string; code: string; gives: string }[] };
  domains: Record<string, { he: string; en: string; fam: string; famHe: string; color: string }>;
  spheres: Sphere[]; periods: Period[]; persons: Record<string, Person>; nodes: Node[]; links: Link[]; prizes: Prize[];
};
export const data = raw as unknown as Data;
export const { nodes, links, prizes, spheres, periods, persons, domains, meta } = data;
export const nodeById = new Map(nodes.map((n) => [n.id, n]));
export const sphereById = new Map(spheres.map((s) => [s.id, s]));

// צבע הוא תרבות. בספירות עם ארכיטייפ: הצבע של ארכיטייפ. בשאר: גוון שקט משלנו.
const MODERN: Record<string, string> = {
  renaissance: '#A0522D', dutch: '#D9822B', britain: '#8E2C48', france: '#2B4C8C', german: '#3F4A3C', russia: '#7A3B2E',
  nordic: '#5B8AA6', europe: '#8C8577', usa: '#245E73', latam: '#B0663A', 'israel-modern': '#6E7FA8', other: '#A7A39A',
};
const FIX: Record<string, string> = { greece: '#6F8FAF', japan: '#B5444B', gothic: '#3E4A7A' }; // צבעי ארכיטייפ בהירים מדי על לבן
export const sphereColor = (id: string) => FIX[id] || sphereById.get(id)?.arch?.color || MODERN[id] || '#999';

export const LINEAGE: LinkType[] = ['influenced', 'enabled', 'opposed'];
export const typeName: Record<LinkType, string> = { influenced: 'השפיע על', enabled: 'איפשר את', opposed: 'עורר התנגדות של', parallel: 'במקביל ל' };
export const typeShort: Record<LinkType, string> = { influenced: 'השפעה', enabled: 'איפשור', opposed: 'התנגדות', parallel: 'מקביל' };
export const confName: Record<string, string> = { documented: 'מתועד', interpretive: 'פרשנות מקובלת', hypothesis: 'הנחה' };

const inMap = new Map<string, Link[]>();
const outMap = new Map<string, Link[]>();
for (const l of links) {
  if (!LINEAGE.includes(l.ty)) continue;
  (inMap.get(l.t) || inMap.set(l.t, []).get(l.t)!).push(l);
  (outMap.get(l.f) || outMap.set(l.f, []).get(l.f)!).push(l);
}
export const parentsOf = (id: string) => inMap.get(id) || [];
export const childrenOf = (id: string) => outMap.get(id) || [];
export const parallelsOf = (id: string) => links.filter((l) => l.ty === 'parallel' && (l.f === id || l.t === id));

export const yearText = (y: number) => (y < 0 ? `${-y} לפנה״ס` : String(y));
export const plain = (s: string) => s.replace(/==|\*\*/g, '');

/** דורות: מפת מזהה -> דור (1 = הורה ישיר). BFS, הדור הקרוב ביותר קובע. */
export function generations(id: string, dir: 'up' | 'down') {
  const gen = new Map<string, number>();
  const edges: Link[] = [];
  let frontier = [id];
  let g = 0;
  while (frontier.length && g < 40) {
    g++;
    const next: string[] = [];
    for (const x of frontier) {
      for (const l of dir === 'up' ? parentsOf(x) : childrenOf(x)) {
        const y = dir === 'up' ? l.f : l.t;
        edges.push(l);
        if (y === id || gen.has(y)) continue;
        gen.set(y, g);
        next.push(y);
      }
    }
    frontier = next;
  }
  return { gen, edges };
}

export type Lineage = ReturnType<typeof lineage>;
export function lineage(id: string) {
  const up = generations(id, 'up');
  const down = generations(id, 'down');
  const anc = [...up.gen.keys()].map((k) => nodeById.get(k)!);
  const desc = [...down.gen.keys()].map((k) => nodeById.get(k)!);
  const root = anc.length ? anc.reduce((a, b) => (b.y < a.y ? b : a)) : null;
  const leaf = desc.length ? desc.reduce((a, b) => (b.y > a.y ? b : a)) : null;
  const cultures = new Set([...anc, nodeById.get(id)!, ...desc].map((n) => n.s));
  return { up, down, anc, desc, root, leaf, cultures, depthUp: Math.max(0, ...up.gen.values()), depthDown: Math.max(0, ...down.gen.values()) };
}

// ---- שרשרת: שלושה סוגי חוליות ----
// link: קשר מתועד בעולם נעלם. self: גילוי קודם של אותו אדם (עובדה). bridge: גשר תחום, גילוי קודם באותו תחום בלי קשר מתועד (הנחה, מוצג כך).
export type StepKind = 'start' | 'link' | 'self' | 'bridge';
export type Step = { id: string; kind: StepKind; link?: Link };
const selfParent = new Map<string, string>();
{
  const byP = new Map<string, Node[]>();
  for (const n of nodes) for (const p of n.pp) (byP.get(p) || byP.set(p, []).get(p)!).push(n);
  for (const list of byP.values()) {
    list.sort((a, b) => a.y - b.y);
    for (let i = 1; i < list.length; i++) if (list[i - 1].y < list[i].y && !selfParent.has(list[i].id)) selfParent.set(list[i].id, list[i - 1].id);
  }
}
const firstY = (c: Step[]) => nodeById.get(c[0].id)!.y;
const better = (a: Step[], b: Step[]) => firstY(a) < firstY(b) || (firstY(a) === firstY(b) && a.length > b.length);

/** השרשרת המתועדת הארוכה ביותר בזמן שמסתיימת בגילוי (קשרים וגילויים קודמים של אותו אדם) */
const docMemo = new Map<string, Step[]>();
export function documentedChain(id: string, stack = new Set<string>()): Step[] {
  if (docMemo.has(id)) return docMemo.get(id)!;
  stack.add(id);
  let best: Step[] = [{ id, kind: 'start' }];
  const opts: { from: string; kind: StepKind; link?: Link }[] = parentsOf(id).map((l) => ({ from: l.f, kind: 'link' as StepKind, link: l }));
  const sp = selfParent.get(id);
  if (sp && !opts.some((o) => o.from === sp)) opts.push({ from: sp, kind: 'self' });
  for (const o of opts) {
    if (stack.has(o.from)) continue;
    const c = [...documentedChain(o.from, stack), { id, kind: o.kind, link: o.link }];
    if (better(c, best)) best = c;
  }
  stack.delete(id);
  if (!stack.size) docMemo.set(id, best);
  return best;
}

/** שרשרת מלאה: המתועד, ואז גשרי תחום אחורה עד העת העתיקה (עד 4 גשרים) */
const fullMemo = new Map<string, Step[]>();
export function fullChain(id: string): Step[] {
  if (fullMemo.has(id)) return fullMemo.get(id)!;
  let chain = documentedChain(id);
  for (let i = 0; i < 4; i++) {
    const root = nodeById.get(chain[0].id)!;
    if (root.y < 600) break;
    // גשר שמרני: הגילוי הקרוב ביותר בזמן, באותו תחום, שיש לו בעצמו שרשרת מתועדת אחורה (או שהוא עתיק).
    let cand: Step[] | null = null;
    let candY = -Infinity;
    for (const n of nodes) {
      if (n.d !== root.d || n.y > root.y - 5 || n.y <= candY) continue;
      const c = documentedChain(n.id);
      if (c.length < 2 && n.y >= 600) continue;
      cand = c; candY = n.y;
    }
    if (!cand || firstY(cand) >= root.y) break;
    chain = [...cand, { id: root.id, kind: 'bridge' }, ...chain.slice(1)];
  }
  fullMemo.set(id, chain);
  return chain;
}
/** שרשרת מתועדת לעץ ולדף הבית: רק קשרים מתועדים */
export const linkBetween = (a: string, b: string) => links.find((l) => l.f === a && l.t === b);

/** כמה פעמים עבר המקל מתרבות לתרבות לאורך שרשרת */
export const handoffs = (chain: Step[]) => chain.reduce((n, st, i) => (i && nodeById.get(st.id)!.s !== nodeById.get(chain[i - 1].id)!.s ? n + 1 : n), 0);

export type PrizeChain = { prize: Prize; chain: Step[]; span: number; steps: number; cultures: string[]; hand: number; bridges: number; documented: number; docSpan: number };
const prizeMemo = new Map<string, PrizeChain | null>();
export function prizeChain(p: Prize): PrizeChain | null {
  const key = prizeKey(p);
  if (prizeMemo.has(key)) return prizeMemo.get(key)!;
  const owner = p.pid || p.via!;
  const ends = nodes.filter((n) => n.pp.includes(owner) && n.y <= p.y);
  const pool = ends.length ? ends : nodes.filter((n) => n.pp.includes(owner));
  let best: Step[] | null = null;
  const bridgesOf = (c: Step[]) => c.filter((x) => x.kind === 'bridge').length;
  for (const n of pool) {
    const c = fullChain(n.id);
    if (!best || firstY(c) < firstY(best) || (firstY(c) === firstY(best) && bridgesOf(c) < bridgesOf(best))) best = c;
  }
  if (!best) { prizeMemo.set(key, null); return null; }
  const lastBridge = best.map((x) => x.kind).lastIndexOf('bridge');
  const docPart = best.slice(Math.max(0, lastBridge));
  const r: PrizeChain = {
    prize: p, chain: best, span: p.y - firstY(best), steps: best.length,
    cultures: [...new Set(best.map((x) => nodeById.get(x.id)!.s))], hand: handoffs(best),
    bridges: bridgesOf(best), documented: best.filter((x) => x.kind === 'link' || x.kind === 'self').length,
    docSpan: p.y - nodeById.get(docPart[0].id)!.y,
  };
  prizeMemo.set(key, r);
  return r;
}
export function prizeKey(p: Prize) { return `${p.nid}-${p.y}-${p.f}`; }
export const allPrizeChains = () => prizes.map(prizeChain).filter((x): x is PrizeChain => !!x).sort((a, b) => b.span - a.span || a.bridges - b.bridges);

/** החוליות החסרות: גשרים שחוזרים בהרבה שרשראות. תיעוד של קשר אחד כזה יסגור את כולן. */
export function missingLinks() {
  const m = new Map<string, { from: string; to: string; prizes: Prize[] }>();
  for (const pc of allPrizeChains()) pc.chain.forEach((st, i) => {
    if (st.kind !== 'bridge') return;
    const k = `${pc.chain[i - 1].id}>${st.id}`;
    const e = m.get(k) || m.set(k, { from: pc.chain[i - 1].id, to: st.id, prizes: [] }).get(k)!;
    e.prizes.push(pc.prize);
  });
  return [...m.values()].sort((a, b) => b.prizes.length - a.prizes.length);
}

/** הנהגה תרבותית: לכל תקופה, כמה גילויים בכל ספירה, ומי הוביל */
export function leadership(fam?: string) {
  const pool = fam ? nodes.filter((n) => domains[n.d]?.fam === fam) : nodes;
  return periods.map((p) => {
    const inP = pool.filter((n) => n.y >= p.from && n.y < p.to);
    const counts = new Map<string, number>();
    for (const n of inP) counts.set(n.s, (counts.get(n.s) || 0) + 1);
    const ranked = [...counts.entries()].filter(([s]) => s !== 'other').sort((a, b) => b[1] - a[1]);
    const total = inP.length;
    const leader = ranked[0]?.[0] || null;
    const second = ranked[1]?.[0] || null;
    return { period: p, total, counts, ranked, leader, share: leader ? counts.get(leader)! / total : 0, second, items: inP };
  });
}

/** מנוע ידע: כמה קשרים יוצאים מתרבות לתרבות אחרת (ייצוא), וכמה נכנסים (יבוא) */
export function engine() {
  const m = new Map<string, { out: number; inn: number; self: number; n: number }>();
  const get = (s: string) => m.get(s) || m.set(s, { out: 0, inn: 0, self: 0, n: 0 }).get(s)!;
  for (const n of nodes) get(n.s).n++;
  for (const l of links) {
    if (!LINEAGE.includes(l.ty)) continue;
    const a = nodeById.get(l.f)!.s; const b = nodeById.get(l.t)!.s;
    if (a === b) get(a).self++; else { get(a).out++; get(b).inn++; }
  }
  return [...m.entries()].filter(([s]) => s !== 'other').map(([s, v]) => ({ s, ...v })).sort((a, b) => b.out - a.out || b.n - a.n);
}

/** ספירה של זרימה בין תרבויות: מי מסר למי */
export function flows() {
  const m = new Map<string, number>();
  for (const l of links) {
    if (!LINEAGE.includes(l.ty)) continue;
    const a = nodeById.get(l.f)!.s; const b = nodeById.get(l.t)!.s;
    if (a === b || a === 'other' || b === 'other') continue;
    m.set(`${a}>${b}`, (m.get(`${a}>${b}`) || 0) + 1);
  }
  return [...m.entries()].map(([k, v]) => { const [a, b] = k.split('>'); return { a, b, v }; }).sort((x, y) => y.v - x.v);
}

/** רעיונות עם שושלת, ממוינים לפי גודל השושלת */
export const ideasWithLineage = () => nodes
  .map((n) => ({ n, up: generations(n.id, 'up').gen.size, down: generations(n.id, 'down').gen.size }))
  .filter((x) => x.up + x.down > 0)
  // קודם רעיונות שיש להם גם עבר וגם המשך, ואז לפי גודל השושלת
  .sort((a, b) => Math.min(b.up, b.down) - Math.min(a.up, a.down) || b.up + b.down - (a.up + a.down));

export const SRC = Object.fromEntries(meta.sources.map((s) => [s.id, s]));
export const olamLink = (n: Node) => `${SRC.olam.url}#/timeline?d=${n.d}&y=${n.y2}&w=${n.id}`;
export const nobelLink = (nid: string) => `${SRC.prasnovel.url}#/world?id=${nid}`;
export const archLink = (archId: string) => `${SRC.architaip.url}c/${archId}`;

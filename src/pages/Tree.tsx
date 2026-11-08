// עץ הרעיונות: בוחרים רעיון, ורואים את אבותיו (מימין, העבר) ואת צאצאיו (משמאל, ההמשך).
import { useMemo, useState } from 'react';
import { go, href } from '../route';
import Rich from '../components/Rich';
import CultureChip from '../components/CultureChip';
import Distill from '../components/Distill';
import Term from '../components/Term';
import Bottom, { HowTo, Lvl, Num } from '../components/Bottom';
import { confPlain, typePlain } from '../lib/glossary';
import {
  childrenOf, domains, ideasWithLineage, lineage, nodeById, olamLink, parallelsOf, parentsOf, plain, sphereById, sphereColor,
  yearText, type Link, type Node,
} from '../lib/graph';

const MAXG = 3;     // דורות לכל צד
const MAXN = 9;     // רעיונות לכל דור
const CW = 196, NW = 172, NH = 54, GAP = 12;

export default function Tree({ params }: { params: Record<string, string> }) {
  const ideas = useMemo(ideasWithLineage, []);
  const id = params.id && nodeById.has(params.id) ? params.id : ideas[0].n.id;
  const focus = nodeById.get(id)!;
  const L = useMemo(() => lineage(id), [id]);
  const [q, setQ] = useState('');
  const hits = q.trim()
    ? ideas.filter((x) => `${x.n.t} ${x.n.who}`.includes(q.trim())).slice(0, 8)
    : ideas.slice(0, 8);

  // פריסה: עמודה לכל דור. אבות בעמודות מימין, צאצאים משמאל.
  const layout = useMemo(() => {
    const cols = new Map<number, Node[]>();
    cols.set(0, [focus]);
    for (const [k, g] of L.up.gen) if (g <= MAXG) (cols.get(g) || cols.set(g, []).get(g)!).push(nodeById.get(k)!);
    for (const [k, g] of L.down.gen) if (g <= MAXG) (cols.get(-g) || cols.set(-g, []).get(-g)!).push(nodeById.get(k)!);
    const hidden = new Map<number, number>();
    for (const [c, list] of cols) {
      list.sort((a, b) => a.y - b.y);
      if (list.length > MAXN) { hidden.set(c, list.length - MAXN); cols.set(c, list.slice(0, MAXN)); }
    }
    const minC = Math.min(...cols.keys()), maxC = Math.max(...cols.keys());
    const rows = Math.max(...[...cols.values()].map((l) => l.length));
    const H = Math.max(rows * (NH + GAP) + 60, 260);
    const W = (maxC - minC + 1) * CW + 20;
    const pos = new Map<string, { x: number; y: number }>();
    for (const [c, list] of cols) {
      const x = 10 + (c - minC) * CW + (CW - NW) / 2;
      const top = (H - list.length * (NH + GAP)) / 2;
      list.forEach((n, i) => pos.set(n.id, { x, y: top + i * (NH + GAP) }));
    }
    const edges = [...L.up.edges, ...L.down.edges].filter((l, i, a) => a.indexOf(l) === i && pos.has(l.f) && pos.has(l.t));
    return { cols, hidden, minC, maxC, W, H, pos, edges };
  }, [focus, L]);

  // מהסוף להתחלה: העיקר, בפשטות, ומה לקחת מזה. מחושב מהשושלת שנבחרה.
  const nC = L.cultures.size;
  const rootN = L.root ? (L.root.who || L.root.t) : '';
  const leafN = L.leaf ? (L.leaf.who || L.leaf.t) : '';
  const bl = !L.anc.length
    ? { main: `${focus.t} הוא ==רעיון שורש.==`, plain: `אין לו רעיונות קודמים מוכחים. **${L.desc.length}** רעיונות נבנו עליו, לאורך **${L.leaf ? L.leaf.y - focus.y : 0}** שנים.` }
    : !L.desc.length
    ? { main: `${focus.t} הוא ==סוף השושלת המוכחת.==`, plain: `הוא נשען על **${L.anc.length}** רעיונות קודמים. הראשון שבהם: **${rootN}**, ב-${yearText(L.root!.y)}. עוד לא תיעדנו מי המשיך אותו.` }
    : { main: `הרעיון עבר דרך ==${nC} תרבויות.==`, plain: `**${focus.t}** נשען על **${L.anc.length}** רעיונות קודמים, ו-**${L.desc.length}** רעיונות נבנו עליו. הקו מתחיל ב**${rootN}** (${yearText(L.root!.y)}) ומגיע עד **${leafN}** (${yearText(L.leaf!.y)}).` };
  const adopt = nC >= 3
    ? '**רעיון גדול לא נשאר בבית.** הוא מתחזק כשהוא עובר לתרבות אחרת, שמוסיפה לו שכבה משלה.'
    : !L.anc.length
    ? '**כל מה שמשמאל לו בגרף נשען עליו.** בלי רעיון השורש, השרשרת כולה לא הייתה קיימת.'
    : '**שושלת קצרה בתיעוד.** כנראה שחסרים קשרים. כדאי לבדוק מי עוד הושפע ממנו.';

  const context = () => [
    `רעיון במרכז: ${focus.t} (${yearText(focus.y)}, ${focus.who}, ${sphereById.get(focus.s)?.he}). חידוש: ${plain(focus.nv)}`,
    `אבות: ${L.anc.map((n) => `${n.t} (${yearText(n.y)}, ${sphereById.get(n.s)?.he})`).join('; ') || 'אין'}`,
    `צאצאים: ${L.desc.map((n) => `${n.t} (${yearText(n.y)}, ${sphereById.get(n.s)?.he})`).join('; ') || 'אין'}`,
  ].join('\n');

  return (
    <div className="page tree-page">
      <Bottom
        kicker={<>עץ הרעיונות · ממי ירש {focus.t}, ולמי מסר?</>}
        main={bl.main} plain={bl.plain} adopt={adopt}
        nums={<>
          <Num primary v={nC}><Term k="culture">תרבויות</Term> בשושלת</Num>
          <Num v={L.anc.length}><Term k="anc" />, ב-{L.depthUp} <Term k="gen">דורות</Term></Num>
          <Num v={L.desc.length}><Term k="desc" />, ב-{L.depthDown} דורות</Num>
        </>}
      />
      <HowTo steps={[
        '**בחרו רעיון** מהרשימה, או חפשו שם של רעיון או של אדם.',
        '**ימין: מה קדם לו. שמאל: מה נבנה עליו.** הפס הצבעוני בכרטיס הוא התרבות.',
        '**לחיצה על כרטיס** מעבירה אותו למרכז. בצד: ההסבר המלא, ומאיפה הקשר.',
      ]} />

      <section className="picker" aria-label="בחירת רעיון">
        <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש רעיון או דמות" aria-label="חיפוש רעיון" data-testid="tree-search" />
        <div className="pick-row">
          {hits.map((x) => (
            <a key={x.n.id} className={`pick press ${x.n.id === id ? 'on' : ''}`} href={href('tree', { id: x.n.id })} title={x.n.t}>
              <i style={{ background: sphereColor(x.n.s) }} /><span>{x.n.t}</span><small>{x.up + x.down}</small>
            </a>
          ))}
        </div>
        <p className="hint">המספר ליד כל רעיון: <b>כמה רעיונות קשורים אליו</b>. קודם מופיעים רעיונות שיש להם גם עבר וגם המשך.</p>
      </section>

      <div className="split">
        <section className="canvas-wrap">
          <h2 className="sec-h"><Lvl n={2} />העץ: {L.anc.length} רעיונות לפניו, {L.desc.length} אחריו</h2>
          <div className="axis"><span>מה קדם לו</span><span>הרעיון שבחרתם</span><span>מה נבנה עליו</span></div>
          <div className="canvas" data-testid="tree-canvas">
            <svg viewBox={`0 0 ${layout.W} ${layout.H}`} role="img" aria-label="עץ שושלת הרעיון">
              <defs>
                <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#55524C" /></marker>
              </defs>
              {/* עמודות האבות (דור חיובי) בצד ימין, העבר. הקשת יוצאת מהאב ונכנסת לצאצא משמאלו. */}
              <g>
                {layout.edges.map((l) => {
                  const a = layout.pos.get(l.f)!, b = layout.pos.get(l.t)!;
                  const x1 = a.x, y1 = a.y + NH / 2, x2 = b.x + NW, y2 = b.y + NH / 2;
                  const mx = (x1 + x2) / 2;
                  return <path key={l.id + l.f} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} className={`edge e-${l.ty}`} markerEnd="url(#ah)" />;
                })}
              </g>
              {[...layout.pos.entries()].map(([nid, p]) => {
                const n = nodeById.get(nid)!;
                const x = p.x;
                return (
                  <g key={nid} className={`node ${nid === id ? 'focus' : ''}`} transform={`translate(${x},${p.y})`} onClick={() => go('tree', { id: nid })} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && go('tree', { id: nid })}>
                    <rect width={NW} height={NH} rx={6} />
                    <rect x={NW - 6} width={6} height={NH} rx={2} fill={sphereColor(n.s)} />
                    <text x={NW - 14} y={22} className="n-t">{n.t.length > 22 ? n.t.slice(0, 21) + '…' : n.t}</text>
                    <text x={NW - 14} y={41} className="n-s">{yearText(n.y)} · {(n.who || '').slice(0, 18)}</text>
                  </g>
                );
              })}
              {[...layout.hidden.entries()].map(([c, k]) => {
                const x = 10 + (c - layout.minC) * CW + CW / 2;
                return <text key={c} x={x} y={layout.H - 10} textAnchor="middle" className="n-more">ועוד {k}</text>;
              })}
            </svg>
          </div>
          <div className="legend">
            <span><i className="lg lg-influenced" /><Term k="influenced" /></span>
            <span><i className="lg lg-enabled" /><Term k="enabled" /></span>
            <span><i className="lg lg-opposed" /><Term k="opposed" /></span>
            <span className="lg-sep">פס הצבע בכרטיס: <Term k="culture">התרבות</Term> שבה נולד הרעיון. עד {MAXG} דורות לכל צד, השאר בצד.</span>
          </div>

          {/* בנייד: רשימה במקום גרף */}
          <div className="tree-list">
            <ListBlock title="אבות" items={L.anc} gen={L.up.gen} />
            <ListBlock title="צאצאים" items={L.desc} gen={L.down.gen} />
          </div>
        </section>

        <aside className="side" aria-label="הרעיון שנבחר">
          <div className="side-card">
            {focus.img && <img key={focus.img} className="side-img" src={focus.img} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
            <p className="meta">{yearText(focus.y)}{focus.y2 !== focus.y ? `–${yearText(focus.y2)}` : ''} · {domains[focus.d]?.he} · {focus.pl || focus.co || 'מקום לא ידוע'}</p>
            <h2>{focus.t}</h2>
            <p className="who">{focus.who}</p>
            <CultureChip s={focus.s} />
            <Lvl n={3} />
            {focus.nv && <div className="kv"><span>מה היה חדש</span><Rich text={focus.nv} /></div>}
            {focus.cn && <div className="kv"><span>מה זה תרם</span><Rich text={focus.cn} /></div>}
            <Near title="נשען ישירות על" links={parentsOf(id)} dir="up" />
            <Near title="העביר ישירות אל" links={childrenOf(id)} dir="down" />
            {parallelsOf(id).length > 0 && <p className="small">במקביל: {parallelsOf(id).map((l) => nodeById.get(l.f === id ? l.t : l.f)!.t).join(', ')}</p>}
            <Distill kind="tree" id={id} context={context} label="זיקוק השושלת" />
            <a className="btn btn-line press" href={olamLink(focus)} target="_blank" rel="noopener">לרעיון בעולם נעלם</a>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Near({ title, links, dir }: { title: string; links: Link[]; dir: 'up' | 'down' }) {
  if (!links.length) return null;
  return (
    <div className="near">
      <h3>{title}</h3>
      {links.map((l) => {
        const o = nodeById.get(dir === 'up' ? l.f : l.t)!;
        return (
          <a key={l.id + o.id} className="near-item press" href={href('tree', { id: o.id })}>
            <span className="near-top"><i style={{ background: sphereColor(o.s) }} /><b>{o.t}</b><small>{typePlain[l.ty]} · {confPlain[l.cf] || l.cf}</small></span>
            {l.ex && <Rich className="near-ex" text={l.ex} />}
          </a>
        );
      })}
    </div>
  );
}

function ListBlock({ title, items, gen }: { title: string; items: Node[]; gen: Map<string, number> }) {
  if (!items.length) return null;
  return (
    <div className="lb">
      <h3>{title === 'אבות' ? 'מה קדם לו' : 'מה נבנה עליו'} ({items.length})</h3>
      {[...items].sort((a, b) => (gen.get(a.id)! - gen.get(b.id)!) || a.y - b.y).map((n) => (
        <a key={n.id} className="lb-item press" href={href('tree', { id: n.id })}>
          <i style={{ background: sphereColor(n.s) }} /><span>{n.t}</span><small>דור {gen.get(n.id)} · {yearText(n.y)}</small>
        </a>
      ))}
    </div>
  );
}


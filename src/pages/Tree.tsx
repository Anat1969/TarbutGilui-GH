// עץ הרעיונות: בוחרים רעיון, ורואים מה קדם לו (ימין) ומה נבנה עליו (שמאל).
// שלושה שלבים: העיקר (מסקנה ועץ שמתפתח מהמרכז החוצה), הראיה (הקשרים הישירים והמקור), להעמקה (כל השושלת).
// המסלול: כל לחיצה על כרטיס נרשמת בכתובת, כך שרואים מאיפה באתי ואפשר לחזור.
import { useEffect, useMemo, useRef } from 'react';
import { go, href } from '../route';
import Rich from '../components/Rich';
import CultureChip from '../components/CultureChip';
import Term from '../components/Term';
import Pick from '../components/Pick';
import Bottom, { NextStage, PageHead, Stepper, stageOf } from '../components/Bottom';
import { PostLinks } from './Posts';
import { confPlain, typePlain } from '../lib/glossary';
import {
  childrenOf, domains, ideasWithLineage, lineage, nodeById, olamLink, parallelsOf, parentsOf, sphereColor,
  yearText, type Link, type Node,
} from '../lib/graph';

const MAXG = 3;     // דורות לכל צד
const MAXN = 9;     // רעיונות לכל דור
const CW = 196, NW = 172, NH = 54, GAP = 12;
const STEP = 0.32;  // השהיה בין דור לדור בתנועה המתפתחת

export default function Tree({ params }: { params: Record<string, string> }) {
  const ideas = useMemo(ideasWithLineage, []);
  const id = params.id && nodeById.has(params.id) ? params.id : ideas[0].n.id;
  const focus = nodeById.get(id)!;
  const L = useMemo(() => lineage(id), [id]);
  const canvas = useRef<HTMLDivElement>(null);
  const l = stageOf(params);
  const path = (params.path || '').split(',').filter((x) => nodeById.has(x) && x !== id);
  const came = path[path.length - 1];
  const to = (n: number) => href('tree', { id, path: path.join(','), l: String(n) });
  // מעבר לרעיון: אם הוא כבר במסלול, חוזרים אליו וחותכים. אחרת מוסיפים את הנוכחי למסלול.
  const goTo = (nid: string) => {
    if (nid === id) return;
    const at = path.indexOf(nid);
    const next = at >= 0 ? path.slice(0, at) : [...path, id].slice(-8);
    go('tree', { id: nid, path: next.join(','), l: String(l) });
  };

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
    const rows = Math.max(...[...cols.values()].map((x) => x.length));
    const H = Math.max(rows * (NH + GAP) + 60, 260);
    const W = (maxC - minC + 1) * CW + 20;
    const pos = new Map<string, { x: number; y: number; g: number }>();
    for (const [c, list] of cols) {
      const x = 10 + (c - minC) * CW + (CW - NW) / 2;
      const top = (H - list.length * (NH + GAP)) / 2;
      list.forEach((n, i) => pos.set(n.id, { x, y: top + i * (NH + GAP), g: Math.abs(c) }));
    }
    const edges = [...L.up.edges, ...L.down.edges].filter((e, i, a) => a.indexOf(e) === i && pos.has(e.f) && pos.has(e.t));
    return { hidden, minC, W, H, pos, edges };
  }, [focus, L]);

  // בגלילה צידית (נייד), הרעיון שבחרתם במרכז החלון ולא מחוץ לו
  useEffect(() => {
    const c = canvas.current, f = c?.querySelector('.node.focus');
    if (!c || !f || c.scrollWidth <= c.clientWidth) return;
    const a = c.getBoundingClientRect(), b = f.getBoundingClientRect();
    c.scrollLeft += (b.left + b.width / 2) - (a.left + a.width / 2);
  }, [id]);

  // מהסוף להתחלה: העיקר, בפשטות, ומה לקחת מזה. מחושב מהשושלת שנבחרה.
  const nC = L.cultures.size;
  const rootN = L.root ? (L.root.who || L.root.t) : '';
  const leafN = L.leaf ? (L.leaf.who || L.leaf.t) : '';
  const bl = !L.anc.length
    ? { main: `${focus.t} הוא ==רעיון שורש.==`, plain: `אין לו רעיונות קודמים מוכחים. **${L.desc.length} רעיונות נבנו עליו**, לאורך ${L.leaf ? L.leaf.y - focus.y : 0} שנים.` }
    : !L.desc.length
    ? { main: `${focus.t} הוא ==סוף השושלת המוכחת.==`, plain: `**הוא נשען על ${L.anc.length} רעיונות קודמים.** הראשון שבהם: ${rootN}, ב-${yearText(L.root!.y)}. עוד לא תיעדנו מי המשיך אותו.` }
    : { main: `הרעיון עבר דרך ==${nC} תרבויות.==`, plain: `**${focus.t}** נשען על **${L.anc.length}** רעיונות קודמים, ו-**${L.desc.length}** נבנו עליו. הקו מתחיל ב${rootN} (${yearText(L.root!.y)}) ומגיע עד ${leafN} (${yearText(L.leaf!.y)}).` };
  const adopt = nC >= 3
    ? '**רעיון גדול לא נשאר בבית.** הוא מתחזק כשהוא עובר לתרבות אחרת, שמוסיפה לו שכבה משלה.'
    : !L.anc.length
    ? '**כל מה שמשמאל לו בגרף נשען עליו.** בלי רעיון השורש, השרשרת כולה לא הייתה קיימת.'
    : '**שושלת קצרה בתיעוד.** כנראה שחסרים קשרים. כדאי לבדוק מי עוד הושפע ממנו.';
  const years = (L.leaf?.y ?? focus.y) - (L.root?.y ?? focus.y);
  const story = nC > 1 ? `**תרבויות** העבירו אותו מיד ליד, ב-${years.toLocaleString('he-IL')} שנה.` : '**תרבות אחת** בלבד בשושלת המוכחת.';

  return (
    <div className="page tree-page">
      <PageHead kicker="עץ הרעיונות" q={<>ממי ירש <b>{focus.t}</b>, ולמי מסר?</>}
        stepper={<Stepper l={l} to={to} desc={['מה התשובה', 'על מה היא נשענת', 'כל השושלת']} />}
        pick={<Pick testid="tree-search" placeholder="הקלידו רעיון או שם של אדם" onPick={goTo}
          current={<><i style={{ background: sphereColor(focus.s) }} />{focus.t}<small>{focus.who}</small></>}
          items={ideas.map((x) => ({ id: x.n.id, label: x.n.t, sub: `${x.n.who} · ${yearText(x.n.y)}`, color: sphereColor(x.n.s) }))} />}>
        {path.length > 0 && (
          <nav className="trail" aria-label="המסלול שלך" data-testid="trail">
            <span className="trail-h">המסלול שלך:</span>
            {path.map((p, i) => <a key={p} className="trail-i press" href={href('tree', { id: p, path: path.slice(0, i).join(','), l: String(l) })}>{nodeById.get(p)!.t}</a>)}
            <span className="trail-i trail-now">{focus.t}</span>
          </nav>
        )}
      </PageHead>

      {l === 1 && (
        <div className="stage" key={'s1' + id}>
          <Bottom main={bl.main} plain={bl.plain} adopt={adopt} num={{ v: nC, story }} />
          <section className="canvas-wrap">
            <div className="axis"><span>מה קדם לו</span><span>הרעיון שבחרתם</span><span>מה נבנה עליו</span></div>
            <div className="canvas" data-testid="tree-canvas" ref={canvas}>
              <svg viewBox={`0 0 ${layout.W} ${layout.H}`} role="img" aria-label="עץ שושלת הרעיון" key={id}>
                <defs>
                  <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#55524C" /></marker>
                </defs>
                <g>
                  {layout.edges.map((e) => {
                    const a = layout.pos.get(e.f)!, b = layout.pos.get(e.t)!;
                    const x1 = a.x, y1 = a.y + NH / 2, x2 = b.x + NW, y2 = b.y + NH / 2;
                    const mx = (x1 + x2) / 2;
                    return <path key={e.id + e.f} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} className={`edge grow e-${e.ty}`} style={{ '--d': `${(Math.max(a.g, b.g) * STEP - STEP / 2).toFixed(2)}s` } as React.CSSProperties} markerEnd="url(#ah)" />;
                  })}
                </g>
                {[...layout.pos.entries()].map(([nid, p]) => {
                  const n = nodeById.get(nid)!;
                  return (
                    <g key={nid} className={`node grow ${nid === id ? 'focus' : ''} ${nid === came ? 'came' : ''}`} style={{ '--d': `${(p.g * STEP).toFixed(2)}s` } as React.CSSProperties}
                      transform={`translate(${p.x},${p.y})`} onClick={() => goTo(nid)} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && goTo(nid)}>
                      <rect width={NW} height={NH} rx={6} />
                      <rect x={NW - 6} width={6} height={NH} rx={2} fill={sphereColor(n.s)} />
                      <text x={NW - 14} y={22} className="n-t">{n.t.length > 22 ? n.t.slice(0, 21) + '…' : n.t}</text>
                      <text x={NW - 14} y={41} className="n-s">{nid === came ? 'באת מכאן' : `${yearText(n.y)} · ${(n.who || '').slice(0, 18)}`}</text>
                    </g>
                  );
                })}
                {[...layout.hidden.entries()].map(([c, k]) => {
                  const x = 10 + (c - layout.minC) * CW + CW / 2;
                  return <text key={c} x={x} y={layout.H - 10} textAnchor="middle" className="n-more">ועוד {k}, בשלב 3</text>;
                })}
              </svg>
            </div>
            <div className="legend">
              <span><b>קריאה:</b> לחיצה על כרטיס מעבירה אותו למרכז, והמסלול שלך נשמר למעלה.</span>
              <span><i className="lg lg-influenced" /><Term k="influenced" /></span>
              <span><i className="lg lg-enabled" /><Term k="enabled" /></span>
              <span><i className="lg lg-opposed" /><Term k="opposed" /></span>
            </div>
          </section>
          <NextStage l={l} to={to} label="על מה הקשרים האלה נשענים" />
        </div>
      )}

      {l === 2 && (
        <div className="stage stage-2" key={'s2' + id}>
          <section className="idea">
            {focus.img && <img key={focus.img} className="side-img" src={focus.img} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
            <p className="meta">{yearText(focus.y)}{focus.y2 !== focus.y ? `–${yearText(focus.y2)}` : ''} · {domains[focus.d]?.he} · {focus.pl || focus.co || 'מקום לא ידוע'}</p>
            <h2>{focus.t}</h2>
            <p className="who">{focus.who}</p>
            <CultureChip s={focus.s} />
            {focus.nv && <div className="kv"><span>מה היה חדש</span><Rich text={focus.nv} lines /></div>}
            {focus.cn && <div className="kv"><span>מה זה תרם</span><Rich text={focus.cn} lines /></div>}
          </section>
          <section className="links2">
            <Near title="נשען ישירות על" links={parentsOf(id)} dir="up" goTo={goTo} />
            <Near title="העביר ישירות אל" links={childrenOf(id)} dir="down" goTo={goTo} />
            {!parentsOf(id).length && !childrenOf(id).length && <p className="small">אין לרעיון הזה קשרים ישירים מוכחים.</p>}
          </section>
          <NextStage l={l} to={to} label="כל השושלת, דור אחר דור" />
        </div>
      )}

      {l === 3 && (
        <div className="stage stage-3" key={'s3' + id}>
          <div className="lists3">
            <ListBlock title={`מה קדם לו (${L.anc.length})`} items={L.anc} gen={L.up.gen} goTo={goTo} />
            <ListBlock title={`מה נבנה עליו (${L.desc.length})`} items={L.desc} gen={L.down.gen} goTo={goTo} />
            <div className="lb">
              {parallelsOf(id).length > 0 && <><h3>במקביל, בלי השפעה ישירה</h3><p className="small">{parallelsOf(id).map((x) => nodeById.get(x.f === id ? x.t : x.f)!.t).join(', ')}</p></>}
              <PostLinks page="tree" id={id} />
              <a className="btn btn-line press" href={olamLink(focus)} target="_blank" rel="noopener">לרעיון בעולם נעלם</a>
            </div>
          </div>
          <NextStage l={l} to={to} label="" />
        </div>
      )}
    </div>
  );
}

function Near({ title, links, dir, goTo }: { title: string; links: Link[]; dir: 'up' | 'down'; goTo: (id: string) => void }) {
  if (!links.length) return null;
  return (
    <div className="near">
      <h3>{title}</h3>
      {links.map((x) => {
        const o = nodeById.get(dir === 'up' ? x.f : x.t)!;
        return (
          <button key={x.id + o.id} className="near-item press" onClick={() => goTo(o.id)}>
            <span className="near-top"><i style={{ background: sphereColor(o.s) }} /><b>{o.t}</b><small>{typePlain[x.ty]} · {confPlain[x.cf] || x.cf}</small></span>
            {x.ex && <Rich className="near-ex" text={x.ex} lines />}
          </button>
        );
      })}
    </div>
  );
}

function ListBlock({ title, items, gen, goTo }: { title: string; items: Node[]; gen: Map<string, number>; goTo: (id: string) => void }) {
  return (
    <div className="lb">
      <h3>{title}</h3>
      {!items.length && <p className="small">אין.</p>}
      {[...items].sort((a, b) => (gen.get(a.id)! - gen.get(b.id)!) || a.y - b.y).map((n) => (
        <button key={n.id} className="lb-item press" onClick={() => goTo(n.id)}>
          <i style={{ background: sphereColor(n.s) }} /><span>{n.t}</span><small>דור {gen.get(n.id)} · {yearText(n.y)}</small>
        </button>
      ))}
    </div>
  );
}

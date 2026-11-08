// שרשרת עד הפרס: מזוכה נובל אחורה, חוליה אחר חוליה, עד העת העתיקה.
// חוליה מתועדת בקו מלא. גשר תחום (בלי קשר מתועד) מסומן בגלוי כהנחה, ונכנס לרשימת החוליות החסרות.
import { useMemo, useState } from 'react';
import { href } from '../route';
import Rich from '../components/Rich';
import CultureChip from '../components/CultureChip';
import ChainStrip from '../components/ChainStrip';
import Distill from '../components/Distill';
import { allPrizeChains, confName, domains, missingLinks, nobelLink, nodeById, olamLink, persons, plain, prizeKey, sphereById, sphereColor, typeShort, yearText } from '../lib/graph';

const FIELDS = [['', 'הכול'], ['physics', 'פיזיקה'], ['chemistry', 'כימיה'], ['medicine', 'רפואה'], ['economics', 'כלכלה'], ['literature', 'ספרות'], ['peace', 'שלום']];
const name = (s: string) => sphereById.get(s)?.he || s;

export default function PrizePage({ params }: { params: Record<string, string> }) {
  const all = useMemo(allPrizeChains, []);
  const miss = useMemo(missingLinks, []);
  const [q, setQ] = useState('');
  const field = params.f || '';
  const list = all.filter((c) => (!field || c.prize.f === field) && (!q.trim() || `${c.prize.he} ${c.prize.en}`.toLowerCase().includes(q.trim().toLowerCase())));
  // בלי בחירה: השרשרת שהחלק המתועד בה הארוך ביותר
  const cur = all.find((c) => prizeKey(c.prize) === params.p) || [...(list.length ? list : all)].sort((a, b) => b.docSpan - a.docSpan)[0];
  const p = cur.prize;
  const docPct = Math.round((cur.docSpan / cur.span) * 100);
  const firstBridge = cur.chain.findIndex((s) => s.kind === 'bridge');
  const lastBridge = cur.chain.map((s) => s.kind).lastIndexOf('bridge');
  const gapA = lastBridge > 0 ? nodeById.get(cur.chain[lastBridge - 1].id)! : null;
  const gapB = lastBridge > 0 ? nodeById.get(cur.chain[lastBridge].id)! : null;
  const root = nodeById.get(cur.chain[0].id)!;

  const insight = gapA && gapB
    ? `==${cur.docSpan} מתוך ${cur.span.toLocaleString('he-IL')} השנים מתועדות.== החוליה החסרה הקרובה לפרס: בין **${gapA.who || gapA.t}** (${yearText(gapA.y)}) ל**${gapB.who || gapB.t}** (${yearText(gapB.y)}).`
    : `==השרשרת מתועדת כולה.== מ**${root.who || root.t}** ועד הפרס, **${cur.steps}** חוליות.`;

  const context = () => [
    `פרס: ${p.he}, נובל ב${p.fh} ${p.y}. נימוק: ${p.mh || p.m}.${p.via ? ` הזוכה הוא תלמיד של ${persons[p.via]?.he}.` : ''}`,
    'שרשרת מהשורש לפרס:',
    ...cur.chain.map((st) => { const n = nodeById.get(st.id)!; return `${st.kind === 'bridge' ? '[גשר, הנחה] ' : st.kind === 'self' ? '[אותו אדם] ' : ''}${n.t}, ${n.who}, ${yearText(n.y)}, ${name(n.s)}${st.link ? `. הקשר: ${plain(st.link.ex)}` : ''}`; }),
    `מתועד: ${cur.docSpan} מתוך ${cur.span} שנים. מעברי תרבות: ${cur.hand}.`,
  ].join('\n');

  return (
    <div className="page prize-page">
      <section className="qhead">
        <div>
          <p className="kicker">שרשרת עד הפרס</p>
          <h1>מאיפה בא הרעיון של <mark>{p.he}</mark>?</h1>
          <p className="sub">נובל ל{p.fh}, {p.y}{p.mh ? `: ${p.mh}` : ''}</p>
        </div>
        <div className="bignums">
          <div className="bn"><b>{cur.span.toLocaleString('he-IL')}</b><span>שנים מהשורש לפרס</span></div>
          <div className="bn"><b>{docPct}%</b><span>מהזמן מתועד בקשרים</span></div>
          <div className="bn"><b>{cur.hand}</b><span>מעברים בין {cur.cultures.length} תרבויות</span></div>
        </div>
      </section>

      <section className="strip-wrap">
        <ChainStrip chain={cur.chain} endYear={p.y} />
        <Rich as="p" className="insight" text={insight} />
        <div className="legend">
          <span><i className="lg lg-doc" />חוליה מתועדת</span>
          <span><i className="lg lg-bridge" />גשר תחום: הנחה</span>
          <span><i className="lg lg-gold" />הפרס</span>
          <span className="lg-sep">צבע הנקודה: התרבות</span>
        </div>
      </section>

      <div className="split split-3">
        <aside className="plist" aria-label="בחירת פרס">
          <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש זוכה" aria-label="חיפוש זוכה" data-testid="prize-search" />
          <div className="seg seg-s">
            {FIELDS.map(([id, he]) => <a key={id} className={`seg-b press ${field === id ? 'on' : ''}`} href={href('prize', { f: id, p: params.p })}>{he}</a>)}
          </div>
          <p className="hint">ממוין לפי אורך השרשרת. {list.length} פרסים.</p>
          <div className="plist-items">
            {list.map((c) => (
              <a key={prizeKey(c.prize)} className={`pitem press ${c === cur ? 'on' : ''}`} href={href('prize', { f: field, p: prizeKey(c.prize) })}>
                <b>{c.prize.he}</b><small>{c.prize.fh} {c.prize.y}</small><span>{c.span.toLocaleString('he-IL')}</span>
              </a>
            ))}
          </div>
        </aside>

        <section className="chain" aria-label="השרשרת" data-testid="chain">
          <h2 className="chart-t">החוליות, מהשורש עד הפרס</h2>
          <ol className="steps">
            {cur.chain.map((st, i) => {
              const n = nodeById.get(st.id)!;
              return (
                <li key={st.id + i} className={`step k-${st.kind}`}>
                  {i > 0 && (
                    <div className={`joint j-${st.kind}`}>
                      {st.kind === 'link' && st.link && <><span className="j-type">{typeShort[st.link.ty]} · {confName[st.link.cf] || st.link.cf}</span><Rich text={st.link.ex} /></>}
                      {st.kind === 'self' && <span className="j-type">אותו אדם, גילוי מאוחר יותר</span>}
                      {st.kind === 'bridge' && <span className="j-type">חוליה חסרה: אין קשר מתועד. גשר תחום ב{domains[n.d]?.he} <span className="tag tag-hyp">הנחה</span></span>}
                    </div>
                  )}
                  <a className="card press" href={href('tree', { id: n.id })} style={{ borderInlineStartColor: sphereColor(n.s) }}>
                    <span className="c-year">{yearText(n.y)}</span>
                    <span className="c-body"><b>{n.t}</b><small>{n.who} · {domains[n.d]?.he}</small></span>
                    <CultureChip s={n.s} small />
                  </a>
                </li>
              );
            })}
            {p.via && (
              <li className="step k-mentor">
                <div className="joint j-link"><span className="j-type">הנחיה · ויקינתונים, דרך גמד על כתפי ענקים</span><span>{persons[p.via]?.he} הנחה את {p.he}.</span></div>
              </li>
            )}
            <li className="step k-prize">
              <div className="joint j-link"><span className="j-type">הפרס</span></div>
              <a className="card card-prize press" href={nobelLink(p.nid)} target="_blank" rel="noopener">
                <span className="c-year">{p.y}</span>
                <span className="c-body"><b>{p.he}, נובל ל{p.fh}</b><small>{p.mh || p.m}</small></span>
                <span className="medal">לזוכה בגמד על כתפי ענקים</span>
              </a>
            </li>
          </ol>
          <Distill kind="prize" id={prizeKey(p)} context={context} label="זיקוק השרשרת" />
          {firstBridge > 0 && <p className="small">החוליה המתועדת הקרובה לפרס מתחילה ב-{yearText(nodeById.get(cur.chain[lastBridge].id)!.y)}. לפניה {cur.bridges === 1 ? 'גשר אחד' : `${cur.bridges} גשרים`}.</p>}
          <a className="btn btn-line press" href={olamLink(root)} target="_blank" rel="noopener">לשורש בעולם נעלם</a>
        </section>

        <aside className="side" aria-label="החוליות החסרות">
          <div className="side-card">
            <h2>החוליות החסרות</h2>
            <p className="small">קשר אחד שיתועד בעולם נעלם יסגור את כל השרשראות שעוברות בו. ממוין לפי כמה פרסים הוא סוגר.</p>
            <ol className="miss" data-testid="missing">
              {miss.slice(0, 8).map((m) => {
                const a = nodeById.get(m.from)!, b = nodeById.get(m.to)!;
                const mine = gapA?.id === a.id && gapB?.id === b.id;
                return (
                  <li key={m.from + m.to} className={mine ? 'on' : ''}>
                    <span className="miss-n">{m.prizes.length}</span>
                    <span className="miss-t"><b>{a.who || a.t}</b> ({yearText(a.y)}) אל <b>{b.who || b.t}</b> ({yearText(b.y)})<small>{domains[a.d]?.he} · {name(a.s)} אל {name(b.s)}</small></span>
                  </li>
                );
              })}
            </ol>
            <Rich as="p" className="insight" text={`==${miss.length} חוליות חסרות.== שלוש הראשונות סוגרות **${new Set(miss.slice(0, 3).flatMap((m) => m.prizes.map(prizeKey))).size}** שרשראות. זה סדר העבודה לתיעוד בעולם נעלם.`} />
          </div>
        </aside>
      </div>
    </div>
  );
}

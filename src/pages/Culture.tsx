// תרבות כמנוע: לכל תקופת גילויים, איזו תרבות הובילה ולמה. ומי מסרה ידע לאחרות.
import { useMemo } from 'react';
import { go, href } from '../route';
import Rich from '../components/Rich';
import CultureChip from '../components/CultureChip';
import Distill from '../components/Distill';
import { archLink, domains, engine, flows, leadership, persons, plain, sphereById, sphereColor, yearText, SRC } from '../lib/graph';

const FAMS = [
  { id: '', he: 'כל התחומים' }, { id: 'sechel', he: 'שכל: מדע' }, { id: 'ruach', he: 'רוח' }, { id: 'regesh', he: 'רגש' }, { id: 'yetzer', he: 'יצר: אמנות' },
];
const name = (s: string) => sphereById.get(s)?.he || s;
const pct = (x: number) => `${Math.round(x * 100)}%`;
const yr = (y: number) => (y <= -4000 ? 'קדם' : yearText(y));

export default function Culture({ params }: { params: Record<string, string> }) {
  const fam = FAMS.some((f) => f.id === params.f) ? params.f || '' : '';
  const rows = useMemo(() => leadership(fam || undefined), [fam]);
  const eng = useMemo(engine, []);
  const fl = useMemo(flows, []);
  const sel = rows.find((r) => r.period.id === params.p) || rows.find((r) => r.leader === 'islamic') || rows[0];
  const leaders = rows.filter((r) => r.leader).map((r) => r.leader!);
  const relay = leaders.filter((l, i) => !i || l !== leaders[i - 1]);
  const used = [...new Set(rows.flatMap((r) => r.ranked.map(([s]) => s)))];
  const maxOut = Math.max(...eng.map((e) => Math.max(e.out, e.inn)));
  const top = eng[0], importer = [...eng].sort((a, b) => b.inn - a.inn)[0];

  // למה: עובדות מתוך הגילויים של התרבות המובילה בתקופה
  const why = useMemo(() => {
    if (!sel.leader) return null;
    const items = sel.items.filter((n) => n.s === sel.leader);
    const byDom = new Map<string, number>(); const byP = new Map<string, number>(); const byPlace = new Map<string, number>();
    for (const n of items) {
      byDom.set(n.d, (byDom.get(n.d) || 0) + 1);
      for (const p of n.pp) byP.set(p, (byP.get(p) || 0) + 1);
      if (n.pl) byPlace.set(n.pl, (byPlace.get(n.pl) || 0) + 1);
    }
    const srt = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);
    const e = eng.find((x) => x.s === sel.leader);
    return { items, doms: srt(byDom).slice(0, 3), ppl: srt(byP).slice(0, 4), places: srt(byPlace).slice(0, 3), e };
  }, [sel, eng]);
  const sp = sel.leader ? sphereById.get(sel.leader)! : null;

  const context = () => [
    `תקופה: ${sel.period.he} (${yr(sel.period.from)}–${yr(sel.period.to)}). ${sel.total} גילויים.`,
    `מובילה: ${name(sel.leader || '')}, ${pct(sel.share)} מהגילויים. אחריה: ${sel.second ? name(sel.second) : 'אין'}.`,
    why ? `תחומים: ${why.doms.map(([d, c]) => `${domains[d]?.he} ${c}`).join(', ')}. דמויות: ${why.ppl.map(([p]) => persons[p]?.he).join(', ')}. מקומות: ${why.places.map(([p]) => p).join(', ')}.` : '',
    why?.e ? `מסרה ${why.e.out} קשרים לתרבויות אחרות, קיבלה ${why.e.inn}.` : '',
    sp?.arch ? `ארכיטייפ (פרשנות, מאפליקציית ארכיטייפ): ${sp.arch.archetype}. הסדר: ${sp.arch.order}. הכאוס: ${sp.arch.chaos}.` : sp?.proposal ? `ארכיטייפ מוצע (הנחה): ${sp.proposal.archetype}. ${plain(sp.proposal.why)}` : '',
    `גילויים: ${why?.items.slice(0, 12).map((n) => n.t).join('; ')}`,
  ].join('\n');

  return (
    <div className="page culture-page">
      <section className="qhead">
        <div>
          <p className="kicker">תרבות כמנוע ידע</p>
          <h1>איזו תרבות <mark>הובילה</mark> כל תקופת גילויים, ולמה?</h1>
        </div>
        <div className="bignums">
          <div className="bn"><b>{relay.length}</b><span>מובילות ברצף, ב-{rows.length} תקופות</span></div>
          <div className="bn"><b>{top.out}</b><span>רעיונות ש{name(top.s)} מסרה לאחרות</span></div>
          <div className="bn"><b>{importer.inn}</b><span>רעיונות ש{name(importer.s)} קיבלה</span></div>
        </div>
      </section>

      <div className="seg" role="group" aria-label="סינון לפי משפחת תחומים">
        {FAMS.map((f) => <a key={f.id} className={`seg-b press ${fam === f.id ? 'on' : ''}`} href={href('culture', { f: f.id, p: params.p })}>{f.he}</a>)}
      </div>

      <div className="split">
        <section className="canvas-wrap">
          <h2 className="chart-t">מקל השליחים: חלק כל תרבות בגילויים של כל תקופה</h2>
          <p className="chart-sub">כל עמודה היא תקופה, מהעתיקה (מימין) ועד היום. גובה הצבע: חלק התרבות בגילויים. השם מעל העמודה: המובילה.</p>
          <div className="bands" data-testid="bands">
            {rows.map((r) => (
              <button key={r.period.id} className={`band press ${r.period.id === sel.period.id ? 'on' : ''}`} onClick={() => go('culture', { f: fam, p: r.period.id })} aria-pressed={r.period.id === sel.period.id}>
                <span className="band-lead" style={{ color: r.leader ? sphereColor(r.leader) : undefined }}>{r.leader ? name(r.leader) : 'אין נתונים'}</span>
                <span className="band-bar">
                  {r.ranked.map(([s, c]) => <i key={s} style={{ height: `${(c / r.total) * 100}%`, background: sphereColor(s), opacity: s === r.leader ? 1 : 0.42 }} title={`${name(s)}: ${c}`} />)}
                </span>
                <span className="band-n">{r.total}</span>
                <span className="band-p">{r.period.he}</span>
              </button>
            ))}
          </div>
          <Rich as="p" className="insight" text={`==ההנהגה עברה ${relay.length - 1} פעמים.== ${relay.map((s) => `**${name(s)}**`).join(' ← ')}.`} />
          <div className="legend legend-wrap">{used.filter((s) => s !== 'other').map((s) => <CultureChip key={s} s={s} small />)}</div>

          <h2 className="chart-t">מנוע הידע: מי מסרה רעיונות לתרבויות אחרות, ומי קיבלה</h2>
          <p className="chart-sub">ספירת הקשרים המתועדים בעולם נעלם שחוצים גבול תרבות. מימין: מסרה. משמאל: קיבלה.</p>
          <div className="engine" data-testid="engine">
            {eng.slice(0, 10).map((e) => (
              <div key={e.s} className="eng-row">
                <span className="eng-out"><i style={{ width: `${(e.out / maxOut) * 100}%`, background: sphereColor(e.s) }} /><b>{e.out}</b></span>
                <span className="eng-name">{name(e.s)}</span>
                <span className="eng-in"><i style={{ width: `${(e.inn / maxOut) * 100}%` }} /><b>{e.inn}</b></span>
              </div>
            ))}
          </div>
          <Rich as="p" className="insight" text={`==${name(top.s)} היא המנוע, ${name(importer.s)} היא הקולטת.== הזרימה הגדולה: **${name(fl[0].a)}** ל**${name(fl[0].b)}**, ${fl[0].v} רעיונות.`} />
          <div className="flows">
            {fl.slice(0, 6).map((f) => (
              <span key={f.a + f.b} className="flow"><CultureChip s={f.a} small /><em>מסרה ל</em><CultureChip s={f.b} small /><b>{f.v}</b></span>
            ))}
          </div>
        </section>

        <aside className="side" aria-label="התקופה שנבחרה">
          <div className="side-card">
            <p className="meta">{sel.period.he} · {yr(sel.period.from)}–{sel.period.to > 2026 ? 'היום' : yr(sel.period.to)}</p>
            {sel.leader ? (
              <>
                <h2>{name(sel.leader)}</h2>
                <div className="bigpct" style={{ color: sphereColor(sel.leader) }}>{pct(sel.share)}</div>
                <p className="small">מהגילויים בתקופה ({sel.counts.get(sel.leader)} מתוך {sel.total}){sel.second ? `. אחריה: ${name(sel.second)}, ${sel.counts.get(sel.second)}` : ''}.</p>
                {why && (
                  <div className="why">
                    <h3>למה: מה הנתונים מראים <span className="tag tag-fact">עובדה</span></h3>
                    <p>בתחומים: {why.doms.map(([d, c]) => <span key={d} className="pill">{domains[d]?.he} <b>{c}</b></span>)}</p>
                    <p>הדמויות: {why.ppl.map(([p]) => persons[p]?.he).filter(Boolean).join(', ')}</p>
                    {why.places.length > 0 && <p>המקומות: {why.places.map(([p]) => p).join(', ')}</p>}
                    {why.e && <p>מסרה <b>{why.e.out}</b> רעיונות לתרבויות אחרות וקיבלה <b>{why.e.inn}</b>.</p>}
                  </div>
                )}
                {sp?.arch ? (
                  <div className="arch">
                    <h3>למה: הארכיטייפ <span className="tag tag-int">פרשנות</span></h3>
                    <p className="arch-name">{sp.arch.archetype}</p>
                    <p><b>הסדר:</b> {sp.arch.order}. <b>הכאוס:</b> {sp.arch.chaos}.</p>
                    <blockquote>{sp.arch.insight}</blockquote>
                    <a className="btn btn-line press" href={archLink(sp.arch.id)} target="_blank" rel="noopener">ל{sp.arch.name} בארכיטייפ</a>
                  </div>
                ) : sp?.proposal ? (
                  <div className="arch arch-hyp">
                    <h3>ארכיטייפ מוצע <span className="tag tag-hyp">הנחה</span></h3>
                    <p className="arch-name">{sp.proposal.archetype}</p>
                    <Rich as="p" text={sp.proposal.why} />
                    <p className="small">לתרבות הזו אין עדיין ארכיטייפ ב<a href={SRC.architaip.url} target="_blank" rel="noopener">ארכיטייפ</a>. ההצעה ממתינה לבדיקה.</p>
                  </div>
                ) : null}
                <Distill kind="period" id={`${sel.period.id}-${fam}`} context={context} label="זיקוק: למה היא הובילה" />
                <div className="near">
                  <h3>הגילויים שלה בתקופה</h3>
                  {why?.items.slice(0, 8).map((n) => (
                    <a key={n.id} className="lb-item press" href={href('tree', { id: n.id })}><i style={{ background: sphereColor(n.s) }} /><span>{n.t}</span><small>{yearText(n.y)}</small></a>
                  ))}
                </div>
              </>
            ) : <p>אין גילויים בתקופה הזו בסינון שנבחר.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

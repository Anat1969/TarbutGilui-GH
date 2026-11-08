// תרבות כמנוע: לכל תקופת גילויים, איזו תרבות הובילה ולמה. ומי העבירה ידע לאחרות.
// שלושה שלבים: העיקר (מסקנה ועמודות שגדלות תקופה אחר תקופה), הראיה (למה דווקא היא, בתקופה שנבחרה), להעמקה (מי העבירה ומי קלטה).
import { useMemo } from 'react';
import { go, href } from '../route';
import Rich from '../components/Rich';
import CultureChip from '../components/CultureChip';
import Term from '../components/Term';
import Bottom, { NextStage, PageHead, Stepper, stageOf } from '../components/Bottom';
import { PostLinks } from './Posts';
import { archLink, domains, engine, flows, leadership, persons, sphereById, sphereColor, yearText, SRC } from '../lib/graph';

const FAMS = [
  { id: '', he: 'כל התחומים' }, { id: 'sechel', he: 'מדע' }, { id: 'ruach', he: 'רוח' }, { id: 'regesh', he: 'רגש' }, { id: 'yetzer', he: 'אמנות' },
];
const name = (s: string) => sphereById.get(s)?.he || s;
const pct = (x: number) => `${Math.round(x * 100)}%`;
const yr = (y: number) => (y <= -4000 ? 'קדם' : yearText(y));

export default function Culture({ params }: { params: Record<string, string> }) {
  const fam = FAMS.some((f) => f.id === params.f) ? params.f || '' : '';
  const l = stageOf(params);
  const rows = useMemo(() => leadership(fam || undefined), [fam]);
  const eng = useMemo(engine, []);
  const fl = useMemo(flows, []);
  const sel = rows.find((r) => r.period.id === params.p) || rows.find((r) => r.leader === 'islamic') || rows[0];
  const to = (n: number) => href('culture', { f: fam, p: params.p, l: String(n) });
  const leaders = rows.filter((r) => r.leader).map((r) => r.leader!);
  const relay = leaders.filter((x, i) => !i || x !== leaders[i - 1]);
  const maxOut = Math.max(...eng.map((e) => Math.max(e.out, e.inn)));
  let run = 0, maxRun = 0, prev = '';
  for (const r of rows) { run = r.leader && r.leader === prev ? run + 1 : 1; prev = r.leader || ''; maxRun = Math.max(maxRun, run); }
  const top = eng[0], importer = [...eng].sort((a, b) => b.inn - a.inn)[0];

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
    return { items, doms: srt(byDom).slice(0, 3), ppl: srt(byP).slice(0, 4), places: srt(byPlace).slice(0, 3), e: eng.find((x) => x.s === sel.leader) };
  }, [sel, eng]);
  const sp = sel.leader ? sphereById.get(sel.leader)! : null;

  return (
    <div className="page culture-page">
      <PageHead kicker="תרבות כמנוע" q={<>איזו תרבות <b>הובילה</b> כל תקופת גילויים, ולמה?</>}
        stepper={<Stepper l={l} to={to} desc={['מה התשובה', 'למה דווקא היא', 'מי העבירה ומי קלטה']} />}
        pick={
          <div className="seg" role="group" aria-label="סינון לפי תחום">
            {FAMS.map((f) => <a key={f.id} className={`seg-b press ${fam === f.id ? 'on' : ''}`} href={href('culture', { f: f.id, p: params.p, l: String(l) })}>{f.he}</a>)}
          </div>
        } />

      {l === 1 && (
        <div className="stage" key={'c1' + fam}>
          <Bottom
            main={`ההובלה במדע ==עברה ${relay.length - 1} פעמים.==`}
            plain={`${maxRun === 1 ? '**אף תרבות לא הובילה שתי תקופות ברציפות.**' : `**הרצף הארוך ביותר של תרבות אחת: ${maxRun} תקופות.**`} מ${name(relay[0])} בעת העתיקה ועד ${name(relay[relay.length - 1])} היום.`}
            adopt="**הובלה היא שלב, לא תכונה.** היא עוברת למקום שקולט רעיונות מאחרים, מפתח אותם ומעביר הלאה."
            num={{ v: relay.length - 1, story: `**פעמים עבר הלפיד** מתרבות לתרבות, ב-${rows.length} תקופות.` }}
          />
          <section className="canvas-wrap">
            <div className="bands" data-testid="bands">
              {rows.map((r, i) => (
                <button key={r.period.id} className={`band press ${r.period.id === sel.period.id ? 'on' : ''}`} onClick={() => go('culture', { f: fam, p: r.period.id, l: '2' })} aria-pressed={r.period.id === sel.period.id}>
                  <span className="band-lead" style={{ color: r.leader ? sphereColor(r.leader) : undefined }}>{r.leader ? name(r.leader) : 'אין נתונים'}</span>
                  <span className="band-bar grow-up" style={{ '--d': `${(i * 0.18).toFixed(2)}s` } as React.CSSProperties}>
                    {r.ranked.map(([s, c]) => <i key={s} style={{ height: `${(c / r.total) * 100}%`, background: sphereColor(s), opacity: s === r.leader ? 1 : 0.32 }} title={`${name(s)}: ${c}`} />)}
                  </span>
                  <span className="band-p">{r.period.he}</span>
                </button>
              ))}
            </div>
            <div className="legend">
              <span><b>קריאה:</b> כל עמודה היא תקופה, מהעתיקה (ימין) עד היום. הצבע החזק: התרבות שהובילה.</span>
              <span>לחיצה על עמודה: למה דווקא היא.</span>
            </div>
          </section>
          <NextStage l={l} to={to} label={`למה ${name(sel.leader || '')} הובילה ב${sel.period.he}`} />
        </div>
      )}

      {l === 2 && (
        <div className="stage" key={'c2' + sel.period.id + fam}>
          <div className="periods" role="group" aria-label="בחירת תקופה">
            {rows.map((r) => <a key={r.period.id} className={`per press ${r.period.id === sel.period.id ? 'on' : ''}`} href={href('culture', { f: fam, p: r.period.id, l: '2' })}><i style={{ background: r.leader ? sphereColor(r.leader) : 'var(--line)' }} />{r.period.he}</a>)}
          </div>
          {sel.leader ? (
            <div className="stage-2">
              <section className="idea">
                <p className="meta">{sel.period.he} · {yr(sel.period.from)}–{sel.period.to > 2026 ? 'היום' : yr(sel.period.to)}</p>
                <h2>{name(sel.leader)}</h2>
                <div className="story-num story-in"><b style={{ color: sphereColor(sel.leader) }}>{pct(sel.share)}</b><p><span className="line"><b>מהגילויים בתקופה</b> נולדו כאן: {sel.counts.get(sel.leader)} מתוך {sel.total}.</span>{sel.second && <span className="line">אחריה: {name(sel.second)}.</span>}</p></div>
                {why && (
                  <div className="why">
                    <h3>מה הנתונים מראים <span className="tag tag-fact">עובדה</span></h3>
                    <p><b>תחומים:</b> {why.doms.map(([d, c]) => `${domains[d]?.he} (${c})`).join(', ')}</p>
                    <p><b>אנשים:</b> {why.ppl.map(([p]) => persons[p]?.he).filter(Boolean).join(', ')}</p>
                    {why.places.length > 0 && <p><b>מקומות:</b> {why.places.map(([p]) => p).join(', ')}</p>}
                    {why.e && <p><b>העבירה {why.e.out}</b> רעיונות לתרבויות אחרות, וקלטה {why.e.inn}.</p>}
                  </div>
                )}
              </section>
              <section className="links2">
                {sp?.arch ? (
                  <div className="arch">
                    <h3><Term k="arch" /> <span className="tag tag-int">פרשנות</span></h3>
                    <p className="arch-name">{sp.arch.archetype}</p>
                    <p><b>הסדר:</b> {sp.arch.order}.</p>
                    <p><b>הכאוס:</b> {sp.arch.chaos}.</p>
                    <blockquote>{sp.arch.insight}</blockquote>
                    <a className="btn btn-line press" href={archLink(sp.arch.id)} target="_blank" rel="noopener">ל{sp.arch.name} בארכיטייפ</a>
                  </div>
                ) : sp?.proposal ? (
                  <div className="arch arch-hyp">
                    <h3><Term k="arch" />, הצעה שלנו <span className="tag tag-hyp">השערה</span></h3>
                    <p className="arch-name">{sp.proposal.archetype}</p>
                    <Rich as="p" text={sp.proposal.why} lines />
                    <p className="small">לתרבות הזו אין עדיין ארכיטייפ ב<a href={SRC.architaip.url} target="_blank" rel="noopener">ארכיטייפ</a>.</p>
                  </div>
                ) : null}
                <div className="near">
                  <h3>הגילויים שלה בתקופה</h3>
                  {why?.items.slice(0, 6).map((n) => (
                    <a key={n.id} className="lb-item press" href={href('tree', { id: n.id })}><i style={{ background: sphereColor(n.s) }} /><span>{n.t}</span><small>{yearText(n.y)}</small></a>
                  ))}
                </div>
              </section>
            </div>
          ) : <p>אין גילויים בתקופה הזו בתחום שנבחר.</p>}
          <NextStage l={l} to={to} label="מי העבירה רעיונות לאחרות, ומי קלטה" />
        </div>
      )}

      {l === 3 && (
        <div className="stage stage-3" key="c3">
          <div className="lists3 lists3-2">
            <section>
              <Rich as="h2" className="sec-t" text={`==${name(top.s)} העבירה הכי הרבה. ${name(importer.s)} קלטה הכי הרבה.==`} />
              <p className="chart-sub"><b>ימין: רעיונות שיצאו מהתרבות והמשיכו אצל אחרת.</b> שמאל: רעיונות שנכנסו אליה. רק קשרים <Term k="documented">מוכחים במקור</Term>.</p>
              <div className="engine" data-testid="engine">
                {eng.slice(0, 10).map((e, i) => (
                  <div key={e.s} className="eng-row grow" style={{ '--d': `${(i * 0.08).toFixed(2)}s` } as React.CSSProperties}>
                    <span className="eng-out"><i style={{ width: `${(e.out / maxOut) * 100}%`, background: sphereColor(e.s) }} /><b>{e.out}</b></span>
                    <span className="eng-name">{name(e.s)}</span>
                    <span className="eng-in"><i style={{ width: `${(e.inn / maxOut) * 100}%` }} /><b>{e.inn}</b></span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="lb-h">המסלולים העמוסים ביותר</h3>
              <div className="flows">
                {fl.slice(0, 6).map((f) => (
                  <span key={f.a + f.b} className="flow"><CultureChip s={f.a} small /><em>העבירה אל</em><CultureChip s={f.b} small /><b>{f.v}</b></span>
                ))}
              </div>
              <PostLinks page="culture" />
            </section>
          </div>
          <NextStage l={l} to={to} label="" />
        </div>
      )}
    </div>
  );
}

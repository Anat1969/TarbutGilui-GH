// מכשירים: איזה מכשיר פתח את העין, ולאיזה תחום הוא עוד לא הגיע.
// מקל השליחים כאן הוא הפועל של המכשיר: להגדיל, לראות דרך, לסמן, להשוות. הוא עובר מתחום לתחום.
// שלושה שלבים: העיקר (מפת המעברים), הראיה (מכשיר אחד: מה ראה, לאן עבר, לאן עוד לא), להעמקה (צורת החקירה וההסתייגות).
import { go, href } from '../route';
import Rich from '../components/Rich';
import Pick from '../components/Pick';
import Bottom, { NextStage, PageHead, Stepper, stageOf } from '../components/Bottom';
import { PostLinks } from './Posts';
import { awards, fieldHe, fields, method, coverage, toolList as list, toolStats as stats, type Instrument } from '../lib/tools';

const NOBEL = 'https://prasnovel-gh.vercel.app/#/people?id=';
type Cell = { kind: 'gold' | 'done' | 'idea' | 'none'; n: number };
const cell = (i: Instrument, f: string): Cell => {
  const n = awards(i.prizes.filter((p) => p.f === f));
  if (n) return { kind: 'gold', n };
  if (i.crossed.some((c) => c.f === f)) return { kind: 'done', n: 0 };
  if (i.ideas.some((c) => c.f === f)) return { kind: 'idea', n: 0 };
  return { kind: 'none', n: 0 };
};
const cellName = { gold: 'פרס נובל', done: 'מעבר שכבר קרה', idea: 'הצעה', none: 'ריק' };
const times = (n: number) => (n === 1 ? 'מעבר אחד' : `${n} מעברים`);

export default function Tools({ params }: { params: Record<string, string> }) {
  const l = stageOf(params);
  const sel = list.find((i) => i.id === params.t) || list.find((i) => i.id === 'xray') || list[0];
  const fsel = fields.some((f) => f.id === params.f) ? params.f : '';
  const to = (n: number) => href('tools', { t: params.t, f: params.f, l: String(n) });
  const years = `${sel.prizes[0].y}–${sel.prizes[sel.prizes.length - 1].y}`;

  return (
    <div className="page tools-page">
      <PageHead kicker="מכשירים" q={<>איזה מכשיר <b>פתח את העין</b>, ולאיזה תחום הוא עוד לא הגיע?</>}
        stepper={<Stepper l={l} to={to} desc={['מפת המעברים', 'מכשיר אחד מקרוב', 'צורת החקירה']} />}
        pick={
          <Pick testid="tool-search" placeholder="חיפוש מכשיר או פועל" current={<><b>{sel.he}</b><small>{sel.verb}</small></>}
            items={list.map((i) => ({ id: i.id, label: i.he, sub: i.verb, key: i.prizes.map((p) => p.he).join(' ') }))}
            onPick={(id) => go('tools', { t: id, l: '2' })} />
        } />

      {l === 1 && (
        <div className="stage" key="t1">
          <Bottom
            main="מכשיר הוא פועל, ==והפועל נייד.=="
            plain={`**${stats.awards} פרסי נובל** ניתנו על ${list.length} מכשירים, או על מה שנראה דרכם. הפועל שלהם, כמו "לראות דרך" או "לסמן ולעקוב", **כבר עבר ${stats.crossed} פעמים** לתחום אחר.`}
            adopt="**לא שואלים איזה מכשיר חסר לי.** שואלים מה אצלי שקוף, מהיר, חלש, מעורבב או קבור, ומשם בוחרים פועל."
            num={{ v: stats.ideas, story: '**הצעות מעבר** לתחום שהמכשיר עוד לא הגיע אליו. כולן השערה, עד שייבדקו.' }}
          />
          <section className="canvas-wrap">
            <div className="mx" data-testid="matrix" role="table" aria-label="מכשירים מול תחומים">
              <div className="mx-row mx-head" role="row">
                <span className="mx-name" role="columnheader">המכשיר, והפועל שלו</span>
                {fields.map((f, k) => <span key={f.id} role="columnheader" className={`mx-h ${k === 4 ? 'mx-gap' : ''}`}><em>{f.he}</em></span>)}
              </div>
              {list.map((i, r) => (
                <div key={i.id} className={`mx-row grow ${i.id === sel.id ? 'on' : ''}`} role="row" style={{ '--d': `${(r * 0.04).toFixed(2)}s` } as React.CSSProperties}>
                  <a className="mx-name" role="rowheader" href={href('tools', { t: i.id, l: '2' })}><b>{i.he}</b><small>{i.verb}</small></a>
                  {fields.map((f, k) => {
                    const c = cell(i, f.id);
                    return c.kind === 'none'
                      ? <span key={f.id} role="cell" className={`mx-c mx-none ${k === 4 ? 'mx-gap' : ''}`} />
                      : (
                        <button key={f.id} role="cell" className={`mx-c mx-${c.kind} ${k === 4 ? 'mx-gap' : ''}`}
                          onClick={() => go('tools', { t: i.id, f: f.id, l: '2' })} aria-label={`${i.he}, ${f.he}: ${cellName[c.kind]}`} title={`${f.he}: ${cellName[c.kind]}`}>
                          {c.kind === 'gold' ? c.n : ''}
                        </button>
                      );
                  })}
                </div>
              ))}
            </div>
            <div className="legend">
              <span><i className="lgc mx-gold" />פרס נובל, ומספר הפרסים</span>
              <span><i className="lgc mx-done" />מעבר שכבר קרה</span>
              <span><i className="lgc mx-idea" />הצעה למעבר חדש (השערה)</span>
              <span><b>קריאה:</b> שורה היא מכשיר, לפי שנת הפרס הראשון. לחיצה על משבצת פותחת אותה.</span>
            </div>
            <Rich as="p" className="insight" text={`==הכי הרבה מכשירים עברו אל ${stats.most.f.he}: ${stats.most.done}.== התחום שמחכה: **${stats.waiting.f.he}**, עם ${times(stats.waiting.done)} ו-**${stats.waiting.idea}** הצעות.`} />
          </section>
          <NextStage l={l} to={to} label={`${sel.he}: מה נראה, ולאן עוד לא הגיע`} />
        </div>
      )}

      {l === 2 && (
        <div className="stage" key={'t2' + sel.id}>
          <div className="stage-2">
            <section className="idea" data-testid="tool-card">
              <p className="meta">פרסי נובל: {years}</p>
              <h2>{sel.he}</h2>
              <p className="verb">{sel.verb}</p>
              <div className="kv"><span>מה נראה לראשונה</span><span>{sel.see}</span></div>
              <div className="kv"><span>איך השתנתה החשיבה</span><Rich as="span" text={`==${sel.shift}==`} /></div>
              <div className="story-num story-in"><b style={{ color: 'var(--gold)' }}>{awards(sel.prizes)}</b><p><span className="line"><b>פרסי נובל</b> על המכשיר, או על מה שנראה דרכו.</span></p></div>
              {sel.node && <a className="btn btn-line press" href={href('tree', { id: sel.node.id })}>לשושלת בעץ הרעיונות: {sel.node.t}</a>}
              <div className="near">
                <h3>הפרסים <span className="tag tag-fact">עובדה</span></h3>
                {sel.prizes.map((p) => (
                  <a key={p.nid + p.y} className={`near-item t-gold press ${fsel === p.f ? 'hit' : ''}`} href={NOBEL + p.nid} target="_blank" rel="noopener" title={p.mh}>
                    <span className="near-top"><b>{p.d}</b><small>{p.y} · {p.fh}</small></span>
                    <span className="near-ex">{p.he} · {p.role === 'f' ? 'הפרס על המכשיר' : 'גילוי בעזרת המכשיר'}</span>
                  </a>
                ))}
                <p className="small">הפרסים: קרן נובל, דרך גמד על כתפי ענקים. השיוך "על המכשיר" או "בעזרתו" הוא פרשנות.</p>
              </div>
            </section>
            <section className="links2">
              <div className="near">
                <h3>לאן הפועל עוד לא הגיע <span className="tag tag-hyp">השערה</span></h3>
                {sel.ideas.map((c) => (
                  <div key={c.f} className={`near-item t-idea ${fsel === c.f ? 'hit' : ''}`}><b>{fieldHe(c.f)}</b><Rich as="span" className="near-ex" text={c.t} /></div>
                ))}
              </div>
              <div className="near">
                <h3>לאן הוא כבר עבר <span className="tag tag-int">ידע כללי, טרם צוטט</span></h3>
                {sel.crossed.map((c) => (
                  <div key={c.f} className={`near-item t-done ${fsel === c.f ? 'hit' : ''}`}><b>{fieldHe(c.f)}</b><Rich as="span" className="near-ex" text={c.t} /></div>
                ))}
              </div>
            </section>
          </div>
          <NextStage l={l} to={to} label="איך חקרתי, ומה ההסתייגות" />
        </div>
      )}

      {l === 3 && (
        <div className="stage stage-3" key="t3">
          <Rich as="h2" className="sec-t" text="==חמישה צעדים, מהפרס אל ההצעה.==" />
          <ol className="method" data-testid="method">
            {method.map((m, k) => <li key={m.t}><span className="m-n">{k + 1}</span><b>{m.t}</b><Rich as="p" text={m.x} /></li>)}
          </ol>
          <div className="lists3 lists3-2">
            <section className="limit">
              <h3 className="lb-h">ההסתייגות: המכשיר הכרחי, לא מספיק <span className="tag tag-int">פרשנות</span></h3>
              <p>הרשימה מכסה <b>{coverage.inList}</b> מתוך <b>{coverage.all}</b> פרסים בפיזיקה, בכימיה וברפואה.</p>
              <p>זה רף תחתון, כי הרשימה נבחרה ביד. ועדיין, רוב הפרסים ניתנו בלי מכשיר חדש ברשימה.</p>
              <p><b>{stats.forIt}</b> פרסים ניתנו על המכשיר עצמו. השאר ניתנו על מה שנראה דרכו, וזה דורש גם <b>שאלה</b>.</p>
              <p>פרימן דייסון (<bdi dir="ltr">Freeman Dyson</bdi>) שאל ב-2012 אם המדע מונע ברעיונות או בכלים. תשובתו, בניסוח שלנו: <b>לסירוגין</b>.</p>
            </section>
            <section>
              <p className="haiku"><span>עדשה אחת.</span><span>מה שלא היה שם</span><span>נהיה מקום.</span></p>
              <PostLinks page="tools" />
            </section>
          </div>
          <NextStage l={l} to={to} label="" />
        </div>
      )}
    </div>
  );
}

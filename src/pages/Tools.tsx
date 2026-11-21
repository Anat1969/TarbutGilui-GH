// מכשירים: איזה מכשיר פתח את העין, ולאיזה תחום הוא עוד לא הגיע.
// מקל השליחים כאן הוא הפועל של המכשיר, והוא עובר מתחום לתחום.
import { useMemo } from 'react';
import raw from '../data/instruments.json';
import { go, href } from '../route';
import Rich from '../components/Rich';
import Distill from '../components/Distill';
import { plain } from '../lib/graph';

type Prize = { nid: string; he: string; en: string; y: number; f: string; fh: string; d: string; mh: string; role: 'f' | 'w' };
type Note = { f: string; t: string };
type Instrument = { id: string; he: string; verb: string; see: string; shift: string; node: null | { id: string; t: string; y: number }; prizes: Prize[]; crossed: Note[]; ideas: Note[] };
type Field = { id: string; he: string; sci: boolean };
const data = raw as unknown as { built: string; fields: Field[]; method: { t: string; x: string }[]; instruments: Instrument[]; coverage: { inList: number; all: number } };
const { fields, method, coverage } = data;
const list = [...data.instruments].sort((a, b) => a.prizes[0].y - b.prizes[0].y);
const fieldHe = (id: string) => fields.find((f) => f.id === id)?.he || id;
const awards = (ps: Prize[]) => new Set(ps.map((p) => `${p.y}-${p.f}`)).size;
const times = (n: number) => (n === 1 ? 'מעבר אחד' : `${n} מעברים`);
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

export default function Tools({ params }: { params: Record<string, string> }) {
  const sel = list.find((i) => i.id === params.t) || list.find((i) => i.id === 'xray') || list[0];
  const fsel = fields.some((f) => f.id === params.f) ? params.f : '';

  const stats = useMemo(() => {
    const all = list.flatMap((i) => i.prizes);
    const byField = fields.filter((f) => !f.sci).map((f) => ({
      f, done: list.filter((i) => i.crossed.some((c) => c.f === f.id)).length, idea: list.filter((i) => i.ideas.some((c) => c.f === f.id)).length,
    }));
    const most = [...byField].sort((a, b) => b.done - a.done)[0];
    const waiting = [...byField].sort((a, b) => a.done - b.done || b.idea - a.idea)[0];
    return {
      awards: awards(all), ideas: list.flatMap((i) => i.ideas).length, crossed: list.flatMap((i) => i.crossed).length,
      forIt: awards(all.filter((p) => p.role === 'f')), most, waiting,
    };
  }, []);

  const years = `${sel.prizes[0].y}–${sel.prizes[sel.prizes.length - 1].y}`;
  const context = () => [
    `מכשיר: ${sel.he}. הפועל שלו: ${sel.verb}.`,
    `מה נראה לראשונה: ${sel.see} איך השתנתה החשיבה: ${plain(sel.shift)}`,
    `פרסי נובל (${awards(sel.prizes)}): ${sel.prizes.map((p) => `${p.he} ${p.y}, ${p.fh}, ${p.d}`).join('; ')}.`,
    `מעברים שכבר קרו: ${sel.crossed.map((c) => `${fieldHe(c.f)}: ${plain(c.t)}`).join(' ')}`,
    `הצעות (הנחה): ${sel.ideas.map((c) => `${fieldHe(c.f)}: ${plain(c.t)}`).join(' ')}`,
    'המשימה: לזקק מה הפועל הזה יכול לגלות בתחום שעוד לא קיבל אותו, ואיזה ניסוי קטן יבדוק את זה.',
  ].join('\n');

  return (
    <div className="page tools-page">
      <section className="qhead">
        <div>
          <p className="kicker">מכשירים</p>
          <h1>איזה מכשיר <mark>פתח את העין</mark>, ולאיזה תחום הוא עוד לא הגיע?</h1>
          <p className="sub">מכשיר הוא <b>פועל</b>: להגדיל, לראות דרך, לסמן, להשוות. הפועל נייד, והוא עובר מתחום לתחום כמו מקל שליחים.</p>
        </div>
        <div className="bignums">
          <div className="bn"><b>{list.length}</b><span>מכשירים שפתחו שדה ראייה חדש</span></div>
          <div className="bn"><b style={{ color: 'var(--gold)' }}>{stats.awards}</b><span>פרסי נובל על המכשיר או בזכותו</span></div>
          <div className="bn"><b>{stats.ideas}</b><span>הצעות מעבר לתחום חדש (הנחה)</span></div>
        </div>
      </section>

      <div className="split">
        <section className="canvas-wrap">
          <h2 className="chart-t">מפת המעברים: כל מכשיר מול כל תחום</h2>
          <p className="chart-sub">שורה היא מכשיר, לפי שנת הפרס הראשון. עמודה היא תחום. משבצת אפורה מקווקוות היא תחום שהמכשיר עוד לא הגיע אליו: שם ההצעה.</p>
          <div className="mx" data-testid="matrix" role="table" aria-label="מכשירים מול תחומים">
            <div className="mx-row mx-head" role="row">
              <span className="mx-name" role="columnheader">המכשיר והפועל שלו</span>
              {fields.map((f, k) => <span key={f.id} role="columnheader" className={`mx-h ${fsel === f.id ? 'on' : ''} ${k === 4 ? 'mx-gap' : ''}`}><em>{f.he}</em></span>)}
            </div>
            {list.map((i) => (
              <div key={i.id} className={`mx-row ${i.id === sel.id ? 'on' : ''}`} role="row">
                <a className="mx-name press" role="rowheader" href={href('tools', { t: i.id })} aria-current={i.id === sel.id ? 'true' : undefined}>
                  <b>{i.he}</b><small>{i.verb}</small>
                </a>
                {fields.map((f, k) => {
                  const c = cell(i, f.id);
                  return c.kind === 'none'
                    ? <span key={f.id} role="cell" className={`mx-c mx-none ${k === 4 ? 'mx-gap' : ''}`} />
                    : (
                      <button key={f.id} role="cell" className={`mx-c mx-${c.kind} press ${k === 4 ? 'mx-gap' : ''} ${i.id === sel.id && fsel === f.id ? 'pick' : ''}`}
                        onClick={() => go('tools', { t: i.id, f: f.id })} aria-label={`${i.he}, ${f.he}: ${cellName[c.kind]}`} title={`${f.he}: ${cellName[c.kind]}`}>
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
            <span><i className="lgc mx-idea" />הצעה למעבר חדש (הנחה)</span>
          </div>
          <Rich as="p" className="insight" text={`==הפועל כבר עבר ${stats.crossed} פעמים.== הכי הרבה אל **${stats.most.f.he}**: ${stats.most.done} מכשירים. התחום שמחכה: **${stats.waiting.f.he}**, עם ${times(stats.waiting.done)} ו-**${stats.waiting.idea}** הצעות.`} />

          <h2 className="chart-t">צורת החקירה: חמישה צעדים מהפרס אל ההצעה</h2>
          <ol className="method" data-testid="method">
            {method.map((m, k) => <li key={m.t}><span className="m-n">{k + 1}</span><b>{m.t}</b><Rich as="p" text={m.x} /></li>)}
          </ol>

          <div className="museum">
            <figure className="quote">
              <blockquote>כיוונים חדשים במדע נפתחים בידי <b>כלים חדשים</b>, הרבה יותר מאשר בידי מושגים חדשים.</blockquote>
              <figcaption>פרימן דייסון, <bdi dir="ltr">Imagined Worlds</bdi>, 1997. תרגום חופשי.</figcaption>
            </figure>
            <p className="haiku">עדשה אחת.<br />מה שלא היה שם<br />נהיה מקום.</p>
            <div className="limit">
              <h3>הסתייגות: המכשיר הכרחי, לא מספיק <span className="tag tag-int">הערכה</span></h3>
              <p>הרשימה מכסה <b>{coverage.inList}</b> מתוך <b>{coverage.all}</b> פרסים בפיזיקה, בכימיה וברפואה. זה רף תחתון, כי הרשימה נבחרה ביד.</p>
              <p><b>{stats.forIt}</b> פרסים ניתנו על המכשיר עצמו. השאר ניתנו על מה שנראה דרכו, וזה דורש גם <b>שאלה</b>.</p>
            </div>
          </div>
        </section>

        <aside className="side" aria-label="המכשיר שנבחר">
          <div className="side-card" data-testid="tool-card">
            <p className="meta">פרסי נובל: {years} · {awards(sel.prizes)} פרסים</p>
            <h2>{sel.he}</h2>
            <p className="verb">{sel.verb}</p>
            <div className="kv"><span>מה נראה לראשונה</span><span>{sel.see}</span></div>
            <div className="kv"><span>איך השתנתה החשיבה</span><Rich as="span" className="shift" text={`==${sel.shift}==`} /></div>
            {sel.node && <a className="btn btn-line press" href={href('tree', { id: sel.node.id })}>לשושלת בעץ הרעיונות: {sel.node.t}</a>}

            <h3>הצעות: לאן הפועל עוד לא הגיע <span className="tag tag-hyp">הנחה</span></h3>
            <div className="near">
              {sel.ideas.map((c) => (
                <div key={c.f} className={`near-item t-idea ${fsel === c.f ? 'pick' : ''}`}><b>{fieldHe(c.f)}</b><Rich as="span" className="near-ex" text={c.t} /></div>
              ))}
            </div>

            <h3>מעברים שכבר קרו <span className="tag tag-int">ידע כללי, טרם צוטט</span></h3>
            <div className="near">
              {sel.crossed.map((c) => (
                <div key={c.f} className={`near-item t-done ${fsel === c.f ? 'pick' : ''}`}><b>{fieldHe(c.f)}</b><Rich as="span" className="near-ex" text={c.t} /></div>
              ))}
            </div>

            <Distill kind="tool" id={sel.id} context={context} label="זיקוק: מה הפועל הזה יגלה אצלי" />

            <h3>הפרסים <span className="tag tag-fact">עובדה</span></h3>
            <div className="near">
              {sel.prizes.map((p) => (
                <a key={p.nid + p.y} className={`near-item t-gold press ${fsel === p.f ? 'pick' : ''}`} href={NOBEL + p.nid} target="_blank" rel="noopener" title={p.mh}>
                  <span className="near-top"><b>{p.d}</b><small>{p.y} · {p.fh}</small></span>
                  <span className="near-ex">{p.he} · {p.role === 'f' ? 'הפרס על המכשיר' : 'גילוי בעזרת המכשיר'}</span>
                </a>
              ))}
            </div>
            <p className="small">הפרסים והנימוקים: קרן נובל, דרך גמד על כתפי ענקים. השיוך "על המכשיר" או "בעזרתו" הוא פרשנות.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

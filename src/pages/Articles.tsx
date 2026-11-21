// כתבות: רשימה, וכתבה אחת בשישה דפים שיורדים מבהיר לכהה (תקן הכתבות: אפורים בלבד, תמונות בצבע).
// כל כתבה: שער, שלושה פרקים עם תובנה, מה זה אומר לתכנון, ושאלה לקוראת. מודפסת כשישה דפי A4.
import { href } from '../route';
import Rich from '../components/Rich';
import { articles } from '../lib/articles';

const BY = "אד' ענת דוד שטיבלמן";

export default function Articles({ params }: { params: Record<string, string> }) {
  const a = articles.find((x) => x.id === params.id);
  if (!a) {
    return (
      <div className="page arts-page">
        <header className="arts-head">
          <p className="kicker">כתבות · בעקבות המכשירים</p>
          <h1 className="arts-h">שישה סיפורים על <mark>פועל אחד שעבר תחום</mark></h1>
          <p className="arts-sub">כל כתבה נפתחת בסיפור, ונגמרת בשלושה צעדים שאפשר לנסות ברחוב אחד.</p>
        </header>
        <div className="arts" data-testid="articles">
          {articles.map((x, i) => (
            <a key={x.id} className="art-card press" href={href('articles', { id: x.id })}>
              <span className="art-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="art-verb">{x.verb}</span>
              <b className="art-t"><span>{x.t1}</span> {x.t2}</b>
              <span className="art-dek">{x.dek}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }
  const i = articles.indexOf(a);
  const next = articles[(i + 1) % articles.length];
  const foot = (n: number) => <p className="pg-foot"><span>תרבות וגילוי · כתבות</span><span>{n}</span></p>;
  return (
    <div className="mag" data-testid="article" key={a.id}>
      <nav className="mag-bar" aria-label="פעולות על הכתבה">
        <a className="press" href={href('articles')}>כל הכתבות</a>
        <span>
          <a className="press" href={`articles/${a.id}.pdf`} download>PDF</a>
          <a className="press" href={`articles/${a.id}.docx`} download>Word</a>
          <button className="press" onClick={() => window.print()}>הדפסה</button>
        </span>
      </nav>

      <section className="pg pg-1">
        {a.img ? (
          <figure className="cover-fig"><img src={a.img.src} alt={a.img.cap} /><figcaption>{a.img.cap}. {a.img.credit}</figcaption></figure>
        ) : <div className="cover-type" aria-hidden="true"><span>{String(i + 1).padStart(2, '0')}</span><em>{a.verb}</em></div>}
        <div className="cover-text">
          <p className="mag-verb">{a.verb}</p>
          <h1 className="mag-t"><span>{a.t1}</span><b>{a.t2}</b></h1>
          <p className="mag-dek">{a.dek}</p>
          <p className="mag-by">{BY}</p>
        </div>
        {foot(1)}
      </section>

      {a.chapters.map((c, k) => (
        <section key={c.h} className={`pg pg-${k + 2}`}>
          <span className="ch-n">{String(k + 1).padStart(2, '0')}</span>
          <h2 className="ch-h">{c.h}</h2>
          <Rich as="div" className="ch-body" text={c.body.join(' ')} lines />
          <p className="ch-insight">{c.insight}</p>
          {foot(k + 2)}
        </section>
      ))}

      <section className="pg pg-5">
        <span className="ch-n">04</span>
        <h2 className="ch-h">מה זה אומר לתכנון</h2>
        <Rich as="div" className="ch-body" text={a.plan.body.join(' ')} lines />
        <ol className="steps">{a.plan.steps.map((s, k) => <li key={k}><i>{k + 1}</i><span>{s}</span></li>)}</ol>
        {foot(5)}
      </section>

      <section className="pg pg-6">
        <p className="ask-l">שאלה אחת לסיום</p>
        <p className="ask-big">{a.ask}</p>
        <p className="mag-haiku">{a.haiku.map((h, k) => <span key={k}>{h}</span>)}</p>
        <div className="colophon">
          <p>השנים, השמות והמספרים בכתבה נכתבו מידע כללי, וטרם צוטטו ממקור. פרסי נובל אומתו מול נתוני קרן נובל.</p>
          <p>הדפים יורדים מבהיר לכהה, עם קפיצה אחת באמצע: מהסיפור אל מה שעושים איתו.</p>
          <p className="mag-links">
            <a href={a.tool ? href('tools', { t: a.tool, l: '2' }) : href('tools', { l: '3' })}>לדף המכשירים</a>
            <a href={href('articles', { id: next.id })}>הכתבה הבאה: {next.t1} {next.t2}</a>
          </p>
        </div>
        {foot(6)}
      </section>
    </div>
  );
}

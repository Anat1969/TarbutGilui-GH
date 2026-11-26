// כתבות: רשימה, וכתבה אחת בשישה דפים שיורדים מבהיר לכהה (תקן הכתבות: אפורים בלבד, תמונות בצבע).
// כל כתבה: שער, שלושה פרקים עם תובנה, מה זה אומר לתכנון, ושאלה לקוראת.
// בהדפסה וב-PDF: דף A4 אחד (Sheet), באותו מהלך גוונים. כתבה בלי תמונה מציגה בשער מסגרת עם פרומפט מוכן להדמיה.
import { useState } from 'react';
import { href } from '../route';
import Rich from '../components/Rich';
import { articles, type Article } from '../lib/articles';

const BY = "אד' ענת דוד שטיבלמן";
const num = (n: number) => String(n).padStart(2, '0');

// מסגרת להדמיית השער, במקום התמונה: משפט הזיקוק, והפרומפט בתוך הכפתור (לפי סקיל הפרומפטים החזותיים).
// מוצגת רק בכתבה שאין לה תמונה, ולא מודפסת. כשהתמונה מגיעה, היא תופסת את המקום, והמסגרת נעלמת.
function Prompt({ p, id }: { p: NonNullable<Article['prompt']>; id: string }) {
  const [ok, setOk] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(p.text); setOk(true); setTimeout(() => setOk(false), 1800); } catch { setOk(false); } };
  return (
    <div className="prompt-frame" data-testid="prompt" dir="rtl">
      <p className="prompt-l">מקום להדמיה</p>
      <p className="prompt-z">{p.zikuk}</p>
      <button className="prompt-b press" onClick={copy} data-testid="prompt-copy" data-prompt={p.text} aria-label="העתקת הפרומפט למידג'רני">{ok ? 'הועתק' : 'העתקת הפרומפט'}</button>
      <p className="prompt-n"><span>שם הקובץ: <code dir="ltr">{id}.jpg</code></span><span>התמונה תיכנס לכאן, ותסומן "הדמיה".</span></p>
    </div>
  );
}

// דף A4 אחד להדפסה: שער, שלושה פרקים בטורים, ומתחת לקפיצת הגוון: מה עושים, והשאלה.
function Sheet({ a, i }: { a: Article; i: number }) {
  return (
    <article className="sheet" data-testid="sheet" aria-hidden="true">
      <section className="sh sh-a">
        <p className="sh-run"><span>תרבות וגילוי · כתבות</span><span>{num(i + 1)}</span></p>
        <div className="sh-cover">
          {a.img ? <figure className="sh-fig"><img src={a.img.src} alt="" /><figcaption>{a.img.cap}. {a.img.credit}</figcaption></figure>
            : <div className="sh-type"><span>{num(i + 1)}</span></div>}
          <div className="sh-title">
            <p className="sh-verb">{a.verb}</p>
            <h1><span>{a.t1}</span><b>{a.t2}</b></h1>
            <p className="sh-dek">{a.dek}</p>
            <p className="sh-by">{BY}</p>
          </div>
        </div>
      </section>
      <section className="sh sh-b">
        {a.chapters.map((c, k) => (
          <div key={c.h} className="sh-ch">
            <span className="sh-n">{num(k + 1)}</span>
            <h2>{c.h}</h2>
            <Rich as="div" className="sh-body" text={c.body.join(' ')} lines />
            <p className="sh-ins">{c.insight}</p>
          </div>
        ))}
      </section>
      <section className="sh sh-c">
        <div className="sh-plan">
          <span className="sh-n">04</span>
          <h2>מה זה אומר לתכנון</h2>
          <Rich as="div" className="sh-body" text={a.plan.body.join(' ')} lines />
        </div>
        <ol className="sh-steps">{a.plan.steps.map((s, k) => <li key={k}><i>{k + 1}</i><span>{s}</span></li>)}</ol>
      </section>
      <section className="sh sh-d">
        <div className="sh-ask"><p className="sh-verb">שאלה אחת לסיום</p><p className="sh-q">{a.ask}</p></div>
        <p className="sh-haiku">{a.haiku.map((h, k) => <span key={k}>{h}</span>)}</p>
        <p className="sh-col">השנים, השמות והמספרים נכתבו מידע כללי, וטרם צוטטו ממקור. פרסי נובל אומתו מול נתוני קרן נובל. הגוונים יורדים מבהיר לכהה, עם קפיצה אחת: מהסיפור אל מה שעושים איתו.</p>
      </section>
    </article>
  );
}

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
          <button className="press" onClick={() => window.print()}>הדפסה בדף אחד</button>
        </span>
      </nav>

      <section className="pg pg-1">
        {a.img ? (
          <figure className="cover-fig"><img src={a.img.src} alt={a.img.cap} /><figcaption>{a.img.cap}. {a.img.credit}</figcaption></figure>
        ) : a.prompt ? <Prompt p={a.prompt} id={a.id} />
          : <div className="cover-type" aria-hidden="true"><span>{String(i + 1).padStart(2, '0')}</span><em>{a.verb}</em></div>}
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
          <p>הדפים יורדים מבהיר לכהה, עם קפיצה אחת באמצע: מהסיפור אל מה שעושים איתו. בהדפסה: דף A4 אחד.</p>
          <p className="mag-links">
            <a href={a.tool ? href('tools', { t: a.tool, l: '2' }) : href('tools', { l: '3' })}>לדף המכשירים</a>
            <a href={href('articles', { id: next.id })}>הכתבה הבאה: {next.t1} {next.t2}</a>
          </p>
        </div>
        {foot(6)}
      </section>
      <Sheet a={a} i={i} />
    </div>
  );
}

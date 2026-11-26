// כתבות: רשימה, וכתבה אחת בשישה דפים שיורדים מבהיר לכהה (תקן הכתבות: אפורים בלבד, תמונות בצבע).
// כל כתבה: שער, שלושה פרקים עם תובנה, מה זה אומר לתכנון, ושאלה לקוראת.
// בהדפסה וב-PDF: דף A4 אחד (Sheet), באותו מהלך גוונים. כתבה בלי תמונה מציגה בשער מסגרת עם פרומפט מוכן להדמיה.
import { useEffect, useRef, useState } from 'react';
import { href } from '../route';
import Rich from '../components/Rich';
import { articles, type Article } from '../lib/articles';
import { clearCover, saveCover, useCover } from '../lib/covers';

const BY = "אד' ענת דוד שטיבלמן";
const num = (n: number) => String(n).padStart(2, '0');

// מסגרת להדמיית השער, במקום התמונה. הכלי הקבוע: הפרומפט שמור בתוך הכפתור, מעתיקים אותו למודל התמונה,
// וגוררים את התמונה שנוצרה לתוך המסגרת (או מדביקים, או לוחצים לבחירה). המסגרת שומרת אותה לתמיד (src/lib/covers.ts).
// כשיש תמונה, היא בשער עם הכיתוב "הדמיה", ואפשר להחליף או להסיר. המסגרת לא מודפסת; התמונה כן.
function Slot({ a, url }: { a: Article; url: string | null }) {
  const p = a.prompt!;
  const [ok, setOk] = useState(false);
  const [over, setOver] = useState(false);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [err, setErr] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const copy = async () => { try { await navigator.clipboard.writeText(p.text); setOk(true); setTimeout(() => setOk(false), 1800); } catch { setOk(false); } };
  const take = async (f?: Blob | null) => {
    if (!f || !f.type.startsWith('image/')) { setState('error'); setErr('זו לא תמונה. גוררים קובץ JPG, PNG או WEBP.'); return; }
    setState('saving'); setErr('');
    try { await saveCover(a.id, f); setState('saved'); setTimeout(() => setState('idle'), 2200); }
    catch (e) { setState('error'); setErr(`${(e as Error).message.replace(/\.$/, '')}. אפשר לגרור שוב.`); }
  };
  // הדבקה בכל מקום בדף: תמונה מהלוח נכנסת למסגרת
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => { const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith('image/')); if (f) { e.preventDefault(); take(f); } };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  });
  const drop = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setOver(true); },
    onDragLeave: () => setOver(false),
    onDrop: (e: React.DragEvent) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]); },
  };
  const status = state === 'saving' ? 'שומרת…' : state === 'saved' ? 'נשמר' : state === 'error' ? err : '';
  const picker = <input ref={input} type="file" accept="image/*" hidden data-testid="cover-input" onChange={(e) => take(e.target.files?.[0])} />;
  if (url) {
    return (
      <figure className={`cover-fig cover-slot${over ? ' over' : ''}`} data-testid="cover-slot" {...drop}>
        <img src={url} alt={p.zikuk} data-testid="cover-img" />
        <figcaption>הדמיה. {p.zikuk}</figcaption>
        <p className="slot-acts">
          <button className="press" onClick={() => input.current?.click()}>החלפת התמונה</button>
          <button className="press" onClick={copy} data-testid="prompt-copy" data-prompt={p.text}>{ok ? 'הועתק' : 'העתקת הפרומפט'}</button>
          <button className="press" onClick={() => clearCover(a.id).catch(() => {})}>הסרה</button>
          {status && <span className="slot-st" role="status">{status}</span>}
        </p>
        {picker}
      </figure>
    );
  }
  return (
    <div className={`prompt-frame${over ? ' over' : ''}`} data-testid="prompt" dir="rtl" {...drop}
      onClick={(e) => { if (!(e.target as HTMLElement).closest('button')) input.current?.click(); }}>
      <p className="prompt-l">מקום להדמיה</p>
      <p className="prompt-z">{p.zikuk}</p>
      <button className="prompt-b press" onClick={copy} data-testid="prompt-copy" data-prompt={p.text} aria-label="העתקת הפרומפט למודל התמונה">{ok ? 'הועתק' : '1. העתקת הפרומפט'}</button>
      <p className="prompt-drop"><b>2. גוררים לכאן את התמונה שנוצרה</b><span>או מדביקים, או לוחצים כאן לבחירה. היא נשמרת לתמיד.</span></p>
      {status && <p className={`slot-st${state === 'error' ? ' bad' : ''}`} role="status">{status}</p>}
      {picker}
    </div>
  );
}

// דף A4 אחד להדפסה: שער, שלושה פרקים בטורים, ומתחת לקפיצת הגוון: מה עושים, והשאלה.
function Sheet({ a, i, url }: { a: Article; i: number; url: string | null }) {
  const img = a.img || (url ? { src: url, cap: 'הדמיה', credit: a.prompt?.zikuk || '' } : null);
  return (
    <article className="sheet" data-testid="sheet" aria-hidden="true">
      <section className="sh sh-a">
        <p className="sh-run"><span>תרבות וגילוי · כתבות</span><span>{num(i + 1)}</span></p>
        <div className="sh-cover">
          {img ? <figure className="sh-fig"><img src={img.src} alt="" /><figcaption>{img.cap}. {img.credit}</figcaption></figure>
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
  const cover = useCover(a.id);
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
        ) : a.prompt ? <Slot a={a} url={cover} />
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
      <Sheet a={a} i={i} url={a.img ? null : cover} />
    </div>
  );
}

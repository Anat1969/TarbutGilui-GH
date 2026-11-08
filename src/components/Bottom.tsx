// השורה התחתונה: כל מסך נקרא מהסוף להתחלה.
// 1. העיקר (משפט אחד, גדול, במרקר). 2. בפשטות (מה זה אומר). 3. מה לקחת מזה (התובנה לאמץ, פרשנות).
// מתחת: איך קוראים את המסך בשלושה צעדים, נסגר ונזכר במכשיר.
import { useState, type ReactNode } from 'react';
import Rich from './Rich';

export function Lvl({ n }: { n: 1 | 2 | 3 }) {
  const he = n === 1 ? 'העיקר' : n === 2 ? 'הראיה' : 'להעמקה';
  return <span className={`lvl lvl-${n}`} aria-label={`רמת חשיבות ${n}: ${he}`}><i>{n}</i>{he}</span>;
}

const KEY = 'tg.howto.closed';
export function HowTo({ steps }: { steps: string[] }) {
  const [open, setOpen] = useState(() => { try { return localStorage.getItem(KEY) !== '1'; } catch { return true; } });
  const toggle = (v: boolean) => { setOpen(v); try { localStorage.setItem(KEY, v ? '0' : '1'); } catch { /* אין אחסון */ } };
  return (
    <details className="howto" open={open} onToggle={(e) => toggle((e.target as HTMLDetailsElement).open)}>
      <summary>
        <span className="howto-t press">איך קוראים את המסך · {open ? 'סגירה' : 'פתיחה'}</span>
        <span className="howto-key">מילה עם <u>קו נקודות</u> מוסברת בריחוף. רמות החשיבות: <Lvl n={1} /><Lvl n={2} /><Lvl n={3} /></span>
      </summary>
      <ol>
        {steps.map((s, i) => <li key={i}><i>{i + 1}</i><Rich text={s} /></li>)}
      </ol>
    </details>
  );
}

export default function Bottom({ kicker, main, plain, adopt, nums, sub }: {
  kicker: ReactNode; main: string; plain: string; adopt: string; nums?: ReactNode; sub?: ReactNode;
}) {
  return (
    <section className="bottom" aria-label="השורה התחתונה">
      <div className="bottom-text">
        <p className="kicker"><Lvl n={1} /><span>{kicker}</span></p>
        <Rich as="h1" className="b-main" text={main} />
        {sub}
        <Rich as="p" className="b-plain" text={plain} />
        <div className="b-adopt"><span className="b-adopt-h">מה לקחת מזה <span className="tag tag-int">פרשנות</span></span><Rich text={adopt} /></div>
      </div>
      {nums && <div className="bignums">{nums}</div>}
    </section>
  );
}

// מספר גדול: הראשון הוא העיקר, השניים האחרים תומכים בו.
export function Num({ v, children, primary }: { v: ReactNode; children: ReactNode; primary?: boolean }) {
  return <div className={`bn ${primary ? 'bn-1' : ''}`}><b>{v}</b><span>{children}</span></div>;
}

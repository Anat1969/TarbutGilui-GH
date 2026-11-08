// מבנה כל מסך פנימי: כותרת קבועה (שאלה, מחוון שלבים, בחירה), ומתחתיה רק השלב הנוכחי.
// שלב 1 העיקר: מסקנה, הסבר פשוט, תובנה לאמץ, מספר אחד עם הסיפור שלו, והדיאגרמה בתנועה מתפתחת.
// שלב 2 הראיה ושלב 3 להעמקה נפרסים בכפתור, אחד אחרי השני.
import type { ReactNode } from 'react';
import Rich from './Rich';

export const STAGES = [
  { n: 1, he: 'העיקר' },
  { n: 2, he: 'הראיה' },
  { n: 3, he: 'להעמקה' },
] as const;
export const stageOf = (params: Record<string, string>) => Math.min(3, Math.max(1, Number(params.l) || 1));

export function Lvl({ n }: { n: 1 | 2 | 3 }) {
  return <span className={`lvl lvl-${n}`}><i>{n}</i>{STAGES[n - 1].he}</span>;
}

// מחוון: איפה אני מתוך שלושה. השלב הנוכחי שחור, מה שעברתי מסומן, מה שלפניי שקט.
export function Stepper({ l, to, desc }: { l: number; to: (n: number) => string; desc: [string, string, string] }) {
  return (
    <nav className="stepper" aria-label="שלבי הקריאה">
      {STAGES.map((s, i) => (
        <a key={s.n} href={to(s.n)} className={`st press ${l === s.n ? 'on' : l > s.n ? 'done' : ''}`} aria-current={l === s.n ? 'step' : undefined} data-testid={`stage-${s.n}`}>
          <i>{s.n}</i><span><b>{s.he}</b><small>{desc[i]}</small></span>
        </a>
      ))}
    </nav>
  );
}

export function NextStage({ l, to, label }: { l: number; to: (n: number) => string; label: string }) {
  if (l >= 3) return <a className="next press" href={to(1)}><span>חזרה לעיקר</span></a>;
  return <a className="next next-go press" href={to(l + 1)} data-testid="next-stage"><small>שלב {l + 1}: {STAGES[l].he}</small><span>{label}</span></a>;
}

export function PageHead({ kicker, q, stepper, pick, children }: { kicker: string; q: ReactNode; stepper: ReactNode; pick?: ReactNode; children?: ReactNode }) {
  return (
    <header className="phead">
      <div className="phead-q"><p className="kicker">{kicker}</p><p className="q">{q}</p></div>
      {stepper}
      {pick && <div className="phead-pick">{pick}</div>}
      {children}
    </header>
  );
}

export default function Bottom({ main, plain, adopt, num }: { main: string; plain: string; adopt: string; num?: { v: ReactNode; story: string } }) {
  return (
    <section className="bottom" aria-label="השורה התחתונה">
      <div className="bottom-text">
        <Rich as="h1" className="b-main" text={main} />
        <Rich as="p" className="b-plain" text={plain} lines />
        <div className="b-adopt"><span className="b-adopt-h">מה לקחת מזה <span className="tag tag-int">פרשנות</span></span><Rich text={adopt} lines /></div>
      </div>
      {num && <div className="story-num"><b>{num.v}</b><Rich as="p" text={num.story} /></div>}
    </section>
  );
}

// דף הבית: כרזה. משפט אחד, שרשרת אחת שמתפתחת מהשורש עד נובל, ושלוש שאלות.
// החזון (רעיון עובר בין תרבויות), המטרה (להבין מי הניע אותו) והכלי (ללכת אחרי השרשרת) נקראים בלי שנאמרו.
// עיצוב שונה מהדפים הפנימיים: דיו כהה, אור הפרס בזהב. השרשרת מתפתחת פעם אחת ונעצרת.
import { useMemo, useState } from 'react';
import { href } from '../route';
import ChainStrip from '../components/ChainStrip';
import { allPrizeChains, prizeKey, sphereById } from '../lib/graph';

export default function Home() {
  const chains = useMemo(allPrizeChains, []);
  const pool = useMemo(() => chains.filter((c) => c.steps >= 7 && c.hand >= 5), [chains]);
  const [i, setI] = useState(() => Math.floor(Math.random() * pool.length));
  const cur = pool[i];
  const name = (s: string) => sphereById.get(s)?.he || s;

  return (
    <div className="poster">
      <section className="poster-in">
        <h1 className="poster-h">אף תרבות לא מגיעה <span>לנובל</span> לבד.</h1>
        {cur && (
          <a className="poster-chain" href={href('prize', { p: prizeKey(cur.prize) })} aria-label={`השרשרת של ${cur.prize.he}`}>
            <ChainStrip chain={cur.chain} endYear={cur.prize.y} anim dark step={0.42} key={prizeKey(cur.prize)} />
          </a>
        )}
        {cur && (
          <p className="poster-story" key={'s' + i}>
            הרעיון של <b>{cur.prize.he}</b> עבר <b>{cur.hand} פעמים</b> בין תרבויות, ב-{cur.span.toLocaleString('he-IL')} שנים:
            <span className="poster-path">{cur.cultures.map(name).join(' ← ')}</span>
          </p>
        )}
        <button className="poster-again" onClick={() => setI((x) => (x + 1) % pool.length)} data-testid="another">שרשרת אחרת</button>
      </section>

      <nav className="poster-doors" aria-label="שלוש השאלות">
        <a className="pdoor" href={href('tree')} data-testid="door-tree"><b>ממי ירש רעיון, ולמי מסר?</b><span>עץ הרעיונות</span></a>
        <a className="pdoor" href={href('culture')} data-testid="door-culture"><b>איזו תרבות הובילה כל תקופה?</b><span>תרבות כמנוע</span></a>
        <a className="pdoor" href={href('prize')} data-testid="door-prize"><b>כמה רחוק הפרס מהשורש?</b><span>שרשרת עד הפרס</span></a>
      </nav>
      <p className="poster-foot"><a href={href('posts')}>פוסטים</a> · <a href={href('sources')}>מקורות ומילון</a> · <a href={href('creations')}>יצירות</a></p>
    </div>
  );
}

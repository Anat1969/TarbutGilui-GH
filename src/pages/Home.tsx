// דף הבית, מהסוף להתחלה: השורה התחתונה של כל האפליקציה, שלוש שאלות עם תשובה, ומקורות.
// השרשרת החיה מתחלפת כל 9 שניות. המסגרת קבועה, רק התוכן מתחלף, ונעצרת בריחוף ובהפחתת תנועה.
import { useEffect, useMemo, useState } from 'react';
import { href } from '../route';
import Rich from '../components/Rich';
import ChainStrip from '../components/ChainStrip';
import Term from '../components/Term';
import Bottom, { HowTo, Lvl, Num } from '../components/Bottom';
import { allPrizeChains, engine, ideasWithLineage, leadership, missingLinks, nodeById, nodes, prizeKey, sphereById, SRC } from '../lib/graph';

export default function Home() {
  const chains = useMemo(allPrizeChains, []);
  const ideas = useMemo(ideasWithLineage, []);
  const lead = useMemo(() => leadership(), []);
  const eng = useMemo(engine, []);
  const miss = useMemo(missingLinks, []);
  const changes = lead.filter((r, i) => i && r.leader && r.leader !== lead[i - 1].leader).length;
  const leaders = new Set(lead.map((r) => r.leader).filter(Boolean));
  const avgHand = Math.round(chains.reduce((s, c) => s + c.hand, 0) / chains.length);
  const multi = chains.filter((c) => c.hand >= 3).length;
  const top = ideas[0];
  const m0 = miss[0];
  const pool = chains.filter((c) => c.steps >= 6);
  const [i, setI] = useState(() => Math.floor(Math.random() * pool.length));
  const [hold, setHold] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || hold) return;
    const t = setInterval(() => setI((x) => (x + 1) % pool.length), 9000);
    return () => clearInterval(t);
  }, [pool.length, hold]);
  const cur = pool[i];
  const name = (s: string) => sphereById.get(s)?.he || s;

  return (
    <div className="home">
      <Bottom
        kicker="השאלה: מאיפה בא רעיון, ומי הניע אותו?"
        main={`אף תרבות ==לא מגיעה לנובל לבד.==`}
        plain={`בממוצע, רעיון שזכה בנובל **עבר ${avgHand} פעמים** מתרבות לתרבות בדרך. ההובלה במדע **התחלפה ${changes} פעמים** מאז העת העתיקה.`}
        adopt="**חדשנות נולדת במעבר.** מי שקולט רעיונות מבחוץ ומפתח אותם, הוא זה שמוביל את התקופה הבאה."
        nums={<>
          <Num primary v={avgHand}><Term k="hand">מעברי תרבות</Term> בממוצע, בדרך לנובל</Num>
          <Num v={`${multi}/${chains.length}`}>פרסים שעברו 3 תרבויות ומעלה</Num>
          <Num v={changes}>חילופי <Term k="lead">הובלה</Term> ב-{lead.length} תקופות</Num>
        </>}
      />
      <HowTo steps={[
        '**קראו את השורה התחתונה** למעלה. זו המסקנה של כל האפליקציה.',
        '**בחרו שאלה** מבין השלוש למטה. בכל אחת: תשובה קודם, הוכחה אחר כך.',
        '**לחצו על כל דבר** כדי לרדת לפרטים: רעיון, תרבות או פרס.',
      ]} />

      <section className="home-grid">
        <div className="home-col">
          <h2 className="sec-h"><Lvl n={2} />שלוש שאלות, שלוש תשובות</h2>
          <div className="doors" aria-label="שלוש השאלות">
            <a className="door press" href={href('tree', { id: top?.n.id })} data-testid="door-tree">
              <span className="door-q">ממי ירש רעיון, ולמי מסר?</span>
              <span className="door-n">{ideas.length}</span>
              <span className="door-u">רעיונות שיש להם עץ משפחה מוכח</span>
              <Rich as="p" className="door-i" text={`==העץ הגדול: ${top?.n.t}.== **${top?.up}** רעיונות קדמו לו, ו-**${top?.down}** נבנו עליו.`} />
              <span className="door-go">לעץ הרעיונות</span>
            </a>
            <a className="door press" href={href('culture')} data-testid="door-culture">
              <span className="door-q">איזו תרבות הובילה כל תקופה?</span>
              <span className="door-n">{changes}</span>
              <span className="door-u">פעמים שההובלה עברה, בין {leaders.size} תרבויות</span>
              <Rich as="p" className="door-i" text={`==${name(eng[0].s)} העבירה הכי הרבה הלאה:== **${eng[0].out}** רעיונות המשיכו בתרבות אחרת.`} />
              <span className="door-go">לתרבות כמנוע</span>
            </a>
            <a className="door press" href={href('prize')} data-testid="door-prize">
              <span className="door-q">כמה רחוק הפרס מהשורש?</span>
              <span className="door-n">{chains[0]?.span.toLocaleString('he-IL')}</span>
              <span className="door-u">שנים בשרשרת הארוכה ביותר</span>
              {m0 && <Rich as="p" className="door-i" text={`==קשר אחד חסר ב-${m0.prizes.length} שרשראות:== בין **${nodeById.get(m0.from)!.who}** ל**${nodeById.get(m0.to)!.who}**. אין לו עדיין מקור.`} />}
              <span className="door-go">לשרשרת עד הפרס</span>
            </a>
          </div>
        </div>

        <div className="home-col home-relay" aria-live="polite" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
          <h2 className="sec-h"><Lvl n={2} />דוגמה חיה: מסלול של רעיון עד נובל</h2>
          {cur && (
            <a className="press relay" href={href('prize', { p: prizeKey(cur.prize) })}>
              <div className="relay-in" key={prizeKey(cur.prize)}>
                <div className="relay-head">
                  <span className="relay-years"><b>{cur.span.toLocaleString('he-IL')}</b> שנים</span>
                  <span className="relay-to">עד <b>{cur.prize.he}</b>, נובל ל{cur.prize.fh} {cur.prize.y}</span>
                </div>
                <ChainStrip chain={cur.chain} endYear={cur.prize.y} />
                <p className="relay-foot">
                  הרעיון <b>עבר {cur.hand} פעמים</b> מתרבות לתרבות: {cur.cultures.map(name).join(' ← ')}
                </p>
              </div>
              <span className="relay-hint">{hold ? 'עצרנו כדי שתוכלו לקרוא. לחיצה פותחת את השרשרת.' : 'מתחלפת כל 9 שניות. ריחוף עוצר.'}</span>
            </a>
          )}
          <section className="sisters" aria-label="אפליקציות המקור">
            <h2 className="sec-h"><Lvl n={3} />מאיפה הנתונים: {nodes.length} גילויים, {sphereById.size - 1} תרבויות ו-{chains.length} פרסי נובל</h2>
            <div className="sister-row">
              {Object.values(SRC).map((s) => (
                <a key={s.id} className="sister press" href={s.url} target="_blank" rel="noopener">
                  <b>{s.he}</b><span>{s.gives}</span>
                </a>
              ))}
              <a className="sister press" href={href('sources')}><b>מקורות, שיטה ומילון</b><span>מה עובדה, מה פרשנות ומה השערה, וכל מונח במילים פשוטות</span></a>
            </div>
          </section>
        </div>
      </section>

    </div>
  );
}

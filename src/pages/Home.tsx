// דף הבית: השאלה, שלוש דלתות עם מספר גדול ותובנה מחושבת, ושרשרת חיה שמתחלפת.
import { useEffect, useMemo, useState } from 'react';
import { href } from '../route';
import Rich from '../components/Rich';
import ChainStrip from '../components/ChainStrip';
import { allPrizeChains, engine, ideasWithLineage, leadership, missingLinks, nodeById, nodes, prizeKey, sphereById, SRC } from '../lib/graph';

export default function Home() {
  const chains = useMemo(allPrizeChains, []);
  const ideas = useMemo(ideasWithLineage, []);
  const lead = useMemo(() => leadership(), []);
  const eng = useMemo(engine, []);
  const miss = useMemo(missingLinks, []);
  const changes = lead.filter((r, i) => i && r.leader && r.leader !== lead[i - 1].leader).length;
  const leaders = new Set(lead.map((r) => r.leader).filter(Boolean));
  const top = ideas[0];
  const m0 = miss[0];
  // שרשרת מתחלפת: מתחילה ממקום אקראי, כדי שתמיד יהיה משהו חדש
  const pool = chains.filter((c) => c.steps >= 6);
  const [i, setI] = useState(() => Math.floor(Math.random() * pool.length));
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const t = setInterval(() => setI((x) => (x + 1) % pool.length), 9000);
    return () => clearInterval(t);
  }, [pool.length]);
  const cur = pool[i];
  const name = (s: string) => sphereById.get(s)?.he || s;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <p className="kicker">שלוש אפליקציות, שאלה אחת</p>
          <h1>מאיפה בא רעיון,<br />ומי <mark>הניע</mark> אותו?</h1>
          <p className="lead">
            <b>{nodes.length}</b> גילויים מעולם נעלם,<br />
            <b>{sphereById.size - 1}</b> תרבויות מארכיטייפ ומהעת החדשה,<br />
            ו-<b>{chains.length}</b> פרסי נובל מגמד על כתפי ענקים, בגרף אחד.
          </p>
        </div>
        <div className="hero-chain" aria-live="polite">
          {cur && (
            <a className="press relay" href={href('prize', { p: prizeKey(cur.prize) })} key={prizeKey(cur.prize)}>
              <div className="relay-head">
                <span className="relay-years"><b>{cur.span.toLocaleString('he-IL')}</b> שנים</span>
                <span className="relay-to">עד {cur.prize.he}, נובל ל{cur.prize.fh} {cur.prize.y}</span>
              </div>
              <ChainStrip chain={cur.chain} endYear={cur.prize.y} />
              <p className="relay-foot">
                המקל עבר <b>{cur.hand}</b> פעמים בין תרבויות: {cur.cultures.map(name).join(' ← ')}
              </p>
            </a>
          )}
        </div>
      </section>

      <section className="doors" aria-label="שלוש השאלות">
        <a className="door press" href={href('tree', { id: top?.n.id })} data-testid="door-tree">
          <span className="door-q">ממי ירש ולמי מסר?</span>
          <span className="door-n">{ideas.length}</span>
          <span className="door-u">רעיונות עם שושלת מתועדת</span>
          <Rich as="p" className="door-i" text={`==השושלת הגדולה: ${top?.n.t}.== **${top?.up}** אבות ו-**${top?.down}** צאצאים.`} />
          <span className="door-go">לעץ הרעיונות</span>
        </a>
        <a className="door press" href={href('culture')} data-testid="door-culture">
          <span className="door-q">איזו תרבות הובילה כל תקופה?</span>
          <span className="door-n">{changes}</span>
          <span className="door-u">חילופי הנהגה ב-{lead.length} תקופות, בין {leaders.size} תרבויות</span>
          <Rich as="p" className="door-i" text={`==המנוע הגדול: ${name(eng[0].s)}.== מסרה **${eng[0].out}** רעיונות לתרבויות אחרות.`} />
          <span className="door-go">לתרבות כמנוע</span>
        </a>
        <a className="door press" href={href('prize')} data-testid="door-prize">
          <span className="door-q">כמה רחוק הפרס מהשורש?</span>
          <span className="door-n">{chains[0]?.span.toLocaleString('he-IL')}</span>
          <span className="door-u">שנים בשרשרת הארוכה ביותר</span>
          {m0 && <Rich as="p" className="door-i" text={`==חוליה חסרה אחת סוגרת ${m0.prizes.length} שרשראות.== בין **${nodeById.get(m0.from)!.who}** ל**${nodeById.get(m0.to)!.who}**.`} />}
          <span className="door-go">לשרשרת עד הפרס</span>
        </a>
      </section>

      <section className="sisters" aria-label="אפליקציות המקור">
        <h2>נבנתה מהן, ומחזירה אליהן</h2>
        <div className="sister-row">
          {Object.values(SRC).map((s) => (
            <a key={s.id} className="sister press" href={s.url} target="_blank" rel="noopener">
              <b>{s.he}</b><span>{s.gives}</span>
            </a>
          ))}
          <a className="sister press" href={href('sources')}><b>מקורות ושיטה</b><span>מה עובדה, מה פרשנות ומה הנחה</span></a>
        </div>
      </section>
    </div>
  );
}

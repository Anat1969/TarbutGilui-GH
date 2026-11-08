// מקורות ושיטה: מאיפה כל נתון, ומה עובדה, מה פרשנות ומה הנחה.
import { GLOSSARY } from '../lib/glossary';
import { meta, nodes, links, prizes, spheres, sphereColor } from '../lib/graph';
export default function Sources() {
  const byS = (id: string) => nodes.filter((n) => n.s === id).length;
  return (
    <div className="page sources-page">
      <section className="bottom"><div className="bottom-text"><p className="kicker">מקורות, שיטה ומילון</p><h1 className="b-main">כל טענה כאן מסומנת: <mark>עובדה, פרשנות או השערה.</mark></h1><p className="b-plain"><span className="line"><b>ירוק: יש מקור.</b></span><span className="line">כתום: קריאה סבירה של הנתונים.</span><span className="line"><b>אפור מקווקו: השערה שלנו</b>, כדי שלא תתבלבל עם עובדה.</span></p></div></section>
      <section className="gloss" aria-label="מילון המונחים">
        <h2 className="sec-h">מילון: כל מונח במילים פשוטות</h2>
        <dl className="gloss-grid">
          {Object.entries(GLOSSARY).map(([k, g]) => (
            <div key={k} className="gloss-item"><dt><b>{g.he}</b>{g.pro && <small>במונחי המחקר: {g.pro}</small>}</dt><dd>{g.def}</dd></div>
          ))}
        </dl>
      </section>
      <h2 className="sec-h">השיטה, להעמקה</h2>
      <div className="src-grid">
        <section>
          <h2>שלוש אפליקציות המקור</h2>
          {meta.sources.map((s) => (
            <div key={s.id} className="src-card">
              <b>{s.he}</b><span>{s.gives}</span>
              <span><a href={s.url} target="_blank" rel="noopener">לאפליקציה</a> · <a href={s.code} target="_blank" rel="noopener">לקוד</a></span>
            </div>
          ))}
          <p className="small">הנתונים נבנו ב-{meta.built}: {nodes.length} גילויים, {links.length} קשרים מאומתים, {prizes.length} פרסים. כל רענון עובר דרך <code>npm run data</code>, ושום עובדה לא נכתבת כאן ביד.</p>
        </section>
        <section>
          <h2>שלוש רמות ודאות</h2>
          <p><span className="tag tag-fact">עובדה</span> גילוי, שנה, מקום וקשר מתועד: מעולם נעלם, עם ציטוט ממקור. פרס ונימוק: מקרן נובל, דרך גמד על כתפי ענקים.</p>
          <p><span className="tag tag-int">פרשנות</span> שיוך גילוי לתרבות (לפי מדינה ושנה), והארכיטייפ התרבותי מאפליקציית ארכיטייפ.</p>
          <p><span className="tag tag-hyp">השערה</span> קפיצה משוערת (גשר תחום) בשרשרת עד הפרס, וארכיטייפ מוצע לתרבויות של העת החדשה. מוצגים בגלוי, באפור.</p>
          <p><span className="tag tag-ai">זיקוק AI</span> תובנה שנכתבת לפי בקשה, מהנתונים שעל המסך בלבד. Gemini החינמי, ו-Claude כגיבוי.</p>
          <h2>איך נבנית שרשרת</h2>
          <p>מהגילוי של הזוכה הולכים אחורה בקשרים המתועדים, ובגילויים קודמים של אותו אדם, עד השורש הקדום ביותר.</p>
          <p>כשהשרשרת נעצרת אחרי שנת 600, מחפשים את הגילוי הקרוב ביותר בזמן באותו תחום שיש לו שרשרת משלו, ומחברים בקפיצה משוערת שמסומנת כהשערה. עד ארבע קפיצות.</p>
        </section>
        <section>
          <h2>התרבויות</h2>
          <p className="small">שיוך לפי מקום הגילוי, או מקום הלידה כשאין מקום. הכללים: <code>scripts/cultures.mjs</code>.</p>
          <ul className="sph-list">
            {spheres.map((s) => (
              <li key={s.id}><i style={{ background: sphereColor(s.id) }} /><b>{s.he}</b><small>{byS(s.id)} גילויים · {s.arch ? `ארכיטייפ: ${s.arch.archetype}` : s.proposal ? `מוצע: ${s.proposal.archetype}` : 'בלי ארכיטייפ'}</small></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

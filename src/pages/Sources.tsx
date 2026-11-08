// מקורות ושיטה: מאיפה כל נתון, ומה עובדה, מה פרשנות ומה הנחה.
import { meta, nodes, links, prizes, spheres, sphereColor } from '../lib/graph';
export default function Sources() {
  const byS = (id: string) => nodes.filter((n) => n.s === id).length;
  return (
    <div className="page sources-page">
      <section className="qhead"><div><p className="kicker">מקורות ושיטה</p><h1>מה <mark>עובדה</mark>, מה פרשנות ומה הנחה</h1></div></section>
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
          <p><span className="tag tag-hyp">הנחה</span> גשר תחום בשרשרת עד הפרס, וארכיטייפ מוצע לתרבויות של העת החדשה. מוצגים בגלוי, באפור.</p>
          <p><span className="tag tag-ai">זיקוק AI</span> תובנה שנכתבת לפי בקשה, מהנתונים שעל המסך בלבד. Gemini החינמי, ו-Claude כגיבוי.</p>
          <h2>איך נבנית שרשרת</h2>
          <p>מהגילוי של הזוכה הולכים אחורה בקשרים המתועדים, ובגילויים קודמים של אותו אדם, עד השורש הקדום ביותר.</p>
          <p>כשהשרשרת נעצרת אחרי שנת 600, מחפשים את הגילוי הקרוב ביותר בזמן באותו תחום שיש לו שרשרת משלו, ומחברים בגשר שמסומן כהנחה. עד ארבעה גשרים.</p>
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

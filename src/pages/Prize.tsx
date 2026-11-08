// שרשרת עד הפרס: מזוכה נובל אחורה, חוליה אחר חוליה, עד העת העתיקה.
// שלושה שלבים: העיקר (מסקנה ורצועה שמתפתחת מהשורש לפרס), הראיה (צעד אחר צעד, עם המקור), להעמקה (הקשרים החסרים).
// קשר מוכח בקו מלא. קפיצה משוערת (בלי מקור) מסומנת בגלוי כהשערה, ונכנסת לרשימת הקשרים החסרים.
import { useMemo } from 'react';
import { go, href } from '../route';
import Rich from '../components/Rich';
import CultureChip from '../components/CultureChip';
import ChainStrip from '../components/ChainStrip';
import Term from '../components/Term';
import Pick from '../components/Pick';
import Bottom, { NextStage, PageHead, Stepper, stageOf } from '../components/Bottom';
import { PostLinks } from './Posts';
import { confPlain, typePlain } from '../lib/glossary';
import { allPrizeChains, domains, missingLinks, nobelLink, nodeById, olamLink, persons, prizeKey, sphereById, sphereColor, yearText } from '../lib/graph';

const name = (s: string) => sphereById.get(s)?.he || s;

export default function PrizePage({ params }: { params: Record<string, string> }) {
  const all = useMemo(allPrizeChains, []);
  const miss = useMemo(missingLinks, []);
  const l = stageOf(params);
  // בלי בחירה: השרשרת שהחלק המוכח בה הארוך ביותר
  const cur = all.find((c) => prizeKey(c.prize) === params.p) || [...all].sort((a, b) => b.docSpan - a.docSpan)[0];
  const p = cur.prize;
  const key = prizeKey(p);
  const to = (n: number) => href('prize', { p: key, l: String(n) });
  const docPct = Math.round((cur.docSpan / cur.span) * 100);
  const docTxt = docPct < 1 ? 'פחות מ-1%' : `${docPct}%`;
  const lastBridge = cur.chain.map((s) => s.kind).lastIndexOf('bridge');
  const gapA = lastBridge > 0 ? nodeById.get(cur.chain[lastBridge - 1].id)! : null;
  const gapB = lastBridge > 0 ? nodeById.get(cur.chain[lastBridge].id)! : null;
  const root = nodeById.get(cur.chain[0].id)!;
  const rootN = root.who || root.t;
  const adopt = gapA && gapB
    ? `**הקשר שהכי שווה לתעד: ${gapA.who || gapA.t} אל ${gapB.who || gapB.t}.** מקור אחד שיוכיח אותו יהפוך השערה לעובדה.`
    : '**השרשרת מוכחת כולה.** אפשר לצטט אותה כעובדה, חוליה אחר חוליה.';

  return (
    <div className="page prize-page">
      <PageHead kicker="שרשרת עד הפרס" q={<>מאיפה בא הרעיון של <b>{p.he}</b>?</>}
        stepper={<Stepper l={l} to={to} desc={['מה התשובה', 'צעד אחר צעד', 'מה חסר']} />}
        pick={<Pick testid="prize-search" placeholder="הקלידו שם זוכה או תחום" onPick={(k) => go('prize', { p: k, l: String(l) })}
          current={<>{p.he}<small>נובל ל{p.fh} {p.y}</small></>}
          items={all.map((c) => ({ id: prizeKey(c.prize), label: c.prize.he, sub: `${c.prize.fh} ${c.prize.y}`, key: `${c.prize.en} ${c.prize.fh}`, color: '#B08A2E' }))} />} />

      {l === 1 && (
        <div className="stage" key={'p1' + key}>
          <Bottom
            main={`בדרך לנובל, הרעיון ==עבר ${cur.hand} פעמים== בין תרבויות.`}
            plain={`השרשרת מתחילה ב${rootN} (${yearText(root.y)}) ונמשכת ${cur.span.toLocaleString('he-IL')} שנים. **רק ${docTxt} מהדרך מוכחים במקור.** השאר הוא השערה, ומסומן באפור מקווקו.`}
            adopt={adopt}
            num={{ v: cur.span.toLocaleString('he-IL'), story: `**שנים** עברו מהרעיון הראשון ועד הפרס ל${p.he}.` }}
          />
          <section className="strip-wrap">
            <ChainStrip chain={cur.chain} endYear={p.y} anim key={key} />
            <div className="legend">
              <span><b>קריאה:</b> מהשורש (ימין) עד נובל (שמאל). צבע הנקודה: <Term k="culture">התרבות</Term></span>
              <span><i className="lg lg-doc" /><Term k="documented">קשר מוכח במקור</Term></span>
              <span><i className="lg lg-bridge" /><Term k="bridge">קפיצה משוערת: אין מקור</Term></span>
              <span><i className="lg lg-gold" />הפרס</span>
            </div>
          </section>
          <NextStage l={l} to={to} label="צעד אחר צעד, ומה המקור לכל קשר" />
        </div>
      )}

      {l === 2 && (
        <div className="stage" key={'p2' + key}>
          <section className="chain" aria-label="השרשרת" data-testid="chain">
            <ol className="steps">
              {cur.chain.map((st, i) => {
                const n = nodeById.get(st.id)!;
                return (
                  <li key={st.id + i} className={`step k-${st.kind}`}>
                    {i > 0 && (
                      <div className={`joint j-${st.kind}`}>
                        {st.kind === 'link' && st.link && <><span className="j-type">{typePlain[st.link.ty]} · {confPlain[st.link.cf] || st.link.cf}</span><Rich text={st.link.ex} lines /></>}
                        {st.kind === 'self' && <span className="j-type">אותו אדם, גילוי מאוחר יותר שלו</span>}
                        {st.kind === 'bridge' && <span className="j-type j-gap"><b>כאן חסר מקור.</b> חיברנו לגילוי הקרוב בזמן ב{domains[n.d]?.he}. <span className="tag tag-hyp">השערה</span></span>}
                      </div>
                    )}
                    <a className="card press" href={href('tree', { id: n.id })} style={{ borderInlineStartColor: sphereColor(n.s) }}>
                      <span className="c-year">{yearText(n.y)}</span>
                      <span className="c-body"><b>{n.t}</b><small>{n.who} · {domains[n.d]?.he}</small></span>
                      <CultureChip s={n.s} small />
                    </a>
                  </li>
                );
              })}
              {p.via && (
                <li className="step k-mentor">
                  <div className="joint j-link"><span className="j-type">מורה ותלמיד · לפי ויקינתונים</span><span>{persons[p.via]?.he} הנחה את {p.he}.</span></div>
                </li>
              )}
              <li className="step k-prize">
                <div className="joint j-link"><span className="j-type">הפרס</span></div>
                <a className="card card-prize press" href={nobelLink(p.nid)} target="_blank" rel="noopener">
                  <span className="c-year">{p.y}</span>
                  <span className="c-body"><b>{p.he}, נובל ל{p.fh}</b><small>{p.mh || p.m}</small></span>
                  <span className="medal">לזוכה בגמד על כתפי ענקים</span>
                </a>
              </li>
            </ol>
          </section>
          <NextStage l={l} to={to} label="אילו קשרים חסרים, ומה כדאי לתעד" />
        </div>
      )}

      {l === 3 && (
        <div className="stage stage-3" key="p3">
          <div className="lists3 lists3-2">
            <section>
              <Rich as="h2" className="sec-t" text={`==שלושה מקורות יחזקו ${new Set(miss.slice(0, 3).flatMap((m) => m.prizes.map(prizeKey))).size} שרשראות.==`} />
              <p className="chart-sub"><b>אלה קשרים בין גילויים שעדיין אין להם מקור.</b> המספר: כמה שרשראות עוברות בקשר.</p>
              <ol className="miss" data-testid="missing">
                {miss.slice(0, 8).map((m) => {
                  const a = nodeById.get(m.from)!, b = nodeById.get(m.to)!;
                  const mine = gapA?.id === a.id && gapB?.id === b.id;
                  return (
                    <li key={m.from + m.to} className={mine ? 'on' : ''}>
                      <span className="miss-n">{m.prizes.length}</span>
                      <span className="miss-t"><b>{a.who || a.t}</b> ({yearText(a.y)}) אל <b>{b.who || b.t}</b> ({yearText(b.y)})<small>{domains[a.d]?.he} · {name(a.s)} אל {name(b.s)}{mine ? ' · בשרשרת שבחרתם' : ''}</small></span>
                    </li>
                  );
                })}
              </ol>
            </section>
            <section>
              <PostLinks page="prize" />
              <a className="btn btn-line press" href={olamLink(root)} target="_blank" rel="noopener">לשורש בעולם נעלם</a>
            </section>
          </div>
          <NextStage l={l} to={to} label="" />
        </div>
      )}
    </div>
  );
}

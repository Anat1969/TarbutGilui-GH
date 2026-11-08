// פוסטים: מה שכפתור הזיקוק היה כותב לפי בקשה, כתוב מראש ושמור.
// כל מספר מחושב מהגרף, כך שרענון נתונים מעדכן את הפוסט. עובדה, פרשנות והשערה מסומנות בנפרד.
// ציטוט רק כשהוא מאומת. הייקו: מקורי.
import { allPrizeChains, engine, flows, ideasWithLineage, leadership, lineage, missingLinks, nodeById, nodes, sphereById, yearText } from './graph';

export type Post = {
  id: string; title: string; dek: string; body: string[]; adopt: string;
  quote?: { text: string; by: string }; haiku: [string, string, string];
  img?: string | null; imgCap?: string; links: { label: string; page: string; params?: Record<string, string> }[];
  about: { page: string; id?: string }[];
};

const nm = (s: string) => sphereById.get(s)?.he || s;
const fmt = (n: number) => n.toLocaleString('he-IL');

export function buildPosts(): Post[] {
  const chains = allPrizeChains();
  const lead = leadership();
  const eng = engine();
  const fl = flows();
  const miss = missingLinks();
  const avgHand = Math.round(chains.reduce((s, c) => s + c.hand, 0) / chains.length);
  const multi = chains.filter((c) => c.hand >= 3).length;
  const docAvg = (chains.reduce((s, c) => s + c.docSpan / c.span, 0) / chains.length) * 100;
  const maxDoc = Math.max(...chains.map((c) => c.docSpan));
  const relay = lead.map((r) => r.leader).filter((l, i, a): l is string => !!l && l !== a[i - 1]);
  const posts: Post[] = [];

  // 1. התזה
  const newton = nodes.find((n) => n.who === 'אייזק ניוטון' && n.img);
  posts.push({
    id: 'thesis', title: 'אף תרבות לא מגיעה לנובל לבד',
    dek: `בדקנו ${chains.length} פרסי נובל, ושאלנו מאיפה הגיע הרעיון של כל אחד מהם.`,
    body: [
      `לכל פרס בנינו שרשרת: מהגילוי של הזוכה, אחורה, עד הרעיון הקדום ביותר שאפשר לחבר אליו.`,
      `**בממוצע, הרעיון עבר ${avgHand} פעמים מתרבות לתרבות** בדרך לפרס.`,
      `**${multi} מתוך ${chains.length} פרסים** עברו דרך שלוש תרבויות ומעלה.`,
      `כלומר, הזוכה הוא הרץ האחרון במרוץ שליחים ארוך, ולא רץ יחיד.`,
    ],
    adopt: '**חדשנות נולדת במעבר בין תרבויות.** מי שקולט רעיונות מבחוץ ומפתח אותם, מוביל את השלב הבא.',
    quote: { text: 'אם ראיתי רחוק יותר, הרי זה משום שעמדתי על כתפי ענקים.', by: 'אייזק ניוטון, במכתב לרוברט הוק (Robert Hooke), 1675' },
    haiku: ['מקל עובר יד', 'מאתונה עד בגדאד', 'והפרס בסוף'],
    img: newton?.img, imgCap: newton ? `${newton.t}, ${yearText(newton.y)}` : undefined,
    links: [{ label: 'לשרשרת עד הפרס', page: 'prize' }],
    about: [{ page: 'home' }, { page: 'prize' }],
  });

  // 2. החוליה החסרה
  const m0 = miss[0];
  if (m0) {
    const a = nodeById.get(m0.from)!, b = nodeById.get(m0.to)!;
    const ex = m0.prizes.slice(0, 3).map((p) => `${p.he} (${p.y})`).join(', ');
    posts.push({
      id: 'missing', title: `קשר אחד חסר ב-${m0.prizes.length} שרשראות`,
      dek: `בין ${a.who} (${yearText(a.y)}) ל${b.who} (${yearText(b.y)}) אין עדיין מקור כתוב.`,
      body: [
        `השרשראות של **${m0.prizes.length} זוכי נובל** עוברות דרך אותו מעבר: מ**${a.t}** אל **${b.t}**.`,
        `ביניהם: ${ex}.`,
        `סביר שהקשר קיים, אבל במאגר אין לו עדיין ציטוט ממקור. לכן הוא מסומן כהשערה.`,
        `**מקור אחד שיוכיח אותו יחזק ${m0.prizes.length} שרשראות בבת אחת.**`,
      ],
      adopt: '**מתעדים קודם את הקשר שעובר בו הכי הרבה.** עבודה אחת, השפעה על עשרות סיפורים.',
      haiku: ['חוט דק בין שניים', 'ניוטון שותק, וולטה מאיר', 'ואין מי שכתב'],
      img: b.img || a.img, imgCap: b.img ? `${b.t}, ${yearText(b.y)}` : `${a.t}, ${yearText(a.y)}`,
      links: [{ label: 'לקשרים החסרים', page: 'prize', params: { l: '3' } }],
      about: [{ page: 'prize' }],
    });
  }

  // 3. מרוץ ההובלה
  const leadLines = lead.filter((r) => r.leader).map((r) => `**${r.period.he}:** ${nm(r.leader!)}, ${Math.round(r.share * 100)}% מהגילויים.`);
  posts.push({
    id: 'relay', title: `ההובלה במדע עברה ${relay.length - 1} פעמים`,
    dek: 'חילקנו את ההיסטוריה לעשר תקופות, וספרנו בכל אחת מאיזו תרבות הגיעו הגילויים.',
    body: [
      'בכל תקופה יש תרבות אחת שמובילה: הכי הרבה גילויים באותו זמן.',
      ...leadLines,
      '**אף תרבות לא החזיקה בהובלה לאורך כל הדרך.**',
    ],
    adopt: '**הובלה היא שלב, לא תכונה.** היא עוברת למקום שקולט רעיונות מאחרים, מפתח אותם ומעביר הלאה.',
    haiku: ['עשר תקופות', 'הלפיד נודד מערבה', 'ולא נח באחת'],
    links: [{ label: 'לתרבות כמנוע', page: 'culture' }],
    about: [{ page: 'culture' }],
  });

  // 4. העולם האסלאמי בימי הביניים
  const med = lead.find((r) => r.leader === 'islamic');
  const gi = fl.find((f) => f.a === 'greece' && f.b === 'islamic');
  const isl = eng.find((e) => e.s === 'islamic');
  if (med) {
    const its = med.items.filter((n) => n.s === 'islamic');
    const top3 = its.slice(0, 3).map((n) => `${n.who} (${n.t.split(':')[0]}, ${yearText(n.y)})`).join('; ');
    const im = its.find((n) => n.img);
    posts.push({
      id: 'islamic', title: 'בימי הביניים, הידע עבר דרך בגדאד',
      dek: `${Math.round(med.share * 100)}% מהגילויים של ימי הביניים במאגר נולדו בעולם האסלאמי.`,
      body: [
        `בתקופה שאירופה מכנה "חשוכה", **העולם האסלאמי הוביל: ${med.counts.get('islamic')} מתוך ${med.total} גילויים.**`,
        `בין השמות: ${top3}.`,
        gi ? `**${gi.v} רעיונות עברו ישירות מהעולם היווני לעולם האסלאמי**, יותר מכל מסלול אחר באותה תקופה.` : '',
        isl ? `העולם האסלאמי קלט ${isl.inn} רעיונות מתרבויות אחרות והעביר ${isl.out}: הוא שמר, תרגם ופיתח.` : '',
        'מרכזי הידע: בגדאד (Baghdad), קהיר (Cairo) וקוניה (Konya).',
      ].filter(Boolean),
      adopt: '**שימור ותרגום הם יצירה.** תרבות שקולטת ומפתחת היא חוליה הכרחית, גם כשהיא לא נזכרת בפרס.',
      haiku: ['דיו על קלף', 'יוונית לערבית', 'והאור נשמר'],
      img: im?.img, imgCap: im ? `${im.t}, ${yearText(im.y)}` : undefined,
      links: [{ label: 'לימי הביניים בתרבות כמנוע', page: 'culture', params: { p: med.period.id, l: '2' } }],
      about: [{ page: 'culture', id: med.period.id }],
    });
  }

  // 5. המעבירה והקולטת
  const top = eng[0], imp = [...eng].sort((x, y) => y.inn - x.inn)[0];
  const ein = nodes.find((n) => n.who === 'אלברט איינשטיין' && n.img);
  posts.push({
    id: 'engine', title: 'מי העבירה רעיונות, ומי קלטה',
    dek: 'ספרנו רק קשרים מוכחים שחוצים גבול: רעיון שנולד בתרבות אחת והמשיך באחרת.',
    body: [
      `**${nm(top.s)} העבירה ${top.out} רעיונות** לתרבויות אחרות, יותר מכל תרבות במאגר.`,
      `**${nm(imp.s)} קלטה ${imp.inn} רעיונות** מבחוץ, והעבירה הלאה רק ${imp.out}.`,
      `המסלול העמוס ביותר: מ${nm(fl[0].a)} אל ${nm(fl[0].b)}, **${fl[0].v} רעיונות**.`,
      'זו תמונה של המאה העשרים: מדענים, תלמידים ורעיונות שחצו את האוקיינוס.',
    ],
    adopt: '**מי שמוביל היום הוא לרוב מי שקלט אתמול.** קליטה היא שלב ראשון של הובלה, לא סימן לחולשה.',
    haiku: ['גרמנית שולחת', 'אמריקה מקשיבה', 'והים באמצע'],
    img: ein?.img, imgCap: ein ? `${ein.t}, ${yearText(ein.y)}` : undefined,
    links: [{ label: 'למי העבירה ומי קלטה', page: 'culture', params: { l: '3' } }],
    about: [{ page: 'culture' }],
  });

  // 6. השושלת הגדולה
  const big = ideasWithLineage()[0];
  if (big) {
    const L = lineage(big.n.id);
    posts.push({
      id: 'lineage', title: `${big.n.t}: ${L.cultures.size} תרבויות`,
      dek: `לרעיון של ${big.n.who} יש את עץ המשפחה הגדול ביותר במאגר.`,
      body: [
        `**${big.n.t}** (${yearText(big.n.y)}) נשען על **${L.anc.length} רעיונות קודמים**, ו-**${L.desc.length} רעיונות** נבנו עליו.`,
        L.leaf ? `הקו מגיע עד **${L.leaf.t}** של ${L.leaf.who}, ב-${yearText(L.leaf.y)}.` : '',
        `בדרך הוא עבר דרך: ${[...L.cultures].map(nm).join(', ')}.`,
        'שאלה אחת, מה טוב לאדם, שכל תרבות ענתה עליה מחדש.',
      ].filter(Boolean),
      adopt: '**רעיון גדול לא נשאר בבית.** הוא מתחזק כשהוא עובר לתרבות אחרת, שמוסיפה לו שכבה משלה.',
      haiku: ['מה טוב לאדם', 'שאל אריסטו, וענו', 'שבע תרבויות'],
      img: big.n.img, imgCap: `${big.n.t}, ${yearText(big.n.y)}`,
      links: [{ label: 'לעץ הרעיון', page: 'tree', params: { id: big.n.id } }],
      about: [{ page: 'tree', id: big.n.id }],
    });
  }

  // 7. כמה מזה מוכח
  const k = chains[0];
  const kr = nodeById.get(k.chain[0].id)!;
  posts.push({
    id: 'evidence', title: `רק ${docAvg < 1 ? 'פחות מ-1' : Math.round(docAvg)}% מהדרך מוכחים`,
    dek: 'שרשרת ארוכה מרשימה, אבל רוב האורך שלה הוא השערה. חשוב לדעת את זה לפני שמצטטים.',
    body: [
      `**בממוצע, רק ${docAvg.toFixed(1)}% מאורך השרשרת מבוסס על קשר עם מקור כתוב.**`,
      `הקטע המוכח הארוך ביותר במאגר: **${maxDoc} שנים**.`,
      `השאר מחובר בקפיצות משוערות: הגילוי הקרוב בזמן באותו תחום. הן מסומנות באפור מקווקו.`,
      `דוגמה: השרשרת של ${k.prize.he} (${fmt(k.span)} שנים) מתחילה ב"${kr.t}". זה מראה עד כמה הקפיצות רחוקות מעובדה.`,
    ],
    adopt: '**הכוח הוא בקשרים הקצרים והמוכחים.** את השרשרת הארוכה קוראים כמפת השערות, לא כהוכחה.',
    haiku: ['רוב הדרך ערפל', 'כמה צעדים בהירים', 'ומהם גשר'],
    links: [{ label: 'לשרשרת הארוכה', page: 'prize' }],
    about: [{ page: 'prize' }],
  });

  return posts;
}

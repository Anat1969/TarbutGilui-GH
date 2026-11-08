// מיפוי גילוי לספירה תרבותית: לפי מדינת המקום (או מקום הלידה כשאין מקום) ולפי השנה.
// זה סיווג פרשני (interpretive), לא עובדה במקור. הכללים גלויים כאן, כדי שאפשר לבדוק ולתקן.
export const SPHERES = [
  // ספירות שיש להן ארכיטייפ באפליקציה ארכיטייפ (architaip.vercel.app)
  { id: 'egypt', he: 'מצרים העתיקה', arch: 'egypt' },
  { id: 'mesopotamia', he: 'מסופוטמיה', arch: 'mesopotamia' },
  { id: 'greece', he: 'העולם היווני', arch: 'greece' },
  { id: 'rome', he: 'רומא', arch: 'rome' },
  { id: 'israel', he: 'ישראל הקדומה', arch: 'israel' },
  { id: 'india', he: 'הודו', arch: 'india' },
  { id: 'china', he: 'סין', arch: 'china' },
  { id: 'japan', he: 'יפן', arch: 'japan' },
  { id: 'maya', he: 'מסו-אמריקה', arch: 'maya' },
  { id: 'islamic', he: 'העולם האסלאמי', arch: 'islamic' },
  { id: 'gothic', he: 'אירופה של ימי הביניים', arch: 'gothic' },
  { id: 'africa', he: 'אפריקה', arch: 'africa' },
  // ספירות מודרניות שעוד אין להן ארכיטייפ. הארכיטייפ המוצע הוא הנחה, ומוצג כך.
  { id: 'renaissance', he: 'איטליה של הרנסנס', proposal: { archetype: 'האדם כקנה מידה', order: 'פרספקטיבה ומדידה בעין', why: 'החזרה לטקסטים העתיקים ולפרספקטיבה הפכה את **המדידה** לדרך לראות.' } },
  { id: 'dutch', he: 'הולנד', proposal: { archetype: 'העדשה והסוחר', order: 'סחר, דפוס חופשי ומכשיר', why: 'רפובליקה של **סוחרים ומדפיסים** נתנה מקלט לרעיונות ולעדשות.' } },
  { id: 'britain', he: 'בריטניה', proposal: { archetype: 'הניסוי הציבורי', order: 'אל תאמין למילה של איש', why: 'החברה המלכותית קבעה ש**ניסוי מול עדים** גובר על סמכות.' } },
  { id: 'france', he: 'צרפת', proposal: { archetype: 'השיטה והאקדמיה', order: 'ידע ממלכתי ומאורגן', why: 'אקדמיה ממלכתית ואנציקלופדיה הפכו ידע ל**שיטה מסודרת**.' } },
  { id: 'german', he: 'מרכז אירופה דוברת הגרמנית', proposal: { archetype: 'הסמינר והמעבדה', order: 'אוניברסיטת המחקר', why: 'אוניברסיטת המחקר חיברה **הוראה ומעבדה** ויצרה דורות של תלמידים.' } },
  { id: 'russia', he: 'רוסיה', proposal: { archetype: 'המדינה כמזמינה', order: 'אקדמיה של המדינה', why: 'המדינה הזמינה ידע מלמעלה, והוא צמח ב**אקדמיה מרכזית**.' } },
  { id: 'nordic', he: 'סקנדינביה', proposal: { archetype: 'הקהילה הקטנה', order: 'מוסד קטן ופתוח', why: 'מכונים קטנים ופתוחים משכו **חוקרים מבחוץ**.' } },
  { id: 'europe', he: 'אירופה (אחר)', proposal: null },
  { id: 'usa', he: 'ארצות הברית', proposal: { archetype: 'המעבדה הגדולה', order: 'קנה מידה, כסף ומהגרים', why: 'מעבדות ענק ו**מהגרים** הפכו את המדע למפעל.' } },
  { id: 'latam', he: 'אמריקה הלטינית', proposal: null },
  { id: 'israel-modern', he: 'ישראל', proposal: null },
  { id: 'other', he: 'אחר', proposal: null },
];

const EUROPE_OTHER = new Set(['פולין', 'בלגיה', 'ספרד', 'סרביה', 'קריית הוותיקן', 'פורטוגל', 'יוון', 'אירלנד', 'הונגריה']);
const GERMAN = new Set(['גרמניה', 'ממלכת פרוסיה', 'אוסטריה', "צ'כיה", 'שווייץ']);
const ISLAMIC = new Set(['עיראק', 'איראן', 'סוריה', 'ערב הסעודית', 'אוזבקיסטן', 'טורקיה', 'ירדן', 'איחוד האמירויות הערביות', 'מרוקו', 'תוניסיה', "אלג'יריה", 'מצרים', "אזרבייג'ן"]);
const AFRICA = new Set(['אתיופיה', 'ניגריה', 'הרפובליקה הדמוקרטית של קונגו', 'דרום אפריקה', 'מאלי', 'גאנה', 'קניה']);
const LATAM = new Set(['ברזיל', 'מקסיקו', "צ'ילה", 'פרו', 'ארגנטינה', 'קובה', "ג'מייקה"]);

export function sphereOf(country, y) {
  const c = country || '';
  if (!c) return 'other';
  if (y < -330) {
    if (c === 'מצרים') return 'egypt';
    if (c === 'עיראק' || c === 'סוריה') return 'mesopotamia';
    if (c === 'יוון' || c === 'טורקיה' || c === 'איטליה') return 'greece';
    if (c === 'מקסיקו') return 'maya';
  }
  if (c.includes('סין')) return 'china';
  if (c === 'הודו' || c === 'בנגלדש' || c === 'קמבודיה' || c === 'נפאל' || c === 'סרי לנקה') return 'india';
  if (c === 'יפן') return 'japan';
  if (c === 'ישראל') return y < 700 ? 'israel' : 'israel-modern';
  if (y < 600) {
    if (['יוון', 'מצרים', 'טורקיה', 'סוריה', 'עיראק'].includes(c)) return 'greece';
    if (['איטליה', "אלג'יריה", 'סרביה', 'ספרד', 'תוניסיה', 'צרפת'].includes(c)) return 'rome';
  }
  if (AFRICA.has(c)) return 'africa';
  if (c === 'מקסיקו' && y < 1600) return 'maya';
  if (LATAM.has(c)) return 'latam';
  if (y < 1900 && ISLAMIC.has(c)) return 'islamic';
  if (c === 'ספרד' && y < 1492 && y >= 711) return 'islamic';
  if (y >= 1900 && ISLAMIC.has(c)) return 'islamic';
  if (y < 1400 && (EUROPE_OTHER.has(c) || GERMAN.has(c) || ['צרפת', 'איטליה', 'הממלכה המאוחדת', 'הולנד'].includes(c))) return 'gothic';
  if (c === 'איטליה') return y < 1650 ? 'renaissance' : 'europe';
  if (c === 'הולנד') return 'dutch';
  if (c === 'הממלכה המאוחדת') return 'britain';
  if (c === 'צרפת') return 'france';
  if (GERMAN.has(c)) return 'german';
  if (['רוסיה', 'אוקראינה', 'ברית המועצות'].includes(c)) return 'russia';
  if (['שוודיה', 'דנמרק', 'נורווגיה', 'פינלנד', 'איסלנד'].includes(c)) return 'nordic';
  if (EUROPE_OTHER.has(c)) return 'europe';
  if (c === 'ארצות הברית') return 'usa';
  return 'other';
}

export const PERIODS = [
  { id: 'ancient', he: 'העת העתיקה', from: -4000, to: -500 },
  { id: 'classical', he: 'יוון הקלאסית וההלניזם', from: -500, to: 0 },
  { id: 'late-antiquity', he: 'רומא והעת העתיקה המאוחרת', from: 0, to: 600 },
  { id: 'medieval', he: 'ימי הביניים', from: 600, to: 1400 },
  { id: 'renaissance', he: 'הרנסנס', from: 1400, to: 1600 },
  { id: 'scientific', he: 'המהפכה המדעית', from: 1600, to: 1750 },
  { id: 'enlightenment', he: 'נאורות ותיעוש', from: 1750, to: 1850 },
  { id: 'lab', he: 'מאת המעבדה', from: 1850, to: 1914 },
  { id: 'wars', he: 'המלחמות והאטום', from: 1914, to: 1950 },
  { id: 'big', he: 'המדע הגדול', from: 1950, to: 2100 },
];

// TarbutGilui-GH: זיקוק של שושלת, תקופה או שרשרת לתובנה אחת, לפי תקן הזיקוק של ענת.
// Gemini החינמי (GEMINI_API_KEY) קודם, Claude (ANTHROPIC_API_KEY) רק כגיבוי.
// הנתונים שנשלחים ציבוריים (גילויים, קשרים ופרסים מאפליקציות התיק). אין מידע אישי.
import Anthropic from 'npm:@anthropic-ai/sdk';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const SYSTEM = `את/ה כותב/ת תובנה בעברית לאפליקציה "תרבות וגילוי", שחוקרת מאיפה בא רעיון ואיזו תרבות הניעה אותו.
זקק, אל תתאר. עברית טבעית, קצרה ומקצועית, בגוף שלישי. בלי סימני קריאה, בלי אימוג'י, בלי מילים ריקות.

מבנה קבוע, בהיררכיה:
1. insight: שורת תובנה עד 8 מילים, כמו כותרת שמבטאת את העיקר. מסתיימת בנקודה.
2. explain: משפט הסבר אחד, עד 20 מילים, שמפרט את התובנה.
3. next: שאלה אחת להמשך חקירה, עד 12 מילים.

הבלטות ב-**כוכביות כפולות**:
- בשורת התובנה: המושג המרכזי בלבד.
- במשפט ההסבר: 2 עד 3 הבלטות, לשמות, מספרים ומושגי מפתח.
- לא מבליטים מילות קישור ולא משפט שלם.

עובדות: רק מה שמופיע בנתונים שנשלחו. חוליה שמסומנת "גשר" היא הנחה, ואסור להציג אותה כעובדה.
ארכיטייפ תרבותי הוא פרשנות. לא ממציאים שמות, שנים או מספרים.`;

const SCHEMA = {
  type: 'object', additionalProperties: false, required: ['insight', 'explain', 'next'],
  properties: { insight: { type: 'string' }, explain: { type: 'string' }, next: { type: 'string' } },
};
type Out = { insight: string; explain: string; next: string };

const MODELS = [...new Set([Deno.env.get('GEMINI_MODEL') ?? 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'])];
async function viaGemini(key: string, user: string): Promise<Out> {
  let last: unknown;
  for (const model of MODELS) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: { type: 'OBJECT', required: ['insight', 'explain', 'next'], properties: { insight: { type: 'STRING' }, explain: { type: 'STRING' }, next: { type: 'STRING' } } },
          },
        }),
        signal: AbortSignal.timeout(25000),
      });
      if (!r.ok) throw Object.assign(new Error(`Gemini ${model} ${r.status}`), { status: r.status });
      const j = await r.json();
      const text = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
      return JSON.parse(text);
    } catch (err) {
      last = err;
      const st = (err as { status?: number }).status;
      if (st === 400 || st === 401 || st === 403) throw err;
    }
  }
  throw last;
}
async function viaClaude(key: string, user: string): Promise<Out> {
  const client = new Anthropic({ apiKey: key });
  const res = await client.messages.create({
    model: 'claude-opus-5-5', max_tokens: 1500, system: SYSTEM,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content: user }],
  } as never);
  const text = (res as { content: { type: string; text?: string }[] }).content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return JSON.parse(text);
}

// מגבלת קצב פשוטה לכל מופע: 20 בקשות בדקה
const hits: number[] = [];
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const now = Date.now();
  while (hits.length && now - hits[0] > 60000) hits.shift();
  if (hits.length >= 20) return json({ error: 'יותר מדי בקשות. נסו שוב בעוד דקה.' }, 429);
  hits.push(now);

  let body: { kind?: string; context?: string };
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const kind = String(body.kind ?? '').slice(0, 40);
  const context = String(body.context ?? '').slice(0, 6000);
  if (!context) return json({ error: 'חסר הקשר' }, 400);
  const ask: Record<string, string> = {
    tree: 'זקק מה השושלת הזו מלמדת על הרעיון שבמרכזה: ממי ירש, למי מסר, ודרך אילו תרבויות.',
    period: 'זקק למה התרבות הזו הובילה את התקופה, מתוך הנתונים ומתוך הארכיטייפ שלה.',
    prize: 'זקק מה השרשרת הזו מלמדת: מאיפה בא הרעיון שזכה בפרס, ואיפה החוליה החסרה.',
  };
  const user = `${ask[kind] ?? 'זקק תובנה אחת מהנתונים.'}\n\nהנתונים:\n${context}`;

  const gemini = Deno.env.get('GEMINI_API_KEY')?.trim();
  const claude = Deno.env.get('ANTHROPIC_API_KEY')?.trim();
  const errors: string[] = [];
  for (const [label, key, run] of [['Gemini', gemini, viaGemini], ['Claude', claude, viaClaude]] as const) {
    if (!key) continue;
    try {
      const out = await run(key, user);
      if (out?.insight && out?.explain) return json({ ...out, by: label });
      errors.push(`${label}: תשובה חסרה`);
    } catch (err) {
      const st = (err as { status?: number }).status;
      errors.push(st ? `${label} ${st}` : String((err as Error).message ?? err));
    }
  }
  return json({ error: `${errors.join(', ') || 'אין מפתח AI'}` }, 502);
});

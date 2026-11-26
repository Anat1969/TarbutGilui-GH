// tarbutgilui-cover: שומר לתמיד את תמונת השער של כתבה בתרבות וגילוי, בדלי tarbutgilui-covers של פרויקט cultura-GH.
// אותו דפוס כמו chok-upload: שום קובץ לא נמחק ולא נדרס. כל תמונה נשמרת בשם חדש, והיומן tarbutgilui_covers רק גדל.
//   list                                            -> התמונה הנוכחית לכל כתבה { covers: { [article_id]: url } }
//   upload  { article_id, image: base64 של JPEG }   -> שומר קובץ ומוסיף שורה ליומן
//   clear   { article_id }                          -> מוסיף שורה ריקה: המסגרת מתרוקנת, הקובץ נשאר
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const BUCKET = 'tarbutgilui-covers'
const MAX_BYTES = 2_000_000
// רק הכתבות שקיימות באפליקציה (src/data/articles.json)
const ARTICLES = new Set(['see-through', 'pyramid', 'under-forest', 'cholera-map', 'section', 'music-waits'])
const URL_ = Deno.env.get('SUPABASE_URL')!
const db = createClient(URL_, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const publicUrl = (path: string) => `${URL_}/storage/v1/object/public/${BUCKET}/${path}`

// מגבלת קצב לכל מופע: עד 20 כתיבות בדקה
const hits: number[] = []

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'POST בלבד' }, 405)

  let b: Record<string, unknown>
  try { b = await req.json() } catch { return json({ error: 'גוף בקשה לא תקין' }, 400) }

  try {
    if (b.mode === 'list') {
      const { data, error } = await db.from('tarbutgilui_covers').select('article_id, path').order('id', { ascending: false }).limit(500)
      if (error) throw error
      const covers: Record<string, string | null> = {}
      for (const r of data ?? []) if (!(r.article_id in covers)) covers[r.article_id] = r.path ? publicUrl(r.path) : null
      return json({ covers })
    }

    const now = Date.now()
    while (hits.length && now - hits[0] > 60000) hits.shift()
    if (hits.length >= 20) return json({ error: 'יותר מדי פעולות, נסו שוב בעוד דקה' }, 429)
    hits.push(now)

    const id = String(b.article_id ?? '')
    if (!ARTICLES.has(id)) return json({ error: 'הכתבה לא נמצאה' }, 404)

    if (b.mode === 'upload') {
      const raw = String(b.image ?? '')
      if (!raw || raw.length > MAX_BYTES * 1.4) return json({ error: 'התמונה חסרה או גדולה מדי' }, 413)
      let bytes: Uint8Array
      try { bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)) } catch { return json({ error: 'קידוד התמונה לא תקין' }, 400) }
      if (bytes.length > MAX_BYTES) return json({ error: 'התמונה גדולה מדי' }, 413)
      if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) return json({ error: 'רק תמונת JPEG' }, 415)
      const path = `${id}/${now}-${crypto.randomUUID().slice(0, 8)}.jpg`
      const up = await db.storage.from(BUCKET).upload(path, bytes, { contentType: 'image/jpeg', upsert: false, cacheControl: '31536000' })
      if (up.error) throw up.error
      const ins = await db.from('tarbutgilui_covers').insert({ article_id: id, path })
      if (ins.error) throw ins.error
      return json({ article_id: id, url: publicUrl(path) })
    }
    if (b.mode === 'clear') {
      const ins = await db.from('tarbutgilui_covers').insert({ article_id: id, path: null })
      if (ins.error) throw ins.error
      return json({ article_id: id, url: null })
    }
    return json({ error: 'mode לא מוכר' }, 400)
  } catch (err) {
    return json({ error: String((err as Error).message ?? err) }, 502)
  }
})

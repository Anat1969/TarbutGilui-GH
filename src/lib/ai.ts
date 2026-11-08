// זיקוק AI דרך פונקציית Edge (Gemini החינמי, Claude כגיבוי). המפתח לא מגיע לדפדפן.
const URL_ = 'https://ktqmwpbzcnzkhjskqisy.supabase.co/functions/v1/tarbutgilui-ai';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cW13cGJ6Y256a2hqc2txaXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODM4OTgsImV4cCI6MjEwNTc1OTg5OH0.uPKn4hrLk16jhDoajMjPl4OmV5j1b3bMIECVmOdhWGI';
export type Distilled = { insight: string; explain: string; next: string; by?: string };
const KEY = 'tg.distill.';
export const cached = (id: string): Distilled | null => { try { return JSON.parse(localStorage.getItem(KEY + id) || 'null'); } catch { return null; } };
export async function distill(kind: 'tree' | 'period' | 'prize', id: string, context: string): Promise<Distilled> {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON}`, apikey: ANON },
    body: JSON.stringify({ kind, context }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.insight) throw new Error(j.error || `שגיאה ${r.status}`);
  try { localStorage.setItem(KEY + id, JSON.stringify(j)); } catch { /* אין אחסון */ }
  return j;
}

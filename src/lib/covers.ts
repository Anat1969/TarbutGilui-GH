// תמונות שער לכתבות: נשמרות לתמיד בפונקציה tarbutgilui-cover (פרויקט cultura-GH), לפי הדפוס של chok-upload.
// יומן שרק גדל: כל תמונה בשם חדש, וניקוי רק מוסיף שורה ריקה. התמונה האחרונה לכל כתבה היא התמונה בשער.
import { useEffect, useState } from 'react';

export const COVER_FN = 'https://ktqmwpbzcnzkhjskqisy.supabase.co/functions/v1/tarbutgilui-cover';
const MAX_SIDE = 1600;
const MAX_BYTES = 1_800_000;

type Covers = Record<string, string | null>;
let cache: Promise<Covers> | null = null;
const listeners = new Set<() => void>();
let current: Covers = {};

async function call(body: unknown) {
  const r = await fetch(COVER_FN, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `שגיאה ${r.status}`);
  return j;
}

export function loadCovers(): Promise<Covers> {
  if (!cache) cache = call({ mode: 'list' }).then((j) => { current = j.covers || {}; listeners.forEach((f) => f()); return current; }).catch(() => ({}));
  return cache;
}

/** כל קובץ תמונה (PNG, JPEG, WEBP) הופך ל-JPEG עד 1600 פיקסל בצלע, ומתחת ל-1.8MB */
async function toJpeg(file: Blob): Promise<string> {
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(file); } catch { throw new Error('לא הצלחנו לקרוא את התמונה. נסו קובץ JPG או PNG אחר'); }
  const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(bmp, 0, 0, c.width, c.height);
  for (const q of [0.88, 0.8, 0.7, 0.6, 0.5]) {
    const data = c.toDataURL('image/jpeg', q).split(',')[1];
    if (data.length * 0.75 < MAX_BYTES) return data;
  }
  throw new Error('התמונה גדולה מדי גם אחרי דחיסה');
}

export async function saveCover(id: string, file: Blob) {
  const j = await call({ mode: 'upload', article_id: id, image: await toJpeg(file) });
  current = { ...current, [id]: j.url }; listeners.forEach((f) => f());
  return j.url as string;
}

export async function clearCover(id: string) {
  await call({ mode: 'clear', article_id: id });
  current = { ...current, [id]: null }; listeners.forEach((f) => f());
}

/** התמונה השמורה לכתבה, ומתעדכנת אחרי שמירה */
export function useCover(id: string): string | null {
  const [, tick] = useState(0);
  useEffect(() => { const f = () => tick((n) => n + 1); listeners.add(f); loadCovers(); return () => { listeners.delete(f); }; }, []);
  return current[id] ?? null;
}

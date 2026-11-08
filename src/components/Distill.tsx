// כפתור זיקוק: AI כותב תובנה אחת מהנתונים שעל המסך. התוצאה נשמרת במכשיר.
import { useEffect, useState } from 'react';
import Rich from './Rich';
import { cached, distill, type Distilled } from '../lib/ai';
export default function Distill({ kind, id, context, label }: { kind: 'tree' | 'period' | 'prize'; id: string; context: () => string; label: string }) {
  const [out, setOut] = useState<Distilled | null>(() => cached(kind + id));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { setOut(cached(kind + id)); setErr(''); }, [kind, id]);
  const run = async () => {
    setBusy(true); setErr('');
    try { setOut(await distill(kind, kind + id, context())); } catch (e) { setErr(String((e as Error).message || e)); }
    setBusy(false);
  };
  return (
    <div className="distill" data-testid="distill">
      {out ? (
        <div className="distill-out">
          <div className="tag tag-ai">זיקוק AI · פרשנות</div>
          <Rich as="p" className="d-insight" text={out.insight} />
          <Rich as="p" className="d-explain" text={out.explain} />
          {out.next && <p className="d-next">להמשך: {out.next}</p>}
          <button className="btn btn-quiet" onClick={run} disabled={busy}>{busy ? 'מזקק...' : 'זיקוק מחדש'}</button>
        </div>
      ) : (
        <button className="btn btn-ai" onClick={run} disabled={busy} data-testid="distill-btn">{busy ? 'מזקק...' : label}</button>
      )}
      {err && <p className="d-err">הזיקוק לא הצליח: {err}</p>}
    </div>
  );
}

// בחירה בודדת: מוצג רק מה שנבחר. הקלדה פותחת עד 6 הצעות, ובחירה סוגרת. לא כל הרשימה בבת אחת.
import { useRef, useState, type ReactNode } from 'react';
export type PickItem = { id: string; label: string; sub?: string; color?: string; key?: string };
export default function Pick({ current, items, onPick, placeholder, testid }: { current: ReactNode; items: PickItem[]; onPick: (id: string) => void; placeholder: string; testid?: string }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const t = q.trim().toLowerCase();
  const hits = t ? items.filter((x) => `${x.label} ${x.sub || ''} ${x.key || ''}`.toLowerCase().includes(t)).slice(0, 6) : [];
  const choose = (id: string) => { onPick(id); setQ(''); setOpen(false); };
  if (!open) {
    return (
      <button className="pick-cur press" onClick={() => { setOpen(true); setTimeout(() => ref.current?.focus(), 0); }} data-testid={testid ? `${testid}-open` : undefined}>
        <span className="pick-v">{current}</span><span className="pick-x">החלפה</span>
      </button>
    );
  }
  return (
    <div className="pick-box">
      <input ref={ref} className="search" value={q} placeholder={placeholder} aria-label={placeholder} data-testid={testid}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && hits[0]) choose(hits[0].id); if (e.key === 'Escape') { setOpen(false); setQ(''); } }}
        onBlur={() => setTimeout(() => { setOpen(false); setQ(''); }, 180)} />
      {t && (
        <ul className="pick-list" role="listbox">
          {hits.length ? hits.map((x) => (
            <li key={x.id}><button className="pick-opt" onMouseDown={(e) => e.preventDefault()} onClick={() => choose(x.id)}>
              {x.color && <i style={{ background: x.color }} />}<span>{x.label}</span>{x.sub && <small>{x.sub}</small>}
            </button></li>
          )) : <li className="pick-none">לא נמצא. נסו שם אחר.</li>}
        </ul>
      )}
    </div>
  );
}

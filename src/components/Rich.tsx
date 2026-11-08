// טקסט עם ==מרקר== ו-**בולד**. עם lines: כל משפט בשורה משלו, כדי שמשפט לא יישבר באמצע.
import { Fragment } from 'react';
type Tag = 'span' | 'p' | 'div' | 'h1' | 'h2';
export default function Rich({ text, as: T = 'span', className, lines }: { text: string; as?: Tag; className?: string; lines?: boolean }) {
  if (lines) {
    const sents = sentences(text);
    return <T className={className}>{sents.map((s, i) => <span key={i} className="line">{inline(s)}</span>)}</T>;
  }
  return <T className={className}>{inline(text)}</T>;
}
function inline(text: string) {
  return text.split(/(==[^=]+==|\*\*[^*]+\*\*)/g).filter(Boolean).map((p, i) => p.startsWith('==') ? <mark key={i}>{bold(p.slice(2, -2))}</mark>
    : p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : <Fragment key={i}>{p}</Fragment>);
}
function bold(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((p, i) => p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : <Fragment key={i}>{p}</Fragment>);
}

// פיצול למשפטים רק מחוץ למרקר ולבולד, כדי לא לשבור את הסימון
function sentences(text: string) {
  const out: string[] = []; let cur = ''; let inB = false, inM = false;
  for (let i = 0; i < text.length; i++) {
    const two = text.slice(i, i + 2);
    if (two === '**') { inB = !inB; cur += two; i++; continue; }
    if (two === '==') { inM = !inM; cur += two; i++; continue; }
    cur += text[i];
    if (!inB && !inM && /[.?!]/.test(text[i]) && /\s/.test(text[i + 1] || '')) { out.push(cur.trim()); cur = ''; }
    else if (!inB && !inM && /\s/.test(text[i]) && /(\*\*|==)$/.test(cur.trimEnd()) && /[.?!](\*\*|==)$/.test(cur.trimEnd())) { out.push(cur.trim()); cur = ''; }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

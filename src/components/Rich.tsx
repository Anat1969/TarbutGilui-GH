// טקסט עם ==מרקר== ו-**בולד**, כמו בעולם נעלם ובתקן הזיקוק.
import { Fragment } from 'react';
export default function Rich({ text, as: Tag = 'span', className }: { text: string; as?: 'span' | 'p' | 'div' | 'h1'; className?: string }) {
  const parts = text.split(/(==[^=]+==|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <Tag className={className}>
      {parts.map((p, i) => p.startsWith('==') ? <mark key={i}>{renderBold(p.slice(2, -2))}</mark>
        : p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : <Fragment key={i}>{p}</Fragment>)}
    </Tag>
  );
}
function renderBold(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((p, i) => p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : <Fragment key={i}>{p}</Fragment>);
}

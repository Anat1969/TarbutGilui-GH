// מונח עם הסבר: קו נקודות מתחת למילה. ריחוף, מיקוד או נגיעה פותחים בועה עם הגדרה פשוטה.
import type { ReactNode } from 'react';
import { GLOSSARY, type TermKey } from '../lib/glossary';
export default function Term({ k, children }: { k: TermKey; children?: ReactNode }) {
  const g = GLOSSARY[k];
  return (
    <span className="term" tabIndex={0} role="button" aria-label={`${g.he}: ${g.def}`}>
      {children ?? g.he}
      <span className="term-pop" role="tooltip">
        <b>{g.he}</b>{g.pro && <small> (במונחי המחקר: {g.pro})</small>}
        <span>{g.def}</span>
      </span>
    </span>
  );
}

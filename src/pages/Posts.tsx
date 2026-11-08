// פוסטים: הסיפורים שהנתונים מספרים, כתובים מראש. טור כותרות מימין, ופוסט אחד פתוח.
import { useMemo } from 'react';
import { href } from '../route';
import Rich from '../components/Rich';
import { buildPosts } from '../lib/posts';

export default function Posts({ params }: { params: Record<string, string> }) {
  const posts = useMemo(buildPosts, []);
  const p = posts.find((x) => x.id === params.id) || posts[0];
  return (
    <div className="page posts-page">
      <div className="posts">
        <nav className="post-list" aria-label="הפוסטים">
          <p className="kicker">פוסטים · {posts.length} סיפורים מהנתונים</p>
          {posts.map((x, i) => (
            <a key={x.id} className={`post-li press ${x.id === p.id ? 'on' : ''}`} href={href('posts', { id: x.id })} aria-current={x.id === p.id ? 'page' : undefined}>
              <i>{i + 1}</i><span>{x.title}</span>
            </a>
          ))}
        </nav>
        <article className="post" data-testid="post" key={p.id}>
          <p className="kicker">פוסט · <span className="tag tag-fact">עובדות מהמאגר</span> <span className="tag tag-int">ופרשנות</span></p>
          <h1 className="post-t">{p.title}</h1>
          <p className="post-dek">{p.dek}</p>
          <div className="post-grid">
            <div className="post-body">
              <Rich as="div" className="post-lines" text={p.body.join(' ')} lines />
              <div className="b-adopt"><span className="b-adopt-h">מה לקחת מזה <span className="tag tag-int">פרשנות</span></span><Rich text={p.adopt} lines /></div>
              <div className="post-links">
                {p.links.map((l) => <a key={l.label} className="btn press" href={href(l.page, l.params)}>{l.label}</a>)}
              </div>
            </div>
            <aside className="post-side">
              {p.img && (
                <figure className="post-fig">
                  <img src={p.img} alt={p.imgCap || ''} loading="lazy" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }} />
                  {p.imgCap && <figcaption>{p.imgCap}. תמונה: ויקישיתוף</figcaption>}
                </figure>
              )}
              {p.quote && <blockquote className="post-q"><p>{p.quote.text}</p><cite>{p.quote.by}</cite></blockquote>}
              <p className="haiku" aria-label="הייקו">{p.haiku.map((h, i) => <span key={i}>{h}</span>)}</p>
            </aside>
          </div>
        </article>
      </div>
    </div>
  );
}

// קישור לפוסטים שעוסקים בדף או בפריט, לשלב 3 של כל דף
export function PostLinks({ page, id }: { page: string; id?: string }) {
  const posts = useMemo(buildPosts, []);
  const rel = posts.filter((p) => p.about.some((a) => a.page === page && (!a.id || !id || a.id === id)));
  if (!rel.length) return null;
  return (
    <div className="post-rel">
      <h3>פוסטים על זה</h3>
      {rel.map((p) => <a key={p.id} className="post-li press" href={href('posts', { id: p.id })}><span>{p.title}</span></a>)}
    </div>
  );
}

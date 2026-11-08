import { useEffect } from 'react';
import { useRoute, href } from './route';
import Home from './pages/Home';
import Tree from './pages/Tree';
import Culture from './pages/Culture';
import PrizePage from './pages/Prize';
import Sources from './pages/Sources';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX { interface IntrinsicElements { 'ai-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { chat?: string } } }
}

// שלוש השאלות הן המבנה: כל לשונית היא שאלה של המשתמש.
const TABS = [
  { page: 'tree', label: 'עץ הרעיונות', q: 'ממי ירש ולמי מסר?' },
  { page: 'culture', label: 'תרבות כמנוע', q: 'מי הובילה כל תקופה?' },
  { page: 'prize', label: 'שרשרת עד הפרס', q: 'כמה רחוק הפרס מהשורש?' },
];

export default function App() {
  const { page, params } = useRoute();
  useEffect(() => {
    const t = TABS.find((x) => x.page === page);
    document.title = t ? `${t.label} · תרבות וגילוי` : 'תרבות וגילוי';
  }, [page]);
  return (
    <>
      <header className="bar">
        <a className="brand press" href={href('home')} aria-label="תרבות וגילוי, לדף הבית">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="brand-name">תרבות וגילוי</span>
        </a>
        <nav className="tabs" aria-label="שלוש השאלות">
          {TABS.map((t) => (
            <a key={t.page} className={`tab press ${page === t.page ? 'on' : ''}`} href={href(t.page)} aria-current={page === t.page ? 'page' : undefined}>
              <span className="tab-label">{t.label}</span><span className="tab-q">{t.q}</span>
            </a>
          ))}
        </nav>
        <ai-menu chat="https://claude.ai/code/session_01UBnSCLEXTFFki8uZJHBiao"></ai-menu>
      </header>
      <main className="main" key={page}>
        {page === 'tree' ? <Tree params={params} />
          : page === 'culture' ? <Culture params={params} />
          : page === 'prize' ? <PrizePage params={params} />
          : page === 'sources' ? <Sources />
          : <Home />}
      </main>
    </>
  );
}

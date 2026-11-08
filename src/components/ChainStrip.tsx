// רצועת שרשרת: מהשורש (מימין) עד הפרס (משמאל). צבע הנקודה הוא התרבות. קפיצה משוערת: קו אפור מקווקו.
// anim: הרצועה מתפתחת, חוליה אחר חוליה, ונעצרת בפרס. בהפחתת תנועה מוצגת שלמה.
import { nodeById, sphereColor, yearText, type Step } from '../lib/graph';
const short = (s: string) => (s.length > 16 ? s.slice(0, 15) + '…' : s);
export default function ChainStrip({ chain, endYear, anim, dark, step = 0.32 }: { chain: Step[]; endYear?: number; anim?: boolean; dark?: boolean; step?: number }) {
  const n = chain.length + (endYear ? 1 : 0);
  const W = 1000, pad = 60;
  const x = (i: number) => W - pad - (n === 1 ? 0 : (i * (W - 2 * pad)) / (n - 1));
  const d = (i: number) => ({ '--d': `${(anim ? i * step : 0).toFixed(2)}s` } as React.CSSProperties);
  return (
    <svg className={`strip ${anim ? 'strip-anim' : ''} ${dark ? 'strip-dark' : ''}`} viewBox={`0 0 ${W} 150`} role="img" aria-label="שרשרת מהשורש עד הפרס">
      {chain.map((st, i) => {
        if (!i) return null;
        const bridge = st.kind === 'bridge';
        return <line key={'l' + i} className={bridge ? 'sl-b' : 'sl'} style={d(i - 0.5)} pathLength={1} x1={x(i - 1)} x2={x(i)} y1={75} y2={75} stroke={bridge ? '#9A968E' : sphereColor(nodeById.get(st.id)!.s)} strokeWidth={bridge ? 3 : 6} strokeDasharray={bridge ? '6 7' : undefined} strokeLinecap="round" />;
      })}
      {endYear && <line className="sl" style={d(chain.length - 0.5)} pathLength={1} x1={x(chain.length - 1)} x2={x(chain.length)} y1={75} y2={75} stroke="#B08A2E" strokeWidth={6} strokeLinecap="round" />}
      {chain.map((st, i) => {
        const nd = nodeById.get(st.id)!;
        const up = i % 2 === 0;
        const keep = i === 0 || i === chain.length - 1 || st.kind === 'bridge';
        return (
          <g key={st.id + i} className={`sn ${keep ? 'keep' : ''}`} style={d(i)}>
            <circle cx={x(i)} cy={75} r={11} fill={sphereColor(nd.s)} stroke={dark ? '#16150F' : '#fff'} strokeWidth={3} />
            <text x={x(i)} y={up ? 40 : 120} textAnchor="middle" className="strip-who">{short(nd.who || nd.t)}</text>
            <text x={x(i)} y={up ? 22 : 138} textAnchor="middle" className="strip-y">{yearText(nd.y)}</text>
          </g>
        );
      })}
      {endYear && (
        <g className="sn keep sn-prize" style={d(chain.length)}>
          <circle cx={x(chain.length)} cy={75} r={16} fill="#B08A2E" stroke={dark ? '#16150F' : '#fff'} strokeWidth={3} />
          <text x={x(chain.length)} y={chain.length % 2 === 0 ? 40 : 120} textAnchor="middle" className="strip-who strip-prize">נובל</text>
          <text x={x(chain.length)} y={chain.length % 2 === 0 ? 22 : 138} textAnchor="middle" className="strip-y">{endYear}</text>
        </g>
      )}
    </svg>
  );
}

import { sphereById, sphereColor } from '../lib/graph';
export default function CultureChip({ s, small }: { s: string; small?: boolean }) {
  return <span className={`chip ${small ? 'chip-s' : ''}`}><i style={{ background: sphereColor(s) }} />{sphereById.get(s)?.he || s}</span>;
}

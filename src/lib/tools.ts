// מכשירים: גישה לנתונים (instruments.json נבנה ב-scripts/instruments.mjs) וספירות שנגזרות מהם.
import raw from '../data/instruments.json';

export type ToolPrize = { nid: string; he: string; en: string; y: number; f: string; fh: string; d: string; mh: string; role: 'f' | 'w' };
export type Src = null | { url: string; by: string };
export type Note = { f: string; t: string; src?: Src };
export type PlanVerb = { id: string; b: string; verb: string; blind: string; tool: string; origin: string; osrc: Src; sci: { state: 'done' | 'idea'; t: string; src: Src }; prizes: ToolPrize[] };
export type Instrument = { id: string; b: string; he: string; verb: string; see: string; shift: string; node: null | { id: string; t: string; y: number }; prizes: ToolPrize[]; crossed: Note[]; ideas: Note[] };
export type Field = { id: string; he: string; sci: boolean };
const data = raw as unknown as { built: string; fields: Field[]; method: { t: string; x: string }[]; instruments: Instrument[]; planning: PlanVerb[]; blind: { id: string; he: string }[]; coverage: { inList: number; all: number } };

export const { fields, method, coverage, planning, blind } = data;
export const toolList = [...data.instruments].sort((a, b) => a.prizes[0].y - b.prizes[0].y);
export const fieldHe = (id: string) => fields.find((f) => f.id === id)?.he || id;
/** פרס = שנה ותחום. כמה זוכים חלקו אותו לא משנה את הספירה. */
export const awards = (ps: ToolPrize[]) => new Set(ps.map((p) => `${p.y}-${p.f}`)).size;

const all = toolList.flatMap((i) => i.prizes);
const byField = fields.filter((f) => !f.sci).map((f) => ({
  f, done: toolList.filter((i) => i.crossed.some((c) => c.f === f.id)).length, idea: toolList.filter((i) => i.ideas.some((c) => c.f === f.id)).length,
}));
export const toolStats = {
  awards: awards(all), forIt: awards(all.filter((p) => p.role === 'f')),
  ideas: toolList.reduce((a, i) => a + i.ideas.length, 0), crossed: toolList.reduce((a, i) => a + i.crossed.length, 0),
  most: [...byField].sort((a, b) => b.done - a.done)[0],
  waiting: [...byField].sort((a, b) => a.done - b.done || b.idea - a.idea)[0],
};

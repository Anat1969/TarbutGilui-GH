// כתבות: שש כתבות שנולדו מדף המכשירים. התוכן ב-articles.json, והמספרים מתמלאים מנתוני המכשירים.
import raw from '../data/articles.json';
import { toolList, toolStats } from './tools';

export type Article = {
  id: string; verb: string; tool: string; t1: string; t2: string; dek: string;
  img?: { src: string; cap: string; credit: string };
  chapters: { h: string; body: string[]; insight: string }[];
  plan: { body: string[]; steps: string[] }; ask: string; haiku: string[];
};
const vars: Record<string, string> = {
  n: String(toolList.length), most: toolStats.most.f.he, mostDone: String(toolStats.most.done),
  waitDone: toolStats.waiting.done === 1 ? 'אחד' : String(toolStats.waiting.done), waitIdea: String(toolStats.waiting.idea),
};
const fill = (s: string) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
const deep = <T,>(x: T): T => (typeof x === 'string' ? fill(x) : Array.isArray(x) ? x.map(deep) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, deep(v)])) : x) as T;
export const articles = deep((raw as unknown as { articles: Article[] }).articles);

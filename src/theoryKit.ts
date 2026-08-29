// Типы и хелперы для сборки учебника

export type FigKind =
  | 'atom' | 'circuit' | 'ohm' | 'wires3' | 'cable-cut' | 'breaker-inside'
  | 'rcd-principle' | 'tn-systems' | 'switch-phase' | 'passthrough'
  | 'panel-tree' | 'selectivity' | 'loop' | 'star-delta' | 'ip-zones'
  | 'ferrule-crimp' | 'cable-tray' | 'grounding' | 'power-triangle' | 'ev-charge'
  | 'sine' | 'series-parallel' | 'magnet' | 'transformer' | 'motor'
  | 'symbols' | 'multimeter' | 'shock' | 'lamp-types' | 'socket-types'
  | 'box-wire' | 'trace-rules' | 'din-rail' | 'busbar-comb' | 'meter-scheme'
  | 'zones-street' | 'lightning' | 'solar' | 'ups' | 'cable-lay'
  | 'heat' | 'insulation-test' | 'kz-loop' | 'harmonics' | 'compensation'
  | 'contactor-scheme' | 'timer-scheme' | 'floor-heat' | 'vent-scheme'
  | 'smart-home' | 'gen-switch' | 'cable-brands' | 'tools' | 'protect-class';

export type Block =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'list'; items: string[] }
  | { t: 'note'; kind: 'info' | 'warn' | 'danger' | 'ok'; title: string; text: string }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'formula'; expr: string; text: string }
  | { t: 'pue'; code: string; text: string }
  | { t: 'fig'; kind: FigKind; caption: string };

export type Level = 'Азы' | 'База' | 'Практика' | 'Профи' | 'Нормативы' | 'Мастер';

export interface Chapter {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  level: Level;
  part: string;
  minutes: number;
  blocks: Block[];
}

// --- краткие хелперы для блоков ---
export const p = (text: string): Block => ({ t: 'p', text });
export const h = (text: string): Block => ({ t: 'h', text });
export const l = (...items: string[]): Block => ({ t: 'list', items });
export const ni = (title: string, text: string): Block => ({ t: 'note', kind: 'info', title, text });
export const nw = (title: string, text: string): Block => ({ t: 'note', kind: 'warn', title, text });
export const nd = (title: string, text: string): Block => ({ t: 'note', kind: 'danger', title, text });
export const nk = (title: string, text: string): Block => ({ t: 'note', kind: 'ok', title, text });
export const tbl = (head: string[], rows: string[][]): Block => ({ t: 'table', head, rows });
export const f = (expr: string, text: string): Block => ({ t: 'formula', expr, text });
export const pue = (code: string, text: string): Block => ({ t: 'pue', code, text });
export const fig = (kind: FigKind, caption: string): Block => ({ t: 'fig', kind, caption });

let counter = 0;
export function ch(
  id: string,
  title: string,
  subtitle: string,
  level: Level,
  part: string,
  minutes: number,
  blocks: Block[],
): Chapter {
  counter += 1;
  return { id, num: String(counter).padStart(3, '0'), title, subtitle, level, part, minutes, blocks };
}
export const resetCounter = () => {
  counter = 0;
};

export const LEVEL_COLORS: Record<Level, string> = {
  'Азы': '#4ade80',
  'База': '#38bdf8',
  'Практика': '#ffc42e',
  'Профи': '#f472b6',
  'Нормативы': '#c084fc',
  'Мастер': '#fb7185',
};

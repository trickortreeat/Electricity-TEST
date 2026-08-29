import { CATALOG_BY_ID, type CatalogItem, type PanelTask } from './content';

export interface WTerm {
  id: string;       // "slotKey:term"
  slotKey: string;
  label: string;
  x: number;
  y: number;
  side: 'top' | 'bot';
}

export interface WModule {
  slotKey: string;
  item: CatalogItem;
  label: string;
  x: number;
  y: number;
  w: number;
  rail: number;
  terms: WTerm[];
}

export interface WLink {
  a: string;
  b: string;
  color: 'brown' | 'blue' | 'pe';
  note: string;
}

export interface WiringModel {
  modules: WModule[];
  terms: Map<string, WTerm>;
  links: WLink[];
  width: number;
  height: number;
}

const MOD_W = 46;
const RAIL_GAP = 260;
const TOP = 150;
const LEFT = 300;

// какие аппараты стоят «в разрыв» магистрали
const SERIES = new Set(['breaker2p', 'breaker3p', 'meter', 'vrn']);
// какие являются групповыми (параллельно от шины питания)
const PARALLEL = new Set(['breaker', 'dif']);


function termsFor(item: CatalogItem, x: number, y: number, slotKey: string, w: number): WTerm[] {
  const t = (key: string, label: string, dx: number, side: 'top' | 'bot'): WTerm => ({
    id: `${slotKey}:${key}`,
    slotKey,
    label,
    x: x + dx,
    y: side === 'top' ? y - 62 : y + 62,
    side,
  });
  switch (item.kind) {
    case 'breaker':
      return [t('in', '1', 0, 'top'), t('out', '2', 0, 'bot')];
    case 'breaker2p':
      return [t('Lin', 'L', -18, 'top'), t('Nin', 'N', 18, 'top'), t('Lout', '2', -18, 'bot'), t('Nout', 'N', 18, 'bot')];
    case 'breaker3p':
      return [t('Lin', 'L1', -30, 'top'), t('L2', 'L2', 0, 'top'), t('L3', 'L3', 30, 'top'), t('Lout', '2', -30, 'bot'), t('L2o', '4', 0, 'bot'), t('L3o', '6', 30, 'bot')];
    case 'rcd':
    case 'dif':
      return [t('Nin', 'N', -20, 'top'), t('Lin', '1', 20, 'top'), t('Nout', 'N', -20, 'bot'), t('Lout', '2', 20, 'bot')];
    case 'vrn':
      return [t('Lin', 'L', -16, 'top'), t('Nin', 'N', 16, 'top'), t('Lout', '2', 0, 'bot')];
    case 'uzip':
      return [t('Lin', 'L', 0, 'top'), t('Nin', 'N', -18, 'bot'), t('PE', 'PE', 18, 'bot')];
    case 'meter':
      return [t('Lin', '1', -30, 'top'), t('Nin', '3', 30, 'top'), t('Lout', '2', -30, 'bot'), t('Nout', '4', 30, 'bot')];
    case 'contactor':
      return [t('Lin', '1', -18, 'top'), t('A1', 'A1', 18, 'top'), t('Lout', '2', -18, 'bot'), t('A2', 'A2', 18, 'bot')];
    case 'cross':
      return [t('Lin', 'L', -w / 2 + 20, 'top'), t('Nin', 'N', -w / 2 + 20, 'bot'), t('L2', 'L', 0, 'top'), t('N2', 'N', 0, 'bot'), t('L3', 'L', w / 2 - 20, 'top'), t('N3', 'N', w / 2 - 20, 'bot')];
    case 'comb':
      return [t('Lin', 'вход', 0, 'top')];
    case 'busbar':
      return [t('a', '', -w / 2 + 18, 'top'), t('b', '', 0, 'top'), t('c', '', w / 2 - 18, 'top')];
    default:
      return [];
  }
}

export function buildWiringModel(task: PanelTask): WiringModel {
  const modules: WModule[] = [];
  task.rails.forEach((rail, ri) => {
    let cursor = LEFT;
    rail.slots.forEach((slot, si) => {
      const item = CATALOG_BY_ID.get(slot.need)!;
      const w = Math.max(item.mods * MOD_W, 60);
      const x = cursor + w / 2;
      const y = TOP + ri * RAIL_GAP;
      const slotKey = `${ri}-${si}`;
      if (item.kind !== 'sep' && item.kind !== 'timer') {
        modules.push({ slotKey, item, label: slot.label, x, y, w, rail: ri, terms: termsFor(item, x, y, slotKey, w) });
      }
      cursor += w + 26;
    });
  });

  // источник (вводной кабель)
  const srcY = TOP + ((task.rails.length - 1) * RAIL_GAP) / 2;
  const source: WModule = {
    slotKey: 'src',
    item: { id: 'src', kind: 'sep', title: 'Ввод', short: 'ВВОД', sub: '', mods: 3, group: '' },
    label: 'Вводной кабель',
    x: 110,
    y: srcY,
    w: 130,
    rail: -1,
    terms: [
      { id: 'src:L', slotKey: 'src', label: 'L', x: 175, y: srcY - 50, side: 'top' },
      { id: 'src:N', slotKey: 'src', label: 'N', x: 175, y: srcY, side: 'top' },
      { id: 'src:PE', slotKey: 'src', label: 'PE', x: 175, y: srcY + 50, side: 'bot' },
    ],
  };
  modules.unshift(source);

  const terms = new Map<string, WTerm>();
  modules.forEach((m) => m.terms.forEach((t) => terms.set(t.id, t)));

  // ---------- план расключения ----------
  const links: WLink[] = [];
  const has = (id: string) => terms.has(id);
  const push = (a: string, b: string, color: WLink['color'], note: string) => {
    if (has(a) && has(b)) links.push({ a, b, color, note });
  };

  const busN = modules.find((m) => m.item.id === 'bus-n');
  const busPE = modules.find((m) => m.item.id === 'bus-pe');
  const cross = modules.find((m) => m.item.kind === 'cross');
  const comb = modules.find((m) => m.item.kind === 'comb');
  const uzip = modules.find((m) => m.item.kind === 'uzip');

  const seriesChain = modules.filter((m) => SERIES.has(m.item.kind));
  const mainRcd = modules.find((m) => m.item.id === 'uzo-63-100s');
  if (mainRcd) seriesChain.push(mainRcd);

  // 1. магистраль
  let feed = 'src:L';
  let feedNote = 'фаза ввода';
  seriesChain.forEach((m) => {
    push(feed, `${m.slotKey}:Lin`, 'brown', `${feedNote} → вход «${m.label}»`);
    feed = `${m.slotKey}:Lout`;
    feedNote = `выход «${m.label}»`;
  });

  // 2. распределение
  if (cross) {
    push(feed, `${cross.slotKey}:Lin`, 'brown', `${feedNote} → фазная шина кросс-модуля`);
    feed = `${cross.slotKey}:L2`;
    feedNote = 'фазная шина кросс-модуля';
  }
  if (comb) {
    push(feed, `${comb.slotKey}:Lin`, 'brown', `${feedNote} → вход гребёнки`);
  }

  // 3. групповые аппараты
  modules
    .filter((m) => PARALLEL.has(m.item.kind) || (m.item.kind === 'rcd' && m.item.id !== 'uzo-63-100s'))
    .forEach((m) => {
      const inTerm = m.item.kind === 'breaker' ? `${m.slotKey}:in` : `${m.slotKey}:Lin`;
      push(feed, inTerm, 'brown', `${feedNote} → фаза на «${m.label}»`);
    });

  // 4. нейтраль
  let nSource = 'src:N';
  const nSeries = seriesChain.filter((m) => has(`${m.slotKey}:Nin`) && has(`${m.slotKey}:Nout`));
  nSeries.forEach((m) => {
    push(nSource, `${m.slotKey}:Nin`, 'blue', `ноль → вход N «${m.label}»`);
    nSource = `${m.slotKey}:Nout`;
  });
  if (busN) {
    push(nSource, `${busN.slotKey}:a`, 'blue', 'ноль → нулевая шина');
    nSource = `${busN.slotKey}:b`;
  }
  if (cross) push(nSource, `${cross.slotKey}:Nin`, 'blue', 'ноль → шина N кросс-модуля');
  modules
    .filter((m) => (m.item.kind === 'rcd' && m.item.id !== 'uzo-63-100s') || m.item.kind === 'dif')
    .forEach((m) => push(cross ? `${cross.slotKey}:N2` : nSource, `${m.slotKey}:Nin`, 'blue', `ноль → вход N «${m.label}»`));

  // 5. земля
  if (busPE) push('src:PE', `${busPE.slotKey}:a`, 'pe', 'земля ввода → шина PE');
  if (uzip) {
    push(feed, `${uzip.slotKey}:Lin`, 'brown', 'отвод фазы на УЗИП');
    push(busN ? `${busN.slotKey}:c` : 'src:N', `${uzip.slotKey}:Nin`, 'blue', 'ноль на УЗИП');
    push(busPE ? `${busPE.slotKey}:b` : 'src:PE', `${uzip.slotKey}:PE`, 'pe', 'земля на УЗИП — главный путь импульса');
  }

  const maxX = Math.max(...modules.map((m) => m.x + m.w / 2)) + 80;
  const maxY = TOP + (task.rails.length - 1) * RAIL_GAP + 150;
  return { modules, terms, links, width: maxX, height: maxY };
}

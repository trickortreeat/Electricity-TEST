import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Crosshair,
  Gauge,
  Home,
  Info,
  Lightbulb,
  Maximize2,
  MousePointerClick,
  Minus,
  Plus,
  Power,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  X,
  XCircle,
  Zap,
  ZapOff,
} from 'lucide-react';
import { DeviceBody, SvgDefs } from './devices';
import { MvpNote, TgBadge } from './Telegram';
import { GlossaryPanel, Tip } from './Tips';
import { HelpCircle } from 'lucide-react';
import { sfx } from '../audio';
import type { Connection, LevelDef, NetType, WireColor } from '../types';
import { NET_WIRE_COLOR, WIRE_META } from '../types';

interface TermInfo {
  id: string;
  deviceId: string;
  deviceType: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  label?: string;
  net: string | null;
}

interface PopupMsg {
  title: string;
  body: string;
  tone: 'danger' | 'warn' | 'info';
}

// ---------- union-find ----------
function ufFind(p: Record<string, string>, x: string): string {
  let r = x;
  while (p[r] !== r) r = p[r];
  while (p[x] !== r) {
    const n = p[x];
    p[x] = r;
    x = n;
  }
  return r;
}

// ---------- ортогональная укладка провода ----------
type Pt = { x: number; y: number };

function roundedPath(pts: Pt[], r = 12) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const prev = pts[i - 1];
    const next = pts[i + 1];
    const d1 = Math.hypot(p.x - prev.x, p.y - prev.y);
    const d2 = Math.hypot(next.x - p.x, next.y - p.y);
    const rr = Math.max(0, Math.min(r, d1 / 2, d2 / 2));
    const a = { x: p.x + ((prev.x - p.x) / (d1 || 1)) * rr, y: p.y + ((prev.y - p.y) / (d1 || 1)) * rr };
    const b = { x: p.x + ((next.x - p.x) / (d2 || 1)) * rr, y: p.y + ((next.y - p.y) / (d2 || 1)) * rr };
    d += ` L ${a.x} ${a.y} Q ${p.x} ${p.y} ${b.x} ${b.y}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

const FLAT = new Set(['hub', 'busN', 'busPE', 'comb']);

function termDir(t: TermInfo, other: TermInfo): Pt {
  if (t.deviceType === 'cable') return { x: 1, y: 0 };
  // у кросс-модуля клеммы на горизонтальных шинах — провод всегда уходит вертикально
  if (t.deviceType === 'cross') return { x: 0, y: Math.sign(t.dy) || 1 };
  // у шин и клеммников провод выходит вверх или вниз — в сторону второй точки
  if (FLAT.has(t.deviceType)) return { x: 0, y: other.y >= t.y ? 1 : -1 };
  if (Math.abs(t.dy) >= Math.abs(t.dx)) return { x: 0, y: Math.sign(t.dy) || 1 };
  return { x: Math.sign(t.dx), y: 0 };
}

function routeWire(a: TermInfo, b: TermInfo, k: number): Pt[] {
  const da = termDir(a, b);
  const db = termDir(b, a);
  const s = 20 + (k % 6) * 10;
  const pa = { x: a.x + da.x * s, y: a.y + da.y * s };
  const pb = { x: b.x + db.x * s, y: b.y + db.y * s };
  const aV = da.x === 0;
  const bV = db.x === 0;

  if (aV && bV) {
    let laneY: number;
    if (da.y === db.y) {
      laneY = da.y > 0 ? Math.max(pa.y, pb.y) + (k % 5) * 9 : Math.min(pa.y, pb.y) - (k % 5) * 9;
    } else {
      const facing = (da.y > 0 && a.y < b.y) || (db.y > 0 && b.y < a.y);
      laneY = facing ? (pa.y + pb.y) / 2 : da.y > 0 ? Math.max(pa.y, pb.y) + 24 + (k % 4) * 9 : Math.min(pa.y, pb.y) - 24 - (k % 4) * 9;
    }
    if (Math.abs(pa.x - pb.x) < 2) return [a, pa, pb, b];
    return [a, pa, { x: pa.x, y: laneY }, { x: pb.x, y: laneY }, pb, b];
  }

  if (!aV && bV) {
    if (Math.abs(pa.y - pb.y) < 2) return [a, pa, pb, b];
    return [a, pa, { x: pa.x, y: pb.y }, pb, b];
  }
  if (aV && !bV) {
    if (Math.abs(pa.y - pb.y) < 2) return [a, pa, pb, b];
    return [a, pa, { x: pb.x, y: pa.y }, pb, b];
  }
  const midX = (pa.x + pb.x) / 2 + (k % 4) * 8;
  return [a, pa, { x: midX, y: pa.y }, { x: midX, y: pb.y }, pb, b];
}

// наконечник НШВИ (втулочный, с изолированным манжетом)
function Ferrule({ at, to, sleeve }: { at: Pt; to: Pt; sleeve: string }) {
  const ang = (Math.atan2(to.y - at.y, to.x - at.x) * 180) / Math.PI;
  return (
    <g transform={`translate(${at.x} ${at.y}) rotate(${ang})`} pointerEvents="none">
      <rect x={-2} y={-4} width={13} height={8} rx={1.5} fill="#c3ccd9" stroke="#7b8798" strokeWidth={0.8} />
      <rect x={-1} y={-4} width={3} height={8} fill="#9aa6b6" opacity={0.7} />
      <rect x={11} y={-5.5} width={11} height={11} rx={2.5} fill={sleeve} stroke="rgba(0,0,0,0.35)" strokeWidth={0.9} />
      <rect x={12.5} y={-3.5} width={2} height={7} rx={1} fill="rgba(255,255,255,0.35)" />
    </g>
  );
}

// цвет манжеты НШВИ по сечению жилы (стандарт DIN 46228-4)
const SLEEVE_BY_COLOR: Record<WireColor, string> = {
  brown: '#2b3440', // 1,5 мм² — чёрный
  blue: '#1d4ed8',  // 2,5 мм² — синий
  pe: '#e0b400',    // 6 мм² — жёлтый
};

function Wire({
  a,
  b,
  color,
  live,
  seed,
  onRemove,
}: {
  a: TermInfo;
  b: TermInfo;
  color: WireColor;
  live: boolean;
  seed: number;
  onRemove?: () => void;
}) {
  const pts = useMemo(() => routeWire(a, b, seed), [a, b, seed]);
  const d = useMemo(() => roundedPath(pts), [pts]);
  const meta = WIRE_META[color];
  return (
    <g className={`wire-group ${live ? 'wire-live' : ''}`}>
      <path d={d} fill="none" stroke="transparent" strokeWidth={20} className="wire-hit" onClick={onRemove} />
      <path d={d} fill="none" stroke="#080d15" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" className="wire-casing" style={{ transition: 'stroke .15s' }} />
      <path d={d} fill="none" stroke={meta.hex} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${meta.hex}66)` }} />
      {meta.hex2 && <path d={d} fill="none" stroke={meta.hex2} strokeWidth={6} strokeLinecap="round" strokeDasharray="9 9" strokeDashoffset={5} />}
      {live && <path d={d} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" strokeDasharray="4 22" className="wire-flow" />}
      <Ferrule at={pts[0]} to={pts[1]} sleeve={SLEEVE_BY_COLOR[color]} />
      <Ferrule at={pts[pts.length - 1]} to={pts[pts.length - 2]} sleeve={SLEEVE_BY_COLOR[color]} />
    </g>
  );
}

// внутренняя проводимость аппаратов: какие клеммы связаны при включённом состоянии
function conductionPairs(type: string, on: boolean): Array<[string, string]> {
  switch (type) {
    case 'breaker':
      return on ? [['top', 'bot']] : [];
    case 'breaker2p':
      return on ? [['Lin', 'Lout'], ['Nin', 'Nout']] : [];
    case 'breaker3p':
      return on ? [['t1', 'b1'], ['t2', 'b2'], ['t3', 'b3']] : [];
    case 'rcd':
    case 'dif':
      return on ? [['Lin', 'Lout'], ['Nin', 'Nout']] : [];
    case 'vrn':
    case 'evbox':
      return on ? [['Lin', 'Lout']] : [];
    case 'contactor':
      return on ? [['p1', 'p2']] : [];
    case 'meter':
      return [['in1', 'out1'], ['in3', 'out3']];
    case 'thermostat':
      return on ? [['Lin', 'Lout'], ['Nin', 'Nout']] : [];
    case 'pir':
      return on ? [['Lin', 'Lout']] : [];
    case 'switch':
      return on ? [['in', 'out']] : [];
    case 'switch2':
      return on ? [['com', 'o1'], ['com', 'o2']] : [];
    case 'dimmer':
      return on ? [['com', 'out']] : [];
    case 'switchP':
      return on ? [['com', 't1']] : [['com', 't2']];
    case 'switchX':
      return on ? [['a', 'c'], ['b', 'd']] : [['a', 'd'], ['b', 'c']];
    default:
      return [];
  }
}

const TOGGLEABLE = new Set([
  'breaker', 'breaker2p', 'breaker3p', 'rcd', 'dif', 'vrn', 'contactor',
  'switch', 'switch2', 'switchP', 'switchX', 'dimmer', 'thermostat', 'pir',
]);

const LOADS = new Set(['lamp', 'lamp2', 'lampS', 'socket', 'stove', 'washer', 'oven', 'ac', 'boiler', 'floorheat', 'ev']);

// подсказки при наведении на аппарат
const DEVICE_TIPS: Record<string, { name: string; tip: string }> = {
  cable: { name: 'Вводной кабель', tip: 'Три жилы: коричневая — фаза (L), синяя — ноль (N), жёлто-зелёная — земля (PE).' },
  hub: { name: 'Клеммник', tip: 'Все провода в одном клеммнике электрически соединены между собой.' },
  busN: { name: 'Шина N', tip: 'Собирает рабочие нули. У каждого УЗО должна быть своя шина N.' },
  busPE: { name: 'Шина PE', tip: 'Собирает защитные проводники. Земля не проходит ни через один аппарат.' },
  comb: { name: 'Гребёнка', tip: 'Медная шина-расчёска: раздаёт фазу по ряду автоматов без перемычек.' },
  cross: { name: 'Кросс-модуль', tip: 'Изолированные шины L и N: распределяет питание между рядами щита.' },
  breaker: { name: 'Автоматический выключатель', tip: 'Защищает кабель от КЗ и перегрузки. Питание — сверху, нагрузка — снизу.' },
  breaker2p: { name: 'Двухполюсный автомат', tip: 'Разрывает и фазу, и ноль. Ставится на вводе и мокрых линиях.' },
  breaker3p: { name: 'Трёхполюсный автомат', tip: 'Отключает все три фазы одновременно. Для сетей 380 В.' },
  rcd: { name: 'УЗО', tip: 'Ловит утечку тока (10–30 мА) и защищает человека. Через него идут фаза и ноль, земля — мимо.' },
  dif: { name: 'Дифавтомат', tip: 'Автомат и УЗО в одном корпусе: КЗ, перегрузка и утечка.' },
  vrn: { name: 'Реле напряжения', tip: 'Отключает нагрузку при выходе за 170–250 В. Защита от обрыва нуля.' },
  uzip: { name: 'УЗИП', tip: 'Стравливает грозовой импульс на землю. Подключается отводами.' },
  meter: { name: 'Счётчик', tip: 'Учёт энергии. Клеммы: 1 — фаза вход, 2 — выход, 3 — ноль вход, 4 — выход.' },
  contactor: { name: 'Контактор', tip: 'Катушка A1–A2 замыкает силовые контакты 1–2. Мощная нагрузка от слабого сигнала.' },
  switch: { name: 'Выключатель', tip: 'Ставится ТОЛЬКО в разрыв фазы, чтобы патрон лампы был обесточен.' },
  switch2: { name: 'Двухклавишный выключатель', tip: 'Общий вход фазы и два выхода — на две группы ламп.' },
  switchP: { name: 'Проходной выключатель', tip: 'Общий контакт и два «бегунка». Управление светом из двух мест.' },
  switchX: { name: 'Перекрёстный выключатель', tip: 'Меняет местами пары бегунков — добавляет третью точку управления.' },
  dimmer: { name: 'Диммер', tip: 'Плавно регулирует яркость. Только для диммируемых ламп.' },
  pir: { name: 'Датчик движения', tip: 'Нужны фаза и ноль для питания электроники, выход L′ — на лампу.' },
  thermostat: { name: 'Терморегулятор', tip: 'L/N — питание, L′/N′ — выход на нагревательный мат.' },
  lamp: { name: 'Светильник', tip: 'Загорается, когда на нём есть и фаза, и ноль.' },
  lamp2: { name: 'Люстра', tip: 'Две группы ламп, общий ноль и два фазных провода.' },
  lampS: { name: 'Светильник', tip: 'Загорается при наличии фазы и нуля.' },
  socket: { name: 'Розетка', tip: 'Фаза, ноль и обязательно заземление на боковые лепестки.' },
  stove: { name: 'Варочная панель', tip: '7 кВт ≈ 32 А: кабель 6 мм² и автомат C32.' },
  ev: { name: 'Зарядная станция', tip: '7,4 кВт непрерывно: кабель 6 мм², C40 и УЗО типа A.' },
  boiler: { name: 'Бойлер', tip: 'ТЭН в воде — обязательна защита 10 мА и заземление корпуса.' },
  washer: { name: 'Стиральная машина', tip: 'Мокрая зона: отдельная линия с дифавтоматом 10 мА.' },
  oven: { name: 'Духовой шкаф', tip: '3–3,5 кВт: отдельная линия 2,5 мм² под автомат C16.' },
  ac: { name: 'Кондиционер', tip: 'Компрессор даёт пусковые токи — отдельная линия и дифавтомат.' },
  floorheat: { name: 'Нагревательный мат', tip: 'Питается через терморегулятор, экран заземляется.' },
  evbox: { name: 'Балансировщик мощности', tip: 'Делит доступный лимит мощности между зарядными станциями.' },
};

export default function Game({
  level,
  onExit,
  onFinished,
  onNext,
  isLast,
  totalLevels,
}: {
  level: LevelDef;
  onExit: () => void;
  onFinished: (levelId: number, stars: number) => void;
  onNext: () => void;
  isLast: boolean;
  totalLevels: number;
}) {
  const termMap = useMemo(() => {
    const m = new Map<string, TermInfo>();
    level.devices.forEach((d) =>
      d.terminals.forEach((t) =>
        m.set(`${d.id}:${t.key}`, {
          id: `${d.id}:${t.key}`,
          deviceId: d.id,
          deviceType: d.type,
          x: d.x + t.dx,
          y: d.y + t.dy,
          dx: t.dx,
          dy: t.dy,
          label: t.label,
          net: t.net,
        }),
      ),
    );
    return m;
  }, [level]);

  // ---- авторазмер холста под контент уровня ----
  const view = useMemo(() => {
    let minX = 1e9;
    let minY = 1e9;
    let maxX = -1e9;
    let maxY = -1e9;
    const add = (x: number, y: number) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    };
    level.devices.forEach((d) => {
      add(d.x - 130, d.y - 130);
      add(d.x + 130, d.y + 140);
      d.terminals.forEach((t) => add(d.x + t.dx, d.y + t.dy));
    });
    level.decor.forEach((r) => {
      add(r.x - 20, r.y - 20);
      add(r.x + r.w + 20, r.y + r.h + 20);
    });
    minX = Math.min(minX, 0);
    minY = Math.min(minY, 0);
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }, [level]);

  const netsById = useMemo(() => new Map(level.nets.map((n) => [n.id, n])), [level]);
  const netTerminals = useCallback((netId: string) => [...termMap.values()].filter((t) => t.net === netId).map((t) => t.id), [termMap]);

  const initParent = useCallback(() => {
    const p: Record<string, string> = {};
    termMap.forEach((t) => (p[t.id] = t.id));
    level.devices.forEach((d) => {
      if (d.type === 'hub' || d.type === 'busN' || d.type === 'busPE' || d.type === 'comb') {
        const ids = d.terminals.map((t) => `${d.id}:${t.key}`);
        for (let i = 1; i < ids.length; i++) p[ufFind(p, ids[i])] = ufFind(p, ids[0]);
      }
      if (d.type === 'cross') {
        const groups: Record<string, string[]> = {};
        d.terminals.forEach((t) => {
          const g = t.key.replace(/[0-9]/g, '');
          (groups[g] = groups[g] ?? []).push(`${d.id}:${t.key}`);
        });
        Object.values(groups).forEach((ids) => {
          for (let i = 1; i < ids.length; i++) p[ufFind(p, ids[i])] = ufFind(p, ids[0]);
        });
      }
    });
    level.bonds?.forEach(([a, b]) => {
      if (p[a] && p[b]) p[ufFind(p, a)] = ufFind(p, b);
    });
    return p;
  }, [termMap, level]);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [parent, setParent] = useState<Record<string, string>>(initParent);
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<{ a: string; b: string } | null>(null);
  const [popup, setPopup] = useState<PopupMsg | null>(null);
  const [hint, setHint] = useState<{ a: string; b: string; text: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [powered, setPowered] = useState(false);
  const [done, setDone] = useState(false);
  const [showTheory, setShowTheory] = useState(true);
  const [showGlossary, setShowGlossary] = useState(false);
  const [mouse, setMouse] = useState<Pt | null>(null);
  const [flash, setFlash] = useState<{ x: number; y: number; k: number } | null>(null);
  const [litDevices, setLitDevices] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pt>({ x: 0, y: 0 });
  const [deviceOn, setDeviceOn] = useState<Record<string, boolean>>({});
  const [explore, setExplore] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [meterMode, setMeterMode] = useState(false);
  const [probeA, setProbeA] = useState<string | null>(null);
  const [meterRead, setMeterRead] = useState<{ v: string; note: string } | null>(null);
  const dragRef = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const connId = useRef(0);
  const finishedRef = useRef(false);

  const stars = mistakes === 0 && hintsUsed === 0 ? 3 : mistakes + hintsUsed <= 3 ? 2 : 1;

  const netDone = useCallback(
    (p: Record<string, string>, netId: string) => {
      const ids = netTerminals(netId);
      if (ids.length <= 1) return true;
      const c = { ...p };
      const r = ufFind(c, ids[0]);
      return ids.every((id) => ufFind(c, id) === r);
    },
    [netTerminals],
  );

  const fail = (title: string, body: string, tone: PopupMsg['tone'] = 'danger') => {
    setMistakes((m) => m + 1);
    setPopup({ title, body, tone });
    sfx.error();
  };

  const connect = (aId: string, bId: string, color: WireColor) => {
    const a = termMap.get(aId)!;
    const b = termMap.get(bId)!;
    const netA = a.net ? netsById.get(a.net) : undefined;
    const netB = b.net ? netsById.get(b.net) : undefined;

    if (connections.some((c) => (c.a === aId && c.b === bId) || (c.a === bId && c.b === aId))) {
      setPopup({ title: 'Уже соединено', body: 'Между этими клеммами уже есть провод. Нажмите на провод, чтобы убрать его.', tone: 'info' });
      sfx.click();
      return;
    }

    if (netA && netB && netA.id === netB.id) {
      const p0 = { ...parent };
      if (ufFind(p0, aId) === ufFind(p0, bId)) {
        setPopup({ title: 'Лишний провод', body: 'Эти клеммы уже связаны между собой (через шину, гребёнку или клеммник). Дополнительный провод не нужен.', tone: 'info' });
        sfx.click();
        return;
      }
      const need = NET_WIRE_COLOR[netA.type];
      if (color !== need) {
        const texts: Record<NetType, string> = {
          L: 'Фазу ведут коричневым проводом (в старых схемах — чёрным или белым). Синий и жёлто-зелёный для фазы использовать запрещено.',
          N: 'Нулевой рабочий проводник — только СИНИЙ. Это жёсткое требование цветовой маркировки.',
          PE: 'Заземление — только ЖЁЛТО-ЗЕЛЁНЫЙ, и никакой другой цвет для него недопустим.',
        };
        fail('Цвет не соответствует цепи', texts[netA.type], 'warn');
        return;
      }
      const p = { ...parent };
      p[ufFind(p, aId)] = ufFind(p, bId);
      setParent(p);
      setConnections((cs) => [...cs, { id: ++connId.current, a: aId, b: bId, color }]);
      setHint(null);
      sfx.spark();
      setFlash({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, k: Date.now() });
      setLitDevices((s) => new Set([...s, a.deviceId, b.deviceId]));
      setTimeout(() => setLitDevices((s) => {
        const n = new Set(s);
        n.delete(a.deviceId);
        n.delete(b.deviceId);
        return n;
      }), 700);

      if (level.nets.every((n) => netDone(p, n.id)) && !finishedRef.current) {
        finishedRef.current = true;
        setTimeout(() => {
          setPowered(true);
          sfx.powerOn();
        }, 450);
        setTimeout(() => {
          setDone(true);
          sfx.success();
          onFinished(level.id, mistakes === 0 && hintsUsed === 0 ? 3 : mistakes + hintsUsed <= 3 ? 2 : 1);
        }, 1700);
      }
      return;
    }

    if (!netA || !netB) {
      setMistakes((m) => m + 1);
      setPopup({ title: 'Клемма не задействована', body: level.spareTip ?? 'Эта клемма в данной схеме не используется.', tone: 'warn' });
      sfx.error();
      return;
    }

    const ta = netA.type;
    const tb = netB.type;
    if (ta === tb) {
      fail('Разные участки цепи', level.crossTip ?? 'Обе точки — одна полярность, но разные участки схемы. Соединив их, вы нарушите работу защиты.', 'warn');
      return;
    }
    const pair = new Set([ta, tb]);
    if (pair.has('L') && pair.has('N')) {
      fail('Короткое замыкание!', 'Фаза соединена с нулём напрямую. Ток вырастет в десятки раз: искры, оплавленная изоляция, пожар. Фаза и ноль встречаются только внутри нагрузки.');
    } else if (pair.has('L') && pair.has('PE')) {
      fail('Фаза на земле!', 'Фаза, попавшая на заземление или корпус прибора, делает его смертельно опасным. Именно такую утечку ловит УЗО. Земля — только для защиты.');
    } else {
      fail('Ноль с землёй соединять нельзя', 'Нулевой рабочий (N) и защитный (PE) проводники объединяют только в главной заземляющей шине здания. В квартире это даст потенциал на корпусах и ложные срабатывания УЗО.');
    }
  };

  const measureAt = (id: string) => {
    const pot = (t: string) => (energy.L.has(t) ? 'L' : energy.N.has(t) ? 'N' : termMap.get(t)?.net && netsById.get(termMap.get(t)!.net!)?.type === 'PE' ? 'PE' : '0');
    if (!probeA) {
      setProbeA(id);
      setMeterRead({ v: '– – –', note: 'Первый щуп установлен. Коснитесь второй точки.' });
      sfx.select();
      return;
    }
    if (probeA === id) {
      setProbeA(null);
      setMeterRead(null);
      return;
    }
    const a = pot(probeA);
    const b = pot(id);
    const pair = [a, b].sort().join('');
    let v = '0.0 В';
    let note = 'Разности потенциалов нет — обе точки в одной цепи.';
    if (pair === 'LN' || pair === 'LPE') {
      v = '230 В';
      note = a === 'L' || b === 'L' ? 'Есть напряжение: одна точка под фазой, вторая — ноль или земля.' : '';
    } else if (pair === 'L0' || pair === '0L') {
      v = '0.0 В';
      note = 'Вторая точка обесточена: выше по цепи разомкнут аппарат.';
    } else if (pair === 'NPE') {
      v = '0.0 В';
      note = 'N и PE в исправной системе показывают около нуля — это норма.';
    } else if (a === 'L' && b === 'L') {
      v = '0.0 В';
      note = 'Обе точки под одной фазой — разности потенциалов нет.';
    }
    setMeterRead({ v, note });
    setProbeA(null);
    sfx.click();
  };

  const onTerminalClick = (id: string) => {
    if (meterMode) {
      measureAt(id);
      return;
    }
    if (done || popup) return;
    if (!selected) {
      setSelected(id);
      sfx.select();
      return;
    }
    if (selected === id) {
      setSelected(null);
      sfx.click();
      return;
    }
    setPending({ a: selected, b: id });
    setSelected(null);
    sfx.select();
  };

  const pickColor = (color: WireColor) => {
    if (!pending) return;
    connect(pending.a, pending.b, color);
    setPending(null);
  };

  const removeConnection = (c: Connection) => {
    if (done) return;
    const rest = connections.filter((x) => x.id !== c.id);
    setConnections(rest);
    const p = initParent();
    rest.forEach((x) => {
      p[ufFind(p, x.a)] = ufFind(p, x.b);
    });
    setParent(p);
    sfx.remove();
  };

  const useHint = () => {
    if (done) return;
    for (const net of level.nets) {
      if (!netDone(parent, net.id)) {
        const ids = netTerminals(net.id);
        const groups = new Map<string, string[]>();
        ids.forEach((id) => {
          const r = ufFind({ ...parent }, id);
          groups.set(r, [...(groups.get(r) ?? []), id]);
        });
        const gs = [...groups.values()].sort((x, y) => y.length - x.length);
        const from = gs[0][0];
        const rest = gs.slice(1).flat();
        const a = termMap.get(from)!;
        let best = rest[0];
        let bestD = Infinity;
        rest.forEach((id) => {
          const t = termMap.get(id)!;
          const dd = (t.x - a.x) ** 2 + (t.y - a.y) ** 2;
          if (dd < bestD) {
            bestD = dd;
            best = id;
          }
        });
        setHint({ a: from, b: best, text: net.hint });
        setHintsUsed((h) => h + 1);
        sfx.select();
        return;
      }
    }
  };

  const reset = () => {
    setConnections([]);
    setParent(initParent());
    setSelected(null);
    setPending(null);
    setHint(null);
    setPopup(null);
    setMistakes(0);
    setHintsUsed(0);
    setPowered(false);
    setDone(false);
    finishedRef.current = false;
    sfx.click();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelected(null);
        setPending(null);
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setSpaceHeld(true);
      }
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(2.6, z + 0.15));
      if (e.key === '-') setZoom((z) => Math.max(0.5, z - 0.15));
      if (e.key === '0') {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpaceHeld(false);
        dragRef.current = null;
      }
    };
    const onBlur = () => {
      setSpaceHeld(false);
      dragRef.current = null;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const isOn = useCallback((id: string) => deviceOn[id] !== false, [deviceOn]);

  // ---- симуляция протекания тока ----
  const energy = useMemo(() => {
    const adj = new Map<string, string[]>();
    const link = (a: string, b: string) => {
      if (!termMap.has(a) || !termMap.has(b)) return;
      adj.set(a, [...(adj.get(a) ?? []), b]);
      adj.set(b, [...(adj.get(b) ?? []), a]);
    };
    connections.forEach((c) => link(c.a, c.b));
    level.bonds?.forEach(([a, b]) => link(a, b));
    level.devices.forEach((d) => {
      if (d.type === 'hub' || d.type === 'busN' || d.type === 'busPE' || d.type === 'comb') {
        const ids = d.terminals.map((t) => `${d.id}:${t.key}`);
        for (let i = 1; i < ids.length; i++) link(ids[0], ids[i]);
      } else if (d.type === 'cross') {
        const groups: Record<string, string[]> = {};
        d.terminals.forEach((t) => {
          const g = t.key.replace(/[0-9]/g, '');
          (groups[g] = groups[g] ?? []).push(`${d.id}:${t.key}`);
        });
        Object.values(groups).forEach((ids) => {
          for (let i = 1; i < ids.length; i++) link(ids[0], ids[i]);
        });
      } else {
        conductionPairs(d.type, isOn(d.id)).forEach(([x, y]) => link(`${d.id}:${x}`, `${d.id}:${y}`));
      }
    });

    const bfs = (starts: string[]) => {
      const seen = new Set<string>(starts.filter((s) => termMap.has(s)));
      const q = [...seen];
      while (q.length) {
        const cur = q.shift()!;
        (adj.get(cur) ?? []).forEach((n) => {
          if (!seen.has(n)) {
            seen.add(n);
            q.push(n);
          }
        });
      }
      return seen;
    };

    const src = (pred: (k: string) => boolean) =>
      level.devices
        .filter((d) => d.type === 'cable')
        .flatMap((d) => d.terminals.filter((t) => pred(t.key)).map((t) => `${d.id}:${t.key}`));

    return {
      L: bfs(src((k) => k.startsWith('L'))),
      N: bfs(src((k) => k === 'N')),
    };
  }, [connections, level, termMap, isOn]);

  const deviceState = useCallback(
    (deviceId: string, type: string) => {
      if (!powered) return false;
      const ids = level.devices.find((d) => d.id === deviceId)!.terminals.map((t) => `${deviceId}:${t.key}`);
      const hasL = ids.some((i) => energy.L.has(i));
      const hasN = ids.some((i) => energy.N.has(i));
      if (LOADS.has(type)) return hasL && hasN && isOn(deviceId);
      if (type === 'cable' || type === 'busPE') return true;
      if (type === 'busN') return hasN;
      return hasL;
    },
    [powered, energy, level, isOn],
  );

  const toggleDevice = (id: string, type: string, label?: string) => {
    if (!TOGGLEABLE.has(type)) return;
    setDeviceOn((s) => {
      const next = s[id] === false;
      setToast(`${label ?? 'Аппарат'}: ${next ? 'ВКЛЮЧЕН' : 'ОТКЛЮЧЕН'}`);
      return { ...s, [id]: next };
    });
    sfx.click();
  };

  const testRcd = (id: string, label?: string) => {
    setDeviceOn((s) => ({ ...s, [id]: false }));
    setToast(`${label ?? 'УЗО'}: кнопка «Тест» — аппарат сработал и отключил линию. Так проверяют исправность раз в месяц.`);
    sfx.error();
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const baseParent = useMemo(() => initParent(), [initParent]);
  const totalConns = useMemo(() => {
    let total = 0;
    level.nets.forEach((n) => {
      const ids = netTerminals(n.id);
      if (ids.length <= 1) return;
      const roots = new Set(ids.map((id) => ufFind({ ...baseParent }, id)));
      total += roots.size - 1;
    });
    return total;
  }, [level, baseParent, netTerminals]);
  const progress = totalConns === 0 ? 0 : Math.min(1, connections.length / totalConns);

  // экранные координаты (для всплывашек)
  const toPx = (x: number, y: number) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    const sx = ((x - view.x) / view.w) * r.width;
    const sy = ((y - view.y) / view.h) * r.height;
    return { x: sx * zoom + pan.x, y: sy * zoom + pan.y };
  };

  const svgPoint = (clientX: number, clientY: number) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    const lx = (clientX - r.left - pan.x) / zoom;
    const ly = (clientY - r.top - pan.y) / zoom;
    return { x: view.x + (lx / r.width) * view.w, y: view.y + (ly / r.height) * view.h };
  };

  const pendingMid = pending
    ? (() => {
        const a = termMap.get(pending.a)!;
        const b = termMap.get(pending.b)!;
        return toPx((a.x + b.x) / 2, (a.y + b.y) / 2);
      })()
    : null;

  const toneStyle = {
    danger: { border: 'border-red-500/40', icon: <ZapOff className="h-6 w-6 text-red-400" />, bg: 'bg-red-500/10' },
    warn: { border: 'border-amber-500/40', icon: <AlertTriangle className="h-6 w-6 text-amber-400" />, bg: 'bg-amber-500/10' },
    info: { border: 'border-sky-500/40', icon: <Info className="h-6 w-6 text-sky-400" />, bg: 'bg-sky-500/10' },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#070b12] blueprint">
      <header className="mx-auto w-full max-w-[1600px] px-2 pt-2 pl-16">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="flex items-center gap-1.5 rounded-xl border border-line bg-panel px-2.5 py-2 text-sm font-bold text-slate-300 transition hover:border-volt/50 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Меню</span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-volt px-1.5 py-0.5 font-display text-[10px] tracking-wide text-black">{level.tag}</span>
              <span className="font-mono text-[10px] text-slate-500">{level.id}/{totalLevels}</span>
            </div>
            <h1 className="truncate font-display text-[15px] text-white sm:text-lg">{level.title}</h1>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-line bg-panel px-2 py-1.5 text-xs">
            <XCircle className="h-3.5 w-3.5 text-red-400" />
            <span className="font-mono font-bold text-slate-200">{mistakes}</span>
          </div>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <div className="flex items-center gap-0.5 rounded-xl border border-line bg-panel p-0.5">
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))} className="rounded-md p-1.5 text-slate-300 hover:bg-white/5" aria-label="−">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center font-mono text-[10px] text-slate-400">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(2.6, z + 0.15))} className="rounded-md p-1.5 text-slate-300 hover:bg-white/5" aria-label="+">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="rounded-md p-1.5 text-slate-300 hover:bg-white/5" aria-label="reset">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <Tip text="Теория урока">
            <button onClick={() => setShowTheory(true)} className="flex items-center gap-1 rounded-xl border border-line bg-panel px-2 py-1.5 text-xs font-bold text-slate-300 hover:border-sky-400/60">
              <BookOpen className="h-3.5 w-3.5 text-sky-400" />
              <span className="hidden sm:inline">Теория</span>
            </button>
          </Tip>
          <Tip text="Справочник L/N/PE">
            <button onClick={() => setShowGlossary(true)} className="flex items-center gap-1 rounded-xl border border-sky-500/40 bg-sky-500/10 px-2 py-1.5 text-xs font-bold text-sky-300">
              <HelpCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">L/N/PE</span>
            </button>
          </Tip>
          <button onClick={useHint} className="flex items-center gap-1 rounded-xl border border-volt/40 bg-volt/10 px-2 py-1.5 text-xs font-bold text-volt">
            <Lightbulb className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Подсказка</span>
          </button>
          <button onClick={reset} className="rounded-xl border border-line bg-panel p-1.5 text-slate-300 hover:border-volt/50" aria-label="reset">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <TgBadge compact />
        </div>
      </header>

      <p className="mx-auto mt-1 w-full max-w-[1600px] px-3 text-[12px] text-slate-400">{level.goal}</p>

      <div key={`m${mistakes}`} className={`flex-1 ${mistakes > 0 ? 'shake' : ''}`}>
        <div
          ref={wrapRef}
          className="relative mx-auto mt-2 w-full max-w-[1600px] flex-1 select-none overflow-hidden rounded-2xl border border-line bg-[#0a101b]/90 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]"
          style={{ height: 'min(65vh, 780px)', cursor: spaceHeld ? (dragRef.current ? 'grabbing' : 'grab') : meterMode ? 'crosshair' : 'default' }}
          onWheel={(e) => {
            const dz = e.deltaY > 0 ? -0.12 : 0.12;
            setZoom((z) => Math.max(0.5, Math.min(2.6, z + dz)));
          }}
          onContextMenu={(e) => e.preventDefault()}
          onMouseDown={(e) => {
            // панорама: пробел + ЛКМ, средняя кнопка или ПКМ
            if (!(spaceHeld || e.button === 1 || e.button === 2)) return;
            e.preventDefault();
            dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false };
          }}
          onMouseMove={(e) => {
            const d = dragRef.current;
            if (d) {
              const dx = e.clientX - d.x;
              const dy = e.clientY - d.y;
              if (Math.abs(dx) + Math.abs(dy) > 4) {
                d.moved = true;
                setPan({ x: d.px + dx, y: d.py + dy });
              }
            }
            setMouse(svgPoint(e.clientX, e.clientY));
          }}
          onMouseUp={() => {
            dragRef.current = null;
          }}
          onClick={() => {
            if (spaceHeld) return;
            setSelected(null);
            setPending(null);
          }}
          onMouseLeave={() => {
            dragRef.current = null;
            setMouse(null);
          }}
        >
          {mistakes > 0 && <div key={`f${mistakes}`} className="flash-red pointer-events-none absolute inset-0 z-20 bg-red-600/45" />}

          <div className="absolute inset-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
            <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} className="h-full w-full" style={{ width: '100%', height: '100%' }}>
              <SvgDefs />

              {level.decor.map((r, i) => (
                <g key={i}>
                  <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={16} fill="rgba(96,128,180,0.045)" stroke="#33465f" strokeWidth={2} strokeDasharray="10 8" />
                  {r.label && (
                    <text x={r.x + 18} y={r.y + 28} fontSize={14} fontWeight={700} fill="#54688c" fontFamily="'JetBrains Mono', monospace" letterSpacing={2}>
                      {r.label.toUpperCase()}
                    </text>
                  )}
                  {(r.rails ?? (r.rail && r.railY ? [r.railY] : [])).map((ry, j) => (
                    <g key={j}>
                      <rect x={r.x + 30} y={ry - 9} width={r.w - 60} height={18} rx={4} fill="#4b5b74" stroke="#2c3a55" strokeWidth={1.5} />
                      <line x1={r.x + 42} y1={ry} x2={r.x + r.w - 42} y2={ry} stroke="#26334c" strokeWidth={3} strokeDasharray="6 14" />
                      {/* торцевые заглушки-ограничители DIN-рейки */}
                      <rect x={r.x + 24} y={ry - 20} width={12} height={40} rx={3} fill="#8b98ad" stroke="#5b6577" strokeWidth={1.5} />
                      <rect x={r.x + r.w - 36} y={ry - 20} width={12} height={40} rx={3} fill="#8b98ad" stroke="#5b6577" strokeWidth={1.5} />
                    </g>
                  ))}
                </g>
              ))}

              {/* провода — под аппаратами, чтобы ничего не перекрывать */}
              {connections.map((c, i) => (
                <Wire key={c.id} a={termMap.get(c.a)!} b={termMap.get(c.b)!} color={c.color} live={powered} seed={i} onRemove={() => removeConnection(c)} />
              ))}

              {level.devices.map((d) => {
                const isLive = deviceState(d.id, d.type);
                const clickable = powered && TOGGLEABLE.has(d.type);
                return (
                  <g key={d.id} style={litDevices.has(d.id) ? { filter: 'drop-shadow(0 0 14px rgba(255,196,46,0.85))' } : undefined}>
                    <title>
                      {`${d.label ?? DEVICE_TIPS[d.type]?.name ?? 'Аппарат'}${d.sublabel ? ` · ${d.sublabel}` : ''}\n${DEVICE_TIPS[d.type]?.tip ?? ''}${clickable ? '\n\nКлик — включить/отключить' : ''}`}
                    </title>
                    {DeviceBody({ d, powered: isLive, on: isOn(d.id) })}
                    {clickable && (
                      <g
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          if (spaceHeld || dragRef.current?.moved || meterMode) return;
                          e.stopPropagation();
                          toggleDevice(d.id, d.type, d.label);
                        }}
                      >
                        <rect x={d.x - 26} y={d.y - 30} width={52} height={56} rx={8} fill="transparent" />
                        <rect x={d.x - 26} y={d.y - 30} width={52} height={56} rx={8} fill="rgba(255,196,46,0.12)" stroke="rgba(255,196,46,0.5)" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.001}>
                          <animate attributeName="opacity" values="0;0.9;0" dur="2.4s" repeatCount="indefinite" />
                        </rect>
                      </g>
                    )}
                    {powered && (d.type === 'rcd' || d.type === 'dif') && (
                      <circle
                        cx={d.x - 22}
                        cy={d.y - 22}
                        r={13}
                        fill="transparent"
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          if (spaceHeld || dragRef.current?.moved || meterMode) return;
                          e.stopPropagation();
                          testRcd(d.id, d.label);
                        }}
                      />
                    )}
                  </g>
                );
              })}

              {selected && mouse && !pending && (
                <path d={roundedPath(routeWire(termMap.get(selected)!, { ...termMap.get(selected)!, x: mouse.x, y: mouse.y, dx: 0, dy: 1, deviceType: 'x' } as TermInfo, 0))} fill="none" stroke="#ffc42e" strokeWidth={3.5} strokeDasharray="2 9" strokeLinecap="round" opacity={0.85} />
              )}

              {[...termMap.values()].map((t) => {
                const isSel = selected === t.id;
                const isHint = hint && (hint.a === t.id || hint.b === t.id);
                const isCable = t.deviceType === 'cable';
                const onBody = ['breaker', 'breaker2p', 'breaker3p', 'rcd', 'dif', 'vrn', 'uzip', 'contactor', 'evbox', 'cross'].includes(t.deviceType) && t.dy > 0;
                // подписи нижних клемм модулей выносим влево от кружка, чтобы не наезжать на табличку номинала
                const lx = isCable ? t.x - 18 : onBody ? t.x - 19 : t.x;
                const ly = isCable ? t.y + 5 : onBody ? t.y + 5 : t.dy > 0 ? t.y + 26 : t.y - 17;
                return (
                  <g
                    key={t.id}
                    className={`term ${isSel ? 'active' : ''} ${isHint ? 'hinted' : ''}`}
                    onClick={(e) => {
                      if (spaceHeld || dragRef.current?.moved) return;
                      e.stopPropagation();
                      onTerminalClick(t.id);
                    }}
                  >
                    <title>
                      {`Клемма ${t.label ?? ''} · ${t.net ? netsById.get(t.net)?.name ?? '' : 'не используется'}\n${
                        t.net ? { L: 'Фаза — коричневый провод', N: 'Ноль — синий провод', PE: 'Земля — жёлто-зелёный' }[netsById.get(t.net)!.type] : 'В этой схеме клемма свободна'
                      }`}
                    </title>
                    <circle cx={t.x} cy={t.y} r={15} fill="transparent" />
                    {probeA === t.id && <circle cx={t.x} cy={t.y} r={17} fill="none" stroke="#4ade80" strokeWidth={3} />}
                    <circle className="term-ring" cx={t.x} cy={t.y} r={11.5} fill="#0b1220" stroke="#5b6b8c" strokeWidth={2.5} />
                    <circle cx={t.x} cy={t.y} r={4.5} fill="#93a5c4" />
                    {t.label && (
                      <text x={lx} y={ly} textAnchor={isCable || onBody ? 'end' : 'middle'} fontSize={12.5} fontWeight={700} fill="#8ba2c9" fontFamily="'JetBrains Mono', monospace" pointerEvents="none" stroke="#070d16" strokeWidth={3} paintOrder="stroke">
                        {t.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {flash && (
                <g key={flash.k} className="pop-in" pointerEvents="none">
                  <circle cx={flash.x} cy={flash.y} r={20} fill="none" stroke="#ffc42e" strokeWidth={3} opacity={0.9}>
                    <animate attributeName="r" from="8" to="44" dur="0.6s" fill="freeze" />
                    <animate attributeName="opacity" from="0.9" to="0" dur="0.6s" fill="freeze" />
                  </circle>
                </g>
              )}
            </svg>
          </div>

          {pending && pendingMid && (
            <div
              className="pop-in absolute z-30 -translate-x-1/2 -translate-y-[120%] rounded-2xl border border-line bg-[#0e1624]/95 p-3 shadow-2xl backdrop-blur"
              style={{
                left: Math.min(Math.max(pendingMid.x, 150), (wrapRef.current?.getBoundingClientRect().width ?? 800) - 150),
                top: Math.max(pendingMid.y, 150),
              }}
            >
              <div className="mb-2 text-center font-mono text-[11px] tracking-wider text-slate-400">КАКИМ ПРОВОДОМ?</div>
              <div className="flex gap-2">
                {(Object.keys(WIRE_META) as WireColor[]).map((c) => {
                  const m = WIRE_META[c];
                  return (
                    <button
                      key={c}
                      onClick={(e) => {
                        e.stopPropagation();
                        pickColor(c);
                      }}
                      className="group flex flex-col items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 transition hover:border-volt/50 hover:bg-white/5"
                    >
                      <span className="h-3.5 w-10 rounded-full" style={{ background: m.hex2 ? `repeating-linear-gradient(45deg, ${m.hex} 0 5px, ${m.hex2} 5px 10px)` : m.hex, boxShadow: `0 0 8px ${m.hex}66` }} />
                      <span className="text-[11px] font-bold text-slate-300">{c === 'brown' ? 'Фаза' : c === 'blue' ? 'Ноль' : 'Земля'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hint && !popup && (
            <div className="pop-in absolute bottom-3 left-1/2 z-30 w-[92%] max-w-xl -translate-x-1/2 rounded-2xl border border-emerald-500/40 bg-[#0c1a14]/95 px-4 py-3 shadow-xl backdrop-blur">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <p className="text-sm leading-snug text-emerald-100">{hint.text}</p>
                <button onMouseUp={() => setHint(null)} className="ml-auto text-emerald-400/60 hover:text-emerald-300">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-[#0a101b]/85 px-2.5 py-1.5 font-mono text-[10px] text-slate-400 backdrop-blur">
            <Crosshair className="h-3.5 w-3.5" />
            колесо — масштаб ·
            <kbd className={`rounded border px-1.5 py-0.5 ${spaceHeld ? 'border-volt bg-volt/20 text-volt' : 'border-line text-slate-400'}`}>ПРОБЕЛ</kbd>
            + мышь или ПКМ — двигать поле
            {meterMode && <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300">режим мультиметра</span>}
          </div>

          {meterMode && (
            <div className="absolute top-3 right-3 z-20 w-64 rounded-2xl border border-emerald-500/40 bg-[#08120d]/95 p-3 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest text-slate-500">MULTIMETER · V~</span>
                <Gauge className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-1 text-center font-display text-3xl text-emerald-300">{meterRead?.v ?? '– – –'}</div>
              <p className="mt-1 text-[11px] leading-snug text-slate-400">{meterRead?.note ?? 'Коснитесь щупами двух клемм схемы.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* ---- ОБЯЗАТЕЛЬНАЯ ТЕОРИЯ ПОД ПОЛЕМ ---- */}
      <section className="mx-auto mt-4 w-full max-w-[1600px] px-4">
        <div className="rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/[0.07] to-transparent p-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-2 rounded-lg bg-sky-500/15 px-2.5 py-1 font-display text-[11px] tracking-wide text-sky-300">
              <BookOpen className="h-3.5 w-3.5" /> ТЕОРИЯ К УРОКУ
            </span>
            <span className="text-xs text-slate-500">обязательно к прочтению — простыми словами</span>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {level.theory.map((p, i) => (
              <div key={i} className="reveal rounded-xl border border-line bg-panel/70 p-3.5" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-volt/15 font-mono text-[10px] font-bold text-volt">{i + 1}</span>
                  <span className="font-mono text-[10px] tracking-widest text-slate-600 uppercase">шаг {i + 1}</span>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-300">{p}</p>
              </div>
            ))}
          </div>

          {/* базовая памятка на каждом уроке */}
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {[
              { k: 'L', n: 'Фаза', c: '#c96f2e', t: 'Коричневый провод, на нём 220 В. Опасен. Его и разрывают выключатели и автоматы.' },
              { k: 'N', n: 'Ноль', c: '#3d8bff', t: 'Синий провод — обратный путь тока. Без него прибор не заработает. Рвать нельзя.' },
              { k: 'PE', n: 'Земля', c: '#35c759', t: 'Жёлто-зелёный. Тока не несёт, но спасает жизнь при пробое на корпус.' },
            ].map((g) => (
              <div key={g.k} className="flex items-start gap-2.5 rounded-xl border border-line bg-[#0a101b] p-3">
                <span className="flex h-8 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-extrabold" style={{ background: `${g.c}22`, color: g.c }}>
                  {g.k}
                </span>
                <div>
                  <div className="text-[13px] font-bold text-white">{g.n}</div>
                  <p className="text-[11.5px] leading-snug text-slate-400">{g.t}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-2.5">
            <Zap className="h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-[12.5px] leading-snug text-slate-400">
              Ток течёт по кругу: <b className="text-slate-200">фаза → прибор → ноль</b>. Земля в круге не участвует. Соединяйте только точки одной цепи и следите за цветом провода.
            </p>
            <button onClick={() => setShowGlossary(true)} className="ml-auto rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-[11px] font-bold text-sky-300 transition hover:bg-sky-500/20">
              Открыть справочник
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-3 flex w-full max-w-[1600px] flex-wrap items-center gap-2 px-4 pb-6">
        <span className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
          <MousePointerClick className="h-4 w-4" /> клик по двум клеммам → цвет провода · клик по проводу — убрать
        </span>
        <div className="ml-auto flex max-h-24 flex-wrap gap-2 overflow-y-auto">
          {level.nets.map((n) => {
            const ok = netDone(parent, n.id);
            const meta = WIRE_META[NET_WIRE_COLOR[n.type]];
            return (
                <Tip key={n.id} text={n.hint}>
                  <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition ${ok ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-line bg-panel text-slate-400'}`}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.hex }} />
                    {n.name}
                    {ok && <Check className="h-3.5 w-3.5" />}
                  </span>
                </Tip>
            );
          })}
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-panel">
          <div className={`h-full rounded-full bg-gradient-to-r from-volt-2 to-volt transition-all duration-500 ${progress > 0 ? 'progress-live' : ''}`} style={{ width: `${progress * 100}%` }} />
        </div>
        <MvpNote className="mt-3 w-full" />
      </div>

      {showGlossary && <GlossaryPanel onClose={() => setShowGlossary(false)} />}

      {showTheory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowTheory(false)}>
          <div className="pop-in max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-[#0c1320] p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-volt/15 p-2.5">
                <BookOpen className="h-6 w-6 text-volt" />
              </div>
              <div>
                <div className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Теория · Урок {level.id}</div>
                <h2 className="font-display text-xl text-white">{level.title}</h2>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-slate-300 sm:text-[15px]">
              {level.theory.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-volt/70" />
                  <p>{p}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-line bg-panel p-3 sm:p-4">
              <div className="mb-2 font-mono text-[11px] tracking-widest text-slate-500 uppercase">Маркировка проводов</div>
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <span className="h-3 w-8 rounded-full bg-[#c96f2e]" /> Фаза (L) — коричневый
                </span>
                <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <span className="h-3 w-8 rounded-full bg-[#3d8bff]" /> Ноль (N) — синий
                </span>
                <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <span className="h-3 w-8 rounded-full" style={{ background: 'repeating-linear-gradient(45deg,#35c759 0 5px,#ffd93d 5px 10px)' }} /> Земля (PE)
                </span>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
              <div className="mb-1.5 font-mono text-[11px] tracking-widest text-sky-300 uppercase">Если что-то непонятно</div>
              <p className="text-[13px] leading-relaxed text-slate-400">
                Ток всегда течёт по кругу: фаза → прибор → ноль. Земля в работе не участвует, она защищает человека.
                Соединяйте только те точки, что относятся к одной цепи, и следите за цветом провода.
              </p>
              <button
                onClick={() => {
                  setShowTheory(false);
                  setShowGlossary(true);
                }}
                className="mt-3 w-full rounded-xl border border-sky-500/40 bg-sky-500/10 py-2.5 text-sm font-bold text-sky-300 transition hover:bg-sky-500/20"
              >
                Открыть справочник: фаза, ноль, земля
              </button>
            </div>
            <button
              onClick={() => {
                setShowTheory(false);
                sfx.click();
              }}
              className="mt-4 w-full rounded-2xl bg-volt py-3.5 font-display text-base tracking-wide text-black transition hover:bg-volt-2"
            >
              ПОНЯТНО, К РАБОТЕ!
            </button>
          </div>
        </div>
      )}

      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={`pop-in w-full max-w-md rounded-3xl border ${toneStyle[popup.tone].border} bg-[#0c1320] p-5`}>
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${toneStyle[popup.tone].bg}`}>{toneStyle[popup.tone].icon}</div>
              <h3 className="font-display text-lg text-white">{popup.title}</h3>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-300">{popup.body}</p>
            <button
              onClick={() => {
                setPopup(null);
                sfx.click();
              }}
              className="mt-5 w-full rounded-xl border border-line bg-panel py-2.5 font-bold text-slate-200 transition hover:border-volt/50 hover:text-white"
            >
              Понял, продолжаю
            </button>
          </div>
        </div>
      )}

      {done && !explore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="pop-in w-full max-w-lg rounded-3xl border border-volt/30 bg-[#0c1320] p-5 sm:p-8 text-center">
            <div className="mx-auto w-fit rounded-2xl bg-volt/15 p-4">
              <Trophy className="h-10 w-10 text-volt" />
            </div>
            <h3 className="mt-4 font-display text-2xl text-white">Схема работает!</h3>
            <div className="mt-3 flex justify-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <Star key={s} className={`h-8 w-8 ${s <= stars ? 'fill-volt text-volt' : 'text-slate-700'}`} />
              ))}
            </div>
            <p className="mt-2 font-mono text-xs text-slate-500">
              ошибок: {mistakes} · подсказок: {hintsUsed}
            </p>
            <div className="mt-4 rounded-2xl border border-line bg-panel p-4 text-left">
              <div className="mb-1.5 font-mono text-[11px] tracking-widest text-volt uppercase">Запомни</div>
              <p className="text-sm leading-relaxed text-slate-300">{level.fact}</p>
            </div>
            <button
              onClick={() => {
                setExplore(true);
                setToast('Режим изучения: щёлкайте по автоматам и выключателям, нажимайте кнопку «Т» на УЗО — смотрите, что гаснет.');
                sfx.click();
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-volt py-3.5 font-display text-base tracking-wide text-black transition hover:bg-volt-2"
            >
              <Power className="h-5 w-5" /> ИЗУЧИТЬ СХЕМУ В РАБОТЕ
            </button>
            <div className="mt-3 flex gap-2.5">
              <button onClick={onExit} className="flex items-center justify-center gap-2 rounded-xl border border-line bg-panel px-4 py-3 font-bold text-slate-300 transition hover:text-white">
                <Home className="h-4 w-4" />
              </button>
              <button onClick={reset} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-panel px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-volt/50">
                <RotateCcw className="h-4 w-4" /> Заново
              </button>
              <button onClick={onNext} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-panel px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-volt/50">
                {isLast ? 'К итогам' : 'Дальше'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* нижняя панель режима изучения */}
      {done && explore && (
        <div className="sticky bottom-0 z-40 border-t border-volt/30 bg-[#0b1220]/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 pr-20">
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 font-display text-xs text-emerald-300">РЕЖИМ ИЗУЧЕНИЯ</span>
              <span className="text-slate-400">Щёлкайте по автоматам — они отключатся. Кнопка «Т» на УЗО имитирует утечку.</span>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setMeterMode((m) => !m);
                  setProbeA(null);
                  setMeterRead(null);
                  sfx.select();
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${meterMode ? 'bg-emerald-400 text-black' : 'border border-line bg-panel text-slate-200 hover:border-emerald-400/60'}`}
              >
                <Gauge className="h-4 w-4" /> Мультиметр
              </button>
              <button
                onClick={() => {
                  setDeviceOn({});
                  setToast('Все аппараты снова взведены.');
                  sfx.powerOn();
                }}
                className="flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-volt/50"
              >
                <Power className="h-4 w-4 text-emerald-400" /> Взвести все
              </button>
              <button onClick={onExit} className="rounded-xl border border-line bg-panel px-3 py-2.5 text-slate-300 transition hover:text-white">
                <Home className="h-4 w-4" />
              </button>
              <button onClick={reset} className="flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-volt/50">
                <RotateCcw className="h-4 w-4" /> Заново
              </button>
              <button onClick={onNext} className="flex items-center gap-2 rounded-xl bg-volt px-6 py-2.5 font-display text-sm tracking-wide text-black transition hover:bg-volt-2">
                {isLast ? 'К ИТОГАМ' : 'СЛЕДУЮЩИЙ УРОК'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="pop-in pointer-events-none fixed bottom-24 left-1/2 z-50 w-[92%] max-w-lg -translate-x-1/2 rounded-2xl border border-volt/40 bg-[#0c1320]/95 px-4 py-3 text-center text-sm text-slate-200 shadow-2xl backdrop-blur">
          {toast}
        </div>
      )}
    </div>
  );
}

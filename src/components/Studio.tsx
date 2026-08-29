import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Calculator, Camera, Gauge, Layers, Plus, Power, Search, Trash2, Wrench, X } from 'lucide-react';
import LoadCalc from './LoadCalc';
import { CATALOG, CATALOG_BY_ID, type CatalogItem } from '../content';
import { MvpNote, TgBadge } from './Telegram';
import { sfx } from '../audio';

interface Mod {
  uid: string;
  id: string;
  label: string;
}

const MOD_PX = 40;

// ориентировочные цены по типу аппарата (руб.) — пользователь может изменить
const DEFAULT_PRICE: Record<string, number> = {
  breaker: 450,
  breaker2p: 900,
  breaker3p: 1600,
  rcd: 2400,
  dif: 3200,
  vrn: 2800,
  uzip: 3500,
  meter: 4200,
  contactor: 2100,
  timer: 1800,
  cross: 1300,
  busbar: 350,
  comb: 700,
  sep: 60,
};

const KIND_COLOR: Record<string, string> = {
  breaker: '#dbe3ee',
  breaker2p: '#dbe3ee',
  breaker3p: '#dbe3ee',
  rcd: '#fde8c8',
  dif: '#fdd9bd',
  vrn: '#cfe4f5',
  uzip: '#fdf3c4',
  meter: '#cdf0dd',
  contactor: '#e2d5f7',
  timer: '#f6d3f0',
  cross: '#d4d4d8',
  busbar: '#cfe0fb',
  comb: '#f7d08a',
  sep: '#a8b3c4',
};

export default function Studio({ onExit }: { onExit: () => void }) {
  const [title, setTitle] = useState('Щит для квартиры');
  const [client, setClient] = useState('');
  const [railCount, setRailCount] = useState(3);
  const [rails, setRails] = useState<Mod[][]>([[], [], [], []]);
  const [activeRail, setActiveRail] = useState(0);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('Все');
  const [mode, setMode] = useState<'build' | 'test' | 'render'>('build');
  const [offState, setOffState] = useState<Record<string, boolean>>({});
  const [probe, setProbe] = useState<{ a?: string; b?: string }>({});
  const [reading, setReading] = useState<{ v: string; note: string } | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [names, setNames] = useState<Record<string, string>>({});
  const [work, setWork] = useState(40);
  const [zoom, setZoom] = useState(1);
  const [editSpec, setEditSpec] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const uid = useRef(0);

  const groups = useMemo(() => ['Все', ...Array.from(new Set(CATALOG.map((c) => c.group)))], []);
  const list = useMemo(
    () => CATALOG.filter((c) => (group === 'Все' || c.group === group) && (query.trim() === '' || (c.title + c.sub).toLowerCase().includes(query.toLowerCase()))),
    [group, query],
  );

  const usedMods = (r: Mod[]) => r.reduce((a, m) => a + (CATALOG_BY_ID.get(m.id)?.mods ?? 1), 0);

  const addItem = (item: CatalogItem) => {
    if (usedMods(rails[activeRail]) + item.mods > 12) {
      setReading({ v: '—', note: 'В ряду 12 модулей — больше не помещается. Добавьте ещё одну рейку.' });
      sfx.error();
      return;
    }
    setRails((rs) => rs.map((r, i) => (i === activeRail ? [...r, { uid: `m${++uid.current}`, id: item.id, label: item.title }] : r)));
    sfx.spark();
  };

  const removeItem = (ri: number, u: string) => {
    setRails((rs) => rs.map((r, i) => (i === ri ? r.filter((m) => m.uid !== u) : r)));
    sfx.remove();
  };

  const fillCaps = () => {
    setRails((rs) =>
      rs.map((r, i) => {
        if (i >= railCount) return r;
        const free = 12 - usedMods(r);
        const caps = Array.from({ length: free }, () => ({ uid: `m${++uid.current}`, id: 'sep', label: 'Заглушка DIN-рейки' }));
        return [...r, ...caps];
      }),
    );
    sfx.click();
  };

  // ---- мультиметр ----
  const isOff = (u: string) => offState[u] === true;
  const measure = (m: Mod, side: 'top' | 'bot') => {
    const key = `${m.uid}:${side}`;
    if (!probe.a) {
      setProbe({ a: key });
      setReading({ v: '– – –', note: 'Первый щуп установлен. Коснитесь второй точки.' });
      sfx.select();
      return;
    }
    if (probe.a === key) {
      setProbe({});
      setReading(null);
      return;
    }
    const [au] = probe.a.split(':');
    const aSide = probe.a.split(':')[1];
    const aMod = rails.flat().find((x) => x.uid === au);
    const aItem = aMod ? CATALOG_BY_ID.get(aMod.id) : null;
    const bItem = CATALOG_BY_ID.get(m.id);
    const powerUp = (mod: Mod | null | undefined, s: string) => {
      if (!mod) return false;
      const it = CATALOG_BY_ID.get(mod.id);
      if (!it) return false;
      if (it.kind === 'busbar' || it.kind === 'sep' || it.kind === 'comb') return it.id === 'comb-l';
      if (s === 'top') return true;
      return !isOff(mod.uid);
    };
    const aLive = powerUp(aMod, aSide);
    const bLive = powerUp(m, side);
    const aNeutral = aItem?.id === 'bus-n';
    const bNeutral = bItem?.id === 'bus-n';
    const aEarth = aItem?.id === 'bus-pe';
    const bEarth = bItem?.id === 'bus-pe';

    let v = '0.0 В';
    let note = 'Разность потенциалов отсутствует — обе точки в одной цепи.';
    if ((aLive && (bNeutral || bEarth)) || (bLive && (aNeutral || aEarth))) {
      v = '230 В';
      note = 'Есть напряжение: одна точка под фазой, вторая — ноль/земля. Линия под нагрузкой.';
    } else if (aLive && bLive) {
      v = '0.0 В';
      note = 'Обе точки под фазой одного потенциала — разности нет, это норма.';
    } else if ((aNeutral && bEarth) || (aEarth && bNeutral)) {
      v = '0.0 В';
      note = 'N и PE в исправной системе TN-S показывают около нуля.';
    } else if (!aLive && !bLive) {
      v = '0.0 В';
      note = 'Напряжения нет: выше по цепи отключён аппарат — проверьте флажки.';
    }
    setReading({ v, note });
    setProbe({});
    sfx.click();
  };

  const totalMods = rails.slice(0, railCount).reduce((a, r) => a + usedMods(r), 0);
  const specs = useMemo(() => {
    const map = new Map<string, number>();
    rails.slice(0, railCount).flat().forEach((m) => map.set(m.id, (map.get(m.id) ?? 0) + 1));
    return [...map.entries()].map(([id, n]) => ({ item: CATALOG_BY_ID.get(id)!, n })).filter((s) => s.item && s.item.kind !== 'sep');
  }, [rails, railCount]);

  const priceOf = (id: string) => prices[id] ?? DEFAULT_PRICE[CATALOG_BY_ID.get(id)?.kind ?? 'breaker'] ?? 500;
  const nameOf = (id: string) => names[id] ?? CATALOG_BY_ID.get(id)?.title ?? '';
  const equipTotal = specs.reduce((a, s) => a + priceOf(s.item.id) * s.n, 0);
  const workTotal = Math.round(equipTotal * (work / 100));
  const grandTotal = equipTotal + workTotal;
  const money = (v: number) => v.toLocaleString('ru-RU') + ' ₽';

  // ================= РЕНДЕР ДЛЯ ЗАКАЗЧИКА =================
  if (mode === 'render') {
    const boxH = 120 + railCount * 108;
    return (
      <div className="min-h-screen bg-[#141414] py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4">
          <button onClick={() => setMode('build')} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" /> К редактированию
          </button>
          <span className="font-mono text-xs text-slate-400">Презентация для заказчика — можно сделать скриншот</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 p-1">
              <button onClick={() => setRailCount((r) => Math.max(1, r - 1))} className="rounded-lg px-2 py-1 text-slate-200 hover:bg-white/10" title="Убрать рейку">
                −
              </button>
              <span className="px-1 font-mono text-xs text-slate-300">{railCount} рейки</span>
              <button onClick={() => setRailCount((r) => Math.min(4, r + 1))} className="rounded-lg px-2 py-1 text-slate-200 hover:bg-white/10" title="Добавить рейку">
                +
              </button>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 p-1">
              <button onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))} className="rounded-lg px-2 py-1 text-slate-200 hover:bg-white/10">
                −
              </button>
              <span className="w-11 text-center font-mono text-xs text-slate-300">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))} className="rounded-lg px-2 py-1 text-slate-200 hover:bg-white/10">
                +
              </button>
            </div>
            <TgBadge compact />
          </div>
        </div>

        {/* серая стена */}
        <div
          className="mx-auto mt-5 w-full max-w-6xl overflow-hidden rounded-2xl px-4 py-10"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 0%, #9b9b98 0%, #86868a 45%, #6e6e73 100%)',
            boxShadow: 'inset 0 0 120px rgba(0,0,0,0.35)',
          }}
        >
          <div className="mx-auto max-w-3xl" style={{ zoom }}>
            {/* корпус щита */}
            <div
              className="relative mx-auto rounded-xl p-3"
              style={{
                width: '100%',
                background: 'linear-gradient(160deg,#f4f5f7 0%,#dfe3e9 40%,#c9ced7 100%)',
                boxShadow: '0 30px 60px -18px rgba(0,0,0,0.55), 0 3px 0 rgba(255,255,255,0.6) inset',
              }}
            >
              <div className="flex items-center justify-between rounded-lg bg-[#e7eaef] px-3 py-2">
                <span className="font-display text-[13px] tracking-wide text-slate-700">{title || 'Электрощит'}</span>
                <span className="font-mono text-[10px] text-slate-500">{client ? `для: ${client}` : 'проект щита'}</span>
              </div>

              <div className="mt-3 space-y-1 rounded-lg bg-[#eceff4] p-3">
                {rails.slice(0, railCount).map((rail, ri) => (
                  <div key={ri}>
                    {/* жгут проводов сверху ряда */}
                    <div className="relative h-9">
                      <svg viewBox="0 0 1000 36" preserveAspectRatio="none" className="h-full w-full">
                        {rail.map((m, k) => {
                          const before = rail.slice(0, k).reduce((a, x) => a + (CATALOG_BY_ID.get(x.id)?.mods ?? 1), 0);
                          const it = CATALOG_BY_ID.get(m.id)!;
                          if (it.kind === 'sep') return null;
                          const total = Math.max(usedMods(rail), 1);
                          const x = ((before + it.mods / 2) / total) * 1000;
                          const c = it.kind === 'busbar' ? (it.id.includes('pe') ? '#35c759' : '#3d8bff') : '#c96f2e';
                          return (
                            <g key={m.uid}>
                              <path d={`M 40 ${10 + (k % 3) * 5} L ${x} ${10 + (k % 3) * 5} L ${x} 36`} fill="none" stroke="#0f172a" strokeWidth={5} strokeLinejoin="round" opacity={0.35} />
                              <path d={`M 40 ${10 + (k % 3) * 5} L ${x} ${10 + (k % 3) * 5} L ${x} 36`} fill="none" stroke={c} strokeWidth={3.2} strokeLinejoin="round" />
                              <rect x={x - 2.5} y={28} width={5} height={8} rx={1} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={0.6} />
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    <div className="relative rounded-md bg-[#dfe3ea] p-2">
                      <div className="absolute inset-x-2 top-1/2 h-3.5 -translate-y-1/2 rounded bg-gradient-to-b from-[#b8bfc9] to-[#8d95a1]" />
                      <div className="absolute top-1/2 left-1 h-7 w-2 -translate-y-1/2 rounded-sm bg-[#9aa3b0]" />
                      <div className="absolute top-1/2 right-1 h-7 w-2 -translate-y-1/2 rounded-sm bg-[#9aa3b0]" />
                      <div className="relative flex gap-[3px]">
                        {rail.map((m) => {
                          const it = CATALOG_BY_ID.get(m.id)!;
                          const wide = it.mods >= 2;
                          return (
                            <div
                              key={m.uid}
                              title={`${it.title} · ${it.sub}`}
                              className="relative flex flex-col items-center rounded-[3px] pt-1 pb-1.5"
                              style={{
                                width: it.mods * MOD_PX,
                                background: `linear-gradient(180deg,#ffffff 0%, ${KIND_COLOR[it.kind] ?? '#dbe3ee'} 55%, #b9c2ce 100%)`,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.9)',
                              }}
                            >
                              {/* клеммы сверху */}
                              <span className="mb-0.5 flex w-full justify-center gap-1">
                                {Array.from({ length: Math.min(it.mods, 4) }).map((_, i) => (
                                  <span key={i} className="h-1.5 w-3 rounded-sm bg-[#8794a5]" />
                                ))}
                              </span>
                              {/* маркировочная табличка */}
                              <span className="block w-[92%] rounded-sm bg-white/90 py-[1px] text-center font-mono text-[9px] font-extrabold text-slate-800 ring-1 ring-slate-300">
                                {it.short}
                              </span>
                              {it.kind !== 'sep' && it.kind !== 'busbar' && it.kind !== 'comb' && (
                                <span className="mt-1 flex gap-0.5">
                                  {Array.from({ length: it.kind === 'breaker3p' ? 3 : it.kind === 'breaker2p' ? 2 : 1 }).map((_, i) => (
                                    <span key={i} className="block h-4 w-2 rounded-sm bg-slate-900" />
                                  ))}
                                </span>
                              )}
                              {wide && <span className="mt-0.5 text-[6px] leading-none font-bold text-slate-500">~230V 6000</span>}
                              <span className="mt-0.5 flex w-full justify-center gap-1">
                                {Array.from({ length: Math.min(it.mods, 4) }).map((_, i) => (
                                  <span key={i} className="h-1.5 w-3 rounded-sm bg-[#8794a5]" />
                                ))}
                              </span>
                            </div>
                          );
                        })}
                        {rail.length === 0 && <div className="w-full py-6 text-center text-[10px] text-slate-500">рейка пуста</div>}
                      </div>
                    </div>

                    {/* нижний жгут */}
                    <div className="relative h-8">
                      <svg viewBox="0 0 1000 32" preserveAspectRatio="none" className="h-full w-full">
                        {rail.map((m, k) => {
                          const before = rail.slice(0, k).reduce((a, x) => a + (CATALOG_BY_ID.get(x.id)?.mods ?? 1), 0);
                          const it = CATALOG_BY_ID.get(m.id)!;
                          if (it.kind === 'sep' || it.kind === 'busbar') return null;
                          const total = Math.max(usedMods(rail), 1);
                          const x = ((before + it.mods / 2) / total) * 1000;
                          return (
                            <g key={m.uid}>
                              <path d={`M ${x} 0 L ${x} ${14 + (k % 3) * 5} L 960 ${14 + (k % 3) * 5}`} fill="none" stroke="#0f172a" strokeWidth={5} strokeLinejoin="round" opacity={0.3} />
                              <path d={`M ${x} 0 L ${x} ${14 + (k % 3) * 5} L 960 ${14 + (k % 3) * 5}`} fill="none" stroke="#3d8bff" strokeWidth={3} strokeLinejoin="round" opacity={0.9} />
                              <rect x={x - 2.5} y={0} width={5} height={8} rx={1} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={0.6} />
                            </g>
                          );
                        })}
                      </svg>
                      <span className="absolute right-1 -bottom-1 font-mono text-[9px] text-slate-500">рейка {ri + 1}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-lg bg-[#e7eaef] px-3 py-2 font-mono text-[10px] text-slate-500">
                <span>{totalMods} модулей · {railCount} рейки</span>
                <span>смонтировано по проекту</span>
              </div>
              <div className="absolute -top-2 left-1/2 h-1.5 w-24 -translate-x-1/2 rounded-full bg-white/60" style={{ boxShadow: `0 ${boxH / 40}px 0 rgba(0,0,0,0)` }} />
            </div>

            {/* смета */}
            <div className="mt-6 rounded-xl bg-white/90 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="font-display text-sm text-slate-800">Смета на электрощит</div>
                <button onClick={() => setEditSpec((v) => !v)} className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-700">
                  {editSpec ? 'Готово' : 'Редактировать'}
                </button>
              </div>
              <table className="mt-3 w-full text-left text-[13px]">
                <thead>
                  <tr className="text-slate-500">
                    <th className="pb-1 font-mono text-[10px] uppercase">Наименование</th>
                    <th className="pb-1 text-right font-mono text-[10px] uppercase">Кол-во</th>
                    <th className="pb-1 text-right font-mono text-[10px] uppercase">Цена</th>
                    <th className="pb-1 text-right font-mono text-[10px] uppercase">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {specs.map((s) => (
                    <tr key={s.item.id} className="border-t border-slate-200/80 align-middle">
                      <td className="py-1.5 pr-2 text-slate-700">
                        {editSpec ? (
                          <input
                            value={nameOf(s.item.id)}
                            onChange={(e) => setNames((p) => ({ ...p, [s.item.id]: e.target.value }))}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-[12px] text-slate-800 outline-none focus:border-sky-500"
                          />
                        ) : (
                          <>
                            {nameOf(s.item.id)} <span className="text-slate-400">· {s.item.sub}</span>
                          </>
                        )}
                      </td>
                      <td className="py-1.5 text-right font-bold text-slate-800">{s.n}</td>
                      <td className="py-1.5 text-right text-slate-700">
                        {editSpec ? (
                          <input
                            type="number"
                            value={priceOf(s.item.id)}
                            onChange={(e) => setPrices((p) => ({ ...p, [s.item.id]: Number(e.target.value) || 0 }))}
                            className="w-24 rounded border border-slate-300 px-2 py-1 text-right text-[12px] text-slate-800 outline-none focus:border-sky-500"
                          />
                        ) : (
                          money(priceOf(s.item.id))
                        )}
                      </td>
                      <td className="py-1.5 text-right font-bold text-slate-900">{money(priceOf(s.item.id) * s.n)}</td>
                    </tr>
                  ))}
                  {specs.length === 0 && (
                    <tr>
                      <td className="py-3 text-slate-500" colSpan={4}>
                        Добавьте аппараты в щит — они появятся в смете.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-3 text-[13px]">
                <div className="flex justify-between text-slate-600">
                  <span>Оборудование</span>
                  <span className="font-bold text-slate-800">{money(equipTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2">
                    Монтаж и сборка
                    {editSpec ? (
                      <input type="number" value={work} onChange={(e) => setWork(Number(e.target.value) || 0)} className="w-16 rounded border border-slate-300 px-2 py-0.5 text-right text-[12px]" />
                    ) : (
                      <span className="text-slate-400">{work}%</span>
                    )}
                  </span>
                  <span className="font-bold text-slate-800">{money(workTotal)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-300 pt-2 text-base">
                  <span className="font-display text-slate-800">ИТОГО</span>
                  <span className="font-display text-slate-900">{money(grandTotal)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] text-slate-500">
                <span>Смета носит ориентировочный характер · «ЭлектроМастер»</span>
                <a href="https://t.me/irawiq" target="_blank" rel="noopener noreferrer" className="font-bold text-sky-600 underline">
                  @irawiq
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= РЕДАКТОР / ТЕСТ =================
  return (
    <div className="blueprint min-h-screen bg-[#070b12] pb-10">
      <header className="mx-auto w-full max-w-[1600px] px-2 pt-2 pl-16">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="flex items-center gap-1.5 rounded-xl border border-line bg-panel px-2.5 py-2 text-sm font-bold text-slate-300 hover:border-volt/50 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Меню</span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-sky-400 px-1.5 py-0.5 font-display text-[10px] text-black">СТУДИЯ</span>
              <span className="font-mono text-[10px] text-slate-500 hidden sm:inline">свой проект</span>
            </div>
            <h1 className="font-display text-[15px] text-white sm:text-lg">Конструктор щита</h1>
          </div>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <button onClick={() => { setMode(mode === 'test' ? 'build' : 'test'); setProbe({}); setReading(null); }} className={`flex items-center gap-1 rounded-xl px-2 py-1.5 font-display text-xs tracking-wide transition ${mode === 'test' ? 'bg-emerald-400 text-black' : 'border border-line bg-panel text-slate-300'}`}>
            <Gauge className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">МУЛЬТИМЕТР</span>
          </button>
          <button
            onClick={() => setCalcOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 font-display text-sm tracking-wide text-emerald-300 transition hover:bg-emerald-500/20"
          >
            <Calculator className="h-4 w-4" /> КАЛЬКУЛЯТОР
          </button>
          <button onClick={() => setMode('render')} className="flex items-center gap-2 rounded-xl bg-volt px-4 py-2 font-display text-sm tracking-wide text-black hover:bg-volt-2">
            <Camera className="h-4 w-4" /> ПОКАЗАТЬ ЗАКАЗЧИКУ
          </button>
          <TgBadge compact />
        </div>
      </header>

      {calcOpen && <LoadCalc onClose={() => setCalcOpen(false)} />}

      <div className="mx-auto w-full max-w-[1600px] px-4 pt-2">
        <MvpNote />
      </div>
      <div className="mx-auto mt-3 grid w-full max-w-[1600px] gap-4 px-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-line bg-panel/70 p-3">
          <div className="space-y-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название проекта" className="w-full rounded-xl border border-line bg-[#0a101b] px-3 py-2 text-sm text-slate-100 outline-none focus:border-volt/60" />
            <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Заказчик (необязательно)" className="w-full rounded-xl border border-line bg-[#0a101b] px-3 py-2 text-sm text-slate-100 outline-none focus:border-volt/60" />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-500" />
            <span className="text-xs text-slate-400">Реек в щите:</span>
            {[1, 2, 3, 4].map((n) => (
              <button key={n} onClick={() => setRailCount(n)} className={`h-7 w-7 rounded-lg font-mono text-xs font-bold transition ${railCount === n ? 'bg-volt text-black' : 'bg-[#0a101b] text-slate-400 hover:text-white'}`}>
                {n}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-[#0a101b] px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск аппарата…" className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600" />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {groups.map((g) => (
              <button key={g} onClick={() => setGroup(g)} className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${group === g ? 'bg-volt text-black' : 'bg-[#0a101b] text-slate-400 hover:text-white'}`}>
                {g}
              </button>
            ))}
          </div>

          <div className="mt-3 max-h-[46vh] space-y-1.5 overflow-y-auto pr-1">
            {list.map((c) => (
              <button key={c.id} onClick={() => addItem(c)} className="flex w-full items-center gap-3 rounded-xl border border-line bg-[#0b111c] p-2 text-left transition hover:border-volt/60">
                <span className="flex h-9 items-center justify-center rounded-md px-2 font-mono text-[10px] font-extrabold text-slate-800" style={{ width: Math.min(c.mods, 3) * 30, background: KIND_COLOR[c.kind] ?? '#dbe3ee' }}>
                  {c.short}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] leading-tight font-bold text-slate-200">{c.title}</span>
                  <span className="block truncate text-[10.5px] leading-tight text-slate-500">{c.sub}</span>
                </span>
                <Plus className="h-4 w-4 shrink-0 text-volt" />
              </button>
            ))}
          </div>

          <button onClick={fillCaps} className="mt-3 w-full rounded-xl border border-line bg-panel py-2.5 text-xs font-bold text-slate-300 hover:border-volt/50">
            Закрыть пустые места заглушками
          </button>
        </aside>

        <main>
          <div className="rounded-2xl border border-line bg-panel/60 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Wrench className="h-5 w-5 text-volt" />
              <div className="text-sm text-slate-300">
                {mode === 'test' ? (
                  <>Режим мультиметра: щёлкните по флажку, чтобы отключить аппарат, затем коснитесь двух клемм щупами.</>
                ) : (
                  <>Выберите рейку и добавляйте аппараты из каталога. Клик по модулю в щите удаляет его.</>
                )}
              </div>
              <span className="ml-auto rounded-lg border border-line bg-[#0a101b] px-3 py-1.5 font-mono text-xs text-slate-400">{totalMods} модулей</span>
            </div>
          </div>

          <div className="mt-4 space-y-4 rounded-3xl border-2 border-line bg-[#0a101b]/80 p-5">
            {rails.slice(0, railCount).map((rail, ri) => (
              <div key={ri}>
                <div className="mb-1.5 flex items-center gap-2">
                  <button onClick={() => setActiveRail(ri)} className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold transition ${activeRail === ri ? 'bg-volt text-black' : 'bg-panel text-slate-400 hover:text-white'}`}>
                    рейка {ri + 1}
                  </button>
                  <span className="font-mono text-[11px] text-slate-600">{usedMods(rail)} / 12 модулей</span>
                  <span className="h-px flex-1 bg-line" />
                  {rail.length > 0 && (
                    <button onClick={() => setRails((rs) => rs.map((r, i) => (i === ri ? [] : r)))} className="text-slate-600 hover:text-red-400" title="Очистить рейку">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className={`relative min-h-24 rounded-xl border-2 p-3 transition ${activeRail === ri ? 'border-volt/40 bg-[#0d141f]' : 'border-transparent bg-[#0d141f]'}`}>
                  <div className="absolute inset-x-3 top-1/2 h-4 -translate-y-1/2 rounded bg-gradient-to-b from-slate-500 to-slate-700" />
                  {/* торцевые ограничители рейки */}
                  <div className="absolute top-1/2 left-3 h-7 w-2 -translate-y-1/2 rounded-sm bg-slate-400" />
                  <div className="absolute top-1/2 right-3 h-7 w-2 -translate-y-1/2 rounded-sm bg-slate-400" />
                  <div className="relative flex flex-wrap gap-1">
                    {rail.map((m) => {
                      const it = CATALOG_BY_ID.get(m.id)!;
                      const off = isOff(m.uid);
                      const togglable = ['breaker', 'breaker2p', 'breaker3p', 'rcd', 'dif', 'vrn', 'contactor'].includes(it.kind);
                      return (
                        <div key={m.uid} className="relative" style={{ width: it.mods * MOD_PX }}>
                          <div
                            onClick={() => {
                              if (mode === 'build') removeItem(ri, m.uid);
                              else if (togglable) {
                                setOffState((s) => ({ ...s, [m.uid]: !s[m.uid] }));
                                sfx.click();
                              }
                            }}
                            className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-md"
                            style={{ background: `linear-gradient(180deg,#fff 0%, ${KIND_COLOR[it.kind] ?? '#dbe3ee'} 55%, #aeb8c6 100%)` }}
                            title={it.title}
                          >
                            <span className="font-mono text-[10px] font-extrabold text-slate-700">{it.short}</span>
                            {togglable && <span className={`mt-1 block h-5 w-2.5 rounded-sm transition-all ${off ? 'translate-y-1 bg-red-600' : 'bg-slate-900'}`} />}
                            {it.kind === 'sep' && <span className="mt-1 text-[8px] text-slate-500">заглушка</span>}
                          </div>
                          {mode === 'test' && it.kind !== 'sep' && (
                            <>
                              <button onClick={() => measure(m, 'top')} className={`absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 ${probe.a === `${m.uid}:top` ? 'border-volt bg-volt/40' : 'border-slate-400 bg-[#0b1220]'}`} title="Верхняя клемма" />
                              <button onClick={() => measure(m, 'bot')} className={`absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 ${probe.a === `${m.uid}:bot` ? 'border-volt bg-volt/40' : 'border-slate-400 bg-[#0b1220]'}`} title="Нижняя клемма" />
                            </>
                          )}
                        </div>
                      );
                    })}
                    {rail.length === 0 && <div className="w-full py-6 text-center font-mono text-[11px] text-slate-600">рейка пуста — выберите её и добавьте аппараты</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {mode === 'test' && (
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-4">
              <div className="rounded-xl bg-[#0b1220] px-5 py-3 text-center">
                <div className="font-mono text-[10px] tracking-widest text-slate-500">MULTIMETER · V~</div>
                <div className="font-display text-3xl text-emerald-300">{reading?.v ?? '– – –'}</div>
              </div>
              <p className="min-w-40 flex-1 text-sm text-slate-300">{reading?.note ?? 'Коснитесь щупами двух клемм, чтобы измерить напряжение. Отключите автомат — и увидите, как напряжение пропадает ниже него.'}</p>
              <button
                onClick={() => {
                  setOffState({});
                  setReading({ v: '– – –', note: 'Все аппараты взведены.' });
                  sfx.powerOn();
                }}
                className="flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-sm font-bold text-slate-200 hover:border-volt/50"
              >
                <Power className="h-4 w-4 text-emerald-400" /> Взвести все
              </button>
              <button onClick={() => { setProbe({}); setReading(null); }} className="rounded-xl border border-line bg-panel p-2.5 text-slate-300 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

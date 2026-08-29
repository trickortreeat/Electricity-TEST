import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  Check,
  ChevronDown,
  ClipboardList,
  Copy,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { sfx } from '../audio';

interface Appliance {
  id: string;
  name: string;
  watt: number;
  ku: number; // коэффициент использования
  group: string;
  custom?: boolean;
}

const LIB: Appliance[] = [
  // Освещение
  { id: 'light', name: 'Освещение комнат', watt: 400, ku: 0.8, group: 'Освещение' },
  { id: 'light-street', name: 'Уличное освещение', watt: 300, ku: 0.6, group: 'Освещение' },
  { id: 'light-led', name: 'Светодиодная подсветка', watt: 150, ku: 0.7, group: 'Освещение' },

  // Кухня
  { id: 'fridge', name: 'Холодильник', watt: 350, ku: 0.8, group: 'Кухня' },
  { id: 'freezer', name: 'Морозильная камера', watt: 300, ku: 0.8, group: 'Кухня' },
  { id: 'kettle', name: 'Электрочайник', watt: 2200, ku: 0.3, group: 'Кухня' },
  { id: 'micro', name: 'Микроволновая печь', watt: 1200, ku: 0.3, group: 'Кухня' },
  { id: 'dish', name: 'Посудомоечная машина', watt: 2000, ku: 0.5, group: 'Кухня' },
  { id: 'oven', name: 'Духовой шкаф', watt: 3500, ku: 0.5, group: 'Кухня' },
  { id: 'stove', name: 'Варочная панель', watt: 7000, ku: 0.4, group: 'Кухня' },
  { id: 'hood', name: 'Вытяжка', watt: 250, ku: 0.4, group: 'Кухня' },
  { id: 'coffee', name: 'Кофемашина', watt: 1500, ku: 0.2, group: 'Кухня' },
  { id: 'multi', name: 'Мультиварка', watt: 900, ku: 0.3, group: 'Кухня' },

  // Санузел и вода
  { id: 'wash', name: 'Стиральная машина', watt: 2500, ku: 0.5, group: 'Санузел' },
  { id: 'dryer', name: 'Сушильная машина', watt: 2800, ku: 0.4, group: 'Санузел' },
  { id: 'boiler', name: 'Бойлер накопительный', watt: 2000, ku: 0.6, group: 'Санузел' },
  { id: 'flow-heater', name: 'Проточный водонагреватель', watt: 5500, ku: 0.3, group: 'Санузел' },
  { id: 'towel', name: 'Полотенцесушитель', watt: 500, ku: 0.7, group: 'Санузел' },
  { id: 'hair', name: 'Фен', watt: 1800, ku: 0.15, group: 'Санузел' },

  // Климат
  { id: 'ac', name: 'Кондиционер', watt: 1500, ku: 0.7, group: 'Климат' },
  { id: 'floor', name: 'Тёплый пол (комната)', watt: 1200, ku: 0.6, group: 'Климат' },
  { id: 'convector', name: 'Конвектор отопления', watt: 2000, ku: 0.8, group: 'Климат' },
  { id: 'boiler-el', name: 'Электрокотёл', watt: 6000, ku: 0.7, group: 'Климат' },
  { id: 'vent', name: 'Приточная вентиляция', watt: 800, ku: 0.7, group: 'Климат' },
  { id: 'humid', name: 'Увлажнитель / очиститель', watt: 200, ku: 0.5, group: 'Климат' },

  // Быт и электроника
  { id: 'pc', name: 'Компьютер и техника', watt: 600, ku: 0.6, group: 'Быт' },
  { id: 'tv', name: 'Телевизор', watt: 150, ku: 0.6, group: 'Быт' },
  { id: 'iron', name: 'Утюг', watt: 2000, ku: 0.2, group: 'Быт' },
  { id: 'vacuum', name: 'Пылесос', watt: 1600, ku: 0.2, group: 'Быт' },
  { id: 'router', name: 'Роутер, видеонаблюдение', watt: 100, ku: 0.9, group: 'Быт' },

  // Улица, гараж, инженерия
  { id: 'pump', name: 'Скважинный насос', watt: 1100, ku: 0.5, group: 'Инженерия' },
  { id: 'pump-drain', name: 'Дренажный насос', watt: 750, ku: 0.3, group: 'Инженерия' },
  { id: 'ev', name: 'Зарядка электромобиля', watt: 7400, ku: 0.9, group: 'Инженерия' },
  { id: 'tools', name: 'Инструмент в мастерской', watt: 2000, ku: 0.3, group: 'Инженерия' },
  { id: 'compressor', name: 'Компрессор', watt: 2200, ku: 0.3, group: 'Инженерия' },
  { id: 'welder', name: 'Сварочный аппарат', watt: 5000, ku: 0.2, group: 'Инженерия' },
  { id: 'sauna', name: 'Электрокаменка', watt: 6000, ku: 0.6, group: 'Инженерия' },
  { id: 'gate', name: 'Привод ворот', watt: 400, ku: 0.2, group: 'Инженерия' },
];

// стандартный ряд номиналов и сечений
const BREAKERS: Array<{ amp: number; brk: string; sec: string }> = [
  { amp: 10, brk: 'C10', sec: '1,5 мм²' },
  { amp: 16, brk: 'C16', sec: '2,5 мм²' },
  { amp: 20, brk: 'C20', sec: '2,5 мм²' },
  { amp: 25, brk: 'C25', sec: '4 мм²' },
  { amp: 32, brk: 'C32', sec: '6 мм²' },
  { amp: 40, brk: 'C40', sec: '10 мм²' },
  { amp: 50, brk: 'C50', sec: '10 мм²' },
  { amp: 63, brk: 'C63', sec: '16 мм²' },
  { amp: 80, brk: 'C80', sec: '25 мм²' },
  { amp: 100, brk: 'C100', sec: '35 мм²' },
];

function pickBreaker(amps: number) {
  return BREAKERS.find((b) => amps <= b.amp * 0.95) ?? BREAKERS[BREAKERS.length - 1];
}

// рекомендуемая защита отдельной линии по мощности прибора
function lineFor(watt: number, group: string) {
  const amps = watt / 230;
  const b = pickBreaker(amps);
  const wet = group === 'Санузел' || ['boiler', 'wash', 'dish'].length === 0;
  return { ...b, amps, wet };
}

export default function LoadCalc({ onClose }: { onClose: () => void }) {
  const [lib, setLib] = useState<Appliance[]>(LIB);
  const [items, setItems] = useState<Record<string, number>>({ light: 1, fridge: 1, kettle: 1 });
  const [power, setPower] = useState<Record<string, number>>({});
  const [kus, setKus] = useState<Record<string, number>>({});
  const [phases, setPhases] = useState<1 | 3>(1);
  const [cos, setCos] = useState(0.95);
  const [reserve, setReserve] = useState(20);
  const [query, setQuery] = useState('');
  const [groupF, setGroupF] = useState('Все');
  const [editId, setEditId] = useState<string | null>(null);
  const [tab, setTab] = useState<'calc' | 'report'>('calc');
  const [copied, setCopied] = useState(false);

  // форма нового прибора
  const [newName, setNewName] = useState('');
  const [newWatt, setNewWatt] = useState('');
  const [newKu, setNewKu] = useState('0.5');
  const [showAdd, setShowAdd] = useState(false);

  const groups = useMemo(() => ['Все', ...Array.from(new Set(lib.map((a) => a.group)))], [lib]);
  const wattOf = (a: Appliance) => power[a.id] ?? a.watt;
  const kuOf = (a: Appliance) => kus[a.id] ?? a.ku;

  const list = useMemo(
    () =>
      lib.filter(
        (a) => (groupF === 'Все' || a.group === groupF) && (query.trim() === '' || a.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [lib, groupF, query],
  );

  const chosen = useMemo(() => lib.filter((a) => (items[a.id] ?? 0) > 0), [lib, items]);

  const add = (id: string, d: number) => {
    setItems((s) => {
      const n = Math.max(0, (s[id] ?? 0) + d);
      const c = { ...s };
      if (n === 0) delete c[id];
      else c[id] = n;
      return c;
    });
    sfx.click();
  };

  const addCustom = () => {
    const w = Number(newWatt);
    if (!newName.trim() || !w || w <= 0) return;
    const id = `custom-${Date.now()}`;
    const a: Appliance = { id, name: newName.trim(), watt: w, ku: Math.min(1, Math.max(0.05, Number(newKu) || 0.5)), group: 'Свои приборы', custom: true };
    setLib((s) => [...s, a]);
    setItems((s) => ({ ...s, [id]: 1 }));
    setNewName('');
    setNewWatt('');
    setNewKu('0.5');
    setShowAdd(false);
    setGroupF('Свои приборы');
    sfx.spark();
  };

  const removeCustom = (id: string) => {
    setLib((s) => s.filter((a) => a.id !== id));
    setItems((s) => {
      const c = { ...s };
      delete c[id];
      return c;
    });
    sfx.remove();
  };

  const resetAll = () => {
    setItems({});
    setPower({});
    setKus({});
    sfx.click();
  };

  // ---------- РАСЧЁТ ----------
  const calc = useMemo(() => {
    let installed = 0;
    let demand = 0;
    const rows = chosen.map((a) => {
      const n = items[a.id];
      const w = wattOf(a) * n;
      const d = w * kuOf(a);
      installed += w;
      demand += d;
      return { a, n, w, d };
    });
    const full = demand / cos;
    const amps = phases === 1 ? full / 230 : full / (400 * Math.sqrt(3));
    const ampsWithReserve = amps * (1 + reserve / 100);
    return { rows, installed, demand, full, amps, ampsWithReserve };
  }, [chosen, items, power, kus, cos, phases, reserve]);

  const brk = pickBreaker(calc.ampsWithReserve);

  // отдельные линии для мощных приборов
  const heavy = useMemo(() => calc.rows.filter((r) => wattOf(r.a) >= 2000).sort((x, y) => wattOf(y.a) - wattOf(x.a)), [calc.rows, power]);

  const money = (v: number) => v.toLocaleString('ru-RU');

  // ---------- ЧЕК-ЛИСТ ----------
  const checklist = useMemo(() => {
    const out: Array<{ ok: boolean; warn?: boolean; text: string }> = [];
    out.push({ ok: calc.rows.length > 0, text: `В расчёт включено ${calc.rows.length} позиций, всего ${calc.rows.reduce((a, r) => a + r.n, 0)} приборов` });
    out.push({ ok: true, text: `Установленная мощность ${(calc.installed / 1000).toFixed(2)} кВт, расчётная с учётом Kи — ${(calc.demand / 1000).toFixed(2)} кВт` });
    out.push({ ok: true, text: `Полная мощность S = P / cos φ = ${(calc.full / 1000).toFixed(2)} кВА` });
    out.push({ ok: true, text: `Расчётный ток ${calc.amps.toFixed(1)} А, с резервом ${reserve}% — ${calc.ampsWithReserve.toFixed(1)} А` });
    out.push({ ok: true, text: `Вводной аппарат ${phases === 3 ? '3P/4P ' : ''}${brk.brk}, сечение ввода ${brk.sec} медь` });

    if (phases === 1 && calc.ampsWithReserve > 63) {
      out.push({ ok: false, text: 'Ток превышает 63 А для одной фазы — требуется трёхфазный ввод 380 В' });
    } else {
      out.push({ ok: true, text: `Однофазный ввод справляется, запас ${(brk.amp - calc.ampsWithReserve).toFixed(1)} А` });
    }

    if (phases === 3) {
      out.push({ ok: true, text: `Распределить нагрузку по трём фазам примерно поровну: около ${(calc.demand / 3000).toFixed(1)} кВт на фазу` });
    }

    heavy.forEach((r) => {
      const ln = lineFor(wattOf(r.a), r.a.group);
      out.push({ ok: true, text: `${r.a.name} (${wattOf(r.a)} Вт) — отдельная линия ${ln.brk}, кабель ${ln.sec}` });
    });

    const wetItems = calc.rows.filter((r) => r.a.group === 'Санузел');
    if (wetItems.length > 0) {
      out.push({ ok: true, warn: true, text: `Мокрые зоны (${wetItems.map((r) => r.a.name).join(', ')}) — защита УЗО или дифавтоматом 10 мА` });
    }
    if (calc.rows.some((r) => r.a.id === 'ev')) {
      out.push({ ok: true, warn: true, text: 'Зарядка электромобиля — УЗО типа A или B, кабель 6 мм², автомат C40, отдельная линия' });
    }
    if (calc.rows.some((r) => ['pump', 'pump-drain', 'compressor'].includes(r.a.id))) {
      out.push({ ok: true, warn: true, text: 'Есть двигатели с пусковым током — применить характеристику D или защиту двигателя' });
    }
    if (calc.rows.some((r) => r.a.id === 'fridge')) {
      out.push({ ok: true, text: 'Холодильник вывести на отдельную линию, чтобы отключение УЗО не разморозило продукты' });
    }
    out.push({ ok: true, text: 'Свет и розетки развести под разные УЗО 30 мА, каждому УЗО — своя нулевая шина' });
    out.push({ ok: true, warn: true, text: 'Установить реле напряжения и УЗИП класса II на вводе' });
    out.push({ ok: true, text: 'Предусмотреть запас 20–30 % свободных модулей в щите' });
    return out;
  }, [calc, heavy, phases, brk, reserve, power]);

  const reportText = useMemo(() => {
    const lines = [
      'РАСЧЁТ ЭЛЕКТРИЧЕСКОЙ НАГРУЗКИ',
      `Сеть: ${phases === 1 ? 'однофазная 230 В' : 'трёхфазная 400 В'} · cos φ = ${cos.toFixed(2)} · резерв ${reserve}%`,
      '',
      'ПЕРЕЧЕНЬ ПОТРЕБИТЕЛЕЙ:',
      ...calc.rows.map((r) => `  ${r.a.name} × ${r.n} — ${wattOf(r.a)} Вт, Kи ${kuOf(r.a)} → ${Math.round(r.d)} Вт`),
      '',
      `Установленная мощность: ${(calc.installed / 1000).toFixed(2)} кВт`,
      `Расчётная мощность: ${(calc.demand / 1000).toFixed(2)} кВт`,
      `Полная мощность: ${(calc.full / 1000).toFixed(2)} кВА`,
      `Расчётный ток: ${calc.amps.toFixed(1)} А (с резервом ${calc.ampsWithReserve.toFixed(1)} А)`,
      `Вводной аппарат: ${brk.brk}, кабель ${brk.sec}`,
      '',
      'ЧЕК-ЛИСТ:',
      ...checklist.map((c) => `  [${c.ok ? 'v' : '!'}] ${c.text}`),
      '',
      'Расчёт выполнен в тренажёре ЭлектроМастер · t.me/irawiq',
    ];
    return lines.join('\n');
  }, [calc, checklist, phases, cos, reserve, brk, power, kus]);

  const copyReport = () => {
    navigator.clipboard?.writeText(reportText);
    setCopied(true);
    sfx.spark();
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div className="pop-in my-4 w-full max-w-4xl rounded-3xl border border-line bg-[#0c1320] p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        {/* шапка */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-emerald-500/15 p-2.5">
            <Calculator className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <div className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Инструмент монтажника</div>
            <h2 className="font-display text-xl text-white">Калькулятор нагрузки</h2>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-xl border border-line bg-panel p-1">
              {(
                [
                  ['calc', 'Расчёт', <Calculator key="a" className="h-3.5 w-3.5" />],
                  ['report', 'Чек-лист', <ClipboardList key="b" className="h-3.5 w-3.5" />],
                ] as const
              ).map(([k, t, ic]) => (
                <button
                  key={k}
                  onClick={() => setTab(k as 'calc' | 'report')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${tab === k ? 'bg-volt text-black' : 'text-slate-400 hover:text-white'}`}
                >
                  {ic} {t}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* параметры сети */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-line bg-panel p-3">
          <span className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Сеть</span>
          {([1, 3] as const).map((ph) => (
            <button key={ph} onClick={() => setPhases(ph)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${phases === ph ? 'bg-volt text-black' : 'bg-[#0a101b] text-slate-400 hover:text-white'}`}>
              {ph === 1 ? '1 фаза · 230 В' : '3 фазы · 400 В'}
            </button>
          ))}
          <span className="flex items-center gap-2 text-xs text-slate-400">
            cos φ
            <input type="range" min={0.7} max={1} step={0.05} value={cos} onChange={(e) => setCos(Number(e.target.value))} className="w-20 accent-amber-400" />
            <span className="w-9 font-mono text-slate-200">{cos.toFixed(2)}</span>
          </span>
          <span className="flex items-center gap-2 text-xs text-slate-400">
            резерв
            <input type="range" min={0} max={50} step={5} value={reserve} onChange={(e) => setReserve(Number(e.target.value))} className="w-20 accent-emerald-400" />
            <span className="w-9 font-mono text-slate-200">{reserve}%</span>
          </span>
          <button onClick={resetAll} className="ml-auto flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-bold text-slate-400 transition hover:text-white">
            <RotateCcw className="h-3.5 w-3.5" /> Сбросить
          </button>
        </div>

        {tab === 'calc' ? (
          <>
            {/* поиск и фильтры */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex min-w-40 flex-1 items-center gap-2 rounded-xl border border-line bg-[#0a101b] px-3 py-2">
                <Search className="h-4 w-4 text-slate-500" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск прибора…" className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600" />
              </div>
              <button
                onClick={() => setShowAdd((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-volt/40 bg-volt/10 px-3 py-2 text-xs font-bold text-volt transition hover:bg-volt/20"
              >
                <Plus className="h-3.5 w-3.5" /> Свой прибор
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {groups.map((g) => (
                <button key={g} onClick={() => setGroupF(g)} className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${groupF === g ? 'bg-volt text-black' : 'bg-[#0a101b] text-slate-400 hover:text-white'}`}>
                  {g}
                </button>
              ))}
            </div>

            {/* форма добавления */}
            {showAdd && (
              <div className="pop-in mt-3 grid gap-2 rounded-2xl border border-volt/40 bg-volt/[0.06] p-3 grid-cols-1 sm:grid-cols-[1fr_120px_120px_auto]">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Название прибора" className="rounded-lg border border-line bg-[#0a101b] px-3 py-2 text-sm text-slate-100 outline-none focus:border-volt/60" />
                <input value={newWatt} onChange={(e) => setNewWatt(e.target.value)} type="number" placeholder="Ватт" className="rounded-lg border border-line bg-[#0a101b] px-3 py-2 text-sm text-slate-100 outline-none focus:border-volt/60" />
                <input value={newKu} onChange={(e) => setNewKu(e.target.value)} type="number" step="0.05" min="0.05" max="1" placeholder="Kи" className="rounded-lg border border-line bg-[#0a101b] px-3 py-2 text-sm text-slate-100 outline-none focus:border-volt/60" />
                <button onClick={addCustom} className="rounded-lg bg-volt px-4 py-2 font-display text-xs tracking-wide text-black transition hover:bg-volt-2">
                  ДОБАВИТЬ
                </button>
                <p className="text-[11px] text-slate-500 sm:col-span-4">
                  Kи — коэффициент использования: доля времени, когда прибор реально работает. Чайник 0,2–0,3, холодильник 0,8, отопление 0,8–1,0.
                </p>
              </div>
            )}

            {/* список приборов */}
            <div className="mt-3 max-h-[38vh] space-y-1 overflow-y-auto rounded-2xl border border-line bg-panel p-2 pr-1">
              {list.map((a) => {
                const n = items[a.id] ?? 0;
                const isEdit = editId === a.id;
                return (
                  <div key={a.id} className={`rounded-xl px-3 py-2 transition ${n > 0 ? 'bg-volt/[0.07]' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-bold text-slate-200">{a.name}</span>
                          {a.custom && <span className="rounded bg-volt/20 px-1.5 py-0.5 font-mono text-[9px] text-volt">своё</span>}
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10.5px] text-slate-500">
                          <span className={power[a.id] !== undefined ? 'text-volt' : ''}>{wattOf(a)} Вт</span>
                          <span>·</span>
                          <span className={kus[a.id] !== undefined ? 'text-volt' : ''}>Kи {kuOf(a)}</span>
                          {n > 0 && <span className="text-emerald-400">→ {Math.round(wattOf(a) * n * kuOf(a))} Вт расч.</span>}
                        </div>
                      </div>
                      <button onClick={() => setEditId(isEdit ? null : a.id)} className={`rounded-lg p-1.5 transition ${isEdit ? 'bg-volt/20 text-volt' : 'text-slate-500 hover:text-white'}`} title="Изменить мощность">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {a.custom && (
                        <button onClick={() => removeCustom(a.id)} className="rounded-lg p-1.5 text-slate-500 transition hover:text-red-400" title="Удалить">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => add(a.id, -1)} className="rounded-lg bg-[#0a101b] p-1.5 text-slate-400 transition hover:text-white">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className={`w-6 text-center font-mono text-sm font-bold ${n > 0 ? 'text-volt' : 'text-slate-600'}`}>{n}</span>
                        <button onClick={() => add(a.id, 1)} className="rounded-lg bg-[#0a101b] p-1.5 text-slate-400 transition hover:text-white">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* редактор мощности */}
                    {isEdit && (
                      <div className="pop-in mt-2 grid gap-3 rounded-xl border border-line bg-[#0a101b] p-3 sm:grid-cols-2">
                        <div>
                          <div className="mb-1 flex justify-between font-mono text-[10px] text-slate-500">
                            <span>МОЩНОСТЬ, ВТ</span>
                            <span className="text-volt">{wattOf(a)}</span>
                          </div>
                          <input type="range" min={50} max={10000} step={50} value={wattOf(a)} onChange={(e) => setPower((s) => ({ ...s, [a.id]: Number(e.target.value) }))} className="w-full accent-amber-400" />
                          <input
                            type="number"
                            value={wattOf(a)}
                            onChange={(e) => setPower((s) => ({ ...s, [a.id]: Math.max(0, Number(e.target.value)) }))}
                            className="mt-1.5 w-full rounded-lg border border-line bg-panel px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-volt/60"
                          />
                        </div>
                        <div>
                          <div className="mb-1 flex justify-between font-mono text-[10px] text-slate-500">
                            <span>КОЭФФИЦИЕНТ ИСПОЛЬЗОВАНИЯ</span>
                            <span className="text-volt">{kuOf(a).toFixed(2)}</span>
                          </div>
                          <input type="range" min={0.05} max={1} step={0.05} value={kuOf(a)} onChange={(e) => setKus((s) => ({ ...s, [a.id]: Number(e.target.value) }))} className="w-full accent-emerald-400" />
                          <button
                            onClick={() => {
                              setPower((s) => {
                                const c = { ...s };
                                delete c[a.id];
                                return c;
                              });
                              setKus((s) => {
                                const c = { ...s };
                                delete c[a.id];
                                return c;
                              });
                            }}
                            className="mt-1.5 w-full rounded-lg border border-line bg-panel py-1.5 text-[11px] font-bold text-slate-400 transition hover:text-white"
                          >
                            Вернуть значения по умолчанию
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {list.length === 0 && <p className="py-6 text-center text-xs text-slate-600">Ничего не найдено. Добавьте свой прибор.</p>}
            </div>

            {/* результат */}
            <div className="mt-3 grid gap-2 grid-cols-2 sm:grid-cols-4">
              {[
                { t: 'Установленная', v: `${(calc.installed / 1000).toFixed(1)} кВт`, c: 'text-slate-300' },
                { t: 'Расчётная', v: `${(calc.demand / 1000).toFixed(1)} кВт`, c: 'text-volt' },
                { t: 'Полная', v: `${(calc.full / 1000).toFixed(1)} кВА`, c: 'text-sky-300' },
                { t: 'Ток с резервом', v: `${calc.ampsWithReserve.toFixed(1)} А`, c: 'text-emerald-300' },
              ].map((s) => (
                <div key={s.t} className="rounded-2xl border border-line bg-panel p-3 text-center">
                  <div className={`font-display text-xl ${s.c}`}>{s.v}</div>
                  <div className="mt-0.5 text-[10.5px] text-slate-500">{s.t}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-500/35 bg-emerald-500/[0.07] p-4">
              <Zap className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="text-[13.5px] text-slate-300">
                Вводной автомат <b className="text-white">{phases === 3 ? '3P/4P ' : ''}{brk.brk}</b> · сечение ввода{' '}
                <b className="text-white">{brk.sec}</b> медь · запас <b className="text-white">{Math.max(0, brk.amp - calc.ampsWithReserve).toFixed(1)} А</b>
              </div>
              <button onClick={() => setTab('report')} className="ml-auto flex items-center gap-2 rounded-xl bg-volt px-4 py-2.5 font-display text-xs tracking-wide text-black transition hover:bg-volt-2">
                <ClipboardList className="h-4 w-4" /> ОТКРЫТЬ ЧЕК-ЛИСТ
              </button>
            </div>
          </>
        ) : (
          /* ---------- ВКЛАДКА ЧЕК-ЛИСТ ---------- */
          <div className="mt-4">
            {calc.rows.length === 0 ? (
              <div className="rounded-2xl border border-line bg-panel p-8 text-center">
                <ClipboardList className="mx-auto h-8 w-8 text-slate-600" />
                <p className="mt-3 text-sm text-slate-400">Добавьте приборы во вкладке «Расчёт», чтобы сформировать чек-лист.</p>
                <button onClick={() => setTab('calc')} className="mt-4 rounded-xl bg-volt px-5 py-2.5 font-display text-xs tracking-wide text-black">
                  ПЕРЕЙТИ К РАСЧЁТУ
                </button>
              </div>
            ) : (
              <>
                {/* таблица потребителей */}
                <div className="overflow-x-auto rounded-2xl border border-line">
                  <table className="w-full text-left text-[12.5px]">
                    <thead className="bg-panel">
                      <tr>
                        {['Потребитель', 'Кол-во', 'Мощность', 'Kи', 'Расчётная'].map((hd) => (
                          <th key={hd} className="px-3 py-2 font-mono text-[10px] tracking-wider text-slate-500 uppercase">
                            {hd}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {calc.rows.map((r) => (
                        <tr key={r.a.id} className="border-t border-line/70">
                          <td className="px-3 py-1.5 font-bold text-slate-200">{r.a.name}</td>
                          <td className="px-3 py-1.5 text-slate-400">{r.n}</td>
                          <td className="px-3 py-1.5 text-slate-400">{money(wattOf(r.a))} Вт</td>
                          <td className="px-3 py-1.5 text-slate-400">{kuOf(r.a)}</td>
                          <td className="px-3 py-1.5 font-bold text-volt">{money(Math.round(r.d))} Вт</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-line bg-panel/60">
                        <td className="px-3 py-2 font-display text-slate-200" colSpan={4}>
                          ИТОГО расчётная мощность
                        </td>
                        <td className="px-3 py-2 font-display text-volt">{(calc.demand / 1000).toFixed(2)} кВт</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* формулы */}
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {[
                    { f: 'P = Σ(Pi × ni × Kи)', v: `${(calc.demand / 1000).toFixed(2)} кВт` },
                    { f: 'S = P / cos φ', v: `${(calc.full / 1000).toFixed(2)} кВА` },
                    { f: phases === 1 ? 'I = S / 230' : 'I = S / (400 × √3)', v: `${calc.amps.toFixed(1)} А` },
                  ].map((x) => (
                    <div key={x.f} className="rounded-xl border border-line bg-panel p-3">
                      <div className="font-mono text-[11px] text-slate-500">{x.f}</div>
                      <div className="mt-1 font-display text-lg text-volt">{x.v}</div>
                    </div>
                  ))}
                </div>

                {/* отдельные линии */}
                {heavy.length > 0 && (
                  <div className="mt-3 rounded-2xl border border-sky-500/30 bg-sky-500/[0.06] p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-sky-300">
                      <ChevronDown className="h-4 w-4" /> Рекомендуемые отдельные линии
                    </div>
                    <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      {heavy.map((r) => {
                        const ln = lineFor(wattOf(r.a), r.a.group);
                        return (
                          <div key={r.a.id} className="flex items-center gap-2 rounded-lg bg-[#0a101b] px-3 py-2 text-[12.5px]">
                            <span className="truncate text-slate-300">{r.a.name}</span>
                            <span className="ml-auto shrink-0 font-mono text-emerald-300">
                              {ln.brk} · {ln.sec}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* чек-лист */}
                <div className="mt-3 rounded-2xl border border-line bg-panel p-4">
                  <div className="mb-2.5 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-volt" />
                    <span className="font-display text-sm text-white">Чек-лист по результатам расчёта</span>
                  </div>
                  <div className="space-y-1.5">
                    {checklist.map((c, i) => (
                      <div key={i} className="flex gap-2.5 text-[13px] leading-relaxed">
                        {c.ok ? (
                          c.warn ? (
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                          ) : (
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                          )
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                        )}
                        <span className={c.ok ? 'text-slate-300' : 'text-red-300'}>{c.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={copyReport} className="flex items-center gap-2 rounded-xl bg-volt px-5 py-3 font-display text-xs tracking-wide text-black transition hover:bg-volt-2">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'СКОПИРОВАНО' : 'СКОПИРОВАТЬ ОТЧЁТ'}
                  </button>
                  <button onClick={() => setTab('calc')} className="rounded-xl border border-line bg-panel px-5 py-3 text-xs font-bold text-slate-300 transition hover:border-volt/50 hover:text-white">
                    Вернуться к расчёту
                  </button>
                  <p className="w-full text-[10.5px] leading-relaxed text-slate-600">
                    Расчёт носит ориентировочный характер. Итоговые решения согласуйте с проектом и техническими условиями
                    энергоснабжающей организации.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

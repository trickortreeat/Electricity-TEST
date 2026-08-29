import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Cable, Calculator, Check, CheckCircle2, Home, Lightbulb, RotateCcw, Search, Star, Trophy, Wrench, X } from 'lucide-react';
import LoadCalc from './LoadCalc';
import { CATALOG, CATALOG_BY_ID, PANEL_TASKS, PICK_THEORY, type CatalogItem, type PanelTask } from '../content';
import { buildWiringModel, type WLink } from '../wiringPlan';
import { MvpNote, TgBadge } from './Telegram';
import { sfx } from '../audio';

const WIRE_HEX: Record<WLink['color'], string> = { brown: '#c96f2e', blue: '#3d8bff', pe: '#35c759' };
const SLEEVE_HEX: Record<WLink['color'], string> = { brown: '#2b3440', blue: '#1d4ed8', pe: '#e0b400' };

const MOD_W = 38;

const KIND_STYLE: Record<string, { bg: string; text: string; accent: string }> = {
  breaker: { bg: 'from-slate-200 to-slate-400', text: '#1e293b', accent: '#0f172a' },
  breaker2p: { bg: 'from-slate-200 to-slate-400', text: '#1e293b', accent: '#0f172a' },
  breaker3p: { bg: 'from-slate-200 to-slate-400', text: '#1e293b', accent: '#0f172a' },
  rcd: { bg: 'from-amber-100 to-amber-300', text: '#78350f', accent: '#b45309' },
  dif: { bg: 'from-orange-100 to-orange-300', text: '#7c2d12', accent: '#c2410c' },
  vrn: { bg: 'from-sky-100 to-sky-300', text: '#0c4a6e', accent: '#0369a1' },
  uzip: { bg: 'from-yellow-100 to-yellow-300', text: '#713f12', accent: '#a16207' },
  meter: { bg: 'from-emerald-100 to-emerald-300', text: '#064e3b', accent: '#047857' },
  contactor: { bg: 'from-violet-100 to-violet-300', text: '#4c1d95', accent: '#6d28d9' },
  timer: { bg: 'from-fuchsia-100 to-fuchsia-300', text: '#701a75', accent: '#a21caf' },
  cross: { bg: 'from-zinc-200 to-zinc-400', text: '#27272a', accent: '#3f3f46' },
  busbar: { bg: 'from-blue-100 to-blue-300', text: '#1e3a8a', accent: '#1d4ed8' },
  comb: { bg: 'from-amber-200 to-amber-400', text: '#78350f', accent: '#92400e' },
  sep: { bg: 'from-slate-300 to-slate-500', text: '#1e293b', accent: '#334155' },
};

function Module({ item, live, small }: { item: CatalogItem; live?: boolean; small?: boolean }) {
  const st = KIND_STYLE[item.kind] ?? KIND_STYLE.breaker;
  return (
    <div
      className={`relative flex h-full flex-col items-center justify-center rounded-md bg-gradient-to-b ${st.bg} px-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_6px_rgba(0,0,0,0.5)]`}
      style={{ width: item.mods * MOD_W - 4 }}
    >
      <div className="absolute inset-x-1 top-1 h-1.5 rounded-sm bg-black/10" />
      <span className="font-mono text-[10px] leading-tight font-extrabold" style={{ color: st.text }}>
        {item.short}
      </span>
      {!small && (
        <>
          <div className="mt-1 flex gap-0.5">
            {Array.from({ length: Math.min(item.mods, 3) }).map((_, i) => (
              <span key={i} className="block h-4 w-1.5 rounded-sm" style={{ background: st.accent, opacity: live ? 1 : 0.65 }} />
            ))}
          </div>
          <span className="absolute right-1 bottom-1 h-1.5 w-1.5 rounded-full" style={{ background: live ? '#16a34a' : '#94a3b8', boxShadow: live ? '0 0 6px #16a34a' : undefined }} />
        </>
      )}
    </div>
  );
}

export default function Builder({
  task,
  onExit,
  onFinished,
  onNext,
  isLast,
}: {
  task: PanelTask;
  onExit: () => void;
  onFinished: (taskId: number, stars: number) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const totalSlots = task.rails.reduce((a, r) => a + r.slots.length, 0);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean> | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [group, setGroup] = useState<string>('Все');
  const [query, setQuery] = useState('');
  const [done, setDone] = useState(false);
  const [stage, setStage] = useState<'place' | 'wire'>('place');
  const [wired, setWired] = useState<WLink[]>([]);
  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [wireMsg, setWireMsg] = useState<string | null>(null);
  const [hintLink, setHintLink] = useState<WLink | null>(null);
  const [live, setLive] = useState(false);
  const [wireColor, setWireColor] = useState<WLink['color']>('brown');
  const [wireZoom, setWireZoom] = useState(1);
  const [calcOpen, setCalcOpen] = useState(false);
  const [hoverWire, setHoverWire] = useState<number | null>(null);

  const groups = useMemo(() => ['Все', ...Array.from(new Set(CATALOG.map((c) => c.group)))], []);
  const list = useMemo(
    () =>
      CATALOG.filter((c) => (group === 'Все' || c.group === group) && (query.trim() === '' || (c.title + c.sub).toLowerCase().includes(query.toLowerCase()))),
    [group, query],
  );

  const placedCount = Object.keys(placed).length;
  const stars = mistakes === 0 && hints === 0 ? 3 : mistakes + hints <= 3 ? 2 : 1;

  const place = (key: string, itemId: string) => {
    setPlaced((p) => ({ ...p, [key]: itemId }));
    setChecked(null);
    sfx.spark();
  };

  const check = () => {
    const res: Record<string, boolean> = {};
    let wrong = 0;
    task.rails.forEach((rail, ri) =>
      rail.slots.forEach((slot, si) => {
        const key = `${ri}-${si}`;
        const ok = placed[key] === slot.need;
        res[key] = ok;
        if (!ok) wrong++;
      }),
    );
    setChecked(res);
    if (wrong === 0) {
      sfx.powerOn();
      setTimeout(() => {
        setStage('wire');
        sfx.select();
      }, 700);
    } else {
      setMistakes((m) => m + 1);
      sfx.error();
    }
  };

  // ---------- этап 2: расключение ----------
  const wiring = useMemo(() => buildWiringModel(task), [task]);
  const linkKey = (l: { a: string; b: string }) => [l.a, l.b].sort().join('|');
  const planMap = useMemo(() => new Map(wiring.links.map((l) => [linkKey(l), l])), [wiring]);

  const connectTerms = (a: string, b: string, color: WLink['color']) => {
    const k = [a, b].sort().join('|');
    if (wired.some((w) => linkKey(w) === k)) {
      setWireMsg('Эти клеммы уже соединены.');
      sfx.click();
      return;
    }
    const plan = planMap.get(k);
    if (!plan) {
      setMistakes((m) => m + 1);
      setWireMsg('Так соединять нельзя: проверьте цепочку «ввод → магистраль → шина питания → группа». Ноль идёт через шину N, земля — только на шину PE.');
      sfx.error();
      return;
    }
    if (color !== plan.color) {
      setMistakes((m) => m + 1);
      const need = plan.color === 'brown' ? 'коричневый (фаза)' : plan.color === 'blue' ? 'синий (ноль)' : 'жёлто-зелёный (земля)';
      setWireMsg(`Неверный цвет провода. Для этой цепи нужен ${need} — цветовая маркировка обязательна по правилам.`);
      sfx.error();
      return;
    }
    setWired((w) => [...w, plan]);
    setWireMsg(`✔ ${plan.note}`);
    sfx.spark();
    if (wired.length + 1 === wiring.links.length) {
      setTimeout(() => {
        setLive(true);
        sfx.powerOn();
      }, 400);
      setTimeout(() => {
        setDone(true);
        sfx.success();
        onFinished(task.id, mistakes === 0 && hints === 0 ? 3 : mistakes + hints <= 3 ? 2 : 1);
      }, 1500);
    }
  };

  const wireHint = () => {
    const nxt = wiring.links.find((l) => !wired.some((w) => linkKey(w) === linkKey(l)));
    if (!nxt) return;
    setHints((h) => h + 1);
    setHintLink(nxt);
    setWireMsg(`Подсказка: ${nxt.note}`);
    sfx.select();
  };

  const hint = () => {
    for (let ri = 0; ri < task.rails.length; ri++) {
      for (let si = 0; si < task.rails[ri].slots.length; si++) {
        const key = `${ri}-${si}`;
        if (placed[key] !== task.rails[ri].slots[si].need) {
          place(key, task.rails[ri].slots[si].need);
          setHints((h) => h + 1);
          return;
        }
      }
    }
  };

  const reset = () => {
    setPlaced({});
    setChecked(null);
    setMistakes(0);
    setHints(0);
    setDone(false);
    setPicked(null);
    setStage('place');
    setWired([]);
    setSelTerm(null);
    setWireMsg(null);
    setHintLink(null);
    setLive(false);
    sfx.click();
  };

  const allPlaced = placedCount === totalSlots;

  return (
    <div className="min-h-screen bg-[#070b12] blueprint pb-10">
      <header className="mx-auto w-full max-w-[1600px] px-2 pt-2 pl-16">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="flex items-center gap-1.5 rounded-xl border border-line bg-panel px-2.5 py-2 text-sm font-bold text-slate-300 hover:border-volt/50 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Меню</span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-emerald-400 px-1.5 py-0.5 font-display text-[10px] tracking-wide text-black">ЩИТОСБОРКА</span>
              <span className="font-mono text-[10px] text-slate-500">{task.id}/{PANEL_TASKS.length}</span>
            </div>
            <h1 className="truncate font-display text-[15px] text-white sm:text-lg">{task.title}</h1>
          </div>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className="rounded-xl border border-line bg-panel px-2.5 py-1.5 font-mono text-[11px] text-slate-400">
            {placedCount}/{totalSlots}
          </span>
          <button onClick={stage === 'place' ? hint : wireHint} className="flex items-center gap-1 rounded-xl border border-volt/40 bg-volt/10 px-2 py-1.5 text-xs font-bold text-volt">
            <Lightbulb className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Подсказка</span>
          </button>
          <button onClick={() => setCalcOpen(true)} className="flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-2 py-1.5 text-xs font-bold text-emerald-300">
            <Calculator className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Калькулятор</span>
          </button>
          <button onClick={reset} className="rounded-xl border border-line bg-panel p-1.5 text-slate-300 hover:border-volt/50" aria-label="reset">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          {stage === 'place' && (
            <button
              onClick={check}
              disabled={!allPlaced}
              className={`flex items-center gap-1 rounded-xl px-2 py-1.5 font-display text-xs tracking-wide transition ${
                allPlaced ? 'bg-volt text-black hover:bg-volt-2' : 'cursor-not-allowed bg-panel text-slate-600'
              }`}
            >
              <Check className="h-4 w-4" /> ПРОВЕРИТЬ ПОДБОР
            </button>
          )}
          {stage === 'wire' && (
            <span className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 font-display text-sm text-emerald-300">
              <Cable className="h-4 w-4" /> {wired.length} / {wiring.links.length} соединений
            </span>
          )}
          <TgBadge compact />
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1600px] px-4 pt-2">
        <MvpNote />
      </div>
      <div className={`mx-auto mt-2 grid w-full max-w-[1600px] gap-3 px-2 ${stage === 'place' ? 'lg:grid-cols-[280px_1fr]' : ''}`}>
        {/* каталог */}
        <aside className={`rounded-2xl border border-line bg-panel/70 p-3 ${stage === 'wire' ? 'hidden' : ''}`}>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-[#0a101b] px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по каталогу…"
              className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {groups.map((g) => (
              <button key={g} onClick={() => setGroup(g)} className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${group === g ? 'bg-volt text-black' : 'bg-[#0a101b] text-slate-400 hover:text-white'}`}>
                {g}
              </button>
            ))}
          </div>
          <div className="mt-2 max-h-[48vh] space-y-1 overflow-y-auto pr-1 sm:max-h-[55vh]">
            {list.map((c) => (
              <button
                key={c.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', c.id);
                  setPicked(c.id);
                }}
                onClick={() => {
                  setPicked(picked === c.id ? null : c.id);
                  sfx.click();
                }}
                className={`flex w-full items-center gap-2 rounded-xl border p-1.5 text-left transition ${
                  picked === c.id ? 'border-volt bg-volt/10' : 'border-line bg-[#0b111c] hover:border-slate-600'
                }`}
              >
                <div className="h-9 shrink-0" style={{ width: Math.min(c.mods, 3) * (MOD_W - 4) }}>
                  <Module item={c} small />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11.5px] leading-tight font-bold text-slate-200">{c.title}</div>
                  <div className="truncate text-[9.5px] leading-tight text-slate-500">{c.sub}</div>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] leading-snug text-slate-500 sm:text-[11px]">
            Выберите аппарат и нажмите на место в щите или перетащите мышью.
          </p>
        </aside>

        {/* щит */}
        <main>
          <div className="rounded-2xl border border-line bg-panel/60 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Wrench className="h-5 w-5 text-volt" />
              <div>
                <div className="font-display text-sm text-white">{task.place}</div>
                <div className="text-xs text-slate-500">{task.brief}</div>
              </div>
              <span className="ml-auto rounded-lg border border-line bg-[#0a101b] px-3 py-1.5 font-mono text-xs text-slate-400">{task.load}</span>
            </div>
          </div>

          {stage === 'wire' && (
            <div className="mt-4 rounded-3xl border-2 border-emerald-500/40 bg-[#0a101b]/90 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="rounded-lg bg-emerald-400 px-2.5 py-1 font-display text-[11px] text-black">ЭТАП 2 · РАСКЛЮЧЕНИЕ</span>
                <span className="text-xs text-slate-400">Выберите цвет провода, затем щёлкните по двум клеммам. На концах автоматически обжимаются НШВИ.</span>
                <div className="ml-auto flex items-center gap-1.5 rounded-xl border border-line bg-[#0a101b] p-1.5">
                  {(['brown', 'blue', 'pe'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setWireColor(c)}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${wireColor === c ? 'bg-white/10 text-white ring-1 ring-volt' : 'text-slate-400 hover:text-white'}`}
                    >
                      <span className="h-3 w-7 rounded-full" style={{ background: c === 'pe' ? 'repeating-linear-gradient(45deg,#35c759 0 5px,#ffd93d 5px 10px)' : WIRE_HEX[c] }} />
                      {c === 'brown' ? 'Фаза' : c === 'blue' ? 'Ноль' : 'Земля'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-2 flex items-center gap-1 rounded-xl border border-line bg-[#0a101b] p-1 w-fit">
                <button onClick={() => setWireZoom((z) => Math.max(0.6, z - 0.15))} className="rounded-lg px-2.5 py-1 text-slate-300 hover:bg-white/5">
                  −
                </button>
                <span className="w-12 text-center font-mono text-xs text-slate-400">{Math.round(wireZoom * 100)}%</span>
                <button onClick={() => setWireZoom((z) => Math.min(2.2, z + 0.15))} className="rounded-lg px-2.5 py-1 text-slate-300 hover:bg-white/5">
                  +
                </button>
                <span className="px-2 font-mono text-[10px] text-slate-600">масштаб схемы · прокрутка для перемещения</span>
              </div>
              <div className="overflow-auto rounded-2xl bg-[#0b111c] p-2">
                <svg viewBox={`0 0 ${wiring.width} ${wiring.height}`} style={{ minWidth: wiring.width * wireZoom * 0.55, width: `${wireZoom * 100}%` }} className="h-[52vh]">
                  {/* рейки с торцевыми заглушками-ограничителями */}
                  {task.rails.map((_, ri) => {
                    const y = 150 + ri * 260;
                    return (
                      <g key={ri}>
                        <rect x={240} y={y - 9} width={wiring.width - 300} height={18} rx={4} fill="#4b5b74" stroke="#2c3a55" strokeWidth={1.5} />
                        <rect x={236} y={y - 18} width={10} height={36} rx={3} fill="#8b98ad" stroke="#5b6577" strokeWidth={1.5} />
                        <rect x={wiring.width - 66} y={y - 18} width={10} height={36} rx={3} fill="#8b98ad" stroke="#5b6577" strokeWidth={1.5} />
                      </g>
                    );
                  })}

                  {/* провода: верхние связи идут над рядом, нижние — под ним, каждая на своей дорожке */}
                  {wired.map((w, i) => {
                    const a = wiring.terms.get(w.a)!;
                    const b = wiring.terms.get(w.b)!;
                    const bothTop = a.side === 'top' && b.side === 'top';
                    const lane = (i % 8) * 15;
                    const midY = bothTop ? Math.min(a.y, b.y) - 36 - lane : Math.max(a.y, b.y) + 38 + lane;
                    const d = `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`;
                    const hl = hoverWire === i;
                    const labelX = (a.x + b.x) / 2;
                    const tag = `${i + 1}`;
                    return (
                      <g key={i} onMouseEnter={() => setHoverWire(i)} onMouseLeave={() => setHoverWire(null)} style={{ cursor: 'help' }}>
                        <title>{`Провод №${i + 1}: ${w.note}`}</title>
                        <path d={d} fill="none" stroke="transparent" strokeWidth={18} />
                        <path d={d} fill="none" stroke="#080d15" strokeWidth={hl ? 12 : 9} strokeLinejoin="round" strokeLinecap="round" />
                        <path
                          d={d}
                          fill="none"
                          stroke={WIRE_HEX[w.color]}
                          strokeWidth={hl ? 7 : 5.5}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          style={hl ? { filter: `drop-shadow(0 0 9px ${WIRE_HEX[w.color]})` } : live ? { filter: `drop-shadow(0 0 5px ${WIRE_HEX[w.color]})` } : undefined}
                        />
                        {w.color === 'pe' && <path d={d} fill="none" stroke="#ffd93d" strokeWidth={hl ? 7 : 5.5} strokeLinejoin="round" strokeDasharray="10 10" strokeDashoffset={5} />}
                        {/* номер провода на горизонтальном участке */}
                        <circle cx={labelX} cy={midY} r={hl ? 11 : 9} fill="#070d16" stroke={WIRE_HEX[w.color]} strokeWidth={2} />
                        <text x={labelX} y={midY + 4} textAnchor="middle" fontSize={hl ? 11 : 9.5} fontWeight={800} fill={WIRE_HEX[w.color]} fontFamily="'JetBrains Mono', monospace">
                          {tag}
                        </text>
                        {/* НШВИ на концах */}
                        {[a, b].map((t, k) => (
                          <g key={k} transform={`translate(${t.x} ${t.y}) rotate(${t.y < midY ? 90 : -90})`}>
                            <rect x={-2} y={-4.5} width={13} height={9} rx={1.5} fill="#c3ccd9" stroke="#7b8798" strokeWidth={0.8} />
                            <rect x={11} y={-6} width={11} height={12} rx={2.5} fill={SLEEVE_HEX[w.color]} stroke="rgba(0,0,0,0.35)" strokeWidth={0.8} />
                          </g>
                        ))}
                      </g>
                    );
                  })}

                  {/* модули */}
                  {wiring.modules.map((m) => {
                    const st = KIND_STYLE[m.item.kind] ?? KIND_STYLE.breaker;
                    const isSrc = m.slotKey === 'src';
                    return (
                      <g key={m.slotKey}>
                        <rect x={m.x - m.w / 2} y={m.y - 52} width={m.w} height={104} rx={8} fill={isSrc ? '#141d2c' : '#cfd8e6'} stroke={isSrc ? '#33465f' : '#7d8ba1'} strokeWidth={2} />
                        <text x={m.x} y={m.y - 18} textAnchor="middle" fontSize={13} fontWeight={800} fill={isSrc ? '#9db2d4' : st.text} fontFamily="'JetBrains Mono', monospace">
                          {m.item.short}
                        </text>
                        <text x={m.x} y={m.y + 4} textAnchor="middle" fontSize={10} fill={isSrc ? '#64748f' : '#57637a'} fontFamily="'JetBrains Mono', monospace">
                          {m.item.sub.slice(0, 18)}
                        </text>
                        {live && !isSrc && <circle cx={m.x + m.w / 2 - 10} cy={m.y - 40} r={4} fill="#16a34a" style={{ filter: 'drop-shadow(0 0 5px #16a34a)' }} />}
                        {(() => {
                          const words = m.label.split(' ');
                          const lines: string[] = [];
                          let cur = '';
                          words.forEach((w) => {
                            if ((cur + ' ' + w).trim().length <= 16) cur = (cur + ' ' + w).trim();
                            else {
                              if (cur) lines.push(cur);
                              cur = w;
                            }
                          });
                          if (cur) lines.push(cur);
                          const shown = lines.slice(0, 2);
                          const wBox = Math.max(...shown.map((l) => l.length)) * 6.4 + 14;
                          return (
                            <g>
                              <rect x={m.x - wBox / 2} y={m.y + 74} width={wBox} height={shown.length * 14 + 8} rx={5} fill="#070d16" opacity={0.9} stroke="#243149" strokeWidth={1} />
                              {shown.map((l, li) => (
                                <text key={li} x={m.x} y={m.y + 87 + li * 13} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#8ba2c9" fontFamily="'JetBrains Mono', monospace">
                                  {l}
                                </text>
                              ))}
                            </g>
                          );
                        })()}
                        {m.terms.map((t) => {
                          const used = wired.some((w) => w.a === t.id || w.b === t.id);
                          const isSel = selTerm === t.id;
                          const isHint = hintLink && (hintLink.a === t.id || hintLink.b === t.id);
                          return (
                            <g
                              key={t.id}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                if (!selTerm) {
                                  setSelTerm(t.id);
                                  sfx.select();
                                } else if (selTerm === t.id) {
                                  setSelTerm(null);
                                } else {
                                  connectTerms(selTerm, t.id, wireColor);
                                  setSelTerm(null);
                                  setHintLink(null);
                                }
                              }}
                            >
                              <circle cx={t.x} cy={t.y} r={14} fill="transparent" />
                              <circle
                                cx={t.x}
                                cy={t.y}
                                r={10}
                                fill={used ? '#1c2c22' : '#0b1220'}
                                stroke={isSel ? '#ffc42e' : isHint ? '#4ade80' : used ? '#16a34a' : '#5b6b8c'}
                                strokeWidth={isSel || isHint ? 3.5 : 2.2}
                              >
                                {(isSel || isHint) && <animate attributeName="r" values="10;13;10" dur="1s" repeatCount="indefinite" />}
                              </circle>
                              <text x={t.x} y={t.side === 'top' ? t.y - 17 : t.y + 24} textAnchor="middle" fontSize={11} fontWeight={700} fill="#7d92b8" fontFamily="'JetBrains Mono', monospace">
                                {t.label}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </svg>
              </div>
              {wireMsg && (
                <div className={`pop-in mt-3 rounded-xl border px-4 py-2.5 text-sm ${wireMsg.startsWith('✔') ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/40 bg-amber-500/10 text-amber-100'}`}>
                  {wireMsg}
                </div>
              )}

              {/* журнал проложенных проводов */}
              {wired.length > 0 && (
                <div className="mt-3 rounded-2xl border border-line bg-[#0b111c] p-3">
                  <div className="mb-2 font-mono text-[10.5px] tracking-widest text-slate-500 uppercase">Проложенные провода · наведите на строку, чтобы подсветить</div>
                  <div className="grid max-h-40 gap-1 overflow-y-auto pr-1 sm:grid-cols-2">
                    {wired.map((w, i) => (
                      <div
                        key={i}
                        onMouseEnter={() => setHoverWire(i)}
                        onMouseLeave={() => setHoverWire(null)}
                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11.5px] transition ${hoverWire === i ? 'bg-white/[0.06]' : ''}`}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[9.5px] font-bold" style={{ background: `${WIRE_HEX[w.color]}25`, color: WIRE_HEX[w.color] }}>
                          {i + 1}
                        </span>
                        <span className="h-2 w-5 shrink-0 rounded-full" style={{ background: w.color === 'pe' ? 'repeating-linear-gradient(45deg,#35c759 0 4px,#ffd93d 4px 8px)' : WIRE_HEX[w.color] }} />
                        <span className="truncate text-slate-400">{w.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={`mt-4 rounded-3xl border-2 p-5 transition ${stage === 'wire' ? 'hidden' : live ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-line bg-[#0a101b]/80'}`}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-[0.25em] text-slate-500 uppercase">Металлический бокс · {task.rails.length} ряда</span>
              <span className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold ${live ? 'border-emerald-500/50 text-emerald-300' : 'border-line text-slate-500'}`}>
                <span className={`h-2 w-2 rounded-full ${live ? 'animate-pulse bg-emerald-400' : 'bg-slate-600'}`} /> {live ? 'под напряжением' : 'обесточен'}
              </span>
            </div>

            <div className="space-y-6">
              {task.rails.map((rail, ri) => (
                <div key={ri}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500">{rail.title}</span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <div className="relative rounded-xl bg-[#0d141f] p-3">
                    {/* DIN-рейка с торцевыми заглушками */}
                    <div className="absolute inset-x-3 top-1/2 h-4 -translate-y-1/2 rounded bg-gradient-to-b from-slate-500 to-slate-700" />
                    <div className="absolute top-1/2 left-2 h-8 w-2.5 -translate-y-1/2 rounded-sm bg-slate-400" />
                    <div className="absolute top-1/2 right-2 h-8 w-2.5 -translate-y-1/2 rounded-sm bg-slate-400" />
                    <div className="relative flex flex-wrap gap-1.5">
                      {rail.slots.map((slot, si) => {
                        const key = `${ri}-${si}`;
                        const itemId = placed[key];
                        const item = itemId ? CATALOG_BY_ID.get(itemId)! : null;
                        const need = CATALOG_BY_ID.get(slot.need)!;
                        const ok = checked?.[key];
                        return (
                          <div
                            key={key}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const id = e.dataTransfer.getData('text/plain');
                              if (id) place(key, id);
                            }}
                            onClick={() => {
                              if (item) {
                                setPlaced((p) => {
                                  const n = { ...p };
                                  delete n[key];
                                  return n;
                                });
                                setChecked(null);
                                sfx.remove();
                              } else if (picked) {
                                place(key, picked);
                              }
                            }}
                            className={`group relative flex h-28 cursor-pointer flex-col justify-between rounded-lg border-2 border-dashed p-1 transition ${
                              ok === true
                                ? 'border-emerald-500/70 bg-emerald-500/10'
                                : ok === false
                                  ? 'border-red-500/70 bg-red-500/10'
                                  : item
                                    ? 'border-transparent bg-[#111a28]'
                                    : 'border-slate-700 bg-[#0a111c] hover:border-volt/60'
                            }`}
                            style={{ width: need.mods * MOD_W + 8 }}
                            title={slot.label}
                          >
                            <div className="h-14">{item ? <Module item={item} live={live} /> : <div className="flex h-full items-center justify-center font-mono text-[10px] text-slate-700">{need.mods} мод.</div>}</div>
                            <div className="line-clamp-2 px-0.5 text-center text-[8.5px] leading-[1.15] font-bold break-words text-slate-500" title={slot.label}>
                              {slot.label}
                            </div>
                            {ok === false && <X className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 p-0.5 text-white" />}
                            {ok === true && <Check className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-emerald-500 p-0.5 text-white" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {checked && Object.values(checked).some((v) => !v) && (
            <div className="pop-in mt-4 rounded-2xl border border-red-500/40 bg-red-500/5 p-4">
              <div className="flex items-center gap-2 font-display text-sm text-red-300">
                <X className="h-4 w-4" /> Разбор ошибок подбора
              </div>
              <ul className="mt-3 space-y-3 text-sm text-slate-300">
                {task.rails.flatMap((rail, ri) =>
                  rail.slots
                    .map((slot, si) => ({ slot, key: `${ri}-${si}` }))
                    .filter(({ key }) => checked[key] === false)
                    .map(({ slot, key }) => {
                      const need = CATALOG_BY_ID.get(slot.need)!;
                      const got = placed[key] ? CATALOG_BY_ID.get(placed[key]) : null;
                      return (
                        <li key={key} className="rounded-xl border border-line bg-panel p-3">
                          <div className="font-bold text-white">{slot.label}</div>
                          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                            <span className="text-red-300">
                              вы поставили: <b>{got?.title ?? '—'}</b>
                            </span>
                            <span className="text-emerald-300">
                              нужен: <b>{need.title}</b> ({need.sub})
                            </span>
                          </div>
                          <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{PICK_THEORY[need.kind] ?? 'Проверьте назначение линии и номинал аппарата.'}</p>
                        </li>
                      );
                    }),
                )}
              </ul>
            </div>
          )}
        </main>
      </div>

      {calcOpen && <LoadCalc onClose={() => setCalcOpen(false)} />}

      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="pop-in w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-[#0c1320] p-8 text-center">
            <div className="mx-auto w-fit rounded-2xl bg-emerald-500/15 p-4">
              <Trophy className="h-10 w-10 text-emerald-400" />
            </div>
            <h3 className="mt-4 font-display text-2xl text-white">Щит собран верно!</h3>
            <div className="mt-3 flex justify-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <Star key={s} className={`h-8 w-8 ${s <= stars ? 'fill-volt text-volt' : 'text-slate-700'}`} />
              ))}
            </div>
            <p className="mt-2 font-mono text-xs text-slate-500">
              проверок с ошибками: {mistakes} · подсказок: {hints}
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-line bg-panel p-4 text-left">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <p className="text-sm leading-relaxed text-slate-300">{task.fact}</p>
            </div>
            <div className="mt-6 flex gap-2.5">
              <button onClick={onExit} className="rounded-xl border border-line bg-panel px-4 py-3 font-bold text-slate-300 transition hover:text-white">
                <Home className="h-4 w-4" />
              </button>
              <button onClick={reset} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-panel px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-volt/50">
                <RotateCcw className="h-4 w-4" /> Заново
              </button>
              <button onClick={onNext} className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-volt px-4 py-3 font-display text-sm tracking-wide text-black transition hover:bg-volt-2">
                {isLast ? 'В МЕНЮ' : 'СЛЕДУЮЩИЙ ЩИТ'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

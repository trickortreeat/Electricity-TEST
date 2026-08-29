import { useEffect, useState } from 'react';
import { Award, BookOpen, BookOpenCheck, Calculator, Check, GraduationCap, LayoutGrid, Play, ShieldAlert, ShieldCheck, Sparkles, Star, Unlock, Wrench, Zap, Globe } from 'lucide-react';
import LoadCalc from './LoadCalc';
import { LEVELS } from '../levels';
import { CATALOG, PANEL_TASKS } from '../content';
import { QUESTION_BANK } from '../quizBank';
import { DeviceBody, SvgDefs } from './devices';
import { TgBadge, TgCard } from './Telegram';
import { GlossaryPanel, Tip } from './Tips';
import { ChevronRight, HelpCircle, Shield } from 'lucide-react';
import { CHAPTERS, LEVEL_COLORS } from '../theory';
import type { DeviceDef } from '../types';
import { translations, type Language } from '../i18n';

const ACTS = [
  { title: 'АКТ I · Основы электрики', desc: 'провода, коробка, автомат, УЗО', range: [0, 8] as [number, number] },
  { title: 'АКТ II · Свет и управление', desc: 'проходные, диммер, датчик, счётчик', range: [8, 14] as [number, number] },
  { title: 'АКТ III · Защита и номиналы', desc: 'сечения, селективность, РН, УЗИП', range: [14, 22] as [number, number] },
  { title: 'АКТ IV · Спецнагрузки', desc: 'кондиционер, тёплый пол, кухня', range: [22, 28] as [number, number] },
  { title: 'АКТ V · Большой щит квартиры', desc: '5 комнат, 10 групп, две шины', range: [28, 30] as [number, number] },
  { title: 'АКТ VI · Профессиональный уровень', desc: 'кросс-модуль, контактор, 380 В, зарядки EV', range: [30, 36] as [number, number] },
  { title: 'АКТ VII · Современная аппаратура', desc: '2P-автоматы, импульсное реле, фотореле, УЗО 4P', range: [36, 40] as [number, number] },
];

const MENU_DEVICES: DeviceDef[] = [
  { id: 'm1', type: 'breaker', x: 150, y: 190, sublabel: 'C16', terminals: [{ key: 'top', dx: 0, dy: -66, net: null }, { key: 'bot', dx: 0, dy: 66, net: null }] },
  {
    id: 'm2',
    type: 'rcd',
    x: 300,
    y: 190,
    sublabel: '30 мА',
    terminals: [
      { key: 'Nin', dx: -26, dy: -82, net: null },
      { key: 'Lin', dx: 26, dy: -82, net: null },
      { key: 'Nout', dx: -26, dy: 82, net: null },
      { key: 'Lout', dx: 26, dy: 82, net: null },
    ],
  },
  {
    id: 'm3',
    type: 'dif',
    x: 450,
    y: 190,
    sublabel: 'C16',
    terminals: [
      { key: 'Nin', dx: -26, dy: -82, net: null },
      { key: 'Lin', dx: 26, dy: -82, net: null },
      { key: 'Nout', dx: -26, dy: 82, net: null },
      { key: 'Lout', dx: 26, dy: 82, net: null },
    ],
  },
  { id: 'm4', type: 'lamp', x: 560, y: 60, terminals: [{ key: 'L', dx: -55, dy: 26, net: null }, { key: 'N', dx: 55, dy: 26, net: null }] },
];

type Mode = 'lessons' | 'panels' | 'exam';

export default function Menu({
  progress,
  panelProgress,
  examBest,
  onPlay,
  onBuild,
  onExam,
  onStudio,
  onTheory,
  initialMode,
  accountSlot,
  lang = 'ru',
  onToggleLang,
}: {
  progress: Record<number, number>;
  panelProgress: Record<number, number>;
  examBest: number;
  onPlay: (levelIdx: number) => void;
  onBuild: (taskIdx: number) => void;
  onExam: () => void;
  onStudio: () => void;
  onTheory: () => void;
  initialMode?: Mode;
  accountSlot?: React.ReactNode;
  lang?: Language;
  onToggleLang?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode ?? 'lessons');

  const t = translations[lang];

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);
  const [glossary, setGlossary] = useState(false);
  const [calc, setCalc] = useState(false);
  const theoryMin = CHAPTERS.reduce((a, c) => a + c.minutes, 0);
  const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);
  const panelStars = Object.values(panelProgress).reduce((a, b) => a + b, 0);
  const nextIdx = LEVELS.findIndex((l) => !progress[l.id]);
  const startIdx = nextIdx === -1 ? 0 : nextIdx;

  return (
    <div className="min-h-screen bg-[#070b12] blueprint">
      {/* верхняя строка: место под кнопку сайдбара слева */}
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-3 pt-3 pl-16 sm:gap-3 sm:px-4 sm:pt-5 sm:pl-17">
        {accountSlot}
        <Tip text="Справочник: фаза, ноль, земля и основные термины">
          <button onClick={() => setGlossary(true)} className="hidden items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-500/20 sm:flex">
            <HelpCircle className="h-3.5 w-3.5" /> L / N / PE
          </button>
        </Tip>
        <div className="ml-auto">
          <TgBadge compact />
        </div>
      </div>
      {glossary && <GlossaryPanel onClose={() => setGlossary(false)} />}
      {calc && <LoadCalc onClose={() => setCalc(false)} />}

      {/* ===== HERO ===== */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-5 pb-4 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-10 lg:pt-6 lg:pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-3 py-1.5 text-[10px] font-bold tracking-widest text-volt uppercase sm:px-4 sm:text-xs">
            <Zap className="h-3.5 w-3.5" /> Тренажёр электромонтажника
          </div>
          <h1 className="mt-4 font-display text-[2.6rem] leading-[1.02] text-white sm:text-5xl lg:text-6xl">
            ЭЛЕКТРО
            <br className="sm:hidden" />
            <span className="shimmer-text">МАСТЕР</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-400 sm:text-lg">
            {LEVELS.length} уроков, {PANEL_TASKS.length} сборок щитов, {CHAPTERS.length} глав теории и{' '}
            {QUESTION_BANK.length} вопросов экзамена. Всё открыто — начинайте с любого уровня.
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <button
              onClick={() => onPlay(startIdx)}
              className="sheen group flex items-center justify-center gap-2.5 rounded-2xl bg-volt px-5 py-4 font-display text-[15px] tracking-wide text-black transition hover:bg-volt-2 sm:px-7"
            >
              <Play className="h-5 w-5 transition group-hover:scale-110" />
              {totalStars > 0 ? 'ПРОДОЛЖИТЬ' : 'НАЧАТЬ ОБУЧЕНИЕ'}
            </button>
            <button
              onClick={onTheory}
              className="flex items-center justify-center gap-2 rounded-2xl border border-sky-500/40 bg-sky-500/10 px-5 py-4 font-display text-[13px] tracking-wide text-sky-300 transition hover:bg-sky-500/20"
            >
              <BookOpen className="h-4 w-4" /> ЧИТАТЬ ТЕОРИЮ
            </button>
          </div>

          {/* быстрые плитки — 2 колонки на телефоне */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:max-w-lg sm:gap-3 lg:grid-cols-4">
            {[
              { icon: <BookOpenCheck className="h-4 w-4 text-sky-400 sm:h-5 sm:w-5" />, t: `${LEVELS.length} уроков`, d: '7 актов' },
              { icon: <Wrench className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" />, t: `${PANEL_TASKS.length} щитов`, d: 'с расключением' },
              { icon: <GraduationCap className="h-4 w-4 text-fuchsia-400 sm:h-5 sm:w-5" />, t: `${QUESTION_BANK.length} вопросов`, d: 'экзамен' },
              { icon: <Unlock className="h-4 w-4 text-volt sm:h-5 sm:w-5" />, t: `${CATALOG.length} аппаратов`, d: 'каталог' },
            ].map((c, i) => (
              <div key={i} className="reveal lift rounded-2xl border border-line bg-panel p-3" style={{ animationDelay: `${i * 90}ms` }}>
                {c.icon}
                <div className="mt-1.5 text-[13px] leading-tight font-bold text-white sm:text-sm">{c.t}</div>
                <div className="text-[10.5px] text-slate-500 sm:text-xs">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="floaty aura relative mt-6 hidden overflow-hidden rounded-3xl border border-line bg-[#0a101b]/90 p-4 shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)] lg:mt-0 lg:block">
          <svg viewBox="0 0 640 360" className="w-full">
            <SvgDefs />
            <text x={30} y={46} fontSize={15} fontWeight={700} fill="#54688c" fontFamily="'JetBrains Mono', monospace" letterSpacing={3}>
              КВАРТИРНЫЙ ЩИТОК · 220 В
            </text>
            <rect x={24} y={60} width={530} height={230} rx={18} fill="rgba(96,128,180,0.05)" stroke="#33465f" strokeWidth={2} strokeDasharray="10 8" />
            <rect x={44} y={181} width={490} height={18} rx={4} fill="#4b5b74" stroke="#2c3a55" strokeWidth={1.5} />
            <path d="M 150 256 C 190 335, 410 335, 505 90" fill="none" stroke="#0a0f18" strokeWidth={10} strokeLinecap="round" />
            <path d="M 150 256 C 190 335, 410 335, 505 90" fill="none" stroke="#c96f2e" strokeWidth={6.5} strokeLinecap="round" />
            <path d="M 274 272 C 300 355, 480 350, 615 90" fill="none" stroke="#0a0f18" strokeWidth={10} strokeLinecap="round" />
            <path d="M 274 272 C 300 355, 480 350, 615 90" fill="none" stroke="#3d8bff" strokeWidth={6.5} strokeLinecap="round" />
            {MENU_DEVICES.map((d) => (
              <g key={d.id}>{DeviceBody({ d, powered: true })}</g>
            ))}
          </svg>
          <div className="absolute top-6 right-6 flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> под напряжением
          </div>
        </div>
      </div>

      {/* ---- БОЛЬШОЙ БЛОК ТЕОРИИ ---- */}
      {/* ---- БЫСТРЫЙ ДОСТУП (плитки разделов) ---- */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { t: 'Теория', d: `${CHAPTERS.length} глав`, ic: <BookOpen className="h-5 w-5" />, c: '#38bdf8', go: onTheory },
            { t: 'Щитосборка', d: `${PANEL_TASKS.length} объектов`, ic: <Wrench className="h-5 w-5" />, c: '#4ade80', go: () => setMode('panels') },
            { t: 'Студия щита', d: 'свой проект', ic: <Sparkles className="h-5 w-5" />, c: '#a78bfa', go: onStudio },
            { t: 'Калькулятор', d: 'нагрузка', ic: <Calculator className="h-5 w-5" />, c: '#34d399', go: () => setCalc(true) },
            { t: 'Экзамен', d: `${QUESTION_BANK.length} вопросов`, ic: <GraduationCap className="h-5 w-5" />, c: '#f472b6', go: onExam },
          ].map((q, i) => (
            <button
              key={q.t}
              onClick={q.go}
              style={{ animationDelay: `${i * 50}ms` }}
              className="reveal lift group flex items-center gap-3 rounded-2xl border border-line bg-panel p-3 text-left transition hover:border-volt/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105" style={{ background: `${q.c}1f`, color: q.c }}>
                {q.ic}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-[13px] text-white">{q.t}</span>
                <span className="block truncate text-[10.5px] text-slate-500">{q.d}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ---- БОЛЬШОЙ БЛОК ТЕОРИИ ---- */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-6">
        <button
          onClick={onTheory}
          className="aura group relative w-full overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-500/[0.10] via-panel to-transparent p-5 text-left transition hover:border-sky-400/60 sm:p-7 lg:p-9"
        >
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-center gap-4">
              <div className="shrink-0 rounded-2xl bg-sky-500/15 p-3.5 transition group-hover:scale-105 sm:rounded-3xl sm:p-5">
                <BookOpen className="h-7 w-7 text-sky-300 sm:h-11 sm:w-11" />
              </div>
              <div className="lg:hidden">
                <div className="font-mono text-[10px] tracking-widest text-sky-400 uppercase">{CHAPTERS.length} глав · 6 частей</div>
                <h2 className="font-display text-xl leading-tight text-white">ТЕОРИЯ ЭЛЕКТРОМОНТАЖА</h2>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="hidden font-mono text-[11px] tracking-widest text-sky-400 uppercase lg:block">
                Полный учебник · {CHAPTERS.length} глав в 6 частях
              </div>
              <h2 className="hidden font-display text-3xl leading-tight text-white lg:mt-1.5 lg:block lg:text-4xl">ТЕОРИЯ ЭЛЕКТРОМОНТАЖА</h2>
              <p className="text-[13px] leading-relaxed text-slate-400 sm:text-[14.5px] lg:mt-2.5">
                Настоящая книга внутри тренажёра: от «что такое электрон» до систем заземления, трёхфазных сетей,
                частотных приводов, взрывозащиты и требований ПУЭ. Простым языком, с иллюстрациями и формулами.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['Азы', 'База', 'Практика', 'Профи', 'Нормативы', 'Мастер'].map((l) => (
                  <span key={l} className="rounded-lg px-2 py-1 font-mono text-[9.5px] font-bold sm:text-[10.5px]" style={{ background: `${LEVEL_COLORS[l as keyof typeof LEVEL_COLORS]}1f`, color: LEVEL_COLORS[l as keyof typeof LEVEL_COLORS] }}>
                    {l}
                  </span>
                ))}
                <span className="rounded-lg bg-[#0a101b] px-2 py-1 font-mono text-[9.5px] text-slate-500 sm:text-[10.5px]">≈ {Math.round(theoryMin / 60)} ч чтения</span>
              </div>
            </div>
            <span className="sheen flex items-center justify-center gap-2 rounded-2xl bg-sky-400 px-5 py-3.5 font-display text-[13px] tracking-wide text-black transition group-hover:bg-sky-300 sm:text-sm lg:px-6 lg:py-4">
              ЧИТАТЬ УЧЕБНИК <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </button>
      </div>

      {/* переключатель режимов */}
      <div className="sticky top-0 z-30 mx-auto w-full max-w-6xl bg-[#070b12]/92 px-4 py-2 backdrop-blur">
        <div className="flex gap-1 rounded-2xl border border-line bg-panel/70 p-1.5">
          {(
            [
              { id: 'lessons', icon: <LayoutGrid className="h-4 w-4" />, t: 'Уроки', s: `${totalStars}/${LEVELS.length * 3} ★` },
              { id: 'panels', icon: <Wrench className="h-4 w-4" />, t: 'Щиты', s: `${panelStars}/${PANEL_TASKS.length * 3} ★` },
              { id: 'exam', icon: <GraduationCap className="h-4 w-4" />, t: 'Экзамен', s: `${examBest}%` },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as Mode)}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 font-display text-[12px] tracking-wide transition sm:flex-row sm:gap-2 sm:py-3 sm:text-sm ${
                mode === m.id ? 'bg-volt text-black' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {m.icon} {m.t}
              </span>
              <span className="font-mono text-[9px] opacity-70 sm:text-[10px]">{m.s}</span>
            </button>
          ))}
        </div>
      </div>

      {mode === 'lessons' && (
        <div className="mx-auto w-full max-w-6xl px-4 pb-6">
          {ACTS.map((act) => (
            <div key={act.title} className="mt-8">
              <h2 className="flex flex-wrap items-center gap-3 font-display text-lg tracking-wide text-slate-300">
                {act.title}
                <span className="font-sans text-xs font-normal text-slate-500">{act.desc}</span>
                <span className="h-px min-w-8 flex-1 bg-line" />
              </h2>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {LEVELS.slice(act.range[0], act.range[1]).map((l, k) => {
                  const i = LEVELS.indexOf(l);
                  const st = progress[l.id] ?? 0;
                  return (
                    <button
                      key={l.id}
                      onClick={() => onPlay(i)}
                      style={{ animationDelay: `${k * 45}ms` }}
                      className="reveal lift group relative overflow-hidden rounded-2xl border border-line bg-panel p-5 text-left hover:border-volt/60"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-display text-3xl text-slate-700 transition group-hover:text-volt/80">{String(l.id).padStart(2, '0')}</span>
                        <span className={`rounded-md p-1.5 ${st > 0 ? 'bg-emerald-500/15' : 'bg-volt/15'}`}>
                          {st > 0 ? <Check className="h-4 w-4 text-emerald-400" /> : <Play className="h-4 w-4 text-volt" />}
                        </span>
                      </div>
                      <div className="mt-3 font-display text-[15px] leading-snug text-white">{l.title}</div>
                      <div className="mt-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">{l.tag}</div>
                      <div className="mt-3 flex gap-1">
                        {[1, 2, 3].map((s) => (
                          <Star key={s} className={`h-4 w-4 ${s <= st ? 'fill-volt text-volt' : 'text-slate-700'}`} />
                        ))}
                      </div>
                      <div className="pointer-events-none absolute -right-8 -bottom-8 opacity-0 transition group-hover:opacity-100">
                        <Zap className="h-24 w-24 text-volt/10" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {mode === 'panels' && (
        <div className="mx-auto w-full max-w-6xl px-4 pb-6">
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <h2 className="font-display text-lg text-white">Щитосборка: 20 реальных объектов</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
              Выберите аппараты из каталога (автоматы всех номиналов, УЗО, дифавтоматы, реле напряжения, УЗИП, счётчик,
              контакторы, кросс-модули, гребёнки и шины) и расставьте их по DIN-рейкам — от студии до коттеджа с
              зарядкой электромобилей.
            </p>
          </div>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {PANEL_TASKS.map((t, i) => {
              const st = panelProgress[t.id] ?? 0;
              const mods = t.rails.reduce((a, r) => a + r.slots.length, 0);
              return (
                <button
                  key={t.id}
                  onClick={() => onBuild(i)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className="reveal lift group relative overflow-hidden rounded-2xl border border-line bg-panel p-5 text-left hover:border-emerald-400/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-[15px] text-white">{t.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{t.place}</div>
                    </div>
                    <span className="rounded-md bg-emerald-500/15 p-1.5">
                      {st > 0 ? <Check className="h-4 w-4 text-emerald-400" /> : <Wrench className="h-4 w-4 text-emerald-400" />}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-400">{t.brief}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="rounded-lg bg-[#0a101b] px-2 py-1 font-mono text-[10px] text-slate-500">{t.rails.length} рейки</span>
                    <span className="rounded-lg bg-[#0a101b] px-2 py-1 font-mono text-[10px] text-slate-500">{mods} модулей</span>
                    <div className="ml-auto flex gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= st ? 'fill-volt text-volt' : 'text-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'exam' && (
        <div className="mx-auto w-full max-w-3xl px-4 pb-6">
          <div className="mt-6 rounded-3xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-8 text-center">
            <div className="mx-auto w-fit rounded-2xl bg-fuchsia-500/15 p-4">
              <GraduationCap className="h-10 w-10 text-fuchsia-300" />
            </div>
            <h2 className="mt-4 font-display text-2xl text-white">Экзамен: подбор аппаратуры</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
              Банк из {QUESTION_BANK.length} вопросов с иллюстрациями: номиналы под сечение кабеля, расчёт токов, выбор
              УЗО, характеристики B/C/D, системы заземления, диагностика аварий, зарядки электромобилей. Можно выбрать
              тему и длину экзамена, после каждого ответа — объяснение.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 font-mono text-xs text-slate-500">
              <Award className="h-4 w-4 text-volt" /> лучший результат: {examBest}%
            </div>
            <button onClick={onExam} className="mt-6 rounded-2xl bg-volt px-8 py-4 font-display text-sm tracking-wide text-black transition hover:bg-volt-2">
              НАЧАТЬ ЭКЗАМЕН
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl px-4 pb-4">
        <TgCard />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: 'Автомат (АВ)', d: 'Защищает проводку от КЗ и перегрузки. Номинал — по сечению: 1,5 мм² → C10, 2,5 → C16, 6 → C32.' },
            { t: 'Что такое фаза, ноль и земля', d: 'Фаза (коричневый) несёт 220 В, ноль (синий) возвращает ток обратно, земля (жёлто-зелёная) страхует человека при пробое на корпус.' },
            { t: 'УЗО', d: '30 мА — базовая защита, 10 мА — ванная, 100 мА тип S — противопожарное на ввод, тип A — для техники и EV.' },
            { t: 'Дифавтомат (АВДТ)', d: 'Автомат + УЗО в одном корпусе: бойлер, стиралка, кондиционер, зарядка авто.' },
            { t: 'Реле напряжения и УЗИП', d: 'РН отключает при 170/250 В (обрыв нуля), УЗИП стравливает грозовой импульс на землю.' },
            { t: 'Кросс-модуль и гребёнка', d: 'Гребёнка раздаёт фазу внутри ряда, кросс-модуль — между рядами и на аппараты разной ширины.' },
            { t: 'Контактор', d: 'Слабый сигнал управляет мощной нагрузкой: уличный свет, отопление по тарифу, кнопка «всё выключить».' },
          ].map((c, i) => (
            <div key={i} className="reveal lift rounded-2xl border border-line bg-panel p-5" style={{ animationDelay: `${i * 55}ms` }}>
              <div className="font-display text-sm text-volt">{c.t}</div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-slate-400">{c.d}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-line/60 py-6">
        <div className="mx-auto max-w-6xl space-y-3 px-4">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
            В реальной жизни все работы выполняйте только при отключённом напряжении и проверяйте его отсутствие
            индикатором. Не уверены — вызывайте электрика.
            <ShieldCheck className="ml-auto hidden h-4 w-4 text-emerald-500 sm:block" />
          </p>
          <p className="text-[10.5px] leading-relaxed text-slate-600">
            <span className="mr-1.5 rounded bg-slate-700/60 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-300">MVP</span>
            Это ранняя демонстрационная версия продукта. Полноценная SaaS-платформа с облачными аккаунтами, синхронизацией
            прогресса, группами учеников и отчётностью ожидается ближе к зиме. Возможны баги и недоработки — все замечания
            принимаются и оперативно устраняются. Пишите:{' '}
            <a href="https://t.me/irawiq" target="_blank" rel="noopener noreferrer" className="font-bold text-sky-500 underline">
              @irawiq
            </a>
            . Цены в сметах и расчёты носят ориентировочный характер и не являются коммерческим предложением.
          </p>
        </div>
      </footer>
    </div>
  );
}

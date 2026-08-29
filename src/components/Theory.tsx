import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Clock, Info, Scale, Search, ShieldAlert, Sigma, Zap } from 'lucide-react';
import { CHAPTERS, LEVEL_COLORS, PARTS, TOTAL_MINUTES, type Block, type Chapter } from '../theory';
import TheoryFig from './TheoryFig';
import { MvpNote, TgBadge } from './Telegram';
import { sfx } from '../audio';

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case 'h':
      return (
        <h3 className="reveal mt-7 mb-2 flex items-center gap-2.5 font-display text-lg text-white">
          <span className="h-4 w-1 rounded-full bg-volt" />
          {b.text}
        </h3>
      );
    case 'p':
      return <p className="reveal mt-3 text-[15px] leading-[1.75] text-slate-300">{b.text}</p>;
    case 'list':
      return (
        <ul className="reveal mt-3 space-y-2">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed text-slate-300">
              <Check className="mt-1 h-4 w-4 shrink-0 text-volt/70" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case 'note': {
      const st = {
        info: { c: 'border-sky-500/35 bg-sky-500/[0.07]', t: 'text-sky-300', i: <Info className="h-4 w-4" /> },
        warn: { c: 'border-amber-500/35 bg-amber-500/[0.07]', t: 'text-amber-300', i: <AlertTriangle className="h-4 w-4" /> },
        danger: { c: 'border-red-500/40 bg-red-500/[0.07]', t: 'text-red-300', i: <ShieldAlert className="h-4 w-4" /> },
        ok: { c: 'border-emerald-500/35 bg-emerald-500/[0.07]', t: 'text-emerald-300', i: <Check className="h-4 w-4" /> },
      }[b.kind];
      return (
        <div className={`reveal mt-4 rounded-2xl border p-4 ${st.c}`}>
          <div className={`flex items-center gap-2 text-sm font-bold ${st.t}`}>
            {st.i} {b.title}
          </div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-slate-300">{b.text}</p>
        </div>
      );
    }
    case 'table':
      return (
        <div className="reveal mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-panel">
              <tr>
                {b.head.map((h) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[10.5px] tracking-wider text-slate-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-t border-line/70 transition hover:bg-white/[0.02]">
                  {r.map((c, j) => (
                    <td key={j} className={`px-4 py-2.5 ${j === 0 ? 'font-bold text-slate-200' : 'text-slate-400'}`}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'formula':
      return (
        <div className="reveal mt-4 rounded-2xl border border-volt/30 bg-volt/[0.06] p-4">
          <div className="flex items-center gap-2">
            <Sigma className="h-4 w-4 text-volt" />
            <span className="font-mono text-lg font-bold text-volt">{b.expr}</span>
          </div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-400">{b.text}</p>
        </div>
      );
    case 'pue':
      return (
        <div className="reveal mt-4 flex gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/[0.06] p-4">
          <Scale className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
          <div>
            <div className="font-mono text-[11px] font-bold tracking-wider text-violet-300">{b.code}</div>
            <p className="mt-1 text-[13.5px] leading-relaxed text-slate-300 italic">«{b.text}»</p>
          </div>
        </div>
      );
    case 'fig':
      return (
        <figure className="reveal mt-5 rounded-2xl border border-line bg-[#0a101b] p-4">
          <TheoryFig kind={b.kind} />
          <figcaption className="mt-2 text-center text-[12px] text-slate-500">{b.caption}</figcaption>
        </figure>
      );
    default:
      return null;
  }
}

export default function Theory({ onExit }: { onExit: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [levelF, setLevelF] = useState<string>('Все');
  const [read, setRead] = useState<Set<string>>(new Set());

  const levels = ['Все', ...Array.from(new Set(CHAPTERS.map((c) => c.level)))];
  const list = useMemo(
    () =>
      CHAPTERS.filter(
        (c) => (levelF === 'Все' || c.level === levelF) && (query.trim() === '' || (c.title + c.subtitle + c.part).toLowerCase().includes(query.toLowerCase())),
      ),
    [query, levelF],
  );
  const byPart = useMemo(() => PARTS.map((pt) => ({ part: pt, items: list.filter((c) => c.part === pt) })).filter((g) => g.items.length > 0), [list]);

  const chapter: Chapter | undefined = CHAPTERS.find((c) => c.id === openId);
  const idx = chapter ? CHAPTERS.indexOf(chapter) : -1;
  const totalMin = TOTAL_MINUTES;

  const open = (id: string) => {
    setOpenId(id);
    setRead((r) => new Set([...r, id]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    sfx.click();
  };

  // ---------- ЧТЕНИЕ ГЛАВЫ ----------
  if (chapter) {
    return (
      <div className="blueprint min-h-screen bg-[#070b12] pb-16">
        <header className="sticky top-0 z-30 border-b border-line/60 bg-[#070b12]/92 backdrop-blur">
          <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-3 px-4 py-3">
            <button onClick={() => setOpenId(null)} className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3.5 py-2 text-sm font-bold text-slate-300 transition hover:border-volt/50 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Все главы
            </button>
            <span className="rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold" style={{ background: `${LEVEL_COLORS[chapter.level]}22`, color: LEVEL_COLORS[chapter.level] }}>
              {chapter.level}
            </span>
            <span className="hidden font-mono text-[11px] text-slate-600 sm:inline">{chapter.part}</span>
            <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
              <Clock className="h-3.5 w-3.5" /> {chapter.minutes} мин
            </span>
          </div>
        </header>

        <article className="mx-auto w-full max-w-3xl px-4 pt-8">
          <div className="font-display text-6xl text-slate-800">{chapter.num}</div>
          <h1 className="mt-1 font-display text-3xl leading-tight text-white sm:text-4xl">{chapter.title}</h1>
          <p className="mt-2 text-base text-slate-400">{chapter.subtitle}</p>
          <div className="mt-5 h-px bg-gradient-to-r from-volt/50 to-transparent" />

          {chapter.blocks.map((b, i) => (
            <div key={i} style={{ animationDelay: `${Math.min(i * 35, 500)}ms` }}>
              <BlockView b={b} />
            </div>
          ))}

          <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
            {idx > 0 && (
              <button onClick={() => open(CHAPTERS[idx - 1].id)} className="flex flex-1 items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-3.5 text-left transition hover:border-volt/50">
                <ArrowLeft className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="min-w-0">
                  <span className="block font-mono text-[10px] text-slate-600">предыдущая</span>
                  <span className="block truncate text-sm font-bold text-slate-200">{CHAPTERS[idx - 1].title}</span>
                </span>
              </button>
            )}
            {idx < CHAPTERS.length - 1 && (
              <button onClick={() => open(CHAPTERS[idx + 1].id)} className="flex flex-1 items-center gap-2 rounded-2xl border border-volt/40 bg-volt/10 px-4 py-3.5 text-right transition hover:bg-volt/20">
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] text-volt/70">следующая</span>
                  <span className="block truncate text-sm font-bold text-volt">{CHAPTERS[idx + 1].title}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-volt" />
              </button>
            )}
          </div>
          <MvpNote className="mt-6" />
        </article>
      </div>
    );
  }

  // ---------- СПИСОК ГЛАВ ----------
  return (
    <div className="blueprint min-h-screen bg-[#070b12] pb-14">
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 px-4 pt-3 pl-16 sm:pt-5">
        <button onClick={onExit} className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3.5 py-2 text-sm font-bold text-slate-300 transition hover:border-volt/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Меню
        </button>
        <div className="ml-auto">
          <TgBadge compact />
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 pt-8">
        <div className="aura relative overflow-hidden rounded-3xl border border-line bg-panel/40 p-8">
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-4 py-1.5 text-[11px] font-bold tracking-widest text-volt uppercase">
              <BookOpen className="h-3.5 w-3.5" /> Учебник электромонтажника
            </div>
            <h1 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl">
              ТЕОРИЯ <span className="shimmer-text">ОТ АЗОВ ДО ПРОФИ</span>
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-400">
              Полноценный учебник из {CHAPTERS.length} глав в {PARTS.length} частях: от «что такое электрон» до
              промышленных щитов, частотных приводов, взрывозащиты и требований ПУЭ. Простым языком, с иллюстрациями,
              таблицами, формулами и выдержками из нормативов. Прочитав всё, вы будете разбираться в электрике на
              уровне профильного специалиста.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {PARTS.map((pt) => (
                <span key={pt} className="rounded-lg bg-[#0a101b] px-2.5 py-1 font-mono text-[10.5px] text-slate-500">
                  {pt}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2 text-slate-400">
                <BookOpen className="h-4 w-4 text-volt" /> {CHAPTERS.length} глав
              </span>
              <span className="flex items-center gap-2 text-slate-400">
                <Clock className="h-4 w-4 text-sky-400" /> ≈ {totalMin} минут чтения
              </span>
              <span className="flex items-center gap-2 text-slate-400">
                <Scale className="h-4 w-4 text-violet-400" /> выдержки из ПУЭ
              </span>
              <span className="flex items-center gap-2 text-slate-400">
                <Check className="h-4 w-4 text-emerald-400" /> прочитано: {read.size} / {CHAPTERS.length}
              </span>
            </div>
          </div>
        </div>

        {/* фильтры */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-panel px-3.5 py-2.5">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по главам…" className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600" />
          </div>
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevelF(l)}
              className="rounded-xl px-3.5 py-2.5 text-xs font-bold transition"
              style={
                levelF === l
                  ? { background: l === 'Все' ? '#ffc42e' : LEVEL_COLORS[l as Chapter['level']], color: '#0b1220' }
                  : { background: '#0d1420', color: '#7d8fb3' }
              }
            >
              {l}
            </button>
          ))}
        </div>

        {/* главы по частям */}
        {byPart.map((grp) => (
          <section key={grp.part} className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-lg tracking-wide text-white">{grp.part}</h2>
              <span className="font-mono text-[11px] text-slate-600">{grp.items.length} глав</span>
              <span className="h-px min-w-8 flex-1 bg-line" />
              <span className="font-mono text-[11px] text-slate-600">{grp.items.reduce((a, c) => a + c.minutes, 0)} мин</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {grp.items.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => open(c.id)}
                  style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
                  className="reveal lift group relative overflow-hidden rounded-2xl border border-line bg-panel p-4 text-left hover:border-volt/60"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-display text-2xl text-slate-700 transition group-hover:text-volt/70">{c.num}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md px-1.5 py-0.5 font-mono text-[9.5px] font-bold" style={{ background: `${LEVEL_COLORS[c.level]}22`, color: LEVEL_COLORS[c.level] }}>
                          {c.level}
                        </span>
                        <span className="font-mono text-[9.5px] text-slate-600">{c.minutes} мин</span>
                        {read.has(c.id) && <Check className="h-3 w-3 text-emerald-400" />}
                      </div>
                      <div className="mt-1.5 font-display text-[14.5px] leading-snug text-white">{c.title}</div>
                      <div className="mt-1 text-[11.5px] leading-snug text-slate-500">{c.subtitle}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-700 transition group-hover:translate-x-1 group-hover:text-volt" />
                  </div>
                  <Zap className="pointer-events-none absolute -right-5 -bottom-5 h-16 w-16 text-volt/[0.04] transition group-hover:text-volt/10" />
                </button>
              ))}
            </div>
          </section>
        ))}

        <MvpNote className="mt-8" />
      </div>
    </div>
  );
}

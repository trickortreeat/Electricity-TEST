import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, HelpCircle, X, Zap } from 'lucide-react';

/** Всплывающая подсказка при наведении — рендерится в портале и всегда остаётся в пределах экрана */
export function Tip({ text, children }: { text: string; children: ReactNode; side?: 'top' | 'bottom' }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number; below: boolean } | null>(null);

  const open = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const W = 260;
    const x = Math.min(Math.max(r.left + r.width / 2, W / 2 + 10), window.innerWidth - W / 2 - 10);
    const below = r.top < 130;
    setPos({ x, y: below ? r.bottom + 8 : r.top - 8, below });
  };

  return (
    <span ref={ref} className="relative inline-flex" onMouseEnter={open} onMouseLeave={() => setPos(null)}>
      {children}
      {pos &&
        createPortal(
          <span
            className="pointer-events-none fixed z-[200] rounded-xl border border-volt/40 bg-[#0b1220]/98 px-3 py-2 text-[11px] leading-snug font-normal text-slate-200 shadow-2xl backdrop-blur"
            style={{
              width: 260,
              left: pos.x,
              top: pos.y,
              transform: `translate(-50%, ${pos.below ? '0' : '-100%'})`,
              animation: 'popIn .16s ease both',
            }}
          >
            {text}
          </span>,
          document.body,
        )}
    </span>
  );
}

/** Иконка «?» с подсказкой */
export function InfoDot({ text }: { text: string }) {
  return (
    <Tip text={text}>
      <HelpCircle className="h-3.5 w-3.5 cursor-help text-slate-500 transition hover:text-volt" />
    </Tip>
  );
}

export const GLOSSARY: Array<{ term: string; short: string; color?: string; text: string }> = [
  {
    term: 'Фаза (L)',
    short: 'L',
    color: '#c96f2e',
    text: 'Провод, по которому приходит напряжение 220 В относительно земли. Коричневый (реже чёрный или серый). Именно фазу разрывают выключатели и автоматы. Прикосновение к фазе опасно для жизни.',
  },
  {
    term: 'Ноль (N)',
    short: 'N',
    color: '#3d8bff',
    text: 'Рабочий нулевой проводник — обратный путь тока от прибора к источнику. Всегда синий. Без него цепь не замкнётся и прибор не заработает. Разрывать ноль выключателем нельзя.',
  },
  {
    term: 'Земля (PE)',
    short: 'PE',
    color: '#35c759',
    text: 'Защитный проводник, жёлто-зелёный. В обычной работе тока не несёт. Соединяет корпуса приборов с землёй: если пробьёт изоляцию, ток уйдёт в землю, а УЗО или автомат отключат линию.',
  },
  { term: 'Автомат (АВ)', short: 'C16', text: 'Защищает КАБЕЛЬ от короткого замыкания и перегрузки. Номинал подбирают по сечению жилы: 1,5 мм² → C10, 2,5 мм² → C16, 6 мм² → C32.' },
  { term: 'УЗО', short: 'Δ', text: 'Сравнивает ток в фазе и нуле. Разница 10–30 мА означает утечку (например, через человека) — аппарат отключается за 0,03 с. От КЗ не защищает, ставится в паре с автоматом.' },
  { term: 'Дифавтомат', short: 'АВДТ', text: 'Автомат и УЗО в одном корпусе: защита от КЗ, перегрузки и утечки. Удобен для отдельных линий — бойлер, стиралка, зарядка авто.' },
  { term: 'Короткое замыкание', short: 'КЗ', text: 'Прямое соединение фазы с нулём или землёй без нагрузки. Ток вырастает в десятки раз, провод мгновенно раскаляется. Автомат обязан отключить линию за доли секунды.' },
  { term: 'Клеммник', short: 'WAGO', text: 'Соединяет несколько проводов в распределительной коробке. Все жилы в одном клеммнике электрически связаны между собой.' },
  { term: 'Шина N / PE', short: 'ШИНА', text: 'Металлическая планка в щите для сбора нулевых или защитных проводников. У каждого УЗО должна быть своя шина N.' },
  { term: 'Гребёнка', short: 'PIN', text: 'Медная «расчёска» в изоляции: вставляется в верхние клеммы ряда автоматов и раздаёт фазу без перемычек.' },
  { term: 'НШВИ', short: 'НШВИ', text: 'Наконечник штыревой втулочный изолированный. Обжимается на многопроволочную жилу, чтобы она не расползлась в клемме и не грелась.' },
];

/** Панель «Что такое фаза, ноль и земля» */
export function GlossaryPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="pop-in max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-[#0c1320] p-6 sm:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-sky-500/15 p-2.5">
            <BookOpen className="h-6 w-6 text-sky-300" />
          </div>
          <div>
            <div className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Справочник</div>
            <h2 className="font-display text-xl text-white">Что такое фаза, ноль и земля</h2>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-2.5">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="flex gap-3 rounded-2xl border border-line bg-panel p-3.5">
              <span
                className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-extrabold"
                style={{ background: g.color ? `${g.color}22` : 'rgba(255,196,46,0.12)', color: g.color ?? '#ffc42e' }}
              >
                {g.short}
              </span>
              <div>
                <div className="text-sm font-bold text-white">{g.term}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{g.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <Zap className="h-4 w-4" /> Главное правило
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">
            Ток течёт по кругу: фаза → прибор → ноль. Земля в этом круге не участвует — она страхует человека.
            Выключатель и автомат ставят ТОЛЬКО в разрыв фазы, чтобы при отключении на приборе не оставалось напряжения.
          </p>
        </div>

        <button onClick={onClose} className="mt-5 w-full rounded-2xl bg-volt py-3.5 font-display text-sm tracking-wide text-black transition hover:bg-volt-2">
          ПОНЯТНО
        </button>
      </div>
    </div>
  );
}

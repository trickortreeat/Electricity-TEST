import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Award, BadgeCheck, Check, ListChecks, RotateCcw, X } from 'lucide-react';
import { pickQuestions, QUESTION_BANK, TOPICS, type BankQuestion } from '../quizBank';
import QuizGraphic from './QuizGraphic';
import { MvpNote, TgBadge } from './Telegram';
import { sfx } from '../audio';

const LENGTHS = [10, 20, 40];

export default function Quiz({ onExit, onFinished }: { onExit: () => void; onFinished: (score: number, total: number) => void }) {
  const [topic, setTopic] = useState('Все темы');
  const [count, setCount] = useState(20);
  const [started, setStarted] = useState(false);
  const [seed, setSeed] = useState(0);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wrongList, setWrongList] = useState<BankQuestion[]>([]);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => pickQuestions(count, topic), [count, topic, seed]);
  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  const begin = () => {
    setSeed((s) => s + 1);
    setIdx(0);
    setAnswer(null);
    setScore(0);
    setWrongList([]);
    setFinished(false);
    setStarted(true);
    sfx.click();
  };

  const pick = (i: number) => {
    if (answer !== null) return;
    setAnswer(i);
    if (i === q.correct) {
      setScore((s) => s + 1);
      sfx.spark();
    } else {
      setWrongList((w) => [...w, q]);
      sfx.error();
    }
  };

  const next = () => {
    if (isLast) {
      setFinished(true);
      sfx.success();
      onFinished(score, questions.length);
      return;
    }
    setIdx((i) => i + 1);
    setAnswer(null);
    sfx.click();
  };

  // ---------- стартовый экран ----------
  if (!started) {
    return (
      <div className="blueprint min-h-screen bg-[#070b12]">
        <header className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 pt-3 pl-16 sm:pt-5">
          <button onClick={onExit} className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3.5 py-2 text-sm font-bold text-slate-300 transition hover:border-volt/50 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Меню</span>
          </button>
          <div className="ml-auto">
            <TgBadge compact />
          </div>
        </header>
        <div className="mx-auto mt-6 w-full max-w-3xl px-4 pb-10">
          <div className="rounded-3xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-fuchsia-500/15 p-3">
                <ListChecks className="h-7 w-7 text-fuchsia-300" />
              </div>
              <div>
                <h2 className="font-display text-2xl text-white">Экзамен электромонтажника</h2>
                <p className="text-sm text-slate-400">Банк из {QUESTION_BANK.length} вопросов с иллюстрациями</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Тема</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {['Все темы', ...TOPICS].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${topic === t ? 'bg-volt text-black' : 'bg-panel text-slate-400 hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Количество вопросов</div>
              <div className="mt-2 flex gap-2">
                {LENGTHS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setCount(l)}
                    className={`rounded-xl px-5 py-2.5 font-display text-sm transition ${count === l ? 'bg-volt text-black' : 'bg-panel text-slate-300 hover:text-white'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={begin} className="sheen mt-8 w-full rounded-2xl bg-volt py-4 font-display text-base tracking-wide text-black transition hover:bg-volt-2">
              НАЧАТЬ ЭКЗАМЕН
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">Вопросы и варианты ответов перемешиваются при каждом запуске</p>
            <MvpNote className="mt-4 text-center" />
          </div>
        </div>
      </div>
    );
  }

  // ---------- результаты ----------
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const verdict = pct >= 90 ? 'Уровень мастера!' : pct >= 70 ? 'Хороший результат, детали ещё подтянуть.' : 'Стоит вернуться к урокам и теории.';
    return (
      <div className="blueprint min-h-screen bg-[#070b12] py-10">
        <div className="pop-in mx-auto w-full max-w-2xl rounded-3xl border border-volt/30 bg-[#0c1320] p-8 text-center">
          <div className="mx-auto w-fit rounded-2xl bg-volt/15 p-4">
            <Award className="h-10 w-10 text-volt" />
          </div>
          <h2 className="mt-4 font-display text-2xl text-white">Экзамен завершён</h2>
          <div className="mt-4 font-display text-5xl text-volt">
            {score}
            <span className="text-2xl text-slate-600"> / {questions.length}</span>
          </div>
          <div className="mt-2 text-sm text-slate-400">{verdict}</div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-panel">
            <div className="h-full rounded-full bg-gradient-to-r from-volt-2 to-volt transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>

          {wrongList.length > 0 && (
            <div className="mt-6 max-h-72 overflow-y-auto rounded-2xl border border-line bg-panel p-4 text-left">
              <div className="mb-2 font-mono text-[11px] tracking-widest text-red-400 uppercase">Разбор ошибок ({wrongList.length})</div>
              <ul className="space-y-3">
                {wrongList.map((w, i) => (
                  <li key={i} className="border-b border-line/60 pb-2 last:border-0">
                    <div className="text-sm font-bold text-slate-200">{w.q}</div>
                    <div className="mt-1 text-xs text-emerald-300">Верно: {w.options[w.correct]}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{w.why}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button onClick={() => setStarted(false)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-panel px-4 py-3 text-sm font-bold text-slate-200 hover:border-volt/50">
              <RotateCcw className="h-4 w-4" /> Новый набор
            </button>
            <button onClick={onExit} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-volt px-4 py-3 font-display text-sm tracking-wide text-black hover:bg-volt-2">
              В МЕНЮ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- вопрос ----------
  return (
    <div className="blueprint min-h-screen bg-[#070b12] pb-10">
      <header className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-2 px-3 pt-3 pl-16 sm:gap-3 sm:px-4 sm:pt-5">
        <button onClick={onExit} className="flex items-center gap-1.5 rounded-xl border border-line bg-panel px-2.5 py-2 text-sm font-bold text-slate-300 transition hover:border-volt/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Меню</span>
        </button>
        <span className="truncate rounded-lg bg-panel px-2.5 py-1.5 font-mono text-[10px] text-slate-400 sm:text-[11px]">{q.topic}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[11px] text-slate-500">
            {idx + 1}/{questions.length}
          </span>
          <span className="flex items-center gap-1 rounded-xl border border-line bg-panel px-2.5 py-1.5 text-sm font-bold text-emerald-300">
            <BadgeCheck className="h-3.5 w-3.5" /> {score}
          </span>
        </div>
      </header>

      <div className="mx-auto mt-3 w-full max-w-3xl px-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-panel">
          <div className="h-full rounded-full bg-gradient-to-r from-volt-2 to-volt transition-all duration-500" style={{ width: `${((idx + (answer !== null ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>

        <div key={q.id + idx} className="pop-in mt-6 rounded-3xl border border-line bg-[#0c1320] p-6 sm:p-8">
          {q.graphic && (
            <div className="mb-5 rounded-2xl border border-line bg-[#0a101b] p-2">
              <QuizGraphic g={q.graphic} />
            </div>
          )}
          <h2 className="font-display text-xl leading-snug text-white">{q.q}</h2>

          <div className="mt-4 grid gap-2">
            {q.options.map((o, i) => {
              const isCorrect = i === q.correct;
              const chosen = answer === i;
              const show = answer !== null;
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  style={{ animationDelay: `${i * 55}ms` }}
                  className={`reveal lift flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-bold ${
                    show && isCorrect
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
                      : show && chosen
                        ? 'border-red-500/60 bg-red-500/10 text-red-200'
                        : 'border-line bg-panel text-slate-200 hover:border-volt/50'
                  }`}
                >
                  {o}
                  {show && isCorrect && <Check className="h-4 w-4 shrink-0" />}
                  {show && chosen && !isCorrect && <X className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>

          {answer !== null && (
            <div className="pop-in mt-5 rounded-2xl border border-line bg-panel p-4">
              <div className="mb-1 font-mono text-[11px] tracking-widest text-volt uppercase">Почему</div>
              <p className="text-sm leading-relaxed text-slate-300">{q.why}</p>
              <button onClick={next} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-volt py-3 font-display text-sm tracking-wide text-black transition hover:bg-volt-2">
                {isLast ? 'ЗАВЕРШИТЬ ЭКЗАМЕН' : 'СЛЕДУЮЩИЙ ВОПРОС'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

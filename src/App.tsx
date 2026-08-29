import { useEffect, useState } from 'react';
import { Award, Home, RotateCcw, Star, Trophy, Zap } from 'lucide-react';
import Menu from './components/Menu';
import Game from './components/Game';
import Builder from './components/Builder';
import Quiz from './components/Quiz';
import Studio from './components/Studio';
import Admin, { type StudentRecord } from './components/Admin';
import Theory from './components/Theory';
import Sidebar, { type NavTarget } from './components/Sidebar';
import ScrollTop from './components/ScrollTop';
import LoadCalc from './components/LoadCalc';
import { GlossaryPanel } from './components/Tips';
import { AccountChip, AccountModal, type Student } from './components/Account';
import { LEVELS } from './levels';
import { PANEL_TASKS } from './content';

const LS_KEY = 'electromaster_progress_v2';

type Screen =
  | { name: 'menu' }
  | { name: 'game'; levelIdx: number }
  | { name: 'build'; taskIdx: number }
  | { name: 'exam' }
  | { name: 'studio' }
  | { name: 'admin' }
  | { name: 'theory' }
  | { name: 'final' };

interface Save {
  lessons: Record<number, number>;
  panels: Record<number, number>;
  exam: number;
  student: Student | null;
  students: StudentRecord[];
}

function loadSave(): Save {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}');
    return {
      lessons: raw.lessons ?? {},
      panels: raw.panels ?? {},
      exam: raw.exam ?? 0,
      student: raw.student ?? null,
      students: raw.students ?? [],
    };
  } catch {
    return { lessons: {}, panels: {}, exam: 0, student: null, students: [] };
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'menu' });
  const [save, setSave] = useState<Save>(loadSave);
  const [accountOpen, setAccountOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [glossOpen, setGlossOpen] = useState(false);
  const [menuMode, setMenuMode] = useState<'lessons' | 'panels' | 'exam' | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(save));
  }, [save]);

  // ---- глобальная навигация из бокового меню ----
  const navActive: NavTarget =
    screen.name === 'menu'
      ? 'menu'
      : screen.name === 'game'
        ? 'lessons'
        : screen.name === 'build'
          ? 'panels'
          : screen.name === 'exam'
            ? 'exam'
            : screen.name === 'theory'
              ? 'theory'
              : screen.name === 'studio'
                ? 'studio'
                : screen.name === 'admin'
                  ? 'admin'
                  : 'menu';

  const navigate = (t: NavTarget) => {
    switch (t) {
      case 'menu':
        setScreen({ name: 'menu' });
        break;
      case 'lessons':
        setMenuMode('lessons');
        setScreen({ name: 'menu' });
        break;
      case 'panels':
        setMenuMode('panels');
        setScreen({ name: 'menu' });
        break;
      case 'exam':
        setScreen({ name: 'exam' });
        break;
      case 'theory':
        setScreen({ name: 'theory' });
        break;
      case 'studio':
        setScreen({ name: 'studio' });
        break;
      case 'admin':
        setScreen({ name: 'admin' });
        break;
      case 'calc':
        setCalcOpen(true);
        break;
      case 'glossary':
        setGlossOpen(true);
        break;
      case 'account':
        setAccountOpen(true);
        break;
    }
  };

  const onLessonDone = (levelId: number, stars: number) =>
    setSave((s) => ({ ...s, lessons: { ...s.lessons, [levelId]: Math.max(s.lessons[levelId] ?? 0, stars) } }));
  const onPanelDone = (taskId: number, stars: number) =>
    setSave((s) => ({ ...s, panels: { ...s.panels, [taskId]: Math.max(s.panels[taskId] ?? 0, stars) } }));

  const totalStars = Object.values(save.lessons).reduce((a, b) => a + b, 0) + Object.values(save.panels).reduce((a, b) => a + b, 0);
  const maxStars = (LEVELS.length + PANEL_TASKS.length) * 3;

  return (
    <>
      <Sidebar
        active={navActive}
        onNavigate={navigate}
        studentName={save.student?.name ?? null}
        stats={{ lessons: Object.keys(save.lessons).length, panels: Object.keys(save.panels).length, exam: save.exam }}
      />

      <ScrollTop />

      {calcOpen && <LoadCalc onClose={() => setCalcOpen(false)} />}
      {glossOpen && <GlossaryPanel onClose={() => setGlossOpen(false)} />}

      {screen.name === 'menu' && (
        <Menu
          progress={save.lessons}
          panelProgress={save.panels}
          examBest={save.exam}
          initialMode={menuMode}
          onPlay={(i) => setScreen({ name: 'game', levelIdx: i })}
          onBuild={(i) => setScreen({ name: 'build', taskIdx: i })}
          onExam={() => setScreen({ name: 'exam' })}
          onStudio={() => setScreen({ name: 'studio' })}
          onAdmin={() => setScreen({ name: 'admin' })}
          onTheory={() => setScreen({ name: 'theory' })}
          accountSlot={<AccountChip student={save.student} onOpen={() => setAccountOpen(true)} />}
        />
      )}

      {screen.name === 'studio' && <Studio onExit={() => setScreen({ name: 'menu' })} />}

      {screen.name === 'theory' && <Theory onExit={() => setScreen({ name: 'menu' })} />}

      {screen.name === 'admin' && (
        <Admin students={save.students} onChange={(students) => setSave((v) => ({ ...v, students }))} onExit={() => setScreen({ name: 'menu' })} />
      )}

      {accountOpen && (
        <AccountModal
          student={save.student}
          stats={{
            lessons: Object.keys(save.lessons).length,
            lessonsMax: LEVELS.length,
            panels: Object.keys(save.panels).length,
            panelsMax: PANEL_TASKS.length,
            exam: save.exam,
            stars: totalStars,
          }}
          onSave={(s) => setSave((v) => ({ ...v, student: s }))}
          onLogout={() => {
            setSave((v) => ({ ...v, student: null }));
            setAccountOpen(false);
          }}
          onClose={() => setAccountOpen(false)}
        />
      )}

      {screen.name === 'game' && (
        <Game
          key={LEVELS[screen.levelIdx].id}
          level={LEVELS[screen.levelIdx]}
          isLast={screen.levelIdx === LEVELS.length - 1}
          totalLevels={LEVELS.length}
          onExit={() => setScreen({ name: 'menu' })}
          onFinished={onLessonDone}
          onNext={() =>
            screen.levelIdx === LEVELS.length - 1
              ? setScreen({ name: 'final' })
              : setScreen({ name: 'game', levelIdx: screen.levelIdx + 1 })
          }
        />
      )}

      {screen.name === 'build' && (
        <Builder
          key={PANEL_TASKS[screen.taskIdx].id}
          task={PANEL_TASKS[screen.taskIdx]}
          isLast={screen.taskIdx === PANEL_TASKS.length - 1}
          onExit={() => setScreen({ name: 'menu' })}
          onFinished={onPanelDone}
          onNext={() =>
            screen.taskIdx === PANEL_TASKS.length - 1
              ? setScreen({ name: 'final' })
              : setScreen({ name: 'build', taskIdx: screen.taskIdx + 1 })
          }
        />
      )}

      {screen.name === 'exam' && (
        <Quiz
          onExit={() => setScreen({ name: 'menu' })}
          onFinished={(score, total) =>
            setSave((s) => ({ ...s, exam: Math.max(s.exam, Math.round((score / Math.max(1, total)) * 100)) }))
          }
        />
      )}

      {screen.name === 'final' && (
        <div className="blueprint flex min-h-screen items-center justify-center bg-[#070b12] p-4">
          <div className="pop-in w-full max-w-2xl rounded-3xl border border-volt/30 bg-[#0c1320] p-5 text-center sm:p-8 lg:p-12">
            <div className="relative mx-auto w-fit">
              <div className="glow-amber rounded-3xl bg-volt/15 p-6">
                <Trophy className="h-16 w-16 text-volt" />
              </div>
            </div>
            <div className="mt-6 font-mono text-xs tracking-[0.3em] text-slate-500 uppercase">ЭлектроМастер · итоговый протокол</div>
            <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">Диплом электромонтажника получен!</h1>
            <p className="mx-auto mt-4 max-w-lg leading-relaxed text-slate-400">
              Вы прошли путь от трёх проводов до многорядных щитов с реле напряжения, УЗИП, кросс-модулями,
              контакторами, трёхфазным вводом и зарядными станциями для электромобилей.
            </p>

            <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-line bg-panel p-4">
                <Star className="mx-auto h-6 w-6 fill-volt text-volt" />
                <div className="mt-2 font-display text-2xl text-white">
                  {totalStars} <span className="text-sm text-slate-500">/ {maxStars}</span>
                </div>
                <div className="text-xs text-slate-500">звёзд</div>
              </div>
              <div className="rounded-2xl border border-line bg-panel p-4">
                <Award className="mx-auto h-6 w-6 text-sky-400" />
                <div className="mt-2 font-display text-2xl text-white">
                  {Object.keys(save.lessons).length} / {LEVELS.length}
                </div>
                <div className="text-xs text-slate-500">уроков</div>
              </div>
              <div className="rounded-2xl border border-line bg-panel p-4">
                <Zap className="mx-auto h-6 w-6 text-emerald-400" />
                <div className="mt-2 font-display text-2xl text-white">
                  {Object.keys(save.panels).length} / {PANEL_TASKS.length}
                </div>
                <div className="text-xs text-slate-500">щитов</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-left">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                <Zap className="h-4 w-4" /> Памятка на всю жизнь
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Автомат защищает проводку, УЗО — человека, реле напряжения — технику, УЗИП — от импульсов. Выключатель
                всегда в разрыв фазы, номинал автомата — по сечению кабеля, земля не проходит ни через один аппарат.
                И всегда: сначала отключи питание, потом работай.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  localStorage.removeItem(LS_KEY);
                  setSave({ lessons: {}, panels: {}, exam: 0, student: null, students: [] });
                  setScreen({ name: 'menu' });
                }}
                className="flex items-center gap-2 rounded-xl border border-line bg-panel px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-volt/50 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" /> Сбросить прогресс
              </button>
              <button
                onClick={() => setScreen({ name: 'exam' })}
                className="flex items-center gap-2 rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 px-5 py-3 text-sm font-bold text-fuchsia-300 transition hover:bg-fuchsia-500/20"
              >
                Экзамен ({save.exam}%)
              </button>
              <button
                onClick={() => setScreen({ name: 'menu' })}
                className="flex items-center gap-2 rounded-xl bg-volt px-6 py-3 font-display text-sm tracking-wide text-black transition hover:bg-volt-2"
              >
                <Home className="h-4 w-4" /> В МЕНЮ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

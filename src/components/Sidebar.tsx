import { useEffect, useState } from 'react';
import {
  BookOpen,
  Calculator,
  GraduationCap,
  HelpCircle,
  Home,
  LayoutGrid,
  Menu as MenuIcon,
  Send,
  Shield,
  Sparkles,
  User,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { LEVELS } from '../levels';
import { PANEL_TASKS } from '../content';
import { QUESTION_BANK } from '../quizBank';
import { CHAPTERS } from '../theory';
import { TG_URL } from './Telegram';
import { sfx } from '../audio';

export type NavTarget = 'menu' | 'lessons' | 'panels' | 'exam' | 'theory' | 'studio' | 'calc' | 'glossary' | 'account';

export interface SidebarProps {
  active?: NavTarget;
  onNavigate: (t: NavTarget) => void;
  studentName?: string | null;
  stats?: { lessons: number; panels: number; exam: number };
}

interface Item {
  id: NavTarget;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

export default function Sidebar({ active, onNavigate, studentName, stats }: SidebarProps) {
  const [open, setOpen] = useState(false);

  // блокируем прокрутку body при открытом меню
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const groups: Array<{ title: string; items: Item[] }> = [
    {
      title: 'Обучение',
      items: [
        { id: 'lessons', label: 'Уроки', desc: `${LEVELS.length} схем в 7 актах`, icon: <LayoutGrid className="h-4 w-4" />, color: '#ffc42e', badge: stats ? `${stats.lessons}/${LEVELS.length}` : undefined },
        { id: 'theory', label: 'Теория', desc: `${CHAPTERS.length} глав учебника`, icon: <BookOpen className="h-4 w-4" />, color: '#38bdf8' },
        { id: 'glossary', label: 'Справочник L / N / PE', desc: 'фаза, ноль, земля и термины', icon: <HelpCircle className="h-4 w-4" />, color: '#7dd3fc' },
      ],
    },
    {
      title: 'Практика',
      items: [
        { id: 'panels', label: 'Щитосборка', desc: `${PANEL_TASKS.length} объектов с расключением`, icon: <Wrench className="h-4 w-4" />, color: '#4ade80', badge: stats ? `${stats.panels}/${PANEL_TASKS.length}` : undefined },
        { id: 'studio', label: 'Студия щита', desc: 'свой проект и смета', icon: <Sparkles className="h-4 w-4" />, color: '#a78bfa' },
        { id: 'calc', label: 'Калькулятор нагрузки', desc: 'подбор автомата и сечения', icon: <Calculator className="h-4 w-4" />, color: '#34d399' },
      ],
    },
    {
      title: 'Проверка знаний',
      items: [
        { id: 'exam', label: 'Экзамен', desc: `${QUESTION_BANK.length} вопросов с графикой`, icon: <GraduationCap className="h-4 w-4" />, color: '#f472b6', badge: stats ? `${stats.exam}%` : undefined },
      ],
    },
    {
      title: 'Профиль и управление',
      items: [
        { id: 'account', label: 'Аккаунт ученика', desc: studentName ?? 'войти или создать профиль', icon: <User className="h-4 w-4" />, color: '#facc15' },
      ],
    },
  ];

  const go = (t: NavTarget) => {
    setOpen(false);
    sfx.click();
    onNavigate(t);
  };

  return (
    <>
      {/* Кнопка-гамбургер — фиксированная, всегда доступна */}
      <button
        onClick={() => {
          setOpen(true);
          sfx.select();
        }}
        aria-label="Открыть меню"
        className="fixed top-3 left-3 z-[90] flex h-11 w-11 items-center justify-center rounded-2xl border border-volt/40 bg-[#0b1220]/95 text-volt shadow-lg backdrop-blur transition hover:bg-volt/15 active:scale-95"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {/* Затемнение */}
      {open && <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} style={{ animation: 'fadeIn .18s ease both' }} />}

      {/* Панель */}
      <aside
        className={`fixed top-0 left-0 z-[96] flex h-full w-[86vw] max-w-[330px] flex-col border-r border-line bg-[#0a1018] shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Шапка панели */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-4">
          <div className="rounded-xl bg-volt/15 p-2">
            <Zap className="h-5 w-5 text-volt" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-base leading-none text-white">
              ЭЛЕКТРО<span className="text-volt">МАСТЕР</span>
            </div>
            <div className="mt-1 font-mono text-[10px] text-slate-500">навигация по разделам</div>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Закрыть" className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Главная */}
        <div className="px-3 pt-3">
          <button
            onClick={() => go('menu')}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
              active === 'menu' ? 'border-volt/50 bg-volt/10' : 'border-line bg-panel hover:border-volt/40'
            }`}
          >
            <Home className={`h-4 w-4 ${active === 'menu' ? 'text-volt' : 'text-slate-400'}`} />
            <span className={`text-sm font-bold ${active === 'menu' ? 'text-volt' : 'text-slate-200'}`}>Главная</span>
          </button>
        </div>

        {/* Разделы */}
        <nav className="flex-1 overflow-y-auto px-3 pt-3 pb-4">
          {groups.map((g) => (
            <div key={g.title} className="mb-4">
              <div className="mb-1.5 px-1 font-mono text-[10px] tracking-widest text-slate-600 uppercase">{g.title}</div>
              <div className="space-y-1">
                {g.items.map((it) => {
                  const isActive = active === it.id;
                  return (
                    <button
                      key={it.id}
                      onClick={() => go(it.id)}
                      className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                        isActive ? 'border-volt/50 bg-volt/10' : 'border-transparent bg-panel/60 hover:border-line hover:bg-panel'
                      }`}
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-105"
                        style={{ background: `${it.color}1f`, color: it.color }}
                      >
                        {it.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-bold text-slate-100">{it.label}</span>
                        <span className="block truncate text-[10.5px] text-slate-500">{it.desc}</span>
                      </span>
                      {it.badge && (
                        <span className="shrink-0 rounded-md bg-[#0a101b] px-1.5 py-0.5 font-mono text-[9.5px] text-slate-400">{it.badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Подвал */}
        <div className="border-t border-line px-3 py-3">
          <a
            href={TG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2.5 transition hover:bg-sky-500/20"
          >
            <Send className="h-4 w-4 shrink-0 text-sky-300" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-sky-200">@irawiq</span>
              <span className="block truncate text-[10px] text-slate-500">автор проекта · написать</span>
            </span>
          </a>
          <p className="mt-2 px-1 text-[9.5px] leading-relaxed text-slate-600">
            <span className="mr-1 rounded bg-slate-700/60 px-1 py-0.5 font-mono text-[8px] font-bold text-slate-300">MVP</span>
            демоверсия · SaaS ближе к зиме
          </p>
        </div>
      </aside>
    </>
  );
}

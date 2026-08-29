import { useState } from 'react';
import { GraduationCap, LogOut, Pencil, User, X } from 'lucide-react';

export interface Student {
  name: string;
  group: string;
  since: string;
  city?: string;
  goal?: string;
  level?: string;
  sound?: boolean;
  hints?: boolean;
  bigText?: boolean;
}

const GOALS = ['Для себя и дома', 'Работаю электриком', 'Учусь в колледже', 'Собираю щиты на заказ'];
const LEVELS_OPT = ['Новичок', 'Есть опыт', 'Профессионал'];

export function AccountChip({ student, onOpen }: { student: Student | null; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-volt/50 hover:text-white"
      title="Аккаунт ученика"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-volt/20 font-display text-[11px] text-volt">
        {student ? student.name.trim().charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
      </span>
      <span className="max-w-28 truncate">{student ? student.name : 'Войти'}</span>
    </button>
  );
}

export function AccountModal({
  student,
  stats,
  onSave,
  onLogout,
  onClose,
}: {
  student: Student | null;
  stats: { lessons: number; lessonsMax: number; panels: number; panelsMax: number; exam: number; stars: number };
  onSave: (s: Student) => void;
  onLogout: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(student?.name ?? '');
  const [group, setGroup] = useState(student?.group ?? '');
  const [city, setCity] = useState(student?.city ?? '');
  const [goal, setGoal] = useState(student?.goal ?? GOALS[0]);
  const [level, setLevel] = useState(student?.level ?? LEVELS_OPT[0]);
  const [sound, setSound] = useState(student?.sound ?? true);
  const [hints, setHints] = useState(student?.hints ?? true);
  const [bigText, setBigText] = useState(student?.bigText ?? false);
  const [edit, setEdit] = useState(!student);

  const save = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      group: group.trim() || 'Самостоятельное обучение',
      since: student?.since ?? new Date().toLocaleDateString('ru-RU'),
      city: city.trim(),
      goal,
      level,
      sound,
      hints,
      bigText,
    });
    setEdit(false);
  };

  const pct = Math.round(((stats.lessons + stats.panels) / Math.max(1, stats.lessonsMax + stats.panelsMax)) * 100);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="pop-in w-full max-w-md rounded-3xl border border-line bg-[#0c1320] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-volt/15 p-3">
            <GraduationCap className="h-6 w-6 text-volt" />
          </div>
          <div>
            <div className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Аккаунт ученика</div>
            <h3 className="font-display text-lg text-white">{student && !edit ? student.name : 'Создание профиля'}</h3>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {edit ? (
          <div className="mt-5 space-y-3">
            <div>
              <label className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Имя и фамилия</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Петров"
                className="mt-1.5 w-full rounded-xl border border-line bg-[#0a101b] px-4 py-3 text-sm text-slate-100 outline-none focus:border-volt/60"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Группа / организация</label>
              <input
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="Например: ЭМ-21 или ИП Иванов"
                className="mt-1.5 w-full rounded-xl border border-line bg-[#0a101b] px-4 py-3 text-sm text-slate-100 outline-none focus:border-volt/60"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Город</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Москва" className="mt-1.5 w-full rounded-xl border border-line bg-[#0a101b] px-4 py-3 text-sm text-slate-100 outline-none focus:border-volt/60" />
            </div>
            <div>
              <label className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Цель обучения</label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {GOALS.map((g) => (
                  <button key={g} onClick={() => setGoal(g)} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${goal === g ? 'bg-volt text-black' : 'bg-panel text-slate-400 hover:text-white'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Уровень подготовки</label>
              <div className="mt-1.5 flex gap-1.5">
                {LEVELS_OPT.map((g) => (
                  <button key={g} onClick={() => setLevel(g)} className={`flex-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${level === g ? 'bg-volt text-black' : 'bg-panel text-slate-400 hover:text-white'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5 rounded-xl border border-line bg-panel p-3">
              {[
                { t: 'Звуковые эффекты', v: sound, set: setSound },
                { t: 'Показывать подсказки при наведении', v: hints, set: setHints },
                { t: 'Крупный шрифт интерфейса', v: bigText, set: setBigText },
              ].map((o) => (
                <button key={o.t} onClick={() => o.set(!o.v)} className="flex w-full items-center justify-between text-sm text-slate-300">
                  {o.t}
                  <span className={`relative h-5 w-9 rounded-full transition ${o.v ? 'bg-volt' : 'bg-slate-700'}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${o.v ? 'left-4.5' : 'left-0.5'}`} />
                  </span>
                </button>
              ))}
            </div>
            <button onClick={save} className="w-full rounded-xl bg-volt py-3 font-display text-sm tracking-wide text-black transition hover:bg-volt-2">
              СОХРАНИТЬ ПРОФИЛЬ
            </button>
            <p className="text-center text-[11px] text-slate-500">Профиль и прогресс хранятся локально в этом браузере</p>
          </div>
        ) : (
          <>
            <div className="mt-5 rounded-2xl border border-line bg-panel p-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Группа</span>
                <span className="font-bold text-slate-200">{student?.group}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-500">Обучение с</span>
                <span className="font-bold text-slate-200">{student?.since}</span>
              </div>
              {student?.city && (
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Город</span>
                  <span className="font-bold text-slate-200">{student.city}</span>
                </div>
              )}
              {student?.goal && (
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Цель</span>
                  <span className="font-bold text-slate-200">{student.goal}</span>
                </div>
              )}
              {student?.level && (
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Уровень</span>
                  <span className="font-bold text-slate-200">{student.level}</span>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { t: 'Уроки', v: `${stats.lessons}/${stats.lessonsMax}` },
                { t: 'Щиты', v: `${stats.panels}/${stats.panelsMax}` },
                { t: 'Экзамен', v: `${stats.exam}%` },
              ].map((s) => (
                <div key={s.t} className="rounded-xl border border-line bg-panel p-3 text-center">
                  <div className="font-display text-lg text-white">{s.v}</div>
                  <div className="text-[11px] text-slate-500">{s.t}</div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                <span>Общий прогресс курса</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-panel">
                <div className="h-full rounded-full bg-gradient-to-r from-volt-2 to-volt transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button onClick={() => setEdit(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-panel py-3 text-sm font-bold text-slate-200 hover:border-volt/50">
                <Pencil className="h-4 w-4" /> Изменить
              </button>
              <button onClick={onLogout} className="flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20">
                <LogOut className="h-4 w-4" /> Выйти
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

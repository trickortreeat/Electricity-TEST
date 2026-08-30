import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Lock, Plus, Search, Shield, Trash2, Unlock, UserPlus, Users } from 'lucide-react';
import { LEVELS } from '../levels';
import { PANEL_TASKS } from '../content';
import { MvpNote, TgBadge } from './Telegram';
import { sfx } from '../audio';
import { supabase } from '../lib/supabase';

export interface StudentRecord {
  id: string;
  name: string;
  email?: string;
  password?: string;
  group: string;
  since: string;
  allowed: number[];       // id открытых уроков; пустой массив = все открыты
  lockAll: boolean;        // полная блокировка доступа
  lessons: Record<number, number>;
  panels: Record<number, number>;
  exam: number;
  note: string;
}

export function makeStudent(name: string, group: string, email: string = '', password: string = ''): StudentRecord {
  return {
    id: `s${Date.now()}${Math.floor(Math.random() * 999)}`,
    name,
    email,
    password,
    group,
    since: new Date().toISOString().split('T')[0],
    allowed: [],
    lockAll: false,
    lessons: {},
    panels: {},
    exam: 0,
    note: '',
  };
}

const PIN = '2024';

export default function Admin({
  onExit,
}: {
  onExit: () => void;
}) {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading students:', error);
    } else if (data) {
      const mapped: StudentRecord[] = data.map((row: any) => ({
        id: row.id,
        name: row.name || '',
        email: row.email || '',
        password: row.password || '',
        group: row.group || '',
        since: row.since || new Date().toISOString().split('T')[0],
        allowed: Array.isArray(row.allowed) ? row.allowed : [],
        lockAll: row.lockAll || row.is_active === false,
        lessons: row.lessons || {},
        panels: row.panels || {},
        exam: row.exam || 0,
        note: row.note || '',
      }));
      setStudents(mapped);
      if (mapped.length > 0 && !sel) {
        setSel(mapped[0].id);
      }
    }
    setLoading(false);
  };

  const patch = async (id: string, p: Partial<StudentRecord>) => {
    const updateData: any = {};
    if (p.allowed !== undefined) updateData.allowed = p.allowed;
    if (p.lockAll !== undefined) updateData.lockAll = p.lockAll;
    if (p.note !== undefined) updateData.note = p.note;
    if (p.lessons !== undefined) updateData.lessons = p.lessons;
    if (p.panels !== undefined) updateData.panels = p.panels;
    if (p.exam !== undefined) updateData.exam = p.exam;
    if (p.is_active !== undefined) updateData.is_active = p.is_active;

    const { error } = await supabase.from('students').update(updateData).eq('id', id);
    if (error) {
      console.error('Error updating student:', error);
    } else {
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)));
    }
  };

  const addStudent = async () => {
    if (!newName.trim()) return;
    const { data, error } = await supabase.from('students').insert([{
      name: newName.trim(),
      group: newGroup.trim() || 'Без группы',
      email: newEmail.trim(),
      password: newPassword.trim(),
      since: new Date().toISOString().split('T')[0],
      allowed: [],
      lockAll: false,
      lessons: {},
      panels: {},
      exam: 0,
      note: '',
      is_active: true,
    }]).select().single();

    if (error) {
      console.error('Error adding student:', error);
      sfx.error();
    } else if (data) {
      const newStudent: StudentRecord = {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        group: data.group,
        since: data.since,
        allowed: data.allowed || [],
        lockAll: data.lockAll || false,
        lessons: data.lessons || {},
        panels: data.panels || {},
        exam: data.exam || 0,
        note: data.note || '',
      };
      setStudents((prev) => [newStudent, ...prev]);
      setSel(newStudent.id);
      setNewName('');
      setNewGroup('');
      setNewEmail('');
      setNewPassword('');
      sfx.spark();
    }
  };

  const deleteStudent = async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) {
      console.error('Error deleting student:', error);
      sfx.error();
    } else {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (sel === id) setSel(null);
      sfx.remove();
    }
  };

  const toggleLesson = async (lid: number) => {
    if (!sel) return;
    const cur = students.find((s) => s.id === sel);
    if (!cur) return;
    const all = cur.allowed.length === 0;
    const base = all ? LEVELS.map((l) => l.id) : cur.allowed;
    const next = base.includes(lid) ? base.filter((x) => x !== lid) : [...base, lid];
    const allowed = next.length === LEVELS.length ? [] : next;
    await patch(sel, { allowed });
    sfx.click();
  };

  const isOpen = (lid: number) => {
    const cur = students.find((s) => s.id === sel);
    if (!cur) return false;
    return !cur.lockAll && (cur.allowed.length === 0 || cur.allowed.includes(lid));
  };

  const cur = students.find((s) => s.id === sel) ?? null;
  const list = students.filter((s) => (s.name + s.group).toLowerCase().includes(query.toLowerCase()));

  if (!authed) {
    return (
      <div className="blueprint flex min-h-screen items-center justify-center bg-[#070b12] p-4">
        <div className="pop-in w-full max-w-sm rounded-3xl border border-line bg-[#0c1320] p-7 text-center">
          <div className="mx-auto w-fit rounded-2xl bg-red-500/15 p-4">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="mt-4 font-display text-xl text-white">Панель администратора</h2>
          <p className="mt-2 text-sm text-slate-400">Введите PIN-код преподавателя</p>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && pin === PIN && setAuthed(true)}
            type="password"
            placeholder="••••"
            className="mt-4 w-full rounded-xl border border-line bg-[#0a101b] px-4 py-3 text-center font-mono text-lg tracking-[0.5em] text-slate-100 outline-none focus:border-volt/60"
          />
          {pin.length >= 4 && pin !== PIN && <p className="mt-2 text-xs text-red-400">Неверный код</p>}
          <button
            onClick={() => (pin === PIN ? setAuthed(true) : sfx.error())}
            className="mt-4 w-full rounded-xl bg-volt py-3 font-display text-sm tracking-wide text-black hover:bg-volt-2"
          >
            ВОЙТИ
          </button>
          <button onClick={onExit} className="mt-2 w-full rounded-xl border border-line bg-panel py-2.5 text-sm font-bold text-slate-300 hover:text-white">
            Назад
          </button>
          <p className="mt-3 font-mono text-[10px] text-slate-600">демо-код: 2024</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blueprint min-h-screen bg-[#070b12] pb-10">
      <header className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center gap-3 px-4 pt-3 pl-16 sm:pt-5">
        <button onClick={onExit} className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3.5 py-2 text-sm font-bold text-slate-300 hover:border-volt/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Меню
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-red-400 px-2 py-0.5 font-display text-[11px] text-black">АДМИНИСТРАТОР</span>
            <span className="font-mono text-[11px] text-slate-500">{students.length} учеников</span>
          </div>
          <h1 className="font-display text-lg text-white">Управление обучением</h1>
        </div>
        <div className="ml-auto">
          <TgBadge compact />
        </div>
      </header>

      <div className="mx-auto mt-4 grid w-full max-w-[1400px] gap-4 px-4 lg:grid-cols-[320px_1fr]">
        {/* список учеников */}
        <aside className="rounded-2xl border border-line bg-panel/70 p-3">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-[#0a101b] px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск ученика…" className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600" />
          </div>

          <div className="mt-3 max-h-[46vh] space-y-1.5 overflow-y-auto pr-1">
            {loading ? (
              <p className="py-6 text-center text-xs text-slate-600">Загрузка...</p>
            ) : list.map((s) => (
              <button
                key={s.id}
                onClick={() => setSel(s.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${sel === s.id ? 'border-volt bg-volt/10' : 'border-line bg-[#0b111c] hover:border-slate-600'}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-volt/15 font-display text-sm text-volt">{s.name.charAt(0).toUpperCase()}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-slate-200">{s.name}</span>
                  <span className="block truncate text-[11px] text-slate-500">{s.group}</span>
                </span>
                {s.lockAll ? <Lock className="h-4 w-4 text-red-400" /> : <Unlock className="h-4 w-4 text-emerald-400" />}
              </button>
            ))}
            {!loading && list.length === 0 && <p className="py-6 text-center text-xs text-slate-600">Учеников нет</p>}
          </div>

          <div className="mt-3 space-y-2 rounded-xl border border-line bg-[#0b111c] p-3">
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-slate-500 uppercase">
              <UserPlus className="h-3.5 w-3.5" /> Новый ученик
            </div>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Имя и фамилия" className="w-full rounded-lg border border-line bg-[#0a101b] px-3 py-2 text-sm text-slate-100 outline-none focus:border-volt/60" />
            <input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="Группа" className="w-full rounded-lg border border-line bg-[#0a101b] px-3 py-2 text-sm text-slate-100 outline-none focus:border-volt/60" />
            <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email для входа" className="w-full rounded-lg border border-line bg-[#0a101b] px-3 py-2 text-sm text-slate-100 outline-none focus:border-volt/60" />
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Пароль" type="password" className="w-full rounded-lg border border-line bg-[#0a101b] px-3 py-2 text-sm text-slate-100 outline-none focus:border-volt/60" />
            <button
              onClick={addStudent}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-volt py-2.5 font-display text-xs tracking-wide text-black hover:bg-volt-2"
            >
              <Plus className="h-4 w-4" /> ДОБАВИТЬ
            </button>
          </div>
        </aside>

        {/* карточка ученика */}
        <main>
          {!cur ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-line bg-panel/50 text-slate-500">
              <Users className="mr-2 h-5 w-5" /> Выберите ученика слева
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-line bg-panel/60 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-volt/15 font-display text-lg text-volt">{cur.name.charAt(0).toUpperCase()}</span>
                  <div>
                    <div className="font-display text-lg text-white">{cur.name}</div>
                    <div className="text-xs text-slate-500">
                      {cur.group} · обучается с {cur.since}
                    </div>
                    {cur.email && <div className="text-[11px] text-slate-600">{cur.email}</div>}
                  </div>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => patch(cur.id, { lockAll: !cur.lockAll })}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${cur.lockAll ? 'bg-red-500/20 text-red-300' : 'border border-line bg-panel text-slate-200 hover:border-red-400/50'}`}
                    >
                      {cur.lockAll ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      {cur.lockAll ? 'Доступ закрыт' : 'Доступ открыт'}
                    </button>
                    <button
                      onClick={() => deleteStudent(cur.id)}
                      className="rounded-xl border border-line bg-panel p-2.5 text-slate-400 hover:text-red-400"
                      title="Удалить ученика"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { t: 'Уроков', v: `${Object.keys(cur.lessons).length} / ${LEVELS.length}` },
                    { t: 'Щитов', v: `${Object.keys(cur.panels).length} / ${PANEL_TASKS.length}` },
                    { t: 'Экзамен', v: `${cur.exam}%` },
                    { t: 'Открыто', v: cur.lockAll ? '0' : cur.allowed.length === 0 ? `${LEVELS.length}` : `${cur.allowed.length}` },
                  ].map((s, i) => (
                    <div key={s.t} className="reveal rounded-xl border border-line bg-panel p-3 text-center" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="font-display text-xl text-white">{s.v}</div>
                      <div className="text-[10.5px] text-slate-500">{s.t}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-panel/60 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="font-display text-sm text-white">Доступ к урокам</div>
                  <span className="text-xs text-slate-500">Кликните по уроку, чтобы открыть или закрыть его для ученика</span>
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => patch(cur.id, { allowed: [] })} className="rounded-lg border border-line bg-panel px-3 py-1.5 text-[11px] font-bold text-slate-300 hover:border-emerald-400/60">
                      Открыть все
                    </button>
                    <button onClick={() => patch(cur.id, { allowed: [1] })} className="rounded-lg border border-line bg-panel px-3 py-1.5 text-[11px] font-bold text-slate-300 hover:border-red-400/60">
                      Только первый
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-9">
                  {LEVELS.map((l) => {
                    const open = isOpen(l.id);
                    return (
                      <button
                        key={l.id}
                        onClick={() => toggleLesson(l.id)}
                        title={l.title}
                        disabled={cur.lockAll}
                        className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] font-bold transition disabled:opacity-40 ${
                          open ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-line bg-[#0b111c] text-slate-600'
                        }`}
                      >
                        <span className="font-display text-sm">{String(l.id).padStart(2, '0')}</span>
                        {open ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-panel/60 p-4">
                <MvpNote className="mb-3" />
                <div className="font-display text-sm text-white">Заметка преподавателя</div>
                <textarea
                  value={cur.note}
                  onChange={(e) => patch(cur.id, { note: e.target.value })}
                  rows={3}
                  placeholder="Например: слабо разбирается в селективности УЗО, повторить уроки 19–20"
                  className="mt-2 w-full resize-none rounded-xl border border-line bg-[#0a101b] px-4 py-3 text-sm text-slate-100 outline-none focus:border-volt/60"
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

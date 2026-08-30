import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Lock, Plus, Search, Shield, Trash2, Unlock, UserPlus, Users, LogOut, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LEVELS } from '../levels';
import { PANEL_TASKS } from '../content';
import type { Language } from '../i18n';

interface AdminTranslations {
  title: string;
  subtitle: string;
  pin_label: string;
  btn_enter: string;
  back: string;
  demo_pin: string;
  admin_panel: string;
  students_count: string;
  manage_learning: string;
  search_student: string;
  new_student: string;
  name_placeholder: string;
  group_placeholder: string;
  btn_add: string;
  select_student: string;
  access_closed: string;
  access_open: string;
  lessons: string;
  panels: string;
  exam: string;
  unlocked: string;
  lesson_access: string;
  click_to_toggle: string;
  open_all: string;
  only_first: string;
  teacher_note: string;
  note_placeholder: string;
  btn_logout: string;
}

const adminTranslations: Record<Language, AdminTranslations> = {
  ru: {
    title: 'Панель администратора',
    subtitle: 'Введите PIN-код преподавателя',
    pin_label: 'PIN-код',
    btn_enter: 'ВОЙТИ',
    back: 'Назад',
    demo_pin: 'демо-код: 2024',
    admin_panel: 'АДМИНИСТРАТОР',
    students_count: 'учеников',
    manage_learning: 'Управление обучением',
    search_student: 'Поиск ученика…',
    new_student: 'Новый ученик',
    name_placeholder: 'Имя и фамилия',
    group_placeholder: 'Группа',
    btn_add: 'ДОБАВИТЬ',
    select_student: 'Выберите ученика слева',
    access_closed: 'Доступ закрыт',
    access_open: 'Доступ открыт',
    lessons: 'Уроков',
    panels: 'Щитов',
    exam: 'Экзамен',
    unlocked: 'Открыто',
    lesson_access: 'Доступ к урокам',
    click_to_toggle: 'Кликните по уроку, чтобы открыть или закрыть его для ученика',
    open_all: 'Открыть все',
    only_first: 'Только первый',
    teacher_note: 'Заметка преподавателя',
    note_placeholder: 'Например: слабо разбирается в селективности УЗО, повторить уроки 19–20',
    btn_logout: 'ВЫЙТИ',
  },
  en: {
    title: 'Admin Panel',
    subtitle: 'Enter teacher PIN code',
    pin_label: 'PIN Code',
    btn_enter: 'ENTER',
    back: 'Back',
    demo_pin: 'demo code: 2024',
    admin_panel: 'ADMINISTRATOR',
    students_count: 'students',
    manage_learning: 'Manage Learning',
    search_student: 'Search student…',
    new_student: 'New Student',
    name_placeholder: 'Full name',
    group_placeholder: 'Group',
    btn_add: 'ADD',
    select_student: 'Select a student from the left',
    access_closed: 'Access Closed',
    access_open: 'Access Open',
    lessons: 'Lessons',
    panels: 'Panels',
    exam: 'Exam',
    unlocked: 'Unlocked',
    lesson_access: 'Lesson Access',
    click_to_toggle: 'Click on a lesson to toggle access for this student',
    open_all: 'Open All',
    only_first: 'Only First',
    teacher_note: 'Teacher Note',
    note_placeholder: 'e.g., struggles with RCD selectivity, review lessons 19-20',
    btn_logout: 'LOGOUT',
  },
};

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  group: string;
  since: string;
  allowed: number[];
  lockAll: boolean;
  lessons: Record<number, number>;
  panels: Record<number, number>;
  exam: number;
  note: string;
  is_active: boolean;
}

export default function Admin({ lang }: { lang: Language }) {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const t = adminTranslations[lang];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authed) {
      loadStudents();
    }
  }, [authed]);

  const checkAuth = () => {
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) {
      navigate('/login');
    } else {
      setAuthed(true);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('students').select('*').order('name');
    if (!error && data) {
      setStudents(data as StudentRecord[]);
      if (data.length > 0 && !sel) {
        setSel(data[0].id);
      }
    }
    setLoading(false);
  };

  const handleLogin = () => {
    if (pin === '2024') {
      localStorage.setItem('admin_session', 'true');
      setAuthed(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('admin_session');
    navigate('/login');
  };

  const patch = async (id: string, p: Partial<StudentRecord>) => {
    const updated = students.map((s) => (s.id === id ? { ...s, ...p } : s));
    setStudents(updated);
    await supabase.from('students').update(p).eq('id', id);
  };

  const addStudent = async () => {
    if (!newName.trim()) return;
    const newStudent: Partial<StudentRecord> = {
      name: newName.trim(),
      group: newGroup.trim() || 'Без группы',
      email: '',
      since: new Date().toLocaleDateString('ru-RU'),
      allowed: [],
      lockAll: false,
      lessons: {},
      panels: {},
      exam: 0,
      note: '',
      is_active: true,
    };

    const { data, error } = await supabase.from('students').insert([newStudent]).select();
    if (!error && data) {
      const added = data[0] as StudentRecord;
      setStudents([...students, added]);
      setSel(added.id);
      setNewName('');
      setNewGroup('');
    }
  };

  const deleteStudent = async (id: string) => {
    await supabase.from('students').delete().eq('id', id);
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    if (sel === id) setSel(null);
  };

  const toggleLesson = async (lid: number) => {
    const cur = students.find((s) => s.id === sel);
    if (!cur) return;
    const all = cur.allowed.length === 0;
    const base = all ? LEVELS.map((l) => l.id) : cur.allowed;
    const next = base.includes(lid) ? base.filter((x) => x !== lid) : [...base, lid];
    await patch(cur.id, { allowed: next.length === LEVELS.length ? [] : next });
  };

  const isOpen = (lid: number) => {
    const cur = students.find((s) => s.id === sel);
    return cur ? !cur.lockAll && (cur.allowed.length === 0 || cur.allowed.includes(lid)) : false;
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
          <h2 className="mt-4 font-display text-xl text-white">{t.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{t.subtitle}</p>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            type="password"
            placeholder="••••"
            className="mt-4 w-full rounded-xl border border-line bg-[#0a101b] px-4 py-3 text-center font-mono text-lg tracking-[0.5em] text-slate-100 outline-none focus:border-volt/60"
          />
          {pin.length >= 4 && pin !== '2024' && <p className="mt-2 text-xs text-red-400">Неверный код</p>}
          <button
            onClick={handleLogin}
            className="mt-4 w-full rounded-xl bg-volt py-3 font-display text-sm tracking-wide text-black hover:bg-volt-2"
          >
            {t.btn_enter}
          </button>
          <button onClick={() => navigate('/')} className="mt-2 w-full rounded-xl border border-line bg-panel py-2.5 text-sm font-bold text-slate-300 hover:text-white">
            {t.back}
          </button>
          <p className="mt-3 font-mono text-[10px] text-slate-600">{t.demo_pin}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blueprint min-h-screen bg-[#070b12] pb-10">
      <header className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center gap-3 px-4 pt-3 pl-16 sm:pt-5">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3.5 py-2 text-sm font-bold text-slate-300 hover:border-volt/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {t.back}
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-red-400 px-2 py-0.5 font-display text-[11px] text-black">{t.admin_panel}</span>
            <span className="font-mono text-[11px] text-slate-500">{students.length} {t.students_count}</span>
          </div>
          <h1 className="font-display text-lg text-white">{t.manage_learning}</h1>
        </div>
        <div className="ml-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" /> {t.btn_logout}
          </button>
        </div>
      </header>

      <div className="mx-auto mt-4 grid w-full max-w-[1400px] gap-4 px-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-line bg-panel/70 p-3">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-[#0a101b] px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search_student} className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600" />
          </div>

          <div className="mt-3 max-h-[46vh] space-y-1.5 overflow-y-auto pr-1">
            {list.map((s) => (
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
            {list.length === 0 && <p className="py-6 text-center text-xs text-slate-600">Учеников нет</p>}
          </div>

          <div className="mt-3 space-y-2 rounded-xl border border-line bg-[#0b111c] p-3">
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-slate-500 uppercase">
              <UserPlus className="h-3.5 w-3.5" /> {t.new_student}
            </div>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t.name_placeholder} className="w-full rounded-lg border border-line bg-[#0a101b] px-3 py-2 text-sm text-slate-100 outline-none focus:border-volt/60" />
            <input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder={t.group_placeholder} className="w-full rounded-lg border border-line bg-[#0a101b] px-3 py-2 text-sm text-slate-100 outline-none focus:border-volt/60" />
            <button
              onClick={addStudent}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-volt py-2.5 font-display text-xs tracking-wide text-black hover:bg-volt-2"
            >
              <Plus className="h-4 w-4" /> {t.btn_add}
            </button>
          </div>
        </aside>

        <main>
          {!cur ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-line bg-panel/50 text-slate-500">
              <Users className="mr-2 h-5 w-5" /> {t.select_student}
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
                  </div>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => patch(cur.id, { lockAll: !cur.lockAll })}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${cur.lockAll ? 'bg-red-500/20 text-red-300' : 'border border-line bg-panel text-slate-200 hover:border-red-400/50'}`}
                    >
                      {cur.lockAll ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      {cur.lockAll ? t.access_closed : t.access_open}
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
                    { t: t.lessons, v: `${Object.keys(cur.lessons).length} / ${LEVELS.length}` },
                    { t: t.panels, v: `${Object.keys(cur.panels).length} / ${PANEL_TASKS.length}` },
                    { t: t.exam, v: `${cur.exam}%` },
                    { t: t.unlocked, v: cur.lockAll ? '0' : cur.allowed.length === 0 ? `${LEVELS.length}` : `${cur.allowed.length}` },
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
                  <div className="font-display text-sm text-white">{t.lesson_access}</div>
                  <span className="text-xs text-slate-500">{t.click_to_toggle}</span>
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => patch(cur.id, { allowed: [] })} className="rounded-lg border border-line bg-panel px-3 py-1.5 text-[11px] font-bold text-slate-300 hover:border-emerald-400/60">
                      {t.open_all}
                    </button>
                    <button onClick={() => patch(cur.id, { allowed: [1] })} className="rounded-lg border border-line bg-panel px-3 py-1.5 text-[11px] font-bold text-slate-300 hover:border-red-400/60">
                      {t.only_first}
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
                <div className="font-display text-sm text-white">{t.teacher_note}</div>
                <textarea
                  value={cur.note}
                  onChange={(e) => patch(cur.id, { note: e.target.value })}
                  rows={3}
                  placeholder={t.note_placeholder}
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

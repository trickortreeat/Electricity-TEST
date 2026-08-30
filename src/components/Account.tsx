import { useState, useEffect } from 'react';
import { GraduationCap, LogOut, Pencil, User, X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { supabase, type StudentProfile } from '../lib/supabase';
import type { StudentRecord } from '../lib/supabase';

const GOALS = ['Для себя и дома', 'Работаю электриком', 'Учусь в колледже', 'Собираю щиты на заказ'];
const LEVELS_OPT = ['Новичок', 'Есть опыт', 'Профессионал'];

export interface Student {
  id: string;
  name: string;
  group: string;
  since: string;
  city?: string;
  goal?: string;
  level?: string;
  sound?: boolean;
  hints?: boolean;
  bigText?: boolean;
  email: string;
}

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
  const [tab, setTab] = useState<'login' | 'register'>(student ? 'login' : 'register');
  const [name, setName] = useState(student?.name ?? '');
  const [group, setGroup] = useState(student?.group ?? '');
  const [city, setCity] = useState(student?.city ?? '');
  const [goal, setGoal] = useState(student?.goal ?? GOALS[0]);
  const [level, setLevel] = useState(student?.level ?? LEVELS_OPT[0]);
  const [sound, setSound] = useState(student?.sound ?? true);
  const [hints, setHints] = useState(student?.hints ?? true);
  const [bigText, setBigText] = useState(student?.bigText ?? false);
  const [edit, setEdit] = useState(!student);

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Load profile from students table
        const { data: profile } = await supabase
          .from('students')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setName(profile.name);
          setGroup(profile.group || '');
          setCity(profile.city || '');
          setGoal(profile.goal || GOALS[0]);
          setLevel(profile.level || LEVELS_OPT[0]);
          setEmail(profile.email || session.user.email || '');
        } else {
          setEmail(session.user.email || '');
        }
      }
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Введите email');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      
      // Load profile from students table
      const { data: profile, error: profileError } = await supabase
        .from('students')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Update last_seen
      await supabase.from('students').update({ last_seen: new Date().toISOString() }).eq('id', data.user.id);

      const studentData: Student = {
        id: data.user.id,
        name: profile?.name || email.split('@')[0],
        group: profile?.group || 'Самостоятельное обучение',
        since: profile?.since || new Date().toLocaleDateString('ru-RU'),
        city: profile?.city || '',
        goal: profile?.goal || GOALS[0],
        level: profile?.level || LEVELS_OPT[0],
        sound: profile?.sound ?? true,
        hints: profile?.hints ?? true,
        bigText: profile?.bigText ?? false,
        email: data.user.email || email,
      };
      onSave(studentData);
      setTab('login');
    } catch (e: any) {
      setError(e.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Введите имя и фамилию');
      return;
    }
    if (!email.trim()) {
      setError('Введите email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Некорректный формат email');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Ошибка регистрации');

      // Create student record
      const studentRecord: Partial<StudentRecord> = {
        id: authData.user.id,
        name: name.trim(),
        group: group.trim() || 'Самостоятельное обучение',
        email: email.trim(),
        since: new Date().toLocaleDateString('ru-RU'),
        city: city.trim() || undefined,
        goal: goal || undefined,
        level: level || undefined,
        allowed: [],
        lockAll: false,
        lessons: {},
        panels: {},
        exam: 0,
        note: '',
        last_seen: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from('students').insert(studentRecord);
      if (insertError) throw insertError;

      // Sign in after registration
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;

      const studentData: Student = {
        id: authData.user.id,
        name: name.trim(),
        group: studentRecord.group,
        since: studentRecord.since,
        city: city.trim() || undefined,
        goal: goal || undefined,
        level: level || undefined,
        sound,
        hints,
        bigText,
        email: email.trim(),
      };
      onSave(studentData);
      setTab('login');
    } catch (e: any) {
      setError(e.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!name.trim() || !student) return;
    setLoading(true);
    try {
      const updateData: Partial<StudentRecord> = {
        name: name.trim(),
        group: group.trim() || 'Самостоятельное обучение',
        city: city.trim() || undefined,
        goal: goal || undefined,
        level: level || undefined,
        sound,
        hints,
        bigText,
      };
      const { error } = await supabase.from('students').update(updateData).eq('id', student.id);
      if (error) throw error;
      
      onSave({ ...student, ...updateData } as Student);
      setEdit(false);
    } catch (e: any) {
      setError(e.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const pct = Math.round(((stats.lessons + stats.panels) / Math.max(1, stats.lessonsMax + stats.panelsMax)) * 100);

  // If user is logged in, show profile view
  if (student) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="pop-in w-full max-w-md rounded-3xl border border-line bg-[#0c1320] p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-volt/15 p-3">
              <GraduationCap className="h-6 w-6 text-volt" />
            </div>
            <div>
              <div className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Аккаунт ученика</div>
              <h3 className="font-display text-lg text-white">{student.name}</h3>
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
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}
              <button 
                onClick={saveProfile} 
                disabled={loading}
                className="w-full rounded-xl bg-volt py-3 font-display text-sm tracking-wide text-black transition hover:bg-volt-2 disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'СОХРАНИТЬ ПРОФИЛЬ'}
              </button>
            </div>
          ) : (
            <>
              <div className="mt-5 rounded-2xl border border-line bg-panel p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Email</span>
                  <span className="font-bold text-slate-200 truncate max-w-[200px]">{student.email}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Группа</span>
                  <span className="font-bold text-slate-200">{student.group}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Обучение с</span>
                  <span className="font-bold text-slate-200">{student.since}</span>
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
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20">
                  <LogOut className="h-4 w-4" /> Выйти
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Not logged in - show login/register tabs
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="pop-in w-full max-w-md rounded-3xl border border-line bg-[#0c1320] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-volt/15 p-3">
            <GraduationCap className="h-6 w-6 text-volt" />
          </div>
          <div>
            <div className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Добро пожаловать</div>
            <h3 className="font-display text-lg text-white">ЭлектроМастер</h3>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex rounded-xl border border-line bg-[#0a101b] p-1">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${tab === 'login' ? 'bg-volt text-black' : 'text-slate-400 hover:text-white'}`}
          >
            Вход
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${tab === 'register' ? 'bg-volt text-black' : 'text-slate-400 hover:text-white'}`}
          >
            Регистрация
          </button>
        </div>

        {tab === 'login' ? (
          <div className="mt-5 space-y-3">
            <div>
              <label className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-xl border border-line bg-[#0a101b] px-4 py-3 text-sm text-slate-100 outline-none focus:border-volt/60"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Пароль</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-line bg-[#0a101b] px-4 py-3 pr-10 text-sm text-slate-100 outline-none focus:border-volt/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-xl bg-volt py-3 font-display text-sm tracking-wide text-black transition hover:bg-volt-2 disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : 'ВОЙТИ'}
            </button>
          </div>
        ) : (
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
              <label className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-xl border border-line bg-[#0a101b] px-4 py-3 text-sm text-slate-100 outline-none focus:border-volt/60"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Пароль (мин. 6 символов)</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-line bg-[#0a101b] px-4 py-3 pr-10 text-sm text-slate-100 outline-none focus:border-volt/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Группа / организация (необязательно)</label>
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
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full rounded-xl bg-volt py-3 font-display text-sm tracking-wide text-black transition hover:bg-volt-2 disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

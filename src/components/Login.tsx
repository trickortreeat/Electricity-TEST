import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield, User, Lock as LockIcon, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Language } from '../i18n';

interface LoginTranslations {
  title: string;
  subtitle: string;
  email_label: string;
  email_placeholder: string;
  password_label: string;
  password_placeholder: string;
  btn_login: string;
  error_invalid: string;
  back_to_site: string;
}

const loginTranslations: Record<Language, LoginTranslations> = {
  ru: {
    title: 'Вход в систему',
    subtitle: 'Введите свои данные для продолжения',
    email_label: 'Email',
    email_placeholder: 'student@example.com',
    password_label: 'Пароль',
    password_placeholder: '••••••••',
    btn_login: 'ВОЙТИ',
    error_invalid: 'Неверный логин или пароль',
    back_to_site: 'Назад на сайт',
  },
  en: {
    title: 'Login',
    subtitle: 'Enter your credentials to continue',
    email_label: 'Email',
    email_placeholder: 'student@example.com',
    password_label: 'Password',
    password_placeholder: '••••••••',
    btn_login: 'LOGIN',
    error_invalid: 'Invalid login or password',
    back_to_site: 'Back to Site',
  },
};

export default function Login({ lang }: { lang: Language }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const t = loginTranslations[lang];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Сначала пробуем войти как админ через Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!authError && authData.user) {
        // Успешный вход как админ
        localStorage.setItem('admin_session', 'true');
        navigate('/admin');
        return;
      }

      // Если не админ, ищем в таблице students
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, name, email, is_active, last_seen')
        .eq('email', email)
        .eq('password', password)
        .eq('is_active', true)
        .single();

      if (studentsError || !students) {
        setError(t.error_invalid);
        setLoading(false);
        return;
      }

      // Найден активный ученик
      const studentData = {
        id: students.id,
        name: students.name,
        email: students.email,
      };

      localStorage.setItem('student', JSON.stringify(studentData));

      // Обновляем last_seen
      await supabase
        .from('students')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', students.id);

      navigate('/');
    } catch (err) {
      setError(t.error_invalid);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="blueprint flex min-h-screen items-center justify-center bg-[#070b12] p-4">
      <div className="pop-in w-full max-w-md rounded-3xl border border-line bg-[#0c1320] p-7">
        <div className="text-center">
          <div className="mx-auto w-fit rounded-2xl bg-volt/15 p-4">
            <LogIn className="h-8 w-8 text-volt" />
          </div>
          <h2 className="mt-4 font-display text-xl text-white">{t.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{t.subtitle}</p>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">{t.email_label}</label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.email_placeholder}
                className="w-full rounded-xl border border-line bg-[#0a101b] py-3 pl-10 pr-4 text-sm text-slate-100 outline-none focus:border-volt/60"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">{t.password_label}</label>
            <div className="relative mt-1.5">
              <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.password_placeholder}
                className="w-full rounded-xl border border-line bg-[#0a101b] py-3 pl-10 pr-4 text-sm text-slate-100 outline-none focus:border-volt/60"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-volt py-3 font-display text-sm tracking-wide text-black transition hover:bg-volt-2 disabled:opacity-50"
          >
            {loading ? '...' : t.btn_login}
          </button>
        </form>

        <button
          onClick={goBack}
          className="mt-3 w-full rounded-xl border border-line bg-panel py-2.5 text-sm font-bold text-slate-300 hover:text-white"
        >
          {t.back_to_site}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600">
          <Shield className="h-3 w-3" />
          <span>Secure Login</span>
        </div>
      </div>
    </div>
  );
}

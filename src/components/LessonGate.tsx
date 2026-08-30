import React from 'react';
import { StudentRecord } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface LessonGateProps {
  lessonId: number;
  children: React.ReactNode;
}

export const LessonGate: React.FC<LessonGateProps> = ({ lessonId, children }) => {
  const [student, setStudent] = React.useState<StudentRecord | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Загрузка профиля ученика при монтировании и при изменении lessonId
  React.useEffect(() => {
    let mounted = true;
    
    const loadStudent = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (mounted) {
            setStudent(null);
            setLoading(false);
          }
          return;
        }

        const { data: studentData, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (mounted) {
          if (error || !studentData) {
            // Ошибка сети или профиль не найден - fail-closed
            setStudent(null);
          } else {
            setStudent(studentData as StudentRecord);
          }
          setLoading(false);
        }
      } catch (e) {
        console.error('Ошибка загрузки профиля в LessonGate:', e);
        if (mounted) {
          setStudent(null);
          setLoading(false);
        }
      }
    };

    loadStudent();
    
    return () => {
      mounted = false;
    };
  }, [lessonId]);

  // Ученик не вошёл → кнопка "Войти"
  if (!loading && !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-slate-800 rounded-lg border border-slate-700">
        <div className="text-4xl mb-4">🔐</div>
        <h3 className="text-xl font-bold text-white mb-2">Требуется вход</h3>
        <p className="text-slate-400 mb-4">Войдите в систему как ученик, чтобы получить доступ к урокам.</p>
        <button
          onClick={() => {
            const event = new CustomEvent('open-account-modal');
            window.dispatchEvent(event);
          }}
          className="rounded-xl bg-volt px-6 py-3 font-display text-sm tracking-wide text-black transition hover:bg-volt-2"
        >
          Войти в систему
        </button>
      </div>
    );
  }

  // Загрузка ещё идёт (ошибка сети или профиль загружается) → заглушка
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-slate-800 rounded-lg border border-slate-700">
        <div className="text-4xl mb-4">⏳</div>
        <h3 className="text-xl font-bold text-white mb-2">Профиль загружается</h3>
        <p className="text-slate-400">Пожалуйста, подождите...</p>
      </div>
    );
  }

  // Проверка is_active
  if (student.is_active === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50 rounded-lg border border-red-200">
        <div className="text-4xl mb-4">⛔</div>
        <h3 className="text-xl font-bold text-red-800 mb-2">Доступ приостановлен</h3>
        <p className="text-red-600">Обратитесь к преподавателю для восстановления доступа.</p>
      </div>
    );
  }

  // Проверка lockAll
  if (student.lockAll === true) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50 rounded-lg border border-red-200">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-xl font-bold text-red-800 mb-2">Все уроки закрыты</h3>
        <p className="text-red-600">Обратитесь к преподавателю.</p>
      </div>
    );
  }

  // Проверка allowed (массив ID открытых уроков)
  // allowed хранится как jsonb, в типе StudentRecord это number[]
  const allowed = Array.isArray(student.allowed) ? student.allowed : [];
  
  // Если allowed пустой - все уроки открыты
  // lessonId = -1 для theory/studio, -2 для exam - эти всегда открыты если нет lockAll
  if (allowed.length > 0 && lessonId >= 0 && !allowed.includes(lessonId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-orange-50 rounded-lg border border-orange-200">
        <div className="text-4xl mb-4">🔐</div>
        <h3 className="text-xl font-bold text-orange-800 mb-2">Урок закрыт</h3>
        <p className="text-orange-600">Этот урок недоступен. Обратитесь к преподавателю для открытия доступа.</p>
      </div>
    );
  }

  // Доступ разрешён
  return <>{children}</>;
};

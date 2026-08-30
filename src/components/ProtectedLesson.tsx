import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Game from './Game';
import { LEVELS } from '../levels';

interface LessonLockedProps {
  lang: 'ru' | 'en';
}

const lockedTranslations = {
  ru: {
    title: 'Урок закрыт',
    desc: 'Обратитесь к преподавателю для получения доступа',
    back: 'Назад в меню',
  },
  en: {
    title: 'Lesson Locked',
    desc: 'Contact your teacher to get access',
    back: 'Back to Menu',
  },
};

export function LessonLocked({ lang }: LessonLockedProps) {
  const navigate = useNavigate();
  const t = lockedTranslations[lang];

  return (
    <div className="blueprint flex min-h-screen items-center justify-center bg-[#070b12] p-4">
      <div className="pop-in w-full max-w-md rounded-3xl border border-line bg-[#0c1320] p-7 text-center">
        <div className="mx-auto w-fit rounded-2xl bg-red-500/15 p-4">
          <Lock className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="mt-4 font-display text-xl text-white">{t.title}</h2>
        <p className="mt-2 text-sm text-slate-400">{t.desc}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full rounded-xl bg-volt py-3 font-display text-sm tracking-wide text-black hover:bg-volt-2"
        >
          {t.back}
        </button>
      </div>
    </div>
  );
}

interface ProtectedLessonProps {
  levelIdx: number;
  lang: 'ru' | 'en';
  onExit: () => void;
}

export function ProtectedLesson({ levelIdx, lang, onExit }: ProtectedLessonProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const level = LEVELS[levelIdx];

  useEffect(() => {
    checkAccess();
  }, [levelIdx]);

  const checkAccess = async () => {
    const studentRaw = localStorage.getItem('student');
    if (!studentRaw) {
      // Нет ученика в localStorage - доступ открыт (гостевой режим)
      setHasAccess(true);
      return;
    }

    try {
      const student = JSON.parse(studentRaw);
      const { data, error } = await supabase
        .from('lesson_access')
        .select('has_access')
        .eq('student_id', student.id)
        .eq('lesson_id', level.id)
        .single();

      if (error || !data) {
        // Записи нет - проверяем, открыт ли урок по умолчанию
        setHasAccess(true);
        return;
      }

      setHasAccess(data.has_access);
    } catch {
      setHasAccess(true);
    }
  };

  if (hasAccess === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b12]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-volt border-t-transparent" />
      </div>
    );
  }

  if (!hasAccess) {
    return <LessonLocked lang={lang} />;
  }

  return (
    <Game
      key={level.id}
      level={level}
      isLast={levelIdx === LEVELS.length - 1}
      totalLevels={LEVELS.length}
      onExit={onExit}
      onFinished={() => {}}
      onNext={() => {}}
    />
  );
}

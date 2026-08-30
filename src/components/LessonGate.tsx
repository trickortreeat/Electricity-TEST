import React from 'react';
import { StudentRecord } from '../types';

interface LessonGateProps {
  student: StudentRecord | null;
  lessonId: number;
  children: React.ReactNode;
}

export const LessonGate: React.FC<LessonGateProps> = ({ student, lessonId, children }) => {
  // Fail-closed: если студент не загружен, доступ запрещен
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50 rounded-lg border border-red-200">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-xl font-bold text-red-800 mb-2">Доступ ограничен</h3>
        <p className="text-red-600">Профиль ученика не найден или не загружен.</p>
        <p className="text-sm text-red-500 mt-2">Пожалуйста, войдите в систему снова.</p>
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
  
  if (!allowed.includes(lessonId)) {
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

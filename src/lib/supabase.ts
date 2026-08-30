import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xqsvpaoajrarqztefgiq.supabase.co';
const supabaseAnonKey = 'sb_publishable_bxQpu6oiBW_nQUvttH-dTw_ogmLyCJf';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для таблицы students
export interface StudentRecord {
  id: string;                    // uuid, совпадает с auth.users.id
  name: string;
  email: string;
  group: string;
  city: string;
  goal: string;
  level: string;
  is_active: boolean;
  sound: boolean;
  hints: boolean;
  bigText: boolean;
  allowed: number[];             // jsonb: id открытых уроков
  lessons: Record<number, number>; // jsonb: { lesson_id: stars }
  panels: Record<number, number>;  // jsonb: { panel_id: stars }
  lockAll: boolean;
  last_seen: string;             // timestamptz
  note?: string;                 // для админки
}

// Тип для данных входа/регистрации
export interface AuthCredentials {
  email: string;
  password: string;
}

// Тип для профиля ученика (упрощённый, для UI)
export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  group: string;
  city: string;
  goal: string;
  level: string;
  sound: boolean;
  hints: boolean;
  bigText: boolean;
  since: string;
}

// Преобразование записи Supabase в профиль для UI
export function toStudentProfile(rec: StudentRecord): StudentProfile {
  return {
    id: rec.id,
    name: rec.name,
    email: rec.email,
    group: rec.group,
    city: rec.city,
    goal: rec.goal,
    level: rec.level,
    sound: rec.sound,
    hints: rec.hints,
    bigText: rec.bigText,
    since: rec.last_seen ? new Date(rec.last_seen).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU'),
  };
}

// Создание пустой записи студента для регистрации
export function createEmptyStudentRecord(id: string, name: string, email: string, group: string): StudentRecord {
  return {
    id,
    name,
    email,
    group: group || 'Самостоятельное обучение',
    city: '',
    goal: 'Для себя и дома',
    level: 'Новичок',
    is_active: true,
    sound: true,
    hints: true,
    bigText: false,
    allowed: [],
    lessons: {},
    panels: {},
    lockAll: false,
    last_seen: new Date().toISOString(),
    note: '',
  };
}

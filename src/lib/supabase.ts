import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface StudentRecord {
  id: string;
  name: string;
  group: string;
  since: string;
  allowed: number[];       // id открытых уроков; пустой массив = все открыты
  lockAll: boolean;        // полная блокировка доступа
  lessons: Record<number, number>;
  panels: Record<number, number>;
  exam: number;
  note: string;
  email?: string;
  city?: string;
  goal?: string;
  level?: string;
  last_seen?: string;
}

export interface StudentProfile {
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
  lessons: Record<number, number>;
  panels: Record<number, number>;
  exam: number;
}

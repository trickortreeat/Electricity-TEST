// Словарь переводов для сайта ЭлектроМастер

export type Language = 'ru' | 'en';

export interface Translation {
  // Навигация
  menu_home: string;
  menu_lessons: string;
  menu_panels: string;
  menu_exam: string;
  menu_theory: string;
  menu_studio: string;
  menu_calc: string;
  menu_glossary: string;
  menu_account: string;
  
  // Разделы обучения
  section_learning: string;
  section_practice: string;
  section_testing: string;
  section_profile: string;
  
  // Элементы интерфейса
  btn_continue: string;
  btn_start: string;
  btn_read_theory: string;
  btn_read_textbook: string;
  btn_reset_progress: string;
  btn_exit: string;
  btn_next: string;
  btn_back: string;
  btn_save: string;
  btn_cancel: string;
  btn_ok: string;
  
  // Статистика
  stats_lessons: string;
  stats_panels: string;
  stats_exam: string;
  stats_stars: string;
  
  // Заголовки
  title_app: string;
  title_final: string;
  title_diploma: string;
  
  // Прочее
  glossary_title: string;
  calc_title: string;
  exam_title: string;
  theory_title: string;
  studio_title: string;
  
  // Языки
  lang_ru: string;
  lang_en: string;
  switch_language: string;
}

export const translations: Record<Language, Translation> = {
  ru: {
    // Навигация
    menu_home: 'Главная',
    menu_lessons: 'Уроки',
    menu_panels: 'Щитосборка',
    menu_exam: 'Экзамен',
    menu_theory: 'Теория',
    menu_studio: 'Студия щита',
    menu_calc: 'Калькулятор нагрузки',
    menu_glossary: 'Справочник L / N / PE',
    menu_account: 'Аккаунт ученика',
    
    // Разделы обучения
    section_learning: 'Обучение',
    section_practice: 'Практика',
    section_testing: 'Проверка знаний',
    section_profile: 'Профиль и управление',
    
    // Элементы интерфейса
    btn_continue: 'ПРОДОЛЖИТЬ',
    btn_start: 'НАЧАТЬ ОБУЧЕНИЕ',
    btn_read_theory: 'ЧИТАТЬ ТЕОРИЮ',
    btn_read_textbook: 'ЧИТАТЬ УЧЕБНИК',
    btn_reset_progress: 'Сбросить прогресс',
    btn_exit: 'Выход',
    btn_next: 'Далее',
    btn_back: 'Назад',
    btn_save: 'Сохранить',
    btn_cancel: 'Отмена',
    btn_ok: 'OK',
    
    // Статистика
    stats_lessons: 'уроков',
    stats_panels: 'щитов',
    stats_exam: 'экзамен',
    stats_stars: 'звёзд',
    
    // Заголовки
    title_app: 'Тренажёр электромонтажника',
    title_final: 'Диплом электромонтажника получен!',
    title_diploma: 'ЭлектроМастер · итоговый протокол',
    
    // Прочее
    glossary_title: 'Справочник',
    calc_title: 'Калькулятор нагрузки',
    exam_title: 'Экзамен',
    theory_title: 'Теория электромонтажа',
    studio_title: 'Студия щита',
    
    // Языки
    lang_ru: 'Русский',
    lang_en: 'English',
    switch_language: 'Язык',
  },
  
  en: {
    // Навигация
    menu_home: 'Home',
    menu_lessons: 'Lessons',
    menu_panels: 'Panel Assembly',
    menu_exam: 'Exam',
    menu_theory: 'Theory',
    menu_studio: 'Panel Studio',
    menu_calc: 'Load Calculator',
    menu_glossary: 'Reference L / N / PE',
    menu_account: 'Student Account',
    
    // Разделы обучения
    section_learning: 'Learning',
    section_practice: 'Practice',
    section_testing: 'Knowledge Check',
    section_profile: 'Profile & Settings',
    
    // Элементы интерфейса
    btn_continue: 'CONTINUE',
    btn_start: 'START LEARNING',
    btn_read_theory: 'READ THEORY',
    btn_read_textbook: 'READ TEXTBOOK',
    btn_reset_progress: 'Reset Progress',
    btn_exit: 'Exit',
    btn_next: 'Next',
    btn_back: 'Back',
    btn_save: 'Save',
    btn_cancel: 'Cancel',
    btn_ok: 'OK',
    
    // Статистика
    stats_lessons: 'lessons',
    stats_panels: 'panels',
    stats_exam: 'exam',
    stats_stars: 'stars',
    
    // Заголовки
    title_app: 'Electrician Trainer',
    title_final: 'Electrician Diploma Received!',
    title_diploma: 'ElectroMaster · Final Protocol',
    
    // Прочее
    glossary_title: 'Reference Guide',
    calc_title: 'Load Calculator',
    exam_title: 'Exam',
    theory_title: 'Electrical Installation Theory',
    studio_title: 'Panel Studio',
    
    // Языки
    lang_ru: 'Русский',
    lang_en: 'English',
    switch_language: 'Language',
  },
};

export const defaultLanguage: Language = 'ru';

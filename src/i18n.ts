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
  
  // Menu.tsx - HERO секция
  hero_badge: string;
  hero_desc: string;
  hero_quick_lessons: string;
  hero_quick_lessons_sub: string;
  hero_quick_panels: string;
  hero_quick_panels_sub: string;
  hero_quick_exam: string;
  hero_quick_exam_sub: string;
  hero_quick_catalog: string;
  hero_quick_catalog_sub: string;
  hero_panel_title: string;
  hero_panel_status: string;
  
  // Menu.tsx - быстрый доступ плитки
  tile_theory: string;
  tile_theory_sub: string;
  tile_panels: string;
  tile_panels_sub: string;
  tile_studio: string;
  tile_studio_sub: string;
  tile_calc: string;
  tile_calc_sub: string;
  tile_exam: string;
  tile_exam_sub: string;
  
  // Menu.tsx - теория блок
  theory_section_title: string;
  theory_section_subtitle: string;
  theory_section_desc: string;
  theory_tags_base: string;
  theory_tags_fundamentals: string;
  theory_tags_practice: string;
  theory_tags_profi: string;
  theory_tags_norms: string;
  theory_tags_master: string;
  theory_read_time: string;
  theory_btn: string;
  
  // Menu.tsx - переключатель режимов
  tab_lessons: string;
  tab_panels: string;
  tab_exam: string;
  
  // Menu.tsx - акты
  act1_title: string;
  act1_desc: string;
  act2_title: string;
  act2_desc: string;
  act3_title: string;
  act3_desc: string;
  act4_title: string;
  act4_desc: string;
  act5_title: string;
  act5_desc: string;
  act6_title: string;
  act6_desc: string;
  act7_title: string;
  act7_desc: string;
  
  // Menu.tsx - панели
  panels_select_device: string;
  panels_device_desc: string;
  panels_assemble_btn: string;
  
  // Menu.tsx - экзамен
  exam_intro_title: string;
  exam_intro_desc: string;
  exam_start_btn: string;
  
  // App.tsx - финальный экран
  final_protocol: string;
  final_title: string;
  final_desc: string;
  final_tip_title: string;
  final_tip_text: string;
  final_menu_btn: string;
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
    
    // Menu.tsx - HERO секция
    hero_badge: 'Тренажёр электромонтажника',
    hero_desc: '{lessons} уроков, {panels} сборок щитов, {chapters} глав теории и {questions} вопросов экзамена. Всё открыто — начинайте с любого уровня.',
    hero_quick_lessons: '{count} уроков',
    hero_quick_lessons_sub: '7 актов',
    hero_quick_panels: '{count} щитов',
    hero_quick_panels_sub: 'с расключением',
    hero_quick_exam: '{count} вопросов',
    hero_quick_exam_sub: 'экзамен',
    hero_quick_catalog: '{count} аппаратов',
    hero_quick_catalog_sub: 'каталог',
    hero_panel_title: 'КВАРТИРНЫЙ ЩИТОК · 220 В',
    hero_panel_status: 'под напряжением',
    
    // Menu.tsx - быстрый доступ плитки
    tile_theory: 'Теория',
    tile_theory_sub: '{count} глав',
    tile_panels: 'Щитосборка',
    tile_panels_sub: '{count} объектов',
    tile_studio: 'Студия щита',
    tile_studio_sub: 'свой проект',
    tile_calc: 'Калькулятор',
    tile_calc_sub: 'нагрузка',
    tile_exam: 'Экзамен',
    tile_exam_sub: '{count} вопросов',
    
    // Menu.tsx - теория блок
    theory_section_title: 'ТЕОРИЯ ЭЛЕКТРОМОНТАЖА',
    theory_section_subtitle: 'Полный учебник · {count} глав в 6 частях',
    theory_section_desc: 'Настоящая книга внутри тренажёра: от «что такое электрон» до систем заземления, трёхфазных сетей, частотных приводов, взрывозащиты и требований ПУЭ. Простым языком, с иллюстрациями и формулами.',
    theory_tags_base: 'Азы',
    theory_tags_fundamentals: 'База',
    theory_tags_practice: 'Практика',
    theory_tags_profi: 'Профи',
    theory_tags_norms: 'Нормативы',
    theory_tags_master: 'Мастер',
    theory_read_time: '≈ {hours} ч чтения',
    theory_btn: 'ЧИТАТЬ УЧЕБНИК',
    
    // Menu.tsx - переключатель режимов
    tab_lessons: 'Уроки',
    tab_panels: 'Щиты',
    tab_exam: 'Экзамен',
    
    // Menu.tsx - акты
    act1_title: 'АКТ I · Основы электрики',
    act1_desc: 'провода, коробка, автомат, УЗО',
    act2_title: 'АКТ II · Свет и управление',
    act2_desc: 'проходные, диммер, датчик, счётчик',
    act3_title: 'АКТ III · Защита и номиналы',
    act3_desc: 'сечения, селективность, РН, УЗИП',
    act4_title: 'АКТ IV · Спецнагрузки',
    act4_desc: 'кондиционер, тёплый пол, кухня',
    act5_title: 'АКТ V · Большой щит квартиры',
    act5_desc: '5 комнат, 10 групп, две шины',
    act6_title: 'АКТ VI · Профессиональный уровень',
    act6_desc: 'кросс-модуль, контактор, 380 В, зарядки EV',
    act7_title: 'АКТ VII · Современная аппаратура',
    act7_desc: '2P-автоматы, импульсное реле, фотореле, УЗО 4P',
    
    // Menu.tsx - панели
    panels_select_device: 'Выберите аппараты из каталога (автоматы всех номиналов, УЗО, дифавтоматы, реле напряжения, УЗИП, счётчик,',
    panels_device_desc: 'тему и длину экзамена, после каждого ответа — объяснение.',
    panels_assemble_btn: 'СОБРАТЬ ЩИТ',
    
    // Menu.tsx - экзамен
    exam_intro_title: 'ЭКЗАМЕН НА ЭЛЕКТРОМОНТАЖНИКА',
    exam_intro_desc: 'Проверьте свои знания: {count} вопросов из всех разделов. Выберите сложность,',
    exam_start_btn: 'НАЧАТЬ ЭКЗАМЕН',
    
    // App.tsx - финальный экран
    final_protocol: 'ЭлектроМастер · итоговый протокол',
    final_title: 'Диплом электромонтажника получен!',
    final_desc: 'Вы прошли путь от трёх проводов до многорядных щитов с реле напряжения, УЗИП, кросс-модулями, контакторами, трёхфазным вводом и зарядными станциями для электромобилей.',
    final_tip_title: 'Памятка на всю жизнь',
    final_tip_text: 'Автомат защищает проводку, УЗО — человека, реле напряжения — технику, УЗИП — от импульсов. Выключатель всегда в разрыв фазы, номинал автомата — по сечению кабеля, земля не проходит ни через один аппарат. И всегда: сначала отключи питание, потом работай.',
    final_menu_btn: 'В МЕНЮ',
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
    
    // Menu.tsx - HERO секция
    hero_badge: 'Electrician Trainer',
    hero_desc: '{lessons} lessons, {panels} panel assemblies, {chapters} theory chapters and {questions} exam questions. Everything is open — start from any level.',
    hero_quick_lessons: '{count} lessons',
    hero_quick_lessons_sub: '7 acts',
    hero_quick_panels: '{count} panels',
    hero_quick_panels_sub: 'with wiring',
    hero_quick_exam: '{count} questions',
    hero_quick_exam_sub: 'exam',
    hero_quick_catalog: '{count} devices',
    hero_quick_catalog_sub: 'catalog',
    hero_panel_title: 'APARTMENT PANEL · 220 V',
    hero_panel_status: 'live',
    
    // Menu.tsx - быстрый доступ плитки
    tile_theory: 'Theory',
    tile_theory_sub: '{count} chapters',
    tile_panels: 'Panel Assembly',
    tile_panels_sub: '{count} projects',
    tile_studio: 'Panel Studio',
    tile_studio_sub: 'your project',
    tile_calc: 'Calculator',
    tile_calc_sub: 'load calculation',
    tile_exam: 'Exam',
    tile_exam_sub: '{count} questions',
    
    // Menu.tsx - теория блок
    theory_section_title: 'ELECTRICAL INSTALLATION THEORY',
    theory_section_subtitle: 'Complete textbook · {count} chapters in 6 parts',
    theory_section_desc: 'A real book inside the trainer: from \"what is an electron\" to grounding systems, three-phase networks, variable frequency drives, explosion protection and PUE requirements. In simple language, with illustrations and formulas.',
    theory_tags_base: 'Basics',
    theory_tags_fundamentals: 'Fundamentals',
    theory_tags_practice: 'Practice',
    theory_tags_profi: 'Professional',
    theory_tags_norms: 'Standards',
    theory_tags_master: 'Master',
    theory_read_time: '≈ {hours} h reading',
    theory_btn: 'READ TEXTBOOK',
    
    // Menu.tsx - переключатель режимов
    tab_lessons: 'Lessons',
    tab_panels: 'Panels',
    tab_exam: 'Exam',
    
    // Menu.tsx - акты
    act1_title: 'ACT I · Electrical Basics',
    act1_desc: 'wires, junction box, circuit breaker, RCD',
    act2_title: 'ACT II · Lighting and Control',
    act2_desc: '3-way switches, dimmer, sensor, meter',
    act3_title: 'ACT III · Protection and Ratings',
    act3_desc: 'cross-sections, selectivity, voltage relay, SPD',
    act4_title: 'ACT IV · Special Loads',
    act4_desc: 'air conditioner, heated floor, kitchen',
    act5_title: 'ACT V · Large Apartment Panel',
    act5_desc: '5 rooms, 10 groups, two buses',
    act6_title: 'ACT VI · Professional Level',
    act6_desc: 'cross-module, contactor, 380 V, EV charging',
    act7_title: 'ACT VII · Modern Equipment',
    act7_desc: '2P breakers, impulse relay, photo relay, 4P RCD',
    
    // Menu.tsx - панели
    panels_select_device: 'Select devices from the catalog (circuit breakers of all ratings, RCDs, differential breakers, voltage relays, SPDs, meters,',
    panels_device_desc: 'difficulty and exam length, explanation after each answer.',
    panels_assemble_btn: 'ASSEMBLE PANEL',
    
    // Menu.tsx - экзамен
    exam_intro_title: 'ELECTRICIAN EXAM',
    exam_intro_desc: 'Test your knowledge: {count} questions from all sections. Choose',
    exam_start_btn: 'START EXAM',
    
    // App.tsx - финальный экран
    final_protocol: 'ElectroMaster · Final Protocol',
    final_title: 'Electrician Diploma Received!',
    final_desc: 'You have gone from three wires to multi-row panels with voltage relays, SPDs, cross-modules, contactors, three-phase input and charging stations for electric vehicles.',
    final_tip_title: 'Lifelong Reminder',
    final_tip_text: 'Circuit breaker protects wiring, RCD protects people, voltage relay protects equipment, SPD protects from surges. Switch always breaks the live wire, breaker rating matches cable cross-section, ground never passes through any device. And always: disconnect power first, then work.',
    final_menu_btn: 'TO MENU',
  },
};

export const defaultLanguage: Language = 'ru';

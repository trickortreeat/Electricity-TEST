// ---- Типы данных тренажёра ----

export type NetType = 'L' | 'N' | 'PE';
export type WireColor = 'brown' | 'blue' | 'pe';

export type DeviceType =
  | 'cable'      // вводной кабель
  | 'hub'        // клеммник (скрутка)
  | 'busN'       // нулевая шина
  | 'busPE'      // шина заземления
  | 'switch'     // выключатель
  | 'switch2'    // двухклавишный выключатель
  | 'switchP'    // проходной выключатель
  | 'switchX'    // перекрёстный выключатель
  | 'dimmer'     // диммер
  | 'lamp'       // светильник
  | 'lamp2'      // люстра, 2 группы
  | 'lampS'      // компактный светильник
  | 'socket'     // розетка 16А
  | 'breaker'    // автоматический выключатель 1P
  | 'breaker2p'  // автомат 2P (вводной)
  | 'rcd'        // УЗО
  | 'dif'        // дифавтомат
  | 'meter'      // счётчик электроэнергии
  | 'vrn'        // реле напряжения (УЗМ)
  | 'uzip'       // УЗИП
  | 'comb'       // гребенчатая шина
  | 'pir'        // датчик движения
  | 'thermostat' // терморегулятор тёплого пола
  | 'stove'      // электроплита / варочная панель
  | 'washer'     // стиральная/посудомоечная машина
  | 'oven'       // духовой шкаф
  | 'ac'         // кондиционер
  | 'boiler'     // бойлер
  | 'floorheat'  // нагревательный мат тёплого пола
  | 'cross'      // кросс-модуль распределительный
  | 'contactor'  // модульный контактор
  | 'ev'         // зарядная станция электромобиля
  | 'evbox'      // балансировщик мощности EV
  | 'breaker3p'; // трёхполюсный автомат

export interface TerminalDef {
  key: string;      // локальный ключ внутри устройства
  dx: number;       // смещение от центра устройства
  dy: number;
  label?: string;   // подпись клеммы (L, N, PE, 1, 2 ...)
  net: string | null; // id цепи (nets), null — клемма не задействована
}

export interface DeviceDef {
  id: string;
  type: DeviceType;
  x: number;
  y: number;
  label?: string;
  sublabel?: string;
  terminals: TerminalDef[];
}

export interface NetDef {
  id: string;
  name: string;      // короткое имя для чипа прогресса
  type: NetType;
  hint: string;      // текст подсказки
}

export interface RailLine {
  y: number;
  x1: number;
  x2: number;
}

export interface DecorRect {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  rail?: boolean;    // нарисовать DIN-рейку внутри
  railY?: number;    // y-координата DIN-рейки
  rails?: number[];  // несколько DIN-реек
}

export interface LevelDef {
  id: number;
  title: string;
  tag: string;          // короткий тег: «База», «Щиток» ...
  goal: string;
  theory: string[];     // абзацы теории
  fact: string;         // текст на экране победы
  crossTip?: string;    // ошибка «один тип, но разные участки цепи»
  spareTip?: string;    // ошибка «клемма не задействована»
  bonds?: Array<[string, string]>; // физически соединённые пары (гребёнка и т.п.)
  devices: DeviceDef[];
  nets: NetDef[];
  decor: DecorRect[];
}

export interface Connection {
  id: number;
  a: string; // полный id клеммы "device.key"
  b: string;
  color: WireColor;
}

// Цвет, который должна иметь цепь
export const NET_WIRE_COLOR: Record<NetType, WireColor> = {
  L: 'brown',
  N: 'blue',
  PE: 'pe',
};

export const WIRE_META: Record<WireColor, { name: string; hex: string; hex2?: string }> = {
  brown: { name: 'Фаза · коричневый', hex: '#c96f2e' },
  blue: { name: 'Ноль · синий', hex: '#3d8bff' },
  pe: { name: 'Земля · жёлто-зелёный', hex: '#35c759', hex2: '#ffd93d' },
};

export const NET_NAME: Record<NetType, string> = {
  L: 'фаза',
  N: 'ноль',
  PE: 'земля',
};

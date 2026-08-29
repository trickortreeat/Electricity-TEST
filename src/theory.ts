import { resetCounter, type Chapter } from './theoryKit';

resetCounter();

// порядок импорта важен — он задаёт сквозную нумерацию глав
import { PART1 } from './theoryData/part1';
import { PART2 } from './theoryData/part2';
import { PART3 } from './theoryData/part3';
import { PART4 } from './theoryData/part4';
import { PART5 } from './theoryData/part5';
import { PART6 } from './theoryData/part6';

export const CHAPTERS: Chapter[] = [...PART1, ...PART2, ...PART3, ...PART4, ...PART5, ...PART6];

export const PARTS = Array.from(new Set(CHAPTERS.map((c) => c.part)));

export const TOTAL_MINUTES = CHAPTERS.reduce((a, c) => a + c.minutes, 0);

export { LEVEL_COLORS } from './theoryKit';
export type { Block, Chapter, FigKind, Level } from './theoryKit';

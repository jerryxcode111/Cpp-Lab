import { LEARN_CATEGORIES_PART_1 } from './learnContentPart1';
import { LEARN_CATEGORIES_PART_2 } from './learnContentPart2';
import type { LearnCategory, LearnLesson } from './learnTypes';

export type { LearnCategory, LearnLesson, LearnStepItem, LearnTable } from './learnTypes';

export const LEARN_CURRICULUM: LearnCategory[] = [
  ...LEARN_CATEGORIES_PART_1,
  ...LEARN_CATEGORIES_PART_2,
];

export const ALL_LESSONS: LearnLesson[] = LEARN_CURRICULUM.flatMap((cat) => cat.lessons);

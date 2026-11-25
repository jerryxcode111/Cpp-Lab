import { LEARN_CATEGORIES_PART_1 } from './learnContentPart1';
import { LEARN_CATEGORIES_PART_2 } from './learnContentPart2';
import { LEARN_RICH_PART_1 } from './learnRichContent1';
import { LEARN_RICH_PART_2 } from './learnRichContent2';
import type { LearnCategory, LearnLesson } from './learnTypes';

export type {
  LearnArticleExample,
  LearnArticleNote,
  LearnArticleSection,
  LearnCategory,
  LearnLesson,
  LearnStepItem,
  LearnTable,
} from './learnTypes';

const RICH_BY_ID = {
  ...LEARN_RICH_PART_1,
  ...LEARN_RICH_PART_2,
};

export const LEARN_CURRICULUM: LearnCategory[] = [
  ...LEARN_CATEGORIES_PART_1,
  ...LEARN_CATEGORIES_PART_2,
].map((cat) => ({
  ...cat,
  lessons: cat.lessons.map((lesson) => {
    const rich = RICH_BY_ID[lesson.id];
    return rich ? { ...lesson, ...rich } : lesson;
  }),
}));

export const ALL_LESSONS: LearnLesson[] = LEARN_CURRICULUM.flatMap((cat) => cat.lessons);

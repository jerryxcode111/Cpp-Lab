export interface LearnStepItem {
  label: string;
  detail: string;
}

export interface LearnTable {
  headers: string[];
  rows: string[][];
}

export interface LearnCodeExample {
  title: string;
  description: string;
  code: string;
  output: string;
}

export interface LearnArticleNote {
  variant: 'note' | 'tip' | 'warning';
  title?: string;
  text: string;
}

export interface LearnArticleExample {
  title?: string;
  caption?: string;
  code: string;
  output?: string;
  explained?: string[];
  runnable?: boolean;
}

export interface LearnArticleSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  table?: LearnTable;
  example?: LearnArticleExample;
  note?: LearnArticleNote;
}

export interface LearnLesson {
  id: string;
  categoryId: string;
  categoryTitle: string;
  title: string;
  shortTitle: string;
  summary: string;
  introParagraphs?: string[];
  sections?: LearnArticleSection[];
  steps: LearnStepItem[];
  quickTable?: LearnTable;
  syntaxPattern: string;
  quickSnippet: string;
  workingExampleCode: string;
  workingExampleDefaultOutput: string;
  moreExample: LearnCodeExample;
  rulesHeading: string;
  rules: Array<{ text: string; codes?: string[] }>;
  commonMistakeTitle: string;
  commonMistakeBody: string;
}

export interface LearnCategory {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  count: number;
  lessons: LearnLesson[];
}
